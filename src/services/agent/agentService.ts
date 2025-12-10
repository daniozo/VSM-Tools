/**
 * Service Agent VSM - Orchestrateur principal
 * 
 * Gère la conversation avec le LLM (Gemini ou Mistral) et l'exécution des outils
 */

import { useVsmStore } from '@/store/vsmStore'
import {
  ToolCall,
  ToolResult,
  PendingAction,
  AgentContext,
  AgentMessage,
  AgentUIEvent,
  DiagramSummary
} from './types'
import { getToolByName, generateToolsSchema } from './tools'
import { toolExecutor } from './toolExecutor'
import { llmProvider, LLMToolDefinition, LLMFunctionResponse } from './llmProvider'

// Durée de validité d'une action en attente (5 minutes)
const ACTION_EXPIRY_MS = 5 * 60 * 1000

/**
 * Helper pour extraire une valeur d'indicateur
 */
function getIndicatorValue(indicators: Array<{ name: string, value?: string }>, name: string): number {
  const indicator = indicators.find(i =>
    i.name.toLowerCase().includes(name.toLowerCase())
  )
  return indicator?.value ? parseFloat(indicator.value) || 0 : 0
}

/**
 * Service Agent VSM
 */
export class AgentService {
  private pendingActions: Map<string, PendingAction> = new Map()
  private conversationHistory: Array<{ role: string, content: string }> = []
  private uiEventCallback?: (event: AgentUIEvent) => void

  constructor() {
    // Configurer le callback UI sur le toolExecutor
    toolExecutor.setUIEventCallback((event) => {
      if (this.uiEventCallback) {
        this.uiEventCallback(event)
      }
    })
  }

  /**
   * Définit le callback pour les événements UI
   */
  setUIEventCallback(callback: (event: AgentUIEvent) => void) {
    this.uiEventCallback = callback
    toolExecutor.setUIEventCallback(callback)
  }

  /**
   * Vérifie si le service est configuré
   */
  isConfigured(): boolean {
    return llmProvider.isConfigured()
  }

  /**
   * Retourne le provider actif
   */
  getProvider(): string {
    return llmProvider.getProvider()
  }

  /**
   * Génère le contexte actuel du diagramme
   */
  private generateContext(): AgentContext {
    const store = useVsmStore.getState()
    const diagram = store.diagram

    let diagramSummary: DiagramSummary | undefined

    if (diagram) {
      // Extraire les temps de cycle depuis les indicateurs
      const nodes = diagram.nodes.map(n => ({
        id: n.id,
        name: n.name,
        type: n.type.toString(),
        cycleTime: getIndicatorValue(n.indicators, 'cycle'),
        uptime: getIndicatorValue(n.indicators, 'uptime') || getIndicatorValue(n.indicators, 'disponibilité')
      }))

      const totalCycleTime = nodes.reduce((sum, n) => sum + (n.cycleTime || 0), 0)

      // Calculer le temps d'attente depuis les séquences (durée des inventaires en jours)
      let totalWaitTime = 0
      diagram.flowSequences.forEach(seq => {
        seq.intermediateElements?.forEach(el => {
          if (el.type === 'INVENTORY' && el.inventory?.duration) {
            totalWaitTime += el.inventory.duration * 24 * 3600 // Convertir jours en secondes
          }
        })
      })

      const totalLeadTime = totalCycleTime + totalWaitTime
      const efficiency = totalLeadTime > 0 ? (totalCycleTime / totalLeadTime) * 100 : 0

      // Compter les inventaires
      let inventoriesCount = 0
      diagram.flowSequences.forEach(seq => {
        inventoriesCount += seq.intermediateElements?.filter(e => e.type === 'INVENTORY').length || 0
      })

      diagramSummary = {
        name: diagram.metaData.name,
        nodesCount: diagram.nodes.length,
        nodes,
        inventoriesCount,
        flowSequencesCount: diagram.flowSequences.length,
        totalCycleTime,
        totalLeadTime,
        efficiency: Math.round(efficiency * 100) / 100
      }
    }

    return {
      projectId: diagram?.metaData.name,
      projectName: diagram?.metaData.name,
      diagramSummary,
      selectedElement: store.selectedElement
        ? {
          type: store.selectedElement.type,
          id: store.selectedElement.type === 'node' ? store.selectedElement.id : ''
        }
        : undefined,
      conversationHistory: this.conversationHistory.slice(-10) as any
    }
  }

