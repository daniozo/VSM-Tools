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
  // Dimensions des éléments (UNIFORMISÉES pour alignement)
  PROCESS_STEP_WIDTH: 120,
  PROCESS_STEP_HEIGHT: 80,
  ACTOR_WIDTH: 100,
  ACTOR_HEIGHT: 60,
  INVENTORY_WIDTH: 60,
  INVENTORY_HEIGHT: 50,
  CONTROL_CENTER_WIDTH: 180,
  CONTROL_CENTER_HEIGHT: 60,
  DATA_BOX_WIDTH: 120, // MÊME LARGEUR QUE PROCESS_STEP
  DATA_BOX_MIN_HEIGHT: 60,
  DATA_BOX_LINE_HEIGHT: 16,

  // Espacements
  HORIZONTAL_SPACING: 80,
  VERTICAL_LANE_SPACING: 100,
  MARGIN_LEFT: 150,
  MARGIN_TOP: 50,
  MARGIN_RIGHT: 150,
  MARGIN_BOTTOM: 50,

  // Positions Y des swimlanes (selon algo.md)
  Y_ACTORS_CONTROL: 50,
  Y_INFO_FLOWS: 150,
  Y_PRODUCTION_FLOW: 250,
  Y_DATA_BOXES: 360,  // Réduit de 380 à 360 (écart de 110px au lieu de 130px)
  Y_TIMELINE: 500,

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

    // Étape A : Positionner le flux de production principal (Ligne 3) - CALCUL HORIZONTAL
    this.layoutProductionFlow(diagram, result)

    // Étape B - Ligne 1 : Positionner les acteurs et le centre de contrôle (APRÈS Ligne 3)
    this.layoutActorsAndControlCenterAfterProduction(diagram, result, productionWidth, startX)

    // Étape B - Ligne 4 : Positionner les data boxes (indicateurs)
    this.layoutDataBoxes(diagram, result)

    // Étape B - Ligne 5 : Calculer la timeline
    this.layoutTimeline(diagram, result)

    // Étape B - Ligne 2 : Calculer les connexions (flux d'information)
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
   * Étape 1 : Positionne les acteurs et le centre de contrôle (Ligne 1)
   * Selon algo.md Étape B - Ligne 1:
   * - Supplier: centre horizontal aligné sur centre du PREMIER élément de Ligne 3
   * - Customer: centre horizontal aligné sur centre du DERNIER élément de Ligne 3  
   * - ControlCenter: centre horizontal au milieu de TOTAL_PRODUCTION_WIDTH
   */
  private layoutActorsAndControlCenter(
    diagram: VSMDiagram, 
    result: LayoutResult,
    productionWidth: number,
    startX: number
  ): void {
    // NOTE: Cette méthode sera appelée APRÈS layoutProductionFlow
    // pour pouvoir aligner sur les éléments de Ligne 3
  }

  /**
   * Positionne les acteurs APRÈS avoir placé le flux de production
   * (pour aligner sur les centres des éléments de Ligne 3)
   */
  private layoutActorsAndControlCenterAfterProduction(
    diagram: VSMDiagram,
    result: LayoutResult,
    productionWidth: number,
    startX: number
  ): void {
    const { actors } = diagram

    // Trouver le premier et dernier élément de la production (Ligne 3)
    const productionElements = Array.from(result.positions.values())
      .filter(p => p.type === 'process-step' || p.type === 'inventory')
      .sort((a, b) => a.x - b.x)

    if (productionElements.length === 0) return

    const firstElem = productionElements[0]
    const lastElem = productionElements[productionElements.length - 1]

    // Supplier: son centre horizontal aligné sur le centre du PREMIER élément
    if (actors.supplier) {
      const supplierCenterX = firstElem.x + firstElem.width / 2
      result.positions.set('supplier', {
        id: 'supplier',
        x: supplierCenterX - LayoutConstants.ACTOR_WIDTH / 2,
        y: LayoutConstants.Y_ACTORS_CONTROL,
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

    // Customer: son centre horizontal aligné sur le centre du DERNIER élément
    if (actors.customer) {
      const customerCenterX = lastElem.x + lastElem.width / 2
      result.positions.set('customer', {
        id: 'customer',
        x: customerCenterX - LayoutConstants.ACTOR_WIDTH / 2,
        y: LayoutConstants.Y_ACTORS_CONTROL,
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

    // ControlCenter: centré entre Supplier et Customer
    if (actors.controlCenter) {
      const supplierPos = result.positions.get('supplier')
      const customerPos = result.positions.get('customer')
      
      let controlCenterX = startX + productionWidth / 2 - LayoutConstants.CONTROL_CENTER_WIDTH / 2
      
      // Si Supplier et Customer existent, centrer entre les deux
      if (supplierPos && customerPos) {
        const supplierCenter = supplierPos.x + supplierPos.width / 2
        const customerCenter = customerPos.x + customerPos.width / 2
        controlCenterX = (supplierCenter + customerCenter) / 2 - LayoutConstants.CONTROL_CENTER_WIDTH / 2
      }
      
      result.positions.set('control-center', {
        id: 'control-center',
        x: controlCenterX,
        y: LayoutConstants.Y_ACTORS_CONTROL,
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
      y: LayoutConstants.Y_PRODUCTION_FLOW,
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
      
      // Ajouter le node
      sequence.push({ type: 'node', item: node })

      // Trouver la séquence qui a ce node comme source
      const flowSeq = diagram.flowSequences.find(fs => fs.fromNodeId === node.id)

      // Si c'est pas le dernier nœud, ajouter un inventory (existant ou placeholder)
      if (i < nodes.length - 1) {
        let hasInventory = false
        
        if (flowSeq) {
          for (const elem of flowSeq.intermediateElements) {
            if (elem.type === 'INVENTORY' && elem.inventory) {
              sequence.push({ type: 'inventory', item: elem.inventory })
              hasInventory = true
            }
          }
        }
        
        // Si pas d'inventory défini, créer un placeholder (stock vide = 0)
        if (!hasInventory) {
          const placeholderInventory: Inventory = {
            id: `placeholder-${node.id}-${nodes[i + 1].id}`,
            name: '',
            type: 'WIP',
            quantity: '0',
            duration: '0',
            unit: 'unités',
            mode: 'static',
            indicators: []
          }
          sequence.push({ type: 'inventory', item: placeholderInventory })
        }
      } else {
        // Pour le dernier nœud, ajouter les inventories s'ils existent
        if (flowSeq) {
          for (const elem of flowSeq.intermediateElements) {
            if (elem.type === 'INVENTORY' && elem.inventory) {
              sequence.push({ type: 'inventory', item: elem.inventory })
            }
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
          y: LayoutConstants.Y_PRODUCTION_FLOW,
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
          y: LayoutConstants.Y_PRODUCTION_FLOW + 20, // Légèrement décalé pour centrer visuellement
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
      y: LayoutConstants.Y_PRODUCTION_FLOW,
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

      // ALIGNER avec le node (même X, même largeur)
      result.positions.set(`databox-${node.id}`, {
        id: `databox-${node.id}`,
        x: nodePos.x,
        y: LayoutConstants.Y_DATA_BOXES,
        width: nodePos.width, // MÊME LARGEUR que le ProcessStep
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

    // Data boxes pour pseudo-étapes (Réception et Livraison) affichant les stocks
    // Stock Initial sous Réception
    const receptionPos = result.positions.get('reception')
    const initialSeq = diagram.flowSequences.find(fs => !fs.fromNodeId || fs.fromNodeId === 'supplier')
    const initialInventory = initialSeq?.intermediateElements.find(el => el.type === 'INVENTORY')?.inventory
    
    if (receptionPos && initialInventory) {
      result.positions.set('databox-reception', {
        id: 'databox-reception',
        x: receptionPos.x,
        y: LayoutConstants.Y_DATA_BOXES,
        width: receptionPos.width,
        height: 50,
        type: 'data-box',
        metadata: {
          nodeId: 'reception',
          text: initialInventory.name || 'Stock Initial'
        }
      })
    }

    // Stock Final sous Livraison
    const livraisonPos = result.positions.get('livraison')
    const lastNode = diagram.nodes.filter(n => n.type === NodeType.PROCESS_STEP).pop()
    const finalSeq = lastNode ? diagram.flowSequences.find(fs => fs.fromNodeId === lastNode.id) : null
    const finalInventory = finalSeq?.intermediateElements.find(el => el.type === 'INVENTORY')?.inventory
    
    if (livraisonPos && finalInventory) {
      result.positions.set('databox-livraison', {
        id: 'databox-livraison',
        x: livraisonPos.x,
        y: LayoutConstants.Y_DATA_BOXES,
        width: livraisonPos.width,
        height: 50,
        type: 'data-box',
        metadata: {
          nodeId: 'livraison',
          text: finalInventory.name || 'Stock Final'
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

    let vaTotal = 0
    let nvaTotal = 0

    for (let i = 0; i < productionPositions.length; i++) {
      const pos = productionPositions[i]
      
      if (pos.type === 'process-step') {
        // VA - temps de cycle - ALIGNÉ avec ProcessStep (même X, même largeur)
        const cycleTime = (pos.metadata?.indicators as any[])?.find(
          (ind: any) => ind.code?.toLowerCase().includes('cycle') || ind.code?.toLowerCase().includes('ct')
        )?.value || '10'
        
        result.positions.set(`timeline-va-${pos.id}`, {
          id: `timeline-va-${pos.id}`,
          x: pos.x, // MÊME X que ProcessStep
          y: LayoutConstants.Y_TIMELINE,
          width: pos.width, // MÊME largeur que ProcessStep
          height: LayoutConstants.TIMELINE_VA_HEIGHT,
          type: 'timeline-va',
          metadata: { value: cycleTime, unit: 'min' }
        })
        
        vaTotal += parseFloat(cycleTime) || 0
      } else if (pos.type === 'inventory') {
        // NVA - temps d'attente - largeur uniformisée avec VA (PROCESS_STEP_WIDTH)
        const quantity = pos.metadata?.quantity as string || '0'
        const duration = parseFloat(pos.metadata?.duration as string || '0') || 0
        
        // Afficher même si quantity=0 (placeholder)
        // NVA posé EN DESSOUS de la ligne timeline
        // LARGEUR = PROCESS_STEP_WIDTH pour uniformité avec VA
        // X ajusté pour centrer : décalage de (PROCESS_STEP_WIDTH - INVENTORY_WIDTH) / 2
        const nvaX = pos.x - (LayoutConstants.PROCESS_STEP_WIDTH - LayoutConstants.INVENTORY_WIDTH) / 2
        
        result.positions.set(`timeline-nva-${pos.id}`, {
          id: `timeline-nva-${pos.id}`,
          x: nvaX, // Centré sous l'inventory
          y: LayoutConstants.Y_TIMELINE + LayoutConstants.TIMELINE_VA_HEIGHT + LayoutConstants.TIMELINE_LINE_THICKNESS + 5,
          width: LayoutConstants.PROCESS_STEP_WIDTH, // Uniformisé avec VA
          height: LayoutConstants.TIMELINE_NVA_HEIGHT,
          type: 'timeline-nva',
          metadata: { 
            value: quantity === '0' ? '0' : String(duration), 
            unit: quantity === '0' ? '' : 'j',
            isPlaceholder: quantity === '0'
          }
        })
        
        nvaTotal += duration
      }
    }

    // Ligne de timeline horizontale (entre VA et NVA)
    const firstX = productionPositions[0].x
    const lastPos = productionPositions[productionPositions.length - 1]
    const lastX = lastPos.x + lastPos.width

    result.positions.set('timeline-line', {
      id: 'timeline-line',
      x: firstX,
      y: LayoutConstants.Y_TIMELINE + LayoutConstants.TIMELINE_VA_HEIGHT + 2,
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
    // Connexions matérielles avec pseudo-étapes (supplier -> reception -> nodes -> livraison -> customer)
    const processNodes = diagram.nodes.filter(n => n.type === NodeType.PROCESS_STEP)
    
    // Supplier -> reception
    if (diagram.actors.supplier) {
      result.connections.push({
        id: 'flow-supplier-reception',
        sourceId: 'supplier',
        targetId: 'reception',
        type: 'material-flow'
      })
    }

    // Reception -> premier node
    if (processNodes.length > 0) {
      result.connections.push({
        id: 'flow-reception-first',
        sourceId: 'reception',
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

    // Dernier node -> livraison
    if (processNodes.length > 0) {
      result.connections.push({
        id: 'flow-last-livraison',
        sourceId: processNodes[processNodes.length - 1].id,
        targetId: 'livraison',
        type: 'material-flow'
      })
    }

    // Livraison -> customer
    if (diagram.actors.customer) {
      result.connections.push({
        id: 'flow-livraison-customer',
        sourceId: 'livraison',
        targetId: 'customer',
        type: 'material-flow'
      })
    }

    // Flux d'information par défaut (Customer -> ControlCenter -> Supplier)
    if (diagram.actors.customer && diagram.actors.controlCenter) {
      result.connections.push({
        id: 'info-flow-customer-controlcenter',
        sourceId: 'customer',
        targetId: 'control-center',
        type: 'information-flow',
        label: 'Commandes'
      })
    }
    
    if (diagram.actors.controlCenter && diagram.actors.supplier) {
      result.connections.push({
        id: 'info-flow-controlcenter-supplier',
        sourceId: 'control-center',
        targetId: 'supplier',
        type: 'information-flow',
        label: 'Prévisions'
      })
    }

    // Flux d'information du modèle (ControlCenter -> ProcessSteps)
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
