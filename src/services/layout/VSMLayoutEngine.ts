/**
 * VSM Layout Engine - Algorithme de layout automatique
 * 
 * Port TypeScript de l'algorithme Java VSMLayoutEngine
 * Transforme le modèle de données VSMDiagram en coordonnées (x, y) pour chaque élément
 */

import { 
  VSMDiagram, 
  Node, 
  NodeType,
  Inventory
} from '@/shared/types/vsm-model'

// ============================================
// CONSTANTES DE LAYOUT
// ============================================

export const LayoutConstants = {
  // Dimensions des éléments
  PROCESS_STEP_WIDTH: 120,
  PROCESS_STEP_HEIGHT: 80,
  ACTOR_WIDTH: 100,
  ACTOR_HEIGHT: 60,
  INVENTORY_WIDTH: 60,
  INVENTORY_HEIGHT: 50,
  CONTROL_CENTER_WIDTH: 140,
  CONTROL_CENTER_HEIGHT: 60,
  DATA_BOX_WIDTH: 100,
  DATA_BOX_MIN_HEIGHT: 60,
  DATA_BOX_LINE_HEIGHT: 16,

  // Espacements
  HORIZONTAL_SPACING: 80,
  VERTICAL_LANE_SPACING: 100,
  MARGIN_LEFT: 150,
  MARGIN_TOP: 50,
  MARGIN_RIGHT: 150,
  MARGIN_BOTTOM: 50,

  // Positions Y des swimlanes
  ACTORS_Y: 50,
  INFO_FLOW_Y: 150,
  PRODUCTION_Y: 250,
  DATA_Y: 380,
  TIMELINE_Y: 500,

  // Timeline
  TIMELINE_LINE_THICKNESS: 3,
  TIMELINE_VA_HEIGHT: 30,
  TIMELINE_NVA_HEIGHT: 30,
  TIMELINE_TEXT_SPACING: 5,

  // Canvas par défaut
  DEFAULT_CANVAS_WIDTH: 1600,
  DEFAULT_CANVAS_HEIGHT: 800,
}

// ============================================
// TYPES
// ============================================

export type PositionType = 
  | 'process-step' 
  | 'inventory' 
  | 'actor' 
  | 'control-center' 
  | 'data-box' 
  | 'timeline-va' 
  | 'timeline-nva' 
  | 'timeline-line'

export type ConnectionType = 'material-flow' | 'information-flow'

export interface LayoutPosition {
  id: string
  x: number
  y: number
  width: number
  height: number
  type: PositionType
  metadata?: Record<string, unknown>
}

export interface LayoutConnection {
  id: string
  sourceId: string
  targetId: string
  type: ConnectionType
  flowType?: string
  label?: string
  points?: { x: number; y: number }[]
}

export interface LayoutResult {
  totalWidth: number
  totalHeight: number
  positions: Map<string, LayoutPosition>
  connections: LayoutConnection[]
}

// ============================================
// LAYOUT ENGINE
// ============================================

export class VSMLayoutEngine {
  private currentX: number = 0

  constructor() {}

  /**
   * Calcule le layout complet du diagramme
   */
  computeLayout(diagram: VSMDiagram): LayoutResult {
    const result: LayoutResult = {
      totalWidth: LayoutConstants.DEFAULT_CANVAS_WIDTH,
      totalHeight: LayoutConstants.DEFAULT_CANVAS_HEIGHT,
      positions: new Map(),
      connections: []
    }

    console.log('=== VSMLayoutEngine: Début du calcul de layout ===')
    console.log(`Diagramme: ${diagram.metaData.name}`)
    console.log(`  - ${diagram.nodes.length} Nodes`)
    console.log(`  - ${diagram.flowSequences.length} FlowSequences`)
    console.log(`  - ${diagram.informationFlows.length} InformationFlows`)

    // Calculer la largeur du flux de production
    const productionElements = this.countProductionElements(diagram)
    const productionWidth = this.calculateProductionWidth(productionElements)
    const startX = Math.max(
      LayoutConstants.MARGIN_LEFT,
      (LayoutConstants.DEFAULT_CANVAS_WIDTH - productionWidth) / 2
    )

    this.currentX = startX

    // Étape 1 : Positionner les acteurs et le centre de contrôle
    this.layoutActorsAndControlCenter(diagram, result, productionWidth, startX)

    // Étape 2 : Positionner le flux de production principal (nodes + inventories)
    this.layoutProductionFlow(diagram, result)

    // Étape 3 : Positionner les data boxes (indicateurs)
    this.layoutDataBoxes(diagram, result)

    // Étape 4 : Calculer la timeline
    this.layoutTimeline(diagram, result)

    // Étape 5 : Calculer les connexions (flux d'information)
    this.layoutConnections(diagram, result)

    // Normaliser et calculer les dimensions totales
    this.normalizeResult(result)

    console.log(`=== Layout terminé : ${result.positions.size} éléments positionnés ===`)
    return result
  }