  /**
   * Construit le prompt système avec le contexte du diagramme
   */
  private buildSystemPrompt(context: AgentContext): string {
    let contextInfo = ''
    if (context.diagramSummary) {
      const summary = context.diagramSummary
      contextInfo = `
## Diagramme VSM actuel: "${summary.name}"
- Nombre d'étapes: ${summary.nodesCount}
- Étapes: ${summary.nodes.map(n => `${n.name} (CT: ${n.cycleTime}s)`).join(', ')}
- Temps de cycle total: ${summary.totalCycleTime}s
- Lead time: ${summary.totalLeadTime}s
- Efficacité: ${summary.efficiency}%
`
    } else {
      contextInfo = '\n## Aucun diagramme ouvert actuellement\n'
    }

    return `Tu es un assistant expert en Value Stream Mapping (VSM) et amélioration continue (Lean, Six Sigma).
Tu peux analyser les diagrammes VSM et proposer des actions d'amélioration.

${contextInfo}

## Instructions
1. Analyse les demandes de l'utilisateur et propose des actions concrètes
2. Utilise les outils (functions) disponibles pour interagir avec le diagramme
3. Pour les analyses simples, réponds directement avec les informations du contexte
4. Sois précis, concis et professionnel dans tes réponses
5. Explique tes recommandations en termes de Lean/amélioration continue
6. Évite les emojis, utilise un langage professionnel

Note: Les actions qui modifient le diagramme nécessiteront une confirmation de l'utilisateur.
`
  }

  /**
   * Génère le schéma des outils au format unifié
   */
  private generateTools(): LLMToolDefinition[] {
    const tools = generateToolsSchema()
    return tools.map(t => ({
      name: t.function.name,
      description: t.function.description,
      parameters: t.function.parameters
    }))
  }

