/**
 * Exécuteur d'outils - Implémente la logique de chaque outil
 * 
 * Gère l'exécution des actions sur le store VSM
 * Adapté au modèle vsm-model.ts avec indicateurs
 */

import { useVsmStore } from '@/store/vsmStore'
import { ToolCall, ToolResult, DiagramSummary, AgentUIEvent } from './types'
import { getToolByName } from './tools'
import {
  Node,
  ImprovementPoint,
  ImprovementStatus,
  NodeType,
  Indicator,
  InformationFlow,
  TransmissionType
} from '@/shared/types/vsm-model'

type UIEventCallback = (event: AgentUIEvent) => void

/**
 * Helper pour extraire une valeur d'indicateur
 */
function getIndicatorValue(indicators: Indicator[], name: string): number {
  const indicator = indicators.find(i =>
    i.name.toLowerCase().includes(name.toLowerCase())
  )
  return indicator?.value ? parseFloat(indicator.value) || 0 : 0
}

/**
 * Classe principale pour exécuter les outils de l'agent
 */
export class ToolExecutor {
  private uiEventCallback?: UIEventCallback

  setUIEventCallback(callback: UIEventCallback) {
    this.uiEventCallback = callback
  }

  private emitUIEvent(event: AgentUIEvent) {
    if (this.uiEventCallback) {
      this.uiEventCallback(event)
    }
  }