  /**
   * Compte les éléments dans le flux de production
   */
  private countProductionElements(diagram: VSMDiagram): { nodes: number; inventories: number } {
    let inventoryCount = 0
    for (const seq of diagram.flowSequences) {
      for (const elem of seq.intermediateElements) {
        if (elem.type === 'INVENTORY' && elem.inventory) {
          inventoryCount++
        }
      }
    }
    return {
      nodes: diagram.nodes.length,
      inventories: inventoryCount
    }
  }

  /**
   * Calcule la largeur totale du flux de production
   */
  private calculateProductionWidth(elements: { nodes: number; inventories: number }): number {
    const nodesWidth = elements.nodes * LayoutConstants.PROCESS_STEP_WIDTH
    const inventoriesWidth = elements.inventories * LayoutConstants.INVENTORY_WIDTH
    const spacingWidth = (elements.nodes + elements.inventories - 1) * LayoutConstants.HORIZONTAL_SPACING
    return nodesWidth + inventoriesWidth + spacingWidth
  }

  /**
   * Étape 1 : Positionne les acteurs et le centre de contrôle
   */
  private layoutActorsAndControlCenter(
    diagram: VSMDiagram, 
    result: LayoutResult,
    productionWidth: number,
    startX: number
  ): void {
    const { actors } = diagram

    // Fournisseur à gauche
    if (actors.supplier) {
      result.positions.set('supplier', {
        id: 'supplier',
        x: LayoutConstants.MARGIN_LEFT - LayoutConstants.ACTOR_WIDTH - 30,
        y: LayoutConstants.PRODUCTION_Y,
        width: LayoutConstants.ACTOR_WIDTH,
        height: LayoutConstants.ACTOR_HEIGHT,
        type: 'actor',
        metadata: { 
          role: 'supplier', 
          name: actors.supplier.name,
          deliveryFrequency: actors.supplier.deliveryFrequency
        }
      })
    }

    // Client à droite
    if (actors.customer) {
      result.positions.set('customer', {
        id: 'customer',
        x: startX + productionWidth + 30,
        y: LayoutConstants.PRODUCTION_Y,
        width: LayoutConstants.ACTOR_WIDTH,
        height: LayoutConstants.ACTOR_HEIGHT,
        type: 'actor',
        metadata: { 
          role: 'customer', 
          name: actors.customer.name,
          dailyDemand: actors.customer.dailyDemand
        }
      })
    }

    // Centre de contrôle en haut au centre
    if (actors.controlCenter) {
      const centerX = (LayoutConstants.DEFAULT_CANVAS_WIDTH - LayoutConstants.CONTROL_CENTER_WIDTH) / 2
      result.positions.set('control-center', {
        id: 'control-center',
        x: centerX,
        y: LayoutConstants.ACTORS_Y,
        width: LayoutConstants.CONTROL_CENTER_WIDTH,
        height: LayoutConstants.CONTROL_CENTER_HEIGHT,
        type: 'control-center',
        metadata: { name: actors.controlCenter.name }
      })
    }
  }

  /**
   * Étape 2 : Positionne le flux de production principal
   * Structure: Réception -> [inventory_initiale] -> nodes avec inventories -> [inventory_finale] -> Livraison
   */
  private layoutProductionFlow(diagram: VSMDiagram, result: LayoutResult): void {
    // Les nodes sont dans l'ordre du flux
    const nodes = diagram.nodes.filter(n => n.type === NodeType.PROCESS_STEP)
    
    // === PSEUDO-ÉTAPE RÉCEPTION ===
    result.positions.set('reception', {
      id: 'reception',
      x: this.currentX,
      y: LayoutConstants.PRODUCTION_Y,
      width: LayoutConstants.PROCESS_STEP_WIDTH,
      height: LayoutConstants.PROCESS_STEP_HEIGHT,
      type: 'process-step',
      metadata: { 
        name: 'Réception',
        isPseudo: true,
        operators: 0
      }
    })
    this.currentX += LayoutConstants.PROCESS_STEP_WIDTH + LayoutConstants.HORIZONTAL_SPACING

    // Construire la séquence complète
    const sequence: Array<{ type: 'node' | 'inventory'; item: Node | Inventory }> = []

    // Chercher un inventory initial (stock de matières premières)
    const initialSeq = diagram.flowSequences.find(fs => !fs.fromNodeId || fs.fromNodeId === 'supplier')
    if (initialSeq) {
      for (const elem of initialSeq.intermediateElements) {
        if (elem.type === 'INVENTORY' && elem.inventory) {
          sequence.push({ type: 'inventory', item: elem.inventory })
        }
      }
    }

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i]
      