  /**
   * Traite un message utilisateur et génère une réponse
   */
  async processMessage(userMessage: string): Promise<AgentMessage> {
    if (!this.isConfigured()) {
      const provider = this.getProvider()
      return {
        id: `msg-${Date.now()}`,
        type: 'error',
        content: `Service non configuré. Veuillez configurer la clé API ${provider === 'mistral' ? 'Mistral' : 'Gemini'} dans le fichier .env`,
        timestamp: new Date()
      }
    }

    // Ajouter le message utilisateur à l'historique
    this.conversationHistory.push({ role: 'user', content: userMessage })

    const context = this.generateContext()
    const systemPrompt = this.buildSystemPrompt(context)
    const tools = this.generateTools()

    try {
      // Étape 1: Premier appel au LLM avec les outils
      console.log(`[Agent] Appel ${this.getProvider()} avec ${tools.length} outils`)
      const response = await llmProvider.chat(systemPrompt, userMessage, tools)
      console.log('[Agent] Réponse reçue:', {
        textLength: response.text?.length || 0,
        textPreview: response.text?.substring(0, 100),
        functionCallsCount: response.functionCalls?.length || 0
      })

      // Si pas de function calls, retourner la réponse directement
      if (response.functionCalls.length === 0) {
        const textContent = String(response.text || 'Pas de réponse générée.')
        console.log('[Agent] Réponse:', textContent)
        this.conversationHistory.push({ role: 'assistant', content: textContent })
        return {
          id: `msg-${Date.now()}`,
          type: 'text',
          content: textContent,
          timestamp: new Date()
        }
      }

      // Étape 2 & 3: Exécuter les function calls et collecter les résultats
      console.log('[Agent] Function calls détectés:', response.functionCalls)

      const toolCalls: ToolCall[] = []
      const pendingActions: PendingAction[] = []
      const executedResults: ToolResult[] = []
      const functionResponses: LLMFunctionResponse[] = []

      for (const fc of response.functionCalls) {
        const toolCall: ToolCall = {
          id: `tc-${Date.now()}-${toolCalls.length}`,
          toolName: fc.name,
          arguments: fc.args,
          timestamp: new Date()
        }
        toolCalls.push(toolCall)

        const tool = getToolByName(fc.name)

        if (!tool) {
          const errorResult = { error: `Outil inconnu: ${fc.name}` }
          functionResponses.push({ name: fc.name, response: errorResult })
          executedResults.push({
            toolCallId: toolCall.id,
            success: false,
            error: errorResult.error,
            message: `L'outil "${fc.name}" n'existe pas.`
          })
          continue
        }

        // Si l'outil nécessite une confirmation, créer une action en attente
        if (tool.requiresConfirmation) {
          const actionId = `action-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          const confirmMessage = tool.confirmationMessage
            ? tool.confirmationMessage(fc.args)
            : `Confirmer l'exécution de ${tool.name} ?`

          const pendingAction: PendingAction = {
            id: actionId,
            toolCall,
            status: 'pending',
            confirmationMessage: confirmMessage,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + ACTION_EXPIRY_MS)
          }

          this.pendingActions.set(actionId, pendingAction)
          pendingActions.push(pendingAction)

          functionResponses.push({
            name: fc.name,
            response: { status: 'pending_confirmation', message: confirmMessage }
          })
        } else {
          // Exécuter directement l'outil
          console.log(`[Agent] Exécution de l'outil: ${fc.name}`, fc.args)
          const result = await toolExecutor.execute(toolCall)
          console.log(`[Agent] Résultat:`, result)
          executedResults.push(result)

          functionResponses.push({
            name: fc.name,
            response: result.success
              ? (result.result || { success: true, message: result.message })
              : { error: result.error, message: result.message }
          })
        }
      }

      // Si toutes les actions nécessitent confirmation, retourner sans appel supplémentaire
      if (pendingActions.length > 0 && executedResults.length === 0) {
        return {
          id: `msg-${Date.now()}`,
          type: 'action_request',
          content: String(response.text || 'Je souhaite exécuter les actions suivantes. Veuillez confirmer.'),
          toolCalls,
          pendingActions,
          timestamp: new Date()
        }
      }

      // Étape 4 & 5: Renvoyer les résultats au LLM pour obtenir la réponse finale
      console.log('[Agent] Envoi des résultats au LLM pour réponse finale')
      const finalResponse = await llmProvider.chatWithFunctionResults(
        systemPrompt,
        userMessage,
        response.functionCalls,
        functionResponses
      )
      console.log('[Agent] Réponse finale reçue:', {
        textLength: finalResponse.text?.length || 0,
        textPreview: finalResponse.text?.substring(0, 100)
      })

      // Ajouter à l'historique
      // Si le modèle ne retourne pas de texte après l'exécution des outils, générer un message par défaut
      let finalTextContent = finalResponse.text || response.text || ''

      if (!finalTextContent && executedResults.length > 0) {
        // Générer un message basé sur les résultats
        const successCount = executedResults.filter(r => r.success).length
        if (successCount === executedResults.length) {
          finalTextContent = executedResults.length === 1
            ? executedResults[0].message
            : `${successCount} action(s) exécutée(s) avec succès.`
        } else {
          finalTextContent = `${successCount}/${executedResults.length} action(s) réussie(s).`
        }
      }

      finalTextContent = String(finalTextContent || 'Action exécutée.')
      this.conversationHistory.push({ role: 'assistant', content: finalTextContent })

      return {
        id: `msg-${Date.now()}`,
        type: pendingActions.length > 0 ? 'action_request' : 'action_result',
        content: finalTextContent,
        toolCalls,
        pendingActions: pendingActions.length > 0 ? pendingActions : undefined,
        results: executedResults.length > 0 ? executedResults : undefined,
        timestamp: new Date()
      }

    } catch (error) {
      console.error('[Agent] Erreur:', error)
      return {
        id: `msg-${Date.now()}`,
        type: 'error',
        content: `Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
        timestamp: new Date()
      }
    }
  }

  /**
   * Confirme une action en attente
   */
  async confirmAction(actionId: string): Promise<ToolResult> {
    const pendingAction = this.pendingActions.get(actionId)

    if (!pendingAction) {
      return {
        toolCallId: actionId,
        success: false,
        error: 'Action non trouvée ou expirée',
        message: 'Cette action n\'est plus disponible.'
      }
    }

    // Vérifier l'expiration
    if (new Date() > pendingAction.expiresAt) {
      this.pendingActions.delete(actionId)
      return {
        toolCallId: actionId,
        success: false,
        error: 'Action expirée',
        message: 'Cette action a expiré. Veuillez relancer la demande.'
      }
    }

    // Exécuter l'action
    const result = await toolExecutor.execute(pendingAction.toolCall)

    // Mettre à jour le statut
    pendingAction.status = result.success ? 'executed' : 'failed'
    this.pendingActions.delete(actionId)

    return result
  }

  /**
   * Annule une action en attente
   */
  cancelAction(actionId: string): ToolResult {
    const pendingAction = this.pendingActions.get(actionId)

    if (!pendingAction) {
      return {
        toolCallId: actionId,
        success: false,
        error: 'Action non trouvée',
        message: 'Cette action n\'existe pas ou a déjà été traitée.'
      }
    }

    pendingAction.status = 'cancelled'
    this.pendingActions.delete(actionId)

    return {
      toolCallId: actionId,
      success: true,
      message: 'Action annulée'
    }
  }

  /**
   * Récupère les actions en attente
   */
  getPendingActions(): PendingAction[] {
    const now = new Date()
    for (const [id, action] of this.pendingActions) {
      if (now > action.expiresAt) {
        this.pendingActions.delete(id)
      }
    }
    return Array.from(this.pendingActions.values())
  }

  /**
   * Réinitialise la conversation
   */
  resetConversation() {
    this.conversationHistory = []
    this.pendingActions.clear()
  }
}

// Instance singleton
export const agentService = new AgentService()
