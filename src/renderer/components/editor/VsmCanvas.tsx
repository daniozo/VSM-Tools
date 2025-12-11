import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react'
import { useVsmStore } from '@/store/vsmStore'
import { Graph } from '@maxgraph/core'
import { VSMLayoutEngine, VSMGraphRenderer, createVSMRenderer } from '@/services/layout'

// Taille de la grille (en pixels) pour l'affichage et l'accrochage
const GRID_SIZE = 20

// Interface pour les méthodes exposées du canvas
export interface VsmCanvasHandle {
  zoomIn: () => void
  zoomOut: () => void
  zoomReset: () => void
  updateBottlenecks: (bottleneckIds: string[]) => void
}

/**
 * Composant principal du canevas VSM utilisant maxGraph
 * Architecture Model-First : 
 * - Les données viennent du store (vsmStore)
 * - Le layout est calculé par VSMLayoutEngine
 * - Le rendu est effectué par VSMGraphRenderer
 */
const VsmCanvas = forwardRef<VsmCanvasHandle>((_props, ref) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const graphRef = useRef<Graph | null>(null)
  const rendererRef = useRef<VSMGraphRenderer | null>(null)
  const layoutEngineRef = useRef<VSMLayoutEngine | null>(null)

  const {
    diagram
  } = useVsmStore()

  // Vérifier si le diagramme a du contenu
  const hasContent = diagram && diagram.nodes && diagram.nodes.length > 0;

  // Initialisation du graph - doit se déclencher quand le container apparaît
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
    graph.setCellsEditable(false) // Désactiver l'édition au double-clic

    // Définir la taille de la grille
    const gAny = graph as any
    if (typeof gAny.setGridSize === 'function') {
      gAny.setGridSize(GRID_SIZE)
    }

    // Créer le renderer et le layout engine
    const renderer = createVSMRenderer(graph)
    rendererRef.current = renderer
    layoutEngineRef.current = new VSMLayoutEngine()

    // Note: Sélection canvas désactivée - seul le panneau propriétés est mis à jour via l'explorateur

    // Nettoyage à la destruction
    return () => {
      if (graphRef.current) {
        graphRef.current.destroy()
        graphRef.current = null
      }
      rendererRef.current = null
      layoutEngineRef.current = null
    }
  }, [hasContent]) // Re-initialiser quand hasContent change

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

    // Rendre le layout (le fitToContainer est appelé automatiquement dans render())
    rendererRef.current.render(layout)

    // Note: La sélection visuelle dans le canvas est désactivée
    // pour éviter les distractions. Seul le panneau de propriétés
    // affiche l'élément sélectionné.
  }, [diagram])

  // Note: Le centrage automatique sur l'élément sélectionné est désactivé
  // pour éviter les mouvements de caméra non désirés lors de la sélection
  // useEffect(() => {
  //   if (!rendererRef.current || !selectedElementId) return
  //   rendererRef.current.centerOnElement(selectedElementId)
  // }, [selectedElementId])

  // Exposer les méthodes de zoom pour utilisation externe (toolbar)
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
    },
    updateBottlenecks: (bottleneckIds: string[]) => {
      if (rendererRef.current && diagram) {
        const allNodeIds = diagram.nodes.map(n => n.id)
        rendererRef.current.updateBottlenecks(bottleneckIds, allNodeIds)
      }
    }
  }), [diagram])

  return (
    <div className="relative flex-1 h-full w-full min-h-0 bg-background overflow-auto">
      {/* État vide - aucun projet */}
      {!diagram && (
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground z-10">
          <div className="text-center">
            <p className="text-lg mb-2">Aucun diagramme ouvert</p>
            <p className="text-sm">Ouvrez ou créez un projet pour commencer</p>
          </div>
        </div>
      )}

      {/* Conteneur maxGraph avec grille - affiché seulement si hasContent */}
      {hasContent && (
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
      )}

      {/* Message si diagramme vide ET projet ouvert */}
      {diagram && (!diagram.nodes || diagram.nodes.length === 0) && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <div className="mb-4">
              <svg className="w-24 h-24 mx-auto opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">Diagramme Vide</h3>
            <p className="text-sm mb-4">Commencez par configurer votre diagramme VSM</p>
            <p className="text-xs">Ajoutez des étapes de processus dans l'interface de configuration</p>
          </div>
        </div>
      )}
    </div>
  )
})

VsmCanvas.displayName = 'VsmCanvas'

export default VsmCanvas
