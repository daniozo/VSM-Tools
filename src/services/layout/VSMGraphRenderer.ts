/**
 * VSM Graph Renderer - Rendu maxGraph basé sur le layout calculé
 * 
 * Ce renderer prend le résultat de VSMLayoutEngine et crée les cellules
 * maxGraph correspondantes avec les styles VSM appropriés.
 */

import { Graph, Cell } from '@maxgraph/core'
import { LayoutResult, LayoutPosition, LayoutConnection } from './VSMLayoutEngine'

// Type pour les styles maxGraph
type StyleObject = Record<string, unknown>

// ============================================
// STYLES VSM
// ============================================

const VSMStyles: Record<string, StyleObject> = {
  processStep: {
    shape: 'rectangle',
    fillColor: '#ffffff',
    strokeColor: '#2563eb',
    strokeWidth: 2,
    rounded: false,
    fontColor: '#1e3a5f',
    fontSize: 11,
    fontStyle: 1, // Bold
    align: 'center',
    verticalAlign: 'middle',
  },

  pseudoStep: {
    shape: 'rectangle',
    fillColor: '#f3f4f6',
    strokeColor: '#6b7280',
    strokeWidth: 1,
    dashed: true,
    dashPattern: '5 5',
    rounded: false,
    fontColor: '#6b7280',
    fontSize: 10,
    fontStyle: 0, // Normal (not bold)
    align: 'center',
    verticalAlign: 'middle',
  },

  inventory: {
    shape: 'triangle',
    fillColor: '#fef3c7',
    strokeColor: '#d97706',
    strokeWidth: 1.5,
    fontColor: '#92400e',
    fontSize: 9,
    align: 'center',
    verticalAlign: 'bottom',
  },

  inventoryPlaceholder: {
    shape: 'rectangle',
    fillColor: '#ffffff',
    strokeColor: '#9ca3af',
    strokeWidth: 1,
    dashed: true,
    dashPattern: '3 3',
    fontColor: '#6b7280',
    fontSize: 8,
    align: 'center',
    verticalAlign: 'middle',
  },

  actor: {
    shape: 'rectangle',
    fillColor: '#f0fdf4',
    strokeColor: '#16a34a',
    strokeWidth: 2,
    rounded: false,
    fontColor: '#166534',
    fontSize: 10,
    fontStyle: 1,
    align: 'center',
    verticalAlign: 'middle',
  },

  controlCenter: {
    shape: 'rectangle',
    fillColor: '#eff6ff',
    strokeColor: '#3b82f6',
    strokeWidth: 2,
    rounded: false,
    fontColor: '#1e40af',
    fontSize: 11,
    fontStyle: 1,
    align: 'center',
    verticalAlign: 'middle',
  },

  dataBox: {
    shape: 'rectangle',
    fillColor: '#fafafa',
    strokeColor: '#9ca3af',
    strokeWidth: 1,
    fontColor: '#374151',
    fontSize: 9,
    align: 'left',
    verticalAlign: 'top',
    spacing: 4,
  },

  timelineVa: {
    shape: 'rectangle',
    fillColor: '#dcfce7',
    strokeColor: '#22c55e',
    strokeWidth: 1,
    fontColor: '#166534',
    fontSize: 9,
    align: 'center',
    verticalAlign: 'middle',
  },

  timelineNva: {
    shape: 'rectangle',
    fillColor: '#fee2e2',
    strokeColor: '#ef4444',
    strokeWidth: 1,
    fontColor: '#991b1b',
    fontSize: 9,
    align: 'center',
    verticalAlign: 'middle',
  },

  timelineNvaPlaceholder: {
    shape: 'rectangle',
    fillColor: '#ffffff',
    strokeColor: '#d1d5db',
    strokeWidth: 1,
    dashed: true,
    dashPattern: '3 3',
    fontColor: '#9ca3af',
    fontSize: 8,
    align: 'center',
    verticalAlign: 'middle',
  },

  timelineLine: {
    shape: 'rectangle',
    fillColor: '#374151',
    strokeColor: '#374151',
    strokeWidth: 0,
  },

  materialFlow: {
    strokeColor: '#374151',
    strokeWidth: 2,
    endArrow: 'classic',
    endSize: 8,
    rounded: true,
  },

  informationFlow: {
    strokeColor: '#3b82f6',
    strokeWidth: 1.5,
    dashed: true,
    dashPattern: '5 3',
    endArrow: 'classic',
    endSize: 6,
  },
}

// ============================================
// RENDERER
// ============================================

export class VSMGraphRenderer {
  private graph: Graph
  private cellMap: Map<string, Cell> = new Map()

  constructor(graph: Graph) {
    this.graph = graph
    this.registerStyles()
  }

  /**
   * Enregistre les styles personnalisés dans le graph
   */
  private registerStyles(): void {
    const stylesheet = this.graph.getStylesheet()
    
    Object.entries(VSMStyles).forEach(([name, style]) => {
      stylesheet.putCellStyle(name, style as any)
    })
  }

  /**
   * Rend le layout complet dans le graph
   */
  render(layout: LayoutResult): void {
    const parent = this.graph.getDefaultParent()
    
    this.graph.batchUpdate(() => {
      // Nettoyer le graph existant
      this.clear()

      // Rendre tous les éléments positionnés
      layout.positions.forEach((position, id) => {
        const cell = this.renderPosition(parent, position)
        if (cell) {
          this.cellMap.set(id, cell)
        }
      })

      // Rendre les connexions
      layout.connections.forEach(connection => {
        this.renderConnection(parent, connection)
      })
    })

    // Ajuster la vue si la méthode existe
    const graphAny = this.graph as any
    if (typeof graphAny.fit === 'function') {
      graphAny.fit()
    }
  }

