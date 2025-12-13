/**
 * FutureDiagramCanvas - Canvas dédié pour les diagrammes d'état futur
 * 
 * Ce composant crée une instance indépendante du graphe pour chaque
 * onglet d'état futur, avec son propre état de zoom/pan.
 */

import { useEffect, useRef, useImperativeHandle, forwardRef, useState } from 'react'
import { Graph } from '@maxgraph/core'
import { VSMLayoutEngine, VSMGraphRenderer, createVSMRenderer } from '@/services/layout'
import { VSMDiagram } from '@/shared/types/vsm-model'

const GRID_SIZE = 20

export interface FutureDiagramCanvasHandle {
  zoomIn: () => void
  zoomOut: () => void
  zoomReset: () => void
}

interface FutureDiagramCanvasProps {
  diagram: VSMDiagram
  tabId: string // ID de l'onglet pour isoler l'état
}

const FutureDiagramCanvas = forwardRef<FutureDiagramCanvasHandle, FutureDiagramCanvasProps>(
  ({ diagram, tabId }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const graphRef = useRef<Graph | null>(null)
    const rendererRef = useRef<VSMGraphRenderer | null>(null)
    const layoutEngineRef = useRef<VSMLayoutEngine | null>(null)
    const [isInitialized, setIsInitialized] = useState(false)

    // Vérifier si le diagramme a du contenu
    const hasContent = diagram && diagram.nodes && diagram.nodes.length > 0

    // Initialisation du graph
    useEffect(() => {
      if (!containerRef.current || !hasContent) return

      // Détruire le graphe existant s'il y en a un
      if (graphRef.current) {
        graphRef.current.destroy()
        graphRef.current = null
        rendererRef.current = null
        layoutEngineRef.current = null
      }

      // Initialisation de maxGraph
      const graph = new Graph(containerRef.current)
      graphRef.current = graph

      // Configuration du graph
      graph.setPanning(true)
      graph.setConnectable(false)
      graph.setGridEnabled(true)
      graph.setAllowDanglingEdges(false)
      graph.setEnabled(true)
      graph.setCellsMovable(false)
      graph.setCellsResizable(false)
      graph.setCellsEditable(false)

      // Définir la taille de la grille
      const gAny = graph as any
      if (typeof gAny.setGridSize === 'function') {
        gAny.setGridSize(GRID_SIZE)
      }

      // Créer le renderer et le layout engine
      const renderer = createVSMRenderer(graph)
      rendererRef.current = renderer
      layoutEngineRef.current = new VSMLayoutEngine()

      setIsInitialized(true)

      // Nettoyage à la destruction
      return () => {
        if (graphRef.current) {
          graphRef.current.destroy()
          graphRef.current = null
        }
        rendererRef.current = null
        layoutEngineRef.current = null
        setIsInitialized(false)
      }
    }, [hasContent, tabId]) // Re-initialiser uniquement si le contenu ou l'onglet change

    // Rendu du diagramme quand il change
    useEffect(() => {
      if (!isInitialized || !graphRef.current || !rendererRef.current || !layoutEngineRef.current) return

      // Si pas de diagramme, nettoyer le canvas
      if (!diagram) {
        rendererRef.current.clear()
        return
      }

      // Calculer le layout
      const layout = layoutEngineRef.current.computeLayout(diagram)

      // Rendre le layout
      rendererRef.current.render(layout)
    }, [diagram, isInitialized])

    // Exposer les méthodes de zoom
    useImperativeHandle(ref, () => ({
      zoomIn: () => {
        if (rendererRef.current) {
          rendererRef.current.zoomIn()
        }
      },
      zoomOut: () => {
        if (rendererRef.current) {
          rendererRef.current.zoomOut()
        }
      },
      zoomReset: () => {
        if (rendererRef.current) {
          rendererRef.current.zoomReset()
        }
      }
    }), [])

    return (
      <div className="relative flex-1 h-full w-full min-h-0 bg-background overflow-auto">
        {/* État vide */}
        {!diagram && (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground z-10">
            <div className="text-center">
              <p className="text-lg mb-2">Aucun diagramme d'état futur</p>
              <p className="text-sm">Créez un état futur depuis le panneau d'analyse</p>
            </div>
          </div>
        )}

        {/* Conteneur maxGraph avec grille */}
        {hasContent && (
          <div
            className="min-w-full min-h-full cursor-default"
            ref={containerRef}
            style={{
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
        )}

        {/* Message si diagramme vide */}
        {diagram && (!diagram.nodes || diagram.nodes.length === 0) && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <div className="mb-4">
                <svg className="w-24 h-24 mx-auto opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">État Futur Vide</h3>
              <p className="text-sm mb-4">Ce diagramme d'état futur n'a pas encore d'étapes</p>
            </div>
          </div>
        )}

        {/* Badge indiquant état futur */}
        <div className="absolute top-2 left-2 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-medium shadow-md z-20">
          État Futur
        </div>
      </div>
    )
  }
)

FutureDiagramCanvas.displayName = 'FutureDiagramCanvas'

export default FutureDiagramCanvas
