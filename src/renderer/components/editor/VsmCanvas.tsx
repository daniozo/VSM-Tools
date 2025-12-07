import React, { useEffect, useRef, useCallback } from 'react'
import { useVsmStore } from '@/store/vsmStore'
import { Graph } from '@maxgraph/core'
import { VSMLayoutEngine, VSMGraphRenderer, createVSMRenderer, LayoutConstants } from '@/services/layout'

// Taille de la grille (en pixels) pour l'affichage et l'accrochage
const GRID_SIZE = 20


/**
 * Composant principal du canevas VSM utilisant maxGraph
 * Architecture Model-First : 
 * - Les données viennent du store (vsmStore)
 * - Le layout est calculé par VSMLayoutEngine
 * - Le rendu est effectué par VSMGraphRenderer
 */
const VsmCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const graphRef = useRef<Graph | null>(null)
  const rendererRef = useRef<VSMGraphRenderer | null>(null)
  const layoutEngineRef = useRef<VSMLayoutEngine | null>(null)

  const {
    diagram,
    selectedElement,
    selectElement
  } = useVsmStore()

  const selectedElementId = selectedElement?.type === 'node' ? selectedElement.id : null

  // Gestionnaire de sélection
  const handleSelectionChange = useCallback((cellId: string | null) => {
    if (!diagram) return

    if (cellId) {
      // Trouver le type d'élément sélectionné
      const node = diagram.nodes.find(n => n.id === cellId)
      if (node) {
        selectElement({ type: 'node', id: cellId })
        return
      }

      // Chercher dans les inventories via les flowSequences
      for (const seq of diagram.flowSequences) {
        for (const elem of seq.intermediateElements) {
          if (elem.type === 'INVENTORY' && elem.inventory?.id === cellId) {
            selectElement({ 
              type: 'inventory', 
              sequenceOrder: seq.order, 
              elementOrder: elem.order 
            })
            return
          }
        }
      }

      // Chercher dans les points d'amélioration
      const improvement = diagram.improvementPoints.find(p => p.id === cellId)
      if (improvement) {
        selectElement({ type: 'improvementPoint', id: cellId })
        return
      }

      // Chercher dans les annotations
      const annotation = diagram.textAnnotations.find(a => a.id === cellId)
      if (annotation) {
        selectElement({ type: 'textAnnotation', id: cellId })
        return
      }
    }
    
    selectElement(null)
  }, [diagram, selectElement])

  // Initialisation du graph
  useEffect(() => {
    if (!containerRef.current) return

    // Initialisation de maxGraph
    const graph = new Graph(containerRef.current)
    graphRef.current = graph

    // Configuration du graph
    graph.setPanning(true)
    graph.setConnectable(false) // Connexions gérées par le modèle
    graph.setGridEnabled(true)
    graph.setAllowDanglingEdges(false)
    graph.setEnabled(true)
    graph.setCellsMovable(false) // Positions calculées par layout
    graph.setCellsResizable(false) // Tailles fixes

    // Définir la taille de la grille
    const gAny = graph as any
    if (typeof gAny.setGridSize === 'function') {
      gAny.setGridSize(GRID_SIZE)
    }

    // Créer le renderer et le layout engine
    const renderer = createVSMRenderer(graph)
    rendererRef.current = renderer
    layoutEngineRef.current = new VSMLayoutEngine()

    // Gestion des événements de sélection
    graph.getSelectionModel().addListener('change', () => {
      const cells = graph.getSelectionCells()
      if (cells.length > 0) {
        const selectedCell = cells[0]
        const id = selectedCell.getId?.() || null
        handleSelectionChange(id)
      } else {
        handleSelectionChange(null)
      }
    })

    // Nettoyage à la destruction
    return () => {
      if (graphRef.current) {
        graphRef.current.destroy()
        graphRef.current = null
      }
      rendererRef.current = null
      layoutEngineRef.current = null
    }
  }, [handleSelectionChange])

  // Rendu du diagramme quand il change
  useEffect(() => {
    if (!graphRef.current || !rendererRef.current || !layoutEngineRef.current) return

    // Si pas de diagramme, nettoyer le canvas
    if (!diagram) {
      rendererRef.current.clear()
      return
    }

    // Calculer le layout
    const layout = layoutEngineRef.current.computeLayout(diagram)

    // Rendre le layout
    rendererRef.current.render(layout)

    // Restaurer la sélection
    if (selectedElementId) {
      rendererRef.current.selectElement(selectedElementId)
    }
  }, [diagram, selectedElementId])

  // Centrer sur l'élément sélectionné
  useEffect(() => {
    if (!rendererRef.current || !selectedElementId) return
    rendererRef.current.centerOnElement(selectedElementId)
  }, [selectedElementId])


  return (
    <div className="relative flex-1 h-full w-full min-h-0 bg-background overflow-auto">
      {/* État vide */}
      {!diagram && (
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground z-10">
          <div className="text-center">
            <p className="text-lg mb-2">Aucun diagramme ouvert</p>
            <p className="text-sm">Ouvrez ou créez un projet pour commencer</p>
          </div>
        </div>
      )}

      {/* Conteneur maxGraph avec grille qui s'étend */}
      <div
        className="min-w-full min-h-full cursor-default"
        ref={containerRef}
        style={{
          // Dimensions minimales pour que la grille couvre tout le diagramme
          minWidth: '3000px',
          minHeight: '1200px',
          backgroundImage: `
            linear-gradient(to right, rgba(0,0,0,0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0,0,0,0.08) 1px, transparent 1px)
          `,
          backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
          backgroundPosition: '0 0'
        }}
      />

      {/* Légende des swimlanes (indicateurs visuels) */}
      {diagram && (
        <div className="absolute left-2 top-2 z-10 text-xs text-muted-foreground space-y-1 pointer-events-none">
          <div style={{ marginTop: LayoutConstants.ACTORS_Y - 10 }}>Acteurs</div>
          <div style={{ marginTop: LayoutConstants.PRODUCTION_Y - LayoutConstants.ACTORS_Y - 20 }}>Production</div>
          <div style={{ marginTop: LayoutConstants.DATA_Y - LayoutConstants.PRODUCTION_Y - 20 }}>Données</div>
          <div style={{ marginTop: LayoutConstants.TIMELINE_Y - LayoutConstants.DATA_Y - 20 }}>Timeline</div>
        </div>
      )}
    </div>
  )
}

export default VsmCanvas