  /**
   * Nettoie le graph
   */
  clear(): void {
    const parent = this.graph.getDefaultParent()
    const cells = this.graph.getChildCells(parent, true, true)
    if (cells.length > 0) {
      this.graph.removeCells(cells)
    }
    this.cellMap.clear()
  }

  /**
   * Rend une position (élément)
   */
  private renderPosition(parent: Cell, position: LayoutPosition): Cell | null {
    const { id, x, y, width, height, type, metadata } = position

    let styleName = ''
    let label = ''
    let cell: Cell | null = null

    switch (type) {
      case 'process-step':
        // Vérifier si c'est une pseudo-étape (Réception/Livraison)
        const isPseudo = metadata?.isPseudo === true
        styleName = isPseudo ? 'pseudoStep' : 'processStep'
        label = this.formatProcessStepLabel(metadata)
        break

      case 'inventory':
        // Vérifier si c'est un placeholder (id commence par "placeholder-" et quantity = 0)
        const isPlaceholder = id.startsWith('placeholder-') || 
                             (metadata?.quantity === '0' && !metadata?.name)
        styleName = isPlaceholder ? 'inventoryPlaceholder' : 'inventory'
        label = isPlaceholder ? '' : ((metadata?.name as string) || '')
        break

      case 'actor':
        styleName = 'actor'
        label = this.formatActorLabel(metadata)
        break

      case 'control-center':
        styleName = 'controlCenter'
        label = (metadata?.name as string) || 'Control Center'
        break

      case 'data-box':
        styleName = 'dataBox'
        label = this.formatDataBoxLabel(metadata)
        break

      case 'timeline-va':
        styleName = 'timelineVa'
        label = this.formatTimelineLabel(metadata)
        break

      case 'timeline-nva':
        // Vérifier si c'est un placeholder (stock vide)
        const isNvaPlaceholder = metadata?.isPlaceholder === true
        styleName = isNvaPlaceholder ? 'timelineNvaPlaceholder' : 'timelineNva'
        label = this.formatTimelineLabel(metadata)
        break

      case 'timeline-line':
        styleName = 'timelineLine'
        label = ''
        break
    }

    if (styleName) {
      // Nouvelle API maxGraph avec objet de paramètres
      cell = this.graph.insertVertex({
        parent,
        id,
        value: label,
        position: [x, y],
        size: [width, height],
        style: { baseStyleNames: [styleName] }
      })
    }

    return cell
  }

  /**
   * Rend une connexion (edge)
   */
  private renderConnection(parent: Cell, connection: LayoutConnection): Cell | null {
    const { id, sourceId, targetId, type, label } = connection
    
    const sourceCell = this.cellMap.get(sourceId)
    const targetCell = this.cellMap.get(targetId)

    if (!sourceCell || !targetCell) {
      console.warn(`Connection ${id}: source ou target non trouvé`)
      return null
    }

    const styleName = type === 'material-flow' ? 'materialFlow' : 'informationFlow'
    
    // Nouvelle API maxGraph avec objet de paramètres
    const edge = this.graph.insertEdge({
      parent,
      id,
      value: label || '',
      source: sourceCell,
      target: targetCell,
      style: { baseStyleNames: [styleName] }
    })

    return edge
  }

  // ============================================
  // FORMATAGE DES LABELS
  // ============================================

  private formatProcessStepLabel(metadata?: Record<string, unknown>): string {
    if (!metadata) return ''
    
    const name = metadata.name as string || ''
    const operators = metadata.operators as number | undefined

    if (operators && operators > 0) {
      return `${name}\n\n👤 ${operators}`
    }
    return name
  }

  private formatActorLabel(metadata?: Record<string, unknown>): string {
    if (!metadata) return ''
    
    const name = metadata.name as string || ''
    const role = metadata.role as string || ''
    
    const icon = role === 'supplier' ? '🏭' : role === 'customer' ? '🏪' : '🏢'
    return `${icon}\n${name}`
  }

  private formatDataBoxLabel(metadata?: Record<string, unknown>): string {
    if (!metadata) return ''

    const indicators = metadata.indicators as Array<{ code: string; value: string; unit: string }> || []
    
    return indicators
      .map(ind => `${ind.code}: ${ind.value} ${ind.unit || ''}`.trim())
      .join('\n')
  }

  private formatTimelineLabel(metadata?: Record<string, unknown>): string {
    if (!metadata) return ''
    
    const value = metadata.value as string || ''
    const unit = metadata.unit as string || ''
    
    return `${value} ${unit}`.trim()
  }

  // ============================================
  // MÉTHODES UTILITAIRES
  // ============================================

  /**
   * Récupère la cellule par ID
   */
  getCell(id: string): Cell | undefined {
    return this.cellMap.get(id)
  }

  /**
   * Sélectionne un élément par ID
   */
  selectElement(id: string): void {
    const cell = this.cellMap.get(id)
    if (cell) {
      this.graph.setSelectionCell(cell)
    }
  }

  /**
   * Met en surbrillance un élément
   */
  highlightElement(id: string, highlight: boolean): void {
    const cell = this.cellMap.get(id)
    if (cell) {
      const state = this.graph.view.getState(cell)
      if (state) {
        // Appliquer un style de surbrillance
        if (highlight) {
          state.style = { ...state.style, strokeWidth: 3, shadow: true }
        }
        this.graph.view.invalidate(cell)
      }
    }
  }

  /**
   * Centre la vue sur un élément
   */
  centerOnElement(id: string): void {
    const cell = this.cellMap.get(id)
    if (cell) {
      this.graph.scrollCellToVisible(cell, true)
    }
  }
}

// ============================================
// FACTORY FUNCTION
// ============================================

export function createVSMRenderer(graph: Graph): VSMGraphRenderer {
  return new VSMGraphRenderer(graph)
}