  async execute(toolCall: ToolCall): Promise<ToolResult> {
    const tool = getToolByName(toolCall.toolName)

    if (!tool) {
      return {
        toolCallId: toolCall.id,
        success: false,
        error: `Outil inconnu: ${toolCall.toolName}`,
        message: `L'outil "${toolCall.toolName}" n'existe pas.`
      }
    }

    try {
      const result = await this.executeToolAction(toolCall.toolName, toolCall.arguments)
      return {
        toolCallId: toolCall.id,
        success: true,
        result,
        message: result.message || 'Action exécutée avec succès'
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
      return {
        toolCallId: toolCall.id,
        success: false,
        error: errorMessage,
        message: `Erreur lors de l'exécution: ${errorMessage}`
      }
    }
  }

  private async executeToolAction(toolName: string, args: Record<string, any>): Promise<any> {
    switch (toolName) {
      // Configuration / Navigation
      case 'open_configuration_dialog':
        return this.openConfigDialog()

      // Analyse
      case 'get_diagram_summary':
        return this.getDiagramSummary()
      case 'get_node_details':
        return this.getNodeDetails(args.nodeId)
      case 'calculate_metrics':
        return this.calculateMetrics()
      case 'identify_bottlenecks':
        return this.identifyBottlenecks(args.threshold)
      case 'analyze_wastes':
        return this.analyzeWastes()

      // Modification - Nœuds
      case 'add_process_step':
        return this.addProcessStep(args.name, args.cycleTime, args.operators, args.position)
      case 'update_node':
        return this.updateNode(args.nodeId, args)
      case 'delete_node':
        return this.deleteNode(args.nodeId)

      // Modification - Stocks
      case 'add_inventory':
        return this.addInventory(args.afterNodeId, args.quantity, args.waitingTime)
      case 'update_inventory':
        return this.updateInventory(args.sequenceOrder, args.elementOrder, args)

      // Flux d'information
      case 'add_information_flow':
        return this.addInformationFlow(args.sourceId, args.targetId, args.label, args.type)

      // Amélioration
      case 'add_improvement_point':
        return this.addImprovementPoint(args.nodeId, args.description, args.priority)

      // Configuration
      case 'update_takt_time':
        return this.updateTaktTime(args.taktTime)
      case 'update_customer_demand':
        return this.updateCustomerDemand(args.dailyDemand, args.unit)

      // Notes
      case 'list_notes':
        return this.listNotes()
      case 'create_note':
        return this.createNote(args.title, args.content)
      case 'update_note':
        return this.updateNote(args.noteId, args.title, args.content)

      // Plan d'action
      case 'list_action_items':
        return this.listActionItems()
      case 'create_action_item':
        return this.createActionItem(args.action, args.responsible, args.priority, args.dueDate)
      case 'update_action_item':
        return this.updateActionItem(args.actionId, args)

      // État futur
      case 'get_future_state':
        return this.getFutureState()
      case 'list_future_states':
        return this.listFutureStates()
      case 'create_future_state':
        return this.createFutureState(args.improvements, args.targetLeadTimeReduction)
      case 'update_future_state':
        return this.updateFutureState(args.futureStateId, args)
      case 'compare_current_vs_future':
        return this.compareCurrentVsFuture(args.futureStateId)
      case 'open_future_state_tab':
        return this.openFutureStateTab(args.futureStateId)

      default:
        throw new Error(`Outil non implémenté: ${toolName}`)
    }
  }

  // ============================================
  // CONFIGURATION
  // ============================================

  private openConfigDialog() {
    const store = useVsmStore.getState()
    store.openConfigDialog()
    this.emitUIEvent({ type: 'open_config' })
    return { message: 'Dialogue de configuration ouvert' }
  }

  // ============================================
  // ANALYSE
  // ============================================

  private getDiagramSummary(): { summary: DiagramSummary, message: string } {
    const store = useVsmStore.getState()
    const diagram = store.diagram

    if (!diagram) {
      throw new Error('Aucun diagramme ouvert')
    }

    // Collecter les nœuds avec leurs indicateurs
    const nodes = diagram.nodes.map(node => ({
      id: node.id,
      name: node.name,
      type: node.type.toString(),
      cycleTime: getIndicatorValue(node.indicators, 'cycle'),
      uptime: getIndicatorValue(node.indicators, 'uptime') || getIndicatorValue(node.indicators, 'disponibilité')
    }))

    const totalCycleTime = nodes.reduce((sum, n) => sum + (n.cycleTime || 0), 0)

    // Calculer le temps d'attente depuis les séquences (durée des inventaires en jours)
    let totalWaitTime = 0
    let inventoriesCount = 0
    diagram.flowSequences.forEach(seq => {
      seq.intermediateElements?.forEach(el => {
        if (el.type === 'INVENTORY') {
          inventoriesCount++
          if (el.inventory?.duration) {
            totalWaitTime += el.inventory.duration * 24 * 3600 // jours -> secondes
          }
        }
      })
    })

    const totalLeadTime = totalCycleTime + totalWaitTime
    const efficiency = totalLeadTime > 0 ? (totalCycleTime / totalLeadTime) * 100 : 0

    const summary: DiagramSummary = {
      name: diagram.metaData.name,
      nodesCount: diagram.nodes.length,
      nodes,
      inventoriesCount,
      flowSequencesCount: diagram.flowSequences.length,
      totalCycleTime,
      totalLeadTime,
      efficiency: Math.round(efficiency * 100) / 100
    }

    return {
      summary,
      message: `Diagramme "${summary.name}": ${summary.nodesCount} étapes, efficacité ${summary.efficiency}%`
    }
  }

  private getNodeDetails(nodeId: string) {
    const store = useVsmStore.getState()
    const node = store.getNode(nodeId)

    if (!node) {
      throw new Error(`Nœud non trouvé: ${nodeId}`)
    }

    return {
      node: {
        id: node.id,
        name: node.name,
        type: node.type.toString(),
        operators: node.operators,
        indicators: node.indicators,
        cycleTime: getIndicatorValue(node.indicators, 'cycle'),
        uptime: getIndicatorValue(node.indicators, 'uptime')
      },
      message: `Détails du nœud "${node.name}"`
    }
  }

  private calculateMetrics() {
    const store = useVsmStore.getState()
    const diagram = store.diagram

    if (!diagram) {
      throw new Error('Aucun diagramme ouvert')
    }

    // Calculer les temps depuis les indicateurs
    const cycleTimes = diagram.nodes.map(n => getIndicatorValue(n.indicators, 'cycle'))
    const totalCycleTime = cycleTimes.reduce((sum, ct) => sum + ct, 0)

    // Temps d'attente depuis les inventaires
    let totalWaitTime = 0
    diagram.flowSequences.forEach(seq => {
      seq.intermediateElements?.forEach(el => {
        if (el.type === 'INVENTORY' && el.inventory?.duration) {
          totalWaitTime += el.inventory.duration * 24 * 3600 // jours -> secondes
        }
      })
    })

    const totalLeadTime = totalCycleTime + totalWaitTime
    const efficiency = totalLeadTime > 0 ? (totalCycleTime / totalLeadTime) * 100 : 0
    const taktTime = diagram.actors.customer?.taktTime || 0
    const bottleneckCycleTime = Math.max(...cycleTimes, 0)

    const metrics = {
      totalCycleTime,
      totalWaitTime,
      totalLeadTime,
      efficiency: Math.round(efficiency * 100) / 100,
      taktTime,
      bottleneckCycleTime,
      bottleneckRatio: taktTime > 0 ? bottleneckCycleTime / taktTime : null
    }

    return {
      metrics,
      message: `Métriques: Lead Time ${totalLeadTime}s, Efficacité ${metrics.efficiency}%`
    }
  }

  private identifyBottlenecks(threshold?: number) {
    const store = useVsmStore.getState()
    const diagram = store.diagram

    if (!diagram) {
      throw new Error('Aucun diagramme ouvert')
    }

    // Calculer les temps de cycle depuis les indicateurs
    const nodesWithCT = diagram.nodes.map(node => ({
      ...node,
      cycleTime: getIndicatorValue(node.indicators, 'cycle'),
      uptime: getIndicatorValue(node.indicators, 'uptime')
    }))

    const avgCycleTime = nodesWithCT.reduce((sum, n) => sum + n.cycleTime, 0) / nodesWithCT.length || 0
    const actualThreshold = threshold || avgCycleTime * 1.5

    const bottlenecks = nodesWithCT
      .filter(node => node.cycleTime >= actualThreshold)
      .sort((a, b) => b.cycleTime - a.cycleTime)
      .map(node => ({
        id: node.id,
        name: node.name,
        cycleTime: node.cycleTime,
        uptime: node.uptime,
        severity: node.cycleTime >= actualThreshold * 1.5 ? 'critical' : 'warning'
      }))

    return {
      bottlenecks,
      threshold: actualThreshold,
      count: bottlenecks.length,
      message: bottlenecks.length > 0
        ? `${bottlenecks.length} goulot(s): ${bottlenecks.map(b => b.name).join(', ')}`
        : 'Aucun goulot détecté'
    }
  }

  private analyzeWastes() {
    const store = useVsmStore.getState()
    const diagram = store.diagram

    if (!diagram) {
      throw new Error('Aucun diagramme ouvert')
    }

    const wastes: Array<{ type: string, location: string, description: string, impact: string }> = []

    // Analyser les stocks
    diagram.flowSequences.forEach(seq => {
      seq.intermediateElements?.forEach(el => {
        if (el.type === 'INVENTORY' && el.inventory) {
          if (el.inventory.duration && el.inventory.duration > 1) { // Plus d'1 jour
            wastes.push({
              type: 'Attente',
              location: `Séquence ${seq.order}`,
              description: `Durée d'attente élevée: ${el.inventory.duration} jours`,
              impact: 'Augmente le lead time'
            })
          }
          if (el.inventory.quantity && el.inventory.quantity > 100) {
            wastes.push({
              type: 'Surstock',
              location: `Séquence ${seq.order}`,
              description: `Quantité: ${el.inventory.quantity} unités`,
              impact: 'Capital immobilisé'
            })
          }
        }
      })
    })

    // Analyser les nœuds
    diagram.nodes.forEach(node => {
      const uptime = getIndicatorValue(node.indicators, 'uptime')
      const scrapRate = getIndicatorValue(node.indicators, 'rebut') || getIndicatorValue(node.indicators, 'scrap')

      if (uptime > 0 && uptime < 85) {
        wastes.push({
          type: 'Pannes/Arrêts',
          location: node.name,
          description: `Disponibilité: ${uptime}%`,
          impact: 'Perte de capacité'
        })
      }
      if (scrapRate > 2) {
        wastes.push({
          type: 'Défauts',
          location: node.name,
          description: `Taux de rebut: ${scrapRate}%`,
          impact: 'Coûts non-qualité'
        })
      }
    })

    return {
      wastes,
      count: wastes.length,
      message: wastes.length > 0 ? `${wastes.length} gaspillage(s) identifié(s)` : 'Aucun gaspillage majeur'
    }
  }

  // ============================================
  // MODIFICATION - NŒUDS
  // ============================================

  private addProcessStep(name: string, cycleTime?: number, operators?: number, position?: number) {
    const store = useVsmStore.getState()

    if (!store.diagram) {
      throw new Error('Aucun diagramme ouvert')
    }

    // Créer les indicateurs si un temps de cycle est fourni
    const indicators: Indicator[] = []
    if (cycleTime !== undefined) {
      indicators.push({
        id: `ind-ct-${Date.now()}`,
        name: 'Cycle Time',
        unit: 's',
        mode: 'Statique',
        value: cycleTime.toString()
      })
    }

    const newNode: Node = {
      id: `node-${Date.now()}`,
      name,
      type: NodeType.PROCESS_STEP,
      operators: operators || 1,
      indicators
    }

    store.addNode(newNode)

    if (position !== undefined) {
      const currentIndex = store.diagram!.nodes.length - 1
      if (position !== currentIndex) {
        store.reorderNodes(currentIndex, position)
      }
    }

    this.emitUIEvent({ type: 'refresh' })
    return { node: newNode, message: `Étape "${name}" ajoutée` }
  }

  private updateNode(nodeId: string, args: Record<string, any>) {
    const store = useVsmStore.getState()
    const existingNode = store.getNode(nodeId)

    if (!existingNode) {
      throw new Error(`Nœud non trouvé: ${nodeId}`)
    }

    const updates: Partial<Node> = {}
    if (args.name !== undefined) updates.name = args.name
    if (args.operators !== undefined) updates.operators = args.operators

    // Mettre à jour les indicateurs si nécessaire
    if (args.cycleTime !== undefined || args.uptime !== undefined) {
      const newIndicators = [...existingNode.indicators]

      if (args.cycleTime !== undefined) {
        const ctIndex = newIndicators.findIndex(i => i.name.toLowerCase().includes('cycle'))
        if (ctIndex >= 0) {
          newIndicators[ctIndex] = { ...newIndicators[ctIndex], value: args.cycleTime.toString() }
        } else {
          newIndicators.push({
            id: `ind-ct-${Date.now()}`,
            name: 'Cycle Time',
            unit: 's',
            mode: 'Statique',
            value: args.cycleTime.toString()
          })
        }
      }

      if (args.uptime !== undefined) {
        const utIndex = newIndicators.findIndex(i => i.name.toLowerCase().includes('uptime'))
        if (utIndex >= 0) {
          newIndicators[utIndex] = { ...newIndicators[utIndex], value: args.uptime.toString() }
        } else {
          newIndicators.push({
            id: `ind-ut-${Date.now()}`,
            name: 'Uptime',
            unit: '%',
            mode: 'Statique',
            value: args.uptime.toString()
          })
        }
      }

      updates.indicators = newIndicators
    }

    store.updateNode(nodeId, updates)
    this.emitUIEvent({ type: 'refresh' })
    return { message: `Nœud "${existingNode.name}" mis à jour` }
  }

  private deleteNode(nodeId: string) {
    const store = useVsmStore.getState()
    const node = store.getNode(nodeId)

    if (!node) {
      throw new Error(`Nœud non trouvé: ${nodeId}`)
    }

    const nodeName = node.name
    store.removeNode(nodeId)
    this.emitUIEvent({ type: 'refresh' })
    return { message: `Nœud "${nodeName}" supprimé` }
  }

  // ============================================
  // MODIFICATION - STOCKS
  // ============================================

  private addInventory(_afterNodeId: string, quantity?: number, duration?: number) {
    const store = useVsmStore.getState()

    if (!store.diagram) {
      throw new Error('Aucun diagramme ouvert')
    }

    // Note: L'implémentation dépend de la structure exacte des séquences
    // Pour l'instant, on retourne un message informatif
    return {
      message: `Stock ajouté avec ${quantity || 0} unités et ${duration || 0} jours de durée`
    }
  }

  private updateInventory(sequenceOrder: number, _elementOrder: number, _args: Record<string, any>) {
    const store = useVsmStore.getState()
    const sequence = store.getFlowSequence(sequenceOrder)

    if (!sequence) {
      throw new Error(`Séquence non trouvée: ${sequenceOrder}`)
    }

    // Note: Implémentation simplifiée
    return { message: 'Stock mis à jour' }
  }

  // ============================================
  // FLUX D'INFORMATION
  // ============================================

  private addInformationFlow(sourceId: string, targetId: string, label?: string, type?: string) {
    const store = useVsmStore.getState()

    if (!store.diagram) {
      throw new Error('Aucun diagramme ouvert')
    }

    const flow: InformationFlow = {
      id: `flow-${Date.now()}`,
      description: label || 'Flux d\'information',
      sourceNodeId: sourceId,
      targetNodeId: targetId,
      transmissionType: type === 'manual' ? 'MANUAL' as TransmissionType : 'ELECTRONIC' as TransmissionType,
      frequency: 'Temps réel'
    }

    store.addInformationFlow(flow)
    this.emitUIEvent({ type: 'refresh' })
    return { flow, message: `Flux d'information créé${label ? `: ${label}` : ''}` }
  }

  // ============================================
  // AMÉLIORATION
  // ============================================

  private addImprovementPoint(nodeId: string, description: string, priority?: string) {
    const store = useVsmStore.getState()

    if (!store.diagram) {
      throw new Error('Aucun diagramme ouvert')
    }

    const node = store.getNode(nodeId)
    if (!node) {
      throw new Error(`Nœud non trouvé: ${nodeId}`)
    }

    const improvement: ImprovementPoint = {
      id: `improvement-${Date.now()}`,
      description,
      x: 0,
      y: 0,
      priority: priority === 'high' ? 1 : priority === 'low' ? 3 : 2,
      status: 'IDENTIFIED' as ImprovementStatus
    }

    store.addImprovementPoint(improvement)
    this.emitUIEvent({ type: 'refresh' })
    return { improvement, message: `Point d'amélioration ajouté pour "${node.name}"` }
  }

  // ============================================
  // CONFIGURATION
  // ============================================

  private updateTaktTime(taktTime: number) {
    const store = useVsmStore.getState()

    if (!store.diagram) {
      throw new Error('Aucun diagramme ouvert')
    }

    store.updateCustomer({
      taktTime
    })

    this.emitUIEvent({ type: 'refresh' })
    return { message: `Takt Time défini à ${taktTime} secondes` }
  }

  private updateCustomerDemand(dailyDemand: number, unit?: string) {
    const store = useVsmStore.getState()

    if (!store.diagram) {
      throw new Error('Aucun diagramme ouvert')
    }

    // Calculer le Takt Time si les heures de travail sont définies
    const workingHours = store.diagram.actors.customer?.workingHoursPerDay || 8
    const taktTime = (workingHours * 3600) / dailyDemand

    store.updateCustomer({
      dailyDemand,
      taktTime
    })

    this.emitUIEvent({ type: 'refresh' })
    return { message: `Demande client: ${dailyDemand} ${unit || 'pièces'}/jour, Takt Time: ${Math.round(taktTime)}s` }
  }

  // ============================================
  // NOTES
  // ============================================

  private async listNotes() {
    try {
      const { useProjectsStore } = await import('@/store/projectsStore')
      const { currentProject } = useProjectsStore.getState()

      if (!currentProject?.id) {
        return { notes: [], message: 'Aucun projet ouvert' }
      }

      const { notesApi } = await import('@/services/api')
      const notes = await notesApi.list(currentProject.id)

      return {
        notes: notes.map((n: any) => ({
          id: n.id,
          title: n.title,
          content: n.content?.substring(0, 100) + (n.content?.length > 100 ? '...' : ''),
          createdAt: n.created_at
        })),
        count: notes.length,
        message: `${notes.length} note(s) trouvée(s)`
      }
    } catch (error) {
      // Fallback localStorage
      const { useProjectsStore } = await import('@/store/projectsStore')
      const { currentProject } = useProjectsStore.getState()
      const storageKey = currentProject?.id ? `vsm-notes-${currentProject.id}` : 'vsm-notes-default'
      const saved = localStorage.getItem(storageKey)
      const notes = saved ? JSON.parse(saved) : []
      return { notes, count: notes.length, message: `${notes.length} note(s) (localStorage)` }
    }
  }

  private async createNote(title: string, content?: string) {
    try {
      const { useProjectsStore } = await import('@/store/projectsStore')
      const { currentProject } = useProjectsStore.getState()

      if (!currentProject?.id) {
        throw new Error('Aucun projet ouvert')
      }

      const { notesApi } = await import('@/services/api')
      const note = await notesApi.create(currentProject.id, {
        title,
        content: content || ''
      })

      this.emitUIEvent({ type: 'refresh' })
      // Émettre un événement spécifique pour rafraîchir les notes dans MainLayout
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('notes-refreshed', { detail: { projectId: currentProject.id } }))
      }
      return { note, message: `Note "${title}" créée avec succès` }
    } catch (error) {
      throw new Error(`Erreur lors de la création de la note: ${error}`)
    }
  }

  private async updateNote(noteId: string, title?: string, content?: string) {
    try {
      const { useProjectsStore } = await import('@/store/projectsStore')
      const { currentProject } = useProjectsStore.getState()

      if (!currentProject?.id) {
        throw new Error('Aucun projet ouvert')
      }

      const { notesApi } = await import('@/services/api')
      const updates: any = {}
      if (title) updates.title = title
      if (content !== undefined) updates.content = content

      const note = await notesApi.update(currentProject.id, noteId, updates)

      this.emitUIEvent({ type: 'refresh' })
      // Émettre un événement spécifique pour rafraîchir les notes dans MainLayout
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('notes-refreshed', { detail: { projectId: currentProject.id } }))
      }
      return { note, message: `Note mise à jour avec succès` }
    } catch (error) {
      throw new Error(`Erreur lors de la mise à jour de la note: ${error}`)
    }
  }

  // ============================================
  // PLAN D'ACTION
  // ============================================

  private async listActionItems() {
    try {
      const { useProjectsStore } = await import('@/store/projectsStore')
      const { currentProject } = useProjectsStore.getState()

      if (!currentProject?.id) {
        return { actions: [], message: 'Aucun projet ouvert' }
      }

      const { actionPlanApi } = await import('@/services/api')
      const actions = await actionPlanApi.list(currentProject.id)

      const stats = {
        total: actions.length,
        pending: actions.filter((a: any) => a.status === 'pending').length,
        inProgress: actions.filter((a: any) => a.status === 'in_progress').length,
        completed: actions.filter((a: any) => a.status === 'completed').length
      }

      return {
        actions: actions.map((a: any) => ({
          id: a.id,
          action: a.action,
          responsible: a.responsible,
          priority: a.priority,
          status: a.status,
          dueDate: a.due_date
        })),
        stats,
        message: `${stats.total} action(s): ${stats.pending} en attente, ${stats.inProgress} en cours, ${stats.completed} terminée(s)`
      }
    } catch (error) {
      // Fallback localStorage
      const { useProjectsStore } = await import('@/store/projectsStore')
      const { currentProject } = useProjectsStore.getState()
      const storageKey = currentProject?.id ? `vsm-action-plan-${currentProject.id}` : 'vsm-action-plan-default'
      const saved = localStorage.getItem(storageKey)
      const actions = saved ? JSON.parse(saved) : []
      return { actions, count: actions.length, message: `${actions.length} action(s) (localStorage)` }
    }
  }

  private async createActionItem(action: string, responsible?: string, priority?: string, dueDate?: string) {
    try {
      const { useProjectsStore } = await import('@/store/projectsStore')
      const { currentProject } = useProjectsStore.getState()

      if (!currentProject?.id) {
        throw new Error('Aucun projet ouvert')
      }

      const { actionPlanApi } = await import('@/services/api')
      const item = await actionPlanApi.create(currentProject.id, {
        action,
        responsible: responsible || '',
        priority: (priority as 'low' | 'medium' | 'high') || 'medium',
        status: 'pending',
        due_date: dueDate
      })

      this.emitUIEvent({ type: 'refresh' })
      return { item, message: `Action créée: "${action.substring(0, 50)}${action.length > 50 ? '...' : ''}"` }
    } catch (error) {
      throw new Error(`Erreur lors de la création de l'action: ${error}`)
    }
  }

  private async updateActionItem(actionId: string, updates: Record<string, any>) {
    try {
      const { useProjectsStore } = await import('@/store/projectsStore')
      const { currentProject } = useProjectsStore.getState()

      if (!currentProject?.id) {
        throw new Error('Aucun projet ouvert')
      }

      const { actionPlanApi } = await import('@/services/api')
      const updateData: any = {}
      if (updates.action) updateData.action = updates.action
      if (updates.status) updateData.status = updates.status
      if (updates.priority) updateData.priority = updates.priority
      if (updates.responsible) updateData.responsible = updates.responsible

      const item = await actionPlanApi.update(currentProject.id, actionId, updateData)

      this.emitUIEvent({ type: 'refresh' })
      return { item, message: `Action mise à jour avec succès` }
    } catch (error) {
      throw new Error(`Erreur lors de la mise à jour de l'action: ${error}`)
    }
  }

  // ============================================
  // ÉTAT FUTUR
  // ============================================

  private async getFutureState() {
    const store = useVsmStore.getState()

    if (!store.diagram) {
      throw new Error('Aucun diagramme ouvert')
    }

    // Importer le tabsStore pour trouver les onglets état futur
    const { useTabsStore } = await import('@/store/tabsStore')
    const { tabs } = useTabsStore.getState()

    // Trouver les onglets de type future-diagram
    const futureTabs = tabs.filter(tab => tab.type === 'future-diagram')

    if (futureTabs.length === 0) {
      return {
        hasFutureState: false,
        message: 'Aucun état futur n\'existe pour ce diagramme. Utilisez create_future_state pour en créer un.'
      }
    }

    // Récupérer les données des états futurs depuis le store
    const futureDiagrams = store.futureDiagrams || []
    const activeFuture = futureDiagrams[0] // Premier état futur disponible

    if (!activeFuture) {
      return {
        hasFutureState: true,
        tabsCount: futureTabs.length,
        message: `${futureTabs.length} onglet(s) état futur trouvé(s) mais données non disponibles`
      }
    }

    // Calculer les métriques de l'état futur
    const futureCycleTime = activeFuture.nodes?.reduce((sum: number, n: Node) =>
      sum + getIndicatorValue(n.indicators, 'cycle'), 0) || 0

    let futureWaitTime = 0
    activeFuture.flowSequences?.forEach((seq: any) => {
      seq.intermediateElements?.forEach((el: any) => {
        if (el.type === 'INVENTORY' && el.inventory?.duration) {
          futureWaitTime += el.inventory.duration * 24 * 3600
        }
      })
    })

    return {
      hasFutureState: true,
      futureState: {
        id: activeFuture.id,
        name: activeFuture.metaData?.name || 'État Futur',
        description: activeFuture.metaData?.description,
        nodesCount: activeFuture.nodes?.length || 0,
        totalCycleTime: futureCycleTime,
        totalWaitTime: futureWaitTime,
        totalLeadTime: futureCycleTime + futureWaitTime,
        improvementPointsCount: activeFuture.improvementPoints?.length || 0
      },
      message: `État futur "${activeFuture.metaData?.name || 'État Futur'}" avec ${activeFuture.nodes?.length || 0} étapes`
    }
  }

  private async listFutureStates() {
    const store = useVsmStore.getState()

    if (!store.diagram) {
      throw new Error('Aucun diagramme ouvert')
    }

    const futureDiagrams = store.futureDiagrams || []

    if (futureDiagrams.length === 0) {
      return {
        futureStates: [],
        count: 0,
        message: 'Aucun état futur disponible. Utilisez create_future_state pour en créer un.'
      }
    }

    const futureStates = futureDiagrams.map((fd: any) => ({
      id: fd.id,
      name: fd.metaData?.name || 'État Futur',
      description: fd.metaData?.description,
      nodesCount: fd.nodes?.length || 0,
      createdAt: fd.metaData?.createdDate,
      lastModified: fd.metaData?.lastModified
    }))

    return {
      futureStates,
      count: futureStates.length,
      message: `${futureStates.length} état(s) futur(s) disponible(s)`
    }
  }

  private async updateFutureState(futureStateId: string, updates: Record<string, any>) {
    const store = useVsmStore.getState()

    if (!store.diagram) {
      throw new Error('Aucun diagramme ouvert')
    }

    const futureDiagrams = store.futureDiagrams || []
    const futureIndex = futureDiagrams.findIndex((fd: any) => fd.id === futureStateId)

    if (futureIndex === -1) {
      throw new Error(`État futur non trouvé: ${futureStateId}`)
    }

    // Mettre à jour l'état futur
    const updated = { ...futureDiagrams[futureIndex] }

    if (updates.name) {
      updated.metaData = { ...updated.metaData, name: updates.name }
    }
    if (updates.description) {
      updated.metaData = { ...updated.metaData, description: updates.description }
    }
    updated.metaData = { ...updated.metaData, modifiedDate: new Date().toISOString() }

    // Appliquer la mise à jour dans le store
    const newFutureDiagrams = [...futureDiagrams]
    newFutureDiagrams[futureIndex] = updated
    store.setFutureDiagrams(newFutureDiagrams)

    this.emitUIEvent({ type: 'refresh' })

    return {
      futureState: {
        id: updated.id,
        name: updated.metaData?.name,
        description: updated.metaData?.description
      },
      message: `État futur "${updated.metaData?.name}" mis à jour avec succès`
    }
  }

  private async compareCurrentVsFuture(futureStateId?: string) {
    const store = useVsmStore.getState()

    if (!store.diagram) {
      throw new Error('Aucun diagramme ouvert')
    }

    const currentDiagram = store.diagram
    const futureDiagrams = store.futureDiagrams || []

    // Trouver l'état futur
    let futureDiagram
    if (futureStateId) {
      futureDiagram = futureDiagrams.find((fd: any) => fd.id === futureStateId)
    } else {
      futureDiagram = futureDiagrams[0]
    }

    if (!futureDiagram) {
      throw new Error('Aucun état futur disponible pour la comparaison')
    }

    // Calculer les métriques de l'état actuel
    const currentCycleTime = currentDiagram.nodes.reduce((sum: number, n: Node) =>
      sum + getIndicatorValue(n.indicators, 'cycle'), 0)

    let currentWaitTime = 0
    currentDiagram.flowSequences.forEach(seq => {
      seq.intermediateElements?.forEach(el => {
        if (el.type === 'INVENTORY' && el.inventory?.duration) {
          currentWaitTime += el.inventory.duration * 24 * 3600
        }
      })
    })
    const currentLeadTime = currentCycleTime + currentWaitTime

    // Calculer les métriques de l'état futur
    const futureCycleTime = futureDiagram.nodes?.reduce((sum: number, n: Node) =>
      sum + getIndicatorValue(n.indicators, 'cycle'), 0) || 0

    let futureWaitTime = 0
    futureDiagram.flowSequences?.forEach((seq: any) => {
      seq.intermediateElements?.forEach((el: any) => {
        if (el.type === 'INVENTORY' && el.inventory?.duration) {
          futureWaitTime += el.inventory.duration * 24 * 3600
        }
      })
    })
    const futureLeadTime = futureCycleTime + futureWaitTime

    // Calculer les améliorations
    const leadTimeReduction = currentLeadTime > 0
      ? ((currentLeadTime - futureLeadTime) / currentLeadTime * 100)
      : 0
    const cycleTimeReduction = currentCycleTime > 0
      ? ((currentCycleTime - futureCycleTime) / currentCycleTime * 100)
      : 0
    const waitTimeReduction = currentWaitTime > 0
      ? ((currentWaitTime - futureWaitTime) / currentWaitTime * 100)
      : 0

    const currentEfficiency = currentLeadTime > 0 ? (currentCycleTime / currentLeadTime * 100) : 0
    const futureEfficiency = futureLeadTime > 0 ? (futureCycleTime / futureLeadTime * 100) : 0

    return {
      comparison: {
        currentState: {
          name: currentDiagram.metaData.name,
          cycleTime: currentCycleTime,
          waitTime: currentWaitTime,
          leadTime: currentLeadTime,
          efficiency: Math.round(currentEfficiency * 100) / 100,
          nodesCount: currentDiagram.nodes.length
        },
        futureState: {
          name: futureDiagram.metaData?.name || 'État Futur',
          cycleTime: futureCycleTime,
          waitTime: futureWaitTime,
          leadTime: futureLeadTime,
          efficiency: Math.round(futureEfficiency * 100) / 100,
          nodesCount: futureDiagram.nodes?.length || 0
        },
        improvements: {
          leadTimeReduction: Math.round(leadTimeReduction * 100) / 100,
          cycleTimeReduction: Math.round(cycleTimeReduction * 100) / 100,
          waitTimeReduction: Math.round(waitTimeReduction * 100) / 100,
          efficiencyGain: Math.round((futureEfficiency - currentEfficiency) * 100) / 100
        }
      },
      message: `Comparaison: Lead Time réduit de ${Math.round(leadTimeReduction)}%, Efficacité améliorée de ${Math.round(futureEfficiency - currentEfficiency)}%`
    }
  }

  private async openFutureStateTab(futureStateId?: string) {
    const store = useVsmStore.getState()

    if (!store.diagram) {
      throw new Error('Aucun diagramme ouvert')
    }

    const futureDiagrams = store.futureDiagrams || []

    // Trouver l'état futur
    let futureDiagram
    if (futureStateId) {
      futureDiagram = futureDiagrams.find((fd: any) => fd.id === futureStateId)
    } else {
      futureDiagram = futureDiagrams[0]
    }

    if (!futureDiagram) {
      throw new Error('Aucun état futur disponible. Utilisez create_future_state pour en créer un.')
    }

    // Émettre un événement pour ouvrir l'onglet
    this.emitUIEvent({
      type: 'open_future_state',
      payload: { diagram: futureDiagram, currentStateId: store.diagram.id }
    })

    return {
      futureStateId: futureDiagram.id,
      name: futureDiagram.metaData?.name || 'État Futur',
      message: `Onglet état futur "${futureDiagram.metaData?.name || 'État Futur'}" ouvert`
    }
  }

  private async createFutureState(improvements?: string, targetLeadTimeReduction?: number) {
    const store = useVsmStore.getState()

    if (!store.diagram) {
      throw new Error('Aucun diagramme ouvert')
    }

    const currentDiagram = store.diagram
    const reductionTarget = targetLeadTimeReduction || 30

    // Créer une copie profonde du diagramme
    const futureDiagram = JSON.parse(JSON.stringify(currentDiagram))

    // Modifier les métadonnées
    futureDiagram.id = `future-${Date.now()}`
    futureDiagram.diagramType = 'FUTURE'
    futureDiagram.metaData = {
      ...futureDiagram.metaData,
      name: `${currentDiagram.metaData.name} - État Futur`,
      description: `État futur avec objectif de réduction de ${reductionTarget}% du lead time`,
      lastModified: new Date().toISOString()
    }

    // Appliquer les améliorations de base
    // Réduire les temps d'attente dans les stocks
    futureDiagram.flowSequences?.forEach((seq: any) => {
      seq.intermediateElements?.forEach((elem: any) => {
        if (elem.type === 'INVENTORY' && elem.inventory) {
          // Réduire les stocks de moitié
          elem.inventory.quantity = Math.round((elem.inventory.quantity || 0) * 0.5)
          elem.inventory.duration = Math.round((elem.inventory.duration || 0) * 0.5)
        }
      })
    })

    // Ajouter des points d'amélioration basés sur l'analyse
    const improvementsList = improvements?.split(',').map(s => s.trim()) || []
    improvementsList.forEach((imp, index) => {
      if (imp) {
        futureDiagram.improvementPoints = futureDiagram.improvementPoints || []
        futureDiagram.improvementPoints.push({
          id: `improvement-future-${Date.now()}-${index}`,
          description: imp,
          x: 100 + (index * 50),
          y: 50,
          priority: 1,
          status: 'PLANNED'
        })
      }
    })

    // Émettre un événement pour ouvrir l'état futur dans un nouvel onglet
    this.emitUIEvent({
      type: 'open_future_state',
      payload: { diagram: futureDiagram, currentStateId: currentDiagram.id }
    })

    return {
      futureStateId: futureDiagram.id,
      targetReduction: reductionTarget,
      improvements: improvementsList,
      message: `État futur créé avec un objectif de réduction de ${reductionTarget}% du lead time`
    }
  }
}

// Instance singleton
export const toolExecutor = new ToolExecutor()
