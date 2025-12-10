/**
 * Service Agent VSM - Orchestrateur principal
 * 
 * Gère la conversation avec le LLM et l'exécution des outils
 */

import { GEMINI_CONFIG } from '../gemini/config'
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
import { VSM_TOOLS, getToolByName } from './tools'
import { toolExecutor } from './toolExecutor'

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
    return GEMINI_CONFIG.apiKey !== 'AIzaSyDEFAULT_KEY_CHANGE_ME' &&
      GEMINI_CONFIG.apiKey.length > 0
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
      projectId: diagram?.metaData.name, // Utiliser le nom comme ID
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
   * Construit le prompt système avec les outils disponibles
   */
  private buildSystemPrompt(context: AgentContext): string {
    const toolsDescription = VSM_TOOLS.map(tool =>
      `- ${tool.name}: ${tool.description}`
    ).join('\n')

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

## Outils disponibles
Tu peux utiliser les outils suivants pour interagir avec le diagramme:
${toolsDescription}

## Instructions
1. Analyse les demandes de l'utilisateur et propose des actions concrètes
2. Utilise les outils appropriés pour exécuter les actions
3. Les actions qui modifient le diagramme nécessitent une confirmation de l'utilisateur
4. Sois précis et concis dans tes réponses
5. Explique tes recommandations en termes de Lean/amélioration continue

## Format de réponse avec outils
Quand tu veux exécuter une action, utilise le format JSON suivant dans ta réponse:
\`\`\`tool_call
{
  "tool": "nom_de_l_outil",
  "arguments": { ... }
}
\`\`\`

Tu peux inclure plusieurs appels d'outils si nécessaire.
`
  }

  /**
   * Parse les appels d'outils depuis la réponse du LLM
   */
  private parseToolCalls(response: string): { text: string, toolCalls: ToolCall[] } {
    const toolCalls: ToolCall[] = []
    let cleanText = response

    // Regex pour trouver les blocs tool_call
    const toolCallRegex = /```tool_call\s*\n?([\s\S]*?)\n?```/g
    let match

    while ((match = toolCallRegex.exec(response)) !== null) {
      try {
        const parsed = JSON.parse(match[1])
        if (parsed.tool && typeof parsed.tool === 'string') {
          toolCalls.push({
            id: `tc-${Date.now()}-${toolCalls.length}`,
            toolName: parsed.tool,
            arguments: parsed.arguments || {},
            timestamp: new Date()
          })
        }
      } catch (e) {
        console.warn('Erreur parsing tool_call:', e)
      }

      // Retirer le bloc de la réponse texte
      cleanText = cleanText.replace(match[0], '').trim()
    }

    return { text: cleanText, toolCalls }
  }

  /**
   * Traite un message utilisateur et génère une réponse
   */
  async processMessage(userMessage: string): Promise<AgentMessage> {
    if (!this.isConfigured()) {
      return {
        id: `msg-${Date.now()}`,
        type: 'error',
        content: 'Service non configuré. Veuillez configurer la clé API Gemini.',
        timestamp: new Date()
      }
    }

    // Ajouter le message utilisateur à l'historique
    this.conversationHistory.push({ role: 'user', content: userMessage })

    const context = this.generateContext()
    const systemPrompt = this.buildSystemPrompt(context)

    try {
      // Appel à l'API Gemini
      const response = await fetch(
        `${GEMINI_CONFIG.endpoint}/${GEMINI_CONFIG.model}:generateContent?key=${GEMINI_CONFIG.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: `${systemPrompt}\n\nUtilisateur: ${userMessage}` }]
              }
            ],
            generationConfig: {
              ...GEMINI_CONFIG.generationConfig,
              temperature: 0.7
            }
          })
        }
      )

      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status}`)
      }

      const data = await response.json()
      const rawResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

      // Parser les appels d'outils
      const { text, toolCalls } = this.parseToolCalls(rawResponse)

      // Ajouter la réponse à l'historique
      this.conversationHistory.push({ role: 'assistant', content: text })

      // Si des outils sont appelés, les traiter
      if (toolCalls.length > 0) {
        return this.handleToolCalls(text, toolCalls)
      }

      return {
        id: `msg-${Date.now()}`,
        type: 'text',
        content: text,
        timestamp: new Date()
      }

    } catch (error) {
      console.error('Erreur agent:', error)
      return {
        id: `msg-${Date.now()}`,
        type: 'error',
        content: `Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
        timestamp: new Date()
      }
    }
  }

  /**
   * Traite les appels d'outils
   */
  private async handleToolCalls(text: string, toolCalls: ToolCall[]): Promise<AgentMessage> {
    const pendingActions: PendingAction[] = []
    const results: ToolResult[] = []

    for (const toolCall of toolCalls) {
      const tool = getToolByName(toolCall.toolName)

      if (!tool) {
        results.push({
          toolCallId: toolCall.id,
          success: false,
          error: `Outil inconnu: ${toolCall.toolName}`,
          message: `L'outil "${toolCall.toolName}" n'existe pas.`
        })
        continue
      }

      if (tool.requiresConfirmation) {
        // Créer une action en attente de confirmation
        const actionId = `action-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        const confirmMessage = tool.confirmationMessage
          ? tool.confirmationMessage(toolCall.arguments)
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

      } else {
        // Exécuter directement
        const result = await toolExecutor.execute(toolCall)
        results.push(result)
      }
    }

    // Construire le message de réponse
    if (pendingActions.length > 0) {
      return {
        id: `msg-${Date.now()}`,
        type: 'action_request',
        content: text,
        toolCalls,
        pendingActions,
        timestamp: new Date()
      }
    }

    // Ajouter les résultats au texte
    const resultsText = results.map(r =>
      r.success ? `✅ ${r.message}` : `❌ ${r.message}`
    ).join('\n')

    return {
      id: `msg-${Date.now()}`,
      type: 'action_result',
      content: text + (resultsText ? `\n\n${resultsText}` : ''),
      toolCalls,
      results,
      timestamp: new Date()
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
    // Nettoyer les actions expirées
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
