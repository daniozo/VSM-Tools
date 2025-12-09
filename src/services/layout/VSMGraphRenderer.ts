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
    strokeWidth: 2,
    rounded: false,
    fontColor: '#6b7280',
    fontSize: 10,
    fontStyle: 0, // Normal (not bold)
    align: 'center',
    verticalAlign: 'middle',
  },

  inventory: {
    shape: 'triangle',
    direction: 'north',  // Pointe vers le haut, base en bas
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
    edgeStyle: 'orthogonalEdgeStyle',  // Routing en escalier
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

    // Ajuster automatiquement le zoom pour que tout le diagramme soit visible
    this.fitToContainer()
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
        // Afficher la quantité dans le triangle
        if (isPlaceholder) {
          label = ''
        } else {
          const qty = metadata?.quantity as string || ''
          const unit = metadata?.unit as string || ''
          label = qty ? `${qty} ${unit}`.trim() : ''
        }
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
   * Selon algo.md Étape B - Ligne 2 (InformationFlow):
   * - Point d'ancrage de départ: milieu du côté INFÉRIEUR de la source
   * - Point d'ancrage d'arrivée: milieu du côté SUPÉRIEUR de la cible
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
    
    // Définir les points d'ancrage selon le type de flux et les éléments
    let exitX = 0.5  // milieu horizontal par défaut
    let exitY = 0.5  // milieu vertical par défaut
    let entryX = 0.5 // milieu horizontal par défaut
    let entryY = 0.5 // milieu vertical par défaut
    
    if (type === 'information-flow') {
      // Flux d'information Ligne 1 : utiliser les côtés
      if (sourceId === 'customer') {
        // Customer : sortie par le côté gauche
        exitX = 0.0
        exitY = 0.5
      } else if (sourceId === 'control-center') {
        // ControlCenter : sortie par le côté gauche vers supplier
        exitX = 0.0
        exitY = 0.5
      } else {
        // Autres : sortie par le bas (vers process steps)
        exitX = 0.5
        exitY = 1.0
      }
      
      if (targetId === 'control-center') {
        // ControlCenter : entrée par le côté droit
        entryX = 1.0
        entryY = 0.5
      } else if (targetId === 'supplier') {
        // Supplier : entrée par le côté droit
        entryX = 1.0
        entryY = 0.5
      } else {
        // Process steps : entrée par le haut
        entryX = 0.5
        entryY = 0.0
      }
    } else if (type === 'material-flow') {
      // Flux matériel : cas spéciaux pour actors et pseudo-steps
      if (sourceId === 'supplier') {
        // Supplier -> reception : sortie par le bas
        exitX = 0.5
        exitY = 1.0
      } else if (sourceId === 'livraison') {
        // Livraison -> customer : sortie par le côté droit
        exitX = 1.0
        exitY = 0.5
      } else {
        // Autres : sortie par le côté droit
        exitX = 1.0
        exitY = 0.5
      }
      
      if (targetId === 'reception') {
        // Reception : entrée par le côté gauche
        entryX = 0.0
        entryY = 0.5
      } else if (targetId === 'customer') {
        // Customer : entrée par le bas
        entryX = 0.5
        entryY = 1.0
      } else {
        // Autres : entrée par le côté gauche
        entryX = 0.0
        entryY = 0.5
      }
    }
    
    // Nouvelle API maxGraph avec objet de paramètres
    const edge = this.graph.insertEdge({
      parent,
      id,
      value: label || '',
      source: sourceCell,
      target: targetCell,
      style: { 
        baseStyleNames: [styleName],
        exitX,
        exitY,
        entryX,
        entryY,
        exitPerimeter: true,
        entryPerimeter: true
      }
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
      const operatorText = operators === 1 ? '1 Opérateur' : `${operators} Opérateurs`
      return `${name}\n\n${operatorText}`
    }
    return name
  }

  private formatActorLabel(metadata?: Record<string, unknown>): string {
    if (!metadata) return ''
    
    const name = metadata.name as string || ''
    const role = metadata.role as string || ''
    
    // Texte simple selon le rôle
    const roleLabel = role === 'supplier' ? 'Fournisseur' : role === 'customer' ? 'Client' : 'Entreprise'
    return name ? `${roleLabel}\n${name}` : roleLabel
  }

  private formatDataBoxLabel(metadata?: Record<string, unknown>): string {
    if (!metadata) return ''

    // Si c'est une data box pour pseudo-étape (texte simple)
    if (metadata.text) {
      return metadata.text as string
    }

    // Sinon, afficher les indicateurs
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

  /**
   * Ajuste le zoom pour que tout le diagramme soit visible dans le conteneur
   */
  fitToContainer(): void {
    const graphAny = this.graph as any
    
    // Utiliser la méthode zoomToFit de maxGraph si disponible
    if (typeof graphAny.zoomToFit === 'function') {
      graphAny.zoomToFit()
    } else if (typeof graphAny.fit === 'function') {
      graphAny.fit()
    } else {
      // Fallback : calculer manuellement le zoom
      const bounds = this.graph.getGraphBounds()
      const container = this.graph.container
      
      if (bounds && container) {
        const padding = 50 // Marge de 50px autour du diagramme
        const containerWidth = container.clientWidth - padding * 2
        const containerHeight = container.clientHeight - padding * 2
        
        // Calculer le ratio de zoom pour ajuster au conteneur
        const scaleX = containerWidth / bounds.width
        const scaleY = containerHeight / bounds.height
        const scale = Math.min(scaleX, scaleY, 1) // Ne pas zoomer au-delà de 100%
        
        // Appliquer le zoom
        this.graph.zoomTo(scale)
        
        // Centrer le diagramme
        const view = this.graph.getView()
        const dx = (containerWidth - bounds.width * scale) / 2 + padding - bounds.x * scale
        const dy = (containerHeight - bounds.height * scale) / 2 + padding - bounds.y * scale
        
        view.setTranslate(dx, dy)
      }
    }
  }

  /**
   * Zoom avant (augmente le zoom de 20%)
   */
  zoomIn(): void {
    const currentScale = this.graph.getView().getScale()
    const newScale = currentScale * 1.2
    this.graph.zoomTo(newScale)
  }

  /**
   * Zoom arrière (diminue le zoom de 20%)
   */
  zoomOut(): void {
    const currentScale = this.graph.getView().getScale()
    const newScale = currentScale / 1.2
    this.graph.zoomTo(newScale)
  }

  /**
   * Réinitialise le zoom (ajuste au conteneur)
   */
  zoomReset(): void {
    this.fitToContainer()
  }
}

// ============================================
// FACTORY FUNCTION
// ============================================

export function createVSMRenderer(graph: Graph): VSMGraphRenderer {
  return new VSMGraphRenderer(graph)
}
