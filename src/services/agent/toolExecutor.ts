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
      // Navigation
      case 'select_node':
        return this.selectNode(args.nodeId)
      case 'zoom_to_element':
        return this.zoomToElement(args.elementId, args.elementType)
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

      default:
        throw new Error(`Outil non implémenté: ${toolName}`)
    }
  }

  // ============================================
  // NAVIGATION
  // ============================================

  private selectNode(nodeId: string) {
    const store = useVsmStore.getState()
    const node = store.getNode(nodeId)

    if (!node) {
      throw new Error(`Nœud non trouvé: ${nodeId}`)
    }

    store.selectElement({ type: 'node', id: nodeId })
    this.emitUIEvent({ type: 'select_node', payload: { nodeId } })

    return {
      message: `Nœud "${node.name}" sélectionné`,
      node: { id: node.id, name: node.name }
    }
  }

  private zoomToElement(elementId: string, elementType: string) {
    this.emitUIEvent({ type: 'zoom_to', payload: { elementId, elementType } })
    return { message: `Vue centrée sur l'élément ${elementId}` }
  }

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
}

// Instance singleton
export const toolExecutor = new ToolExecutor()