      // Trouver la séquence qui a ce node comme source
      const flowSeq = diagram.flowSequences.find(fs => fs.fromNodeId === node.id)

      // Ajouter le node
      sequence.push({ type: 'node', item: node })

      // Ajouter les inventories après ce node
      if (flowSeq) {
        for (const elem of flowSeq.intermediateElements) {
          if (elem.type === 'INVENTORY' && elem.inventory) {
            sequence.push({ type: 'inventory', item: elem.inventory })
          }
        }
      }
    }

    // Positionner tous les éléments
    for (const item of sequence) {
      if (item.type === 'node') {
        const node = item.item as Node
        result.positions.set(node.id, {
          id: node.id,
          x: this.currentX,
          y: LayoutConstants.PRODUCTION_Y,
          width: LayoutConstants.PROCESS_STEP_WIDTH,
          height: LayoutConstants.PROCESS_STEP_HEIGHT,
          type: 'process-step',
          metadata: { 
            name: node.name, 
            operators: node.operators,
            indicators: node.indicators
          }
        })
        this.currentX += LayoutConstants.PROCESS_STEP_WIDTH + LayoutConstants.HORIZONTAL_SPACING
      } else {
        const inventory = item.item as Inventory
        result.positions.set(inventory.id, {
          id: inventory.id,
          x: this.currentX,
          y: LayoutConstants.PRODUCTION_Y + 20, // Légèrement décalé pour centrer visuellement
          width: LayoutConstants.INVENTORY_WIDTH,
          height: LayoutConstants.INVENTORY_HEIGHT,
          type: 'inventory',
          metadata: { 
            name: inventory.name,
            type: inventory.type,
            quantity: inventory.quantity,
            duration: inventory.duration
          }
        })
        this.currentX += LayoutConstants.INVENTORY_WIDTH + LayoutConstants.HORIZONTAL_SPACING
      }
    }

    // === PSEUDO-ÉTAPE LIVRAISON ===
    result.positions.set('livraison', {
      id: 'livraison',
      x: this.currentX,
      y: LayoutConstants.PRODUCTION_Y,
      width: LayoutConstants.PROCESS_STEP_WIDTH,
      height: LayoutConstants.PROCESS_STEP_HEIGHT,
      type: 'process-step',
      metadata: { 
        name: 'Livraison',
        isPseudo: true,
        operators: 0
      }
    })
    this.currentX += LayoutConstants.PROCESS_STEP_WIDTH + LayoutConstants.HORIZONTAL_SPACING
  }

  /**
   * Étape 3 : Positionne les data boxes sous chaque process step
   */
  private layoutDataBoxes(diagram: VSMDiagram, result: LayoutResult): void {
    for (const node of diagram.nodes) {
      if (node.type !== NodeType.PROCESS_STEP) continue
      if (!node.indicators || node.indicators.length === 0) continue

      const nodePos = result.positions.get(node.id)
      if (!nodePos) continue

      // Calculer la hauteur nécessaire
      const lineCount = node.indicators.length
      const height = Math.max(
        LayoutConstants.DATA_BOX_MIN_HEIGHT,
        lineCount * LayoutConstants.DATA_BOX_LINE_HEIGHT + 20
      )

      // Centrer horizontalement sous le node
      const x = nodePos.x + (nodePos.width - LayoutConstants.DATA_BOX_WIDTH) / 2

      result.positions.set(`databox-${node.id}`, {
        id: `databox-${node.id}`,
        x,
        y: LayoutConstants.DATA_Y,
        width: LayoutConstants.DATA_BOX_WIDTH,
        height,
        type: 'data-box',
        metadata: {
          nodeId: node.id,
          indicators: node.indicators.map(ind => ({
            code: ind.name,
            value: ind.value || '—',
            unit: ind.unit
          }))
        }
      })
    }
  }

  /**
   * Étape 4 : Positionne la timeline en bas
   */
  private layoutTimeline(_diagram: VSMDiagram, result: LayoutResult): void {
    // Trouver les positions des éléments de production pour aligner la timeline
    const productionPositions = Array.from(result.positions.values())
      .filter(p => p.type === 'process-step' || p.type === 'inventory')
      .sort((a, b) => a.x - b.x)

    if (productionPositions.length === 0) return

    let timelineX = productionPositions[0].x
    let vaTotal = 0
    let nvaTotal = 0

    for (let i = 0; i < productionPositions.length; i++) {
      const pos = productionPositions[i]
      
      if (pos.type === 'process-step') {
        // VA - temps de cycle (simulé, en minutes)
        const cycleTime = (pos.metadata?.indicators as any[])?.find(
          (ind: any) => ind.code?.toLowerCase().includes('cycle') || ind.code?.toLowerCase().includes('ct')
        )?.value || '10'
        
        result.positions.set(`timeline-va-${pos.id}`, {
          id: `timeline-va-${pos.id}`,
          x: timelineX,
          y: LayoutConstants.TIMELINE_Y,
          width: pos.width,
          height: LayoutConstants.TIMELINE_VA_HEIGHT,
          type: 'timeline-va',
          metadata: { value: cycleTime, unit: 'min' }
        })
        
        vaTotal += parseFloat(cycleTime) || 0
        timelineX += pos.width
      } else if (pos.type === 'inventory') {
        // NVA - temps d'attente (en jours)
        const duration = (pos.metadata?.duration as number) || 1
        
        result.positions.set(`timeline-nva-${pos.id}`, {
          id: `timeline-nva-${pos.id}`,
          x: timelineX,
          y: LayoutConstants.TIMELINE_Y + LayoutConstants.TIMELINE_VA_HEIGHT + 10,
          width: Math.max(pos.width, LayoutConstants.HORIZONTAL_SPACING),
          height: LayoutConstants.TIMELINE_NVA_HEIGHT,
          type: 'timeline-nva',
          metadata: { value: String(duration), unit: 'j' }
        })
        
        nvaTotal += duration
        timelineX += Math.max(pos.width, LayoutConstants.HORIZONTAL_SPACING)
      }

      // Espacement entre les éléments
      if (i < productionPositions.length - 1) {
        timelineX += 10 // petit espace
      }
    }

    // Ligne de timeline horizontale
    const firstX = productionPositions[0].x
    const lastPos = productionPositions[productionPositions.length - 1]
    const lastX = lastPos.x + lastPos.width

    result.positions.set('timeline-line', {
      id: 'timeline-line',
      x: firstX,
      y: LayoutConstants.TIMELINE_Y + LayoutConstants.TIMELINE_VA_HEIGHT + 5,
      width: lastX - firstX,
      height: LayoutConstants.TIMELINE_LINE_THICKNESS,
      type: 'timeline-line',
      metadata: { vaTotal, nvaTotal }
    })
  }

  /**
   * Étape 5 : Calcule les connexions
   */
  private layoutConnections(diagram: VSMDiagram, result: LayoutResult): void {
    // Connexions matérielles (supplier -> nodes -> customer)
    const processNodes = diagram.nodes.filter(n => n.type === NodeType.PROCESS_STEP)
    
    // Supplier -> premier node
    if (diagram.actors.supplier && processNodes.length > 0) {
      result.connections.push({
        id: 'flow-supplier-start',
        sourceId: 'supplier',
        targetId: processNodes[0].id,
        type: 'material-flow'
      })
    }

    // Entre les nodes (via les flowSequences)
    for (const seq of diagram.flowSequences) {
      if (seq.fromNodeId && seq.toNodeId) {
        result.connections.push({
          id: `flow-${seq.fromNodeId}-${seq.toNodeId}`,
          sourceId: seq.fromNodeId,
          targetId: seq.toNodeId,
          type: 'material-flow',
          flowType: seq.intermediateElements[0]?.materialFlow?.flowType
        })
      }
    }

    // Dernier node -> customer
    if (diagram.actors.customer && processNodes.length > 0) {
      result.connections.push({
        id: 'flow-end-customer',
        sourceId: processNodes[processNodes.length - 1].id,
        targetId: 'customer',
        type: 'material-flow'
      })
    }

    // Flux d'information
    for (const flow of diagram.informationFlows) {
      result.connections.push({
        id: flow.id,
        sourceId: flow.sourceNodeId,
        targetId: flow.targetNodeId,
        type: 'information-flow',
        label: flow.description
      })
    }
  }

  /**
   * Normalise les résultats et calcule les dimensions totales
   */
  private normalizeResult(result: LayoutResult): void {
    let minX = Infinity, minY = Infinity
    let maxX = 0, maxY = 0

    for (const pos of result.positions.values()) {
      minX = Math.min(minX, pos.x)
      minY = Math.min(minY, pos.y)
      maxX = Math.max(maxX, pos.x + pos.width)
      maxY = Math.max(maxY, pos.y + pos.height)
    }

    // Ajouter des marges
    result.totalWidth = maxX + LayoutConstants.MARGIN_RIGHT
    result.totalHeight = maxY + LayoutConstants.MARGIN_BOTTOM
  }
}
