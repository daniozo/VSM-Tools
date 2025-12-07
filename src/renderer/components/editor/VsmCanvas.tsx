import React, { useEffect, useRef } from 'react'
import { useVsmStore } from '@/store/vsmStore'
import { Graph } from '@maxgraph/core'
import { VsmElementType } from '@/shared/types/vsm-elements'

// Taille de la grille (en pixels) pour l'affichage et l'accrochage
const GRID_SIZE = 20
// Hauteur de la zone Timeline (en pixels) en bas du canvas
const TIMELINE_ZONE_HEIGHT = 120


/**
 * Composant principal du canevas VSM utilisant maxGraph
 * Implémente l'approche d'insertion guidée par rangées et boutons +
 * Intégration avec ToolPalette pour l'ajout d'éléments
 */
const VsmCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const graphRef = useRef<Graph | null>(null)

  const {
    diagram,
    selectedElement
  } = useVsmStore()

  // Adaptateur temporaire : extraire les "éléments" du diagramme
  // TODO: Remplacer par un vrai renderer Model-First
  const elements = React.useMemo(() => {
    if (!diagram) return []

    // Convertir les nodes en "éléments" pour le rendu temporaire
    return diagram.nodes.map(node => ({
      id: node.id,
      type: 'process' as VsmElementType,
      label: node.name,
      x: 0,
      y: 0,
      width: 120,
      height: 80,
      properties: { operators: node.operators }
    }))
  }, [diagram])

  const selectedElementId = selectedElement?.type === 'node' ? selectedElement.id : null
  const activeTool = null

  useEffect(() => {
    if (!containerRef.current) return

    // Initialisation de maxGraph
    const graph = new Graph(containerRef.current)
    graphRef.current = graph

    // Configuration du graph
    graph.setPanning(true)
    graph.setConnectable(true)
    graph.setGridEnabled(true)
    // Définir la taille de la grille et la couleur si disponible
    const gAny = graph as any
    if (typeof gAny.setGridSize === 'function') {
      gAny.setGridSize(GRID_SIZE)
    }
    if (typeof gAny.setGridColor === 'function') {
      gAny.setGridColor('#e5e7eb') // gris clair
    }
    graph.setAllowDanglingEdges(false)
    graph.setEnabled(true)

    // Gestion des événements de sélection (map vers le parent pour les groupes)
    graph.getSelectionModel().addListener('change', () => {
      const cells = graph.getSelectionCells()
      if (cells.length > 0) {
        const selectedCell = cells[0]
        const id = selectedCell.getId?.() || null
        // getElementById n'existe plus dans le nouveau store Model-First
        // La sélection sera gérée différemment après la migration complète
        console.log('Élément cliqué:', id)
      } else {
        console.log('Aucun élément sélectionné')
      }
    })

    // Déplacement désactivé pendant la migration Model-First
    graph.addListener('moveCells', (_sender: any, _evt: any) => {
      console.warn('Déplacement désactivé - utilisez le dialogue de configuration')
      // Les positions seront calculées automatiquement par l'algorithme de layout
    })

    // Nettoyage à la destruction
    return () => {
      if (graphRef.current) {
        graphRef.current.destroy()
        graphRef.current = null
      }
    }
  }, []) // Vide pour éviter les re-rendus

  // Gestionnaire de clic désactivé pendant la migration Model-First
  // useEffect(() => {
  //   const container = containerRef.current
  //   if (!container) return
  //   container.addEventListener('click', handleCanvasClick)
  //   return () => {
  //     container.removeEventListener('click', handleCanvasClick)
  //   }
  // }, [handleCanvasClick])

  // Synchroniser les éléments du store avec maxGraph
  useEffect(() => {
    if (!graphRef.current || !elements) return

    const graph = graphRef.current
    const parent = graph.getDefaultParent()

    // Nettoyer le graph
    const existingCells = graph.getChildVertices(parent)
    if (existingCells.length > 0) {
      graph.removeCells(existingCells)
    }

    // Ajouter tous les éléments du store
    elements.forEach(element => {
      const cell = renderElement(graph, parent, element)
      if (!cell) return
      if (element.id === selectedElementId) {
        graph.setSelectionCell(cell)
      }
    })
  }, [elements, selectedElementId]) // Seulement quand les éléments ou la sélection changent


  return (
    <div className="relative flex-1 h-full w-full min-h-0 bg-background overflow-auto">
      {/* Indicateur d'outil actif */}
      {activeTool && (
        <div className="absolute top-4 left-4 z-10 bg-primary text-primary-foreground px-3 py-1 rounded-md text-sm font-medium shadow-md">
          Mode: {getToolDisplayName(activeTool)} - Cliquez pour placer
        </div>
      )}

      {/* Conteneur maxGraph */}
      <div
        className={`absolute inset-0 ${activeTool ? 'cursor-crosshair' : 'cursor-default'}`}
        ref={containerRef}
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(0,0,0,0.12) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0,0,0,0.12) 1px, transparent 1px)
          `,
          backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
          backgroundPosition: '0 0'
        }}
      >
        {/* Le diagramme maxGraph sera rendu ici */}
        {/* Zone timeline visuelle */}
        <div
          className="pointer-events-none absolute left-0 right-0 bottom-0 z-[5]"
          style={{ height: TIMELINE_ZONE_HEIGHT, background: 'linear-gradient(to top, rgba(99,102,241,0.08), rgba(99,102,241,0.02))', borderTop: '1px solid rgba(99,102,241,0.25)' }}
        >
          <div className="absolute left-3 bottom-2 text-[11px] text-indigo-600/80 font-medium">
            Zone Timeline (réservée)
          </div>
        </div>
      </div>
    </div >
  )
}

// Rendu générique d'un élément VSM
function renderElement(graph: Graph, parent: any, element: { id: string; type: VsmElementType; label: string; x: number; y: number; width?: number; height?: number; }): any {
  const w = element.width || getDefaultWidth(element.type)
  const h = element.height || getDefaultHeight(element.type)
  if (element.type === VsmElementType.TIMELINE) {
    return renderTimelineGroup(graph, parent, element.id, element.x, element.y, w, h)
  }
  return graph.insertVertex(parent, element.id, element.label, element.x, element.y, w, h, getElementStyle(element.type))
}

// Rendu d'une timeline en signal carré avec segments horizontaux alternés (VA haut, NVA bas)
function renderTimelineGroup(graph: Graph, parent: any, id: string, x: number, y: number, width: number, height: number) {
  let group: any
  graph.batchUpdate(() => {
    // Groupe parent invisible (contient tout)
    group = graph.insertVertex(parent, id, '', x, y, width, height, { fillColor: 'transparent', strokeColor: 'transparent' } as any)

    // Configuration des segments (alternance VA/NVA)
    const segments = [
      { label: '10 jours', type: 'nva', width: 50 },
      { label: '5min', type: 'va', width: 40 },
      { label: '1 jour', type: 'nva', width: 45 },
      { label: '8 min', type: 'va', width: 45 },
      { label: '2 jours', type: 'nva', width: 50 },
      { label: '10 min', type: 'va', width: 45 },
      { label: '1 jour', type: 'nva', width: 45 }
    ]

    const vaHeight = height / 2 - 15  // Position haute pour VA
    const nvaHeight = height / 2 + 5  // Position basse pour NVA
    const segmentHeight = 12

    let currentX = 0

    segments.forEach((segment, index) => {
      const isVA = segment.type === 'va'
      const segmentY = isVA ? vaHeight : nvaHeight
      const color = isVA ? '#16a34a' : '#dc2626'  // Vert pour VA, rouge pour NVA

      // Segment horizontal
      graph.insertVertex(group, `${id}_segment_${index}`, '', currentX, segmentY, segment.width, segmentHeight, {
        rounded: false,
        fillColor: color,
        strokeColor: '#1e3a8a',
        strokeWidth: 1
      } as any)

      // Label du temps au-dessus/en-dessous
      const labelY = isVA ? vaHeight - 18 : nvaHeight + segmentHeight + 4
      graph.insertVertex(group, `${id}_label_${index}`, segment.label, currentX + 2, labelY, segment.width - 4, 12, {
        fillColor: 'transparent',
        strokeColor: 'transparent',
        fontColor: '#000000',
        fontSize: 9,
        fontFamily: 'Arial'
      } as any)

      // Connexion verticale vers le segment suivant (sauf pour le dernier)
      if (index < segments.length - 1) {
        const nextIsVA = segments[index + 1].type === 'va'
        const nextY = nextIsVA ? vaHeight : nvaHeight

        // Trait vertical de connexion
        if (segmentY !== nextY) {
          const connectX = currentX + segment.width
          const minY = Math.min(segmentY + segmentHeight / 2, nextY + segmentHeight / 2)
          const maxY = Math.max(segmentY + segmentHeight / 2, nextY + segmentHeight / 2)

          graph.insertVertex(group, `${id}_connect_${index}`, '', connectX - 1, minY, 2, maxY - minY, {
            rounded: false,
            fillColor: '#1e3a8a',
            strokeColor: 'transparent'
          } as any)
        }
      }

      currentX += segment.width
    })

    // Totaux VA / NVA en bas
    graph.insertVertex(group, `${id}_va_total`, 'VA 23 min', 8, height - 18, 60, 14, {
      fillColor: 'transparent',
      strokeColor: 'transparent',
      fontColor: '#16a34a',
      fontStyle: 1,
      fontSize: 10
    } as any)

    graph.insertVertex(group, `${id}_nva_total`, 'Non VA 30 jours', 80, height - 18, 80, 14, {
      fillColor: 'transparent',
      strokeColor: 'transparent',
      fontColor: '#dc2626',
      fontStyle: 1,
      fontSize: 10
    } as any)
  })
  return group
}

// Fonctions utilitaires

function getDefaultWidth(type: VsmElementType): number {
  const widths = {
    [VsmElementType.PROCESS]: 80,
    [VsmElementType.STOCK]: 60,
    [VsmElementType.SUPPLIER]: 100,
    [VsmElementType.CUSTOMER]: 100,
    [VsmElementType.DATA_BOX]: 120,
    [VsmElementType.KAIZEN_BURST]: 50,
    [VsmElementType.TEXT]: 100,
    [VsmElementType.FLOW_ARROW]: 80,
    [VsmElementType.TIMELINE]: 300
  }
  return widths[type] || 80
}

function getDefaultHeight(type: VsmElementType): number {
  const heights = {
    [VsmElementType.PROCESS]: 50,
    [VsmElementType.STOCK]: 40,
    [VsmElementType.SUPPLIER]: 60,
    [VsmElementType.CUSTOMER]: 60,
    [VsmElementType.DATA_BOX]: 80,
    [VsmElementType.KAIZEN_BURST]: 50,
    [VsmElementType.TEXT]: 30,
    [VsmElementType.FLOW_ARROW]: 20,
    [VsmElementType.TIMELINE]: 40
  }
  return heights[type] || 50
}



function getElementStyle(type: VsmElementType): Record<string, any> {
  const baseStyle = {
    fontColor: '#000000',
    fontSize: 12,
    fontFamily: 'Arial'
  }

  const styles = {
    [VsmElementType.PROCESS]: {
      ...baseStyle,
      rounded: 1,
      fillColor: '#e1f5fe',
      strokeColor: '#01579b',
      strokeWidth: 2
    },
    [VsmElementType.STOCK]: {
      ...baseStyle,
      shape: 'triangle',
      fillColor: '#fff3e0',
      strokeColor: '#e65100',
      strokeWidth: 2
    },
    [VsmElementType.SUPPLIER]: {
      ...baseStyle,
      rounded: 1,
      fillColor: '#f3e5f5',
      strokeColor: '#4a148c',
      strokeWidth: 2
    },
    [VsmElementType.CUSTOMER]: {
      ...baseStyle,
      rounded: 1,
      fillColor: '#e8f5e8',
      strokeColor: '#1b5e20',
      strokeWidth: 2
    },
    [VsmElementType.DATA_BOX]: {
      ...baseStyle,
      rounded: 0,
      fillColor: '#fffde7',
      strokeColor: '#f57f17',
      strokeWidth: 1
    },
    [VsmElementType.KAIZEN_BURST]: {
      ...baseStyle,
      shape: 'cloud',
      fillColor: '#ffebee',
      strokeColor: '#c62828',
      strokeWidth: 2
    },
    [VsmElementType.TEXT]: {
      ...baseStyle,
      rounded: 0,
      fillColor: 'none',
      strokeColor: 'none',
      strokeWidth: 0
    },
    [VsmElementType.FLOW_ARROW]: {
      ...baseStyle,
      endArrow: 'classic',
      fillColor: 'none',
      strokeColor: '#424242',
      strokeWidth: 2
    },
    [VsmElementType.TIMELINE]: {
      ...baseStyle,
      rounded: 0,
      fillColor: '#f5f5f5',
      strokeColor: '#757575',
      strokeWidth: 2
    }
  }

  return styles[type] || {
    ...baseStyle,
    rounded: 1,
    fillColor: '#ffffff',
    strokeColor: '#000000',
    strokeWidth: 1
  }
}

function getToolDisplayName(type: VsmElementType): string {
  const names = {
    [VsmElementType.PROCESS]: 'Processus',
    [VsmElementType.STOCK]: 'Stock',
    [VsmElementType.SUPPLIER]: 'Fournisseur',
    [VsmElementType.CUSTOMER]: 'Client',
    [VsmElementType.DATA_BOX]: 'Boîte de données',
    [VsmElementType.KAIZEN_BURST]: 'Kaizen',
    [VsmElementType.TEXT]: 'Texte',
    [VsmElementType.FLOW_ARROW]: 'Flèche de flux',
    [VsmElementType.TIMELINE]: 'Timeline'
  }
  return names[type] || 'Élément'
}

export default VsmCanvas
