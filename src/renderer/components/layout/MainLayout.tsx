/**
 * MainLayout - Structure principale de l'application VSM Studio (style VS Code)
 * 
 * - LeftSidebar : Barre d'icônes tout à gauche
 * - Panneaux gauche : Explorateur, Notes, Plan d'action, Analyse
 * - Zone centrale : Système d'onglets avec canevas
 * - Panneau droit : Propriétés, Assistant, Analyse, Simulation
 * 
 * Note: Toolbar et StatusBar sont gérés par App.tsx
 */

import React, { useState, useCallback, useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import { ProjectTreePanel } from './ProjectTreePanel'
import { NotesPanel, Note } from './NotesPanel'
import { PropertiesPanel } from './PropertiesPanel'
import { LeftSidebar, LeftSidebarPanel } from './LeftSidebar'
import { RightSidebar, RightSidebarPanel } from './RightSidebar'
import { AgentChatAssistant } from './AgentChatAssistant'
import { TabsContainer } from './TabsContainer'
import { AgentUIEvent } from '@/services/agent'
import { AnalysisPanel } from '../panels/AnalysisPanel'
import { ActionPlanPanel } from '../panels/ActionPlanPanel'

import { ComparisonPanel } from '../panels/ComparisonPanel'
import { TipTapEditor } from '../editor/TipTapEditor'
import FutureDiagramCanvas, { FutureDiagramCanvasHandle } from '../editor/FutureDiagramCanvas'
import { useVsmStore } from '@/store/vsmStore'
import { useTabsStore } from '@/store/tabsStore'
import { cn } from '@/lib/utils'
import { VsmCanvasHandle } from '../editor/VsmCanvas'
import { notesApi, type Note as ApiNote } from '@/services/api'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/renderer/components/ui/dialog'
import { Button } from '@/renderer/components/ui/button'
import { Input } from '@/renderer/components/ui/input'

export interface MainLayoutHandle {
  zoomIn: () => void
  zoomOut: () => void
  zoomReset: () => void
}

interface MainLayoutProps {
  children: React.ReactNode
  currentProject?: any
  canvasRef?: React.RefObject<VsmCanvasHandle>
  className?: string
}

export const MainLayout = forwardRef<MainLayoutHandle, MainLayoutProps>(({
  children,
  currentProject,
  canvasRef,
  className
}, ref) => {
  // État des panneaux - utiliser null pour "fermé" au lieu de changer la valeur
  const [activeLeftPanel, setActiveLeftPanel] = useState<LeftSidebarPanel | null>('explorer')
  const [activeRightPanel, setActiveRightPanel] = useState<RightSidebarPanel | null>('properties')
  const [leftPanelWidth, setLeftPanelWidth] = useState(280)
  const [rightPanelWidth, setRightPanelWidth] = useState(320)
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null)
  
  // Refs pour les canvas d'état futur (un par onglet)
  const futureDiagramCanvasRefs = useRef<Map<string, FutureDiagramCanvasHandle | null>>(new Map())
  
  // Écouter les requêtes de changement de panneau depuis le store
  const requestedLeftPanel = useTabsStore(state => state.requestedLeftPanel)
  const requestedRightPanel = useTabsStore(state => state.requestedRightPanel)
  const clearPanelRequest = useTabsStore(state => state.clearPanelRequest)
  
  // Gérer les requêtes de panneau
  useEffect(() => {
    if (requestedLeftPanel) {
      setActiveLeftPanel(requestedLeftPanel as LeftSidebarPanel)
      clearPanelRequest()
    }
    if (requestedRightPanel) {
      setActiveRightPanel(requestedRightPanel as RightSidebarPanel)
      clearPanelRequest()
    }
  }, [requestedLeftPanel, requestedRightPanel, clearPanelRequest])

  // Exposer les méthodes de zoom pour l'état futur
  useImperativeHandle(ref, () => ({
    zoomIn: () => {
      const activeTabId = useTabsStore.getState().activeTabId
      const activeTab = useTabsStore.getState().tabs.find(t => t.id === activeTabId)
      
      if (activeTab?.type === 'future-diagram' && activeTabId) {
        const futureCanvasRef = futureDiagramCanvasRefs.current.get(activeTabId)
        if (futureCanvasRef) {
          futureCanvasRef.zoomIn()
        }
      } else if (canvasRef?.current) {
        canvasRef.current.zoomIn()
      }
    },
    zoomOut: () => {
      const activeTabId = useTabsStore.getState().activeTabId
      const activeTab = useTabsStore.getState().tabs.find(t => t.id === activeTabId)
      
      if (activeTab?.type === 'future-diagram' && activeTabId) {
        const futureCanvasRef = futureDiagramCanvasRefs.current.get(activeTabId)
        if (futureCanvasRef) {
          futureCanvasRef.zoomOut()
        }
      } else if (canvasRef?.current) {
        canvasRef.current.zoomOut()
      }
    },
    zoomReset: () => {
      const activeTabId = useTabsStore.getState().activeTabId
      const activeTab = useTabsStore.getState().tabs.find(t => t.id === activeTabId)
      
      if (activeTab?.type === 'future-diagram' && activeTabId) {
        const futureCanvasRef = futureDiagramCanvasRefs.current.get(activeTabId)
        if (futureCanvasRef) {
          futureCanvasRef.zoomReset()
        }
      } else if (canvasRef?.current) {
        canvasRef.current.zoomReset()
      }
    }
  }), [canvasRef])

  // Gestion des notes
  const [notes, setNotes] = useState<Note[]>([])
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null)
  const [isNewNoteDialogOpen, setIsNewNoteDialogOpen] = useState(false)
  const [newNoteTitle, setNewNoteTitle] = useState('')
  const [_isLoadingNotes, setIsLoadingNotes] = useState(false) // Prefixed to avoid warning

  // Charger les notes depuis l'API
  useEffect(() => {
    const loadNotes = async () => {
      if (!currentProject?.id) {
        setNotes([])
        return
      }

      setIsLoadingNotes(true)
      try {
        const apiNotes = await notesApi.list(currentProject.id)
        // Convertir les notes API vers le format local
        const localNotes: Note[] = apiNotes.map((n: ApiNote) => ({
          id: n.id,
          title: n.title,
          content: n.content,
          createdAt: new Date(n.created_at),
          updatedAt: new Date(n.updated_at),
        }))
        setNotes(localNotes)
      } catch (error) {
        console.error('Erreur lors du chargement des notes:', error)
        // Fallback vers localStorage si l'API échoue
        const storageKey = `vsm-notes-${currentProject.id}`
        const savedNotes = localStorage.getItem(storageKey)
        if (savedNotes) {
          const parsed = JSON.parse(savedNotes)
          const notesWithDates = parsed.map((note: any) => ({
            ...note,
            createdAt: new Date(note.createdAt),
            updatedAt: new Date(note.updatedAt),
          }))
          setNotes(notesWithDates)
        }
      } finally {
        setIsLoadingNotes(false)
      }
    }

    loadNotes()

    // Écouter les événements de rafraîchissement des notes
    const handleRefreshNotes = () => {
      loadNotes()
    }

    window.addEventListener('notes-refreshed', handleRefreshNotes)
    return () => window.removeEventListener('notes-refreshed', handleRefreshNotes)
  }, [currentProject?.id])

  // Gestion du redimensionnement
  const [isResizingLeft, setIsResizingLeft] = useState(false)
  const [isResizingRight, setIsResizingRight] = useState(false)

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isResizingLeft) {
      const sidebarWidth = 48 // LeftSidebar width
      const newWidth = Math.max(200, Math.min(400, e.clientX - sidebarWidth))
      setLeftPanelWidth(newWidth)
    }
    if (isResizingRight) {
      const newWidth = Math.max(200, Math.min(400, window.innerWidth - e.clientX))
      setRightPanelWidth(newWidth)
    }
  }, [isResizingLeft, isResizingRight])

  const handleMouseUp = useCallback(() => {
    setIsResizingLeft(false)
    setIsResizingRight(false)
  }, [])

  // Handlers
  const handleExplorerSelect = (elementId: string, elementType: string) => {
    setSelectedElementId(elementId)
    console.log('Élément sélectionné:', elementId, elementType)

    // Mettre à jour le store avec le bon format de sélection
    const { selectElement, diagram } = useVsmStore.getState()

    // Mapper le type de l'explorateur vers le type du store
    switch (elementType) {
      case 'supplier':
        selectElement({ type: 'supplier' })
        break
      case 'customer':
        selectElement({ type: 'customer' })
        break
      case 'control-center':
        selectElement({ type: 'controlCenter' })
        break
      case 'process-step':
        // Les étapes de processus sont des nœuds
        selectElement({ type: 'node', id: elementId })
        break
      case 'inventory':
      case 'stock':
        // Pour les stocks, on doit trouver la position dans les flowSequences
        if (diagram) {
          for (const seq of diagram.flowSequences) {
            for (const elem of seq.intermediateElements) {
              if (elem.type === 'INVENTORY' && elem.inventory?.id === elementId) {
                selectElement({
                  type: 'inventory',
                  sequenceOrder: seq.order,
                  elementOrder: elem.order
                })
                return
              }
            }
          }
        }
        break
      case 'improvement-point':
      case 'kaizen':
        selectElement({ type: 'improvementPoint', id: elementId })
        break
      case 'annotation':
      case 'text-annotation':
        selectElement({ type: 'textAnnotation', id: elementId })
        break
      case 'information-flow':
        selectElement({ type: 'informationFlow', id: elementId })
        break
      case 'material-flow':
        // Extraire l'index depuis l'ID (material-flow-0, material-flow-1, etc.)
        const match = elementId.match(/material-flow-(\d+)/)
        if (match) {
          selectElement({ type: 'materialFlow', sequenceOrder: parseInt(match[1]) })
        } else {
          selectElement(null)
        }
        break
      default:
        // Type non reconnu, essayer de trouver dans les nœuds
        if (diagram?.nodes.find(n => n.id === elementId)) {
          selectElement({ type: 'node', id: elementId })
        } else {
          selectElement(null)
        }
    }
  }

  const handleCreateNote = () => {
    setIsNewNoteDialogOpen(true)
  }

  const handleConfirmCreateNote = async () => {
    if (!newNoteTitle.trim() || !currentProject?.id) return

    try {
      const apiNote = await notesApi.create(currentProject.id, {
        title: newNoteTitle.trim(),
        content: ''
      })

      const newNote: Note = {
        id: apiNote.id,
        title: apiNote.title,
        content: apiNote.content,
        createdAt: new Date(apiNote.created_at),
        updatedAt: new Date(apiNote.updated_at),
      }

      setNotes(prev => [...prev, newNote])
      setSelectedNoteId(newNote.id)
      setNewNoteTitle('')
      setIsNewNoteDialogOpen(false)

      // Ouvrir l'onglet de la note
      useTabsStore.getState().openOrFocusTab('notes', newNote.title, { noteId: newNote.id })
    } catch (error) {
      console.error('Erreur lors de la création de la note:', error)
    }
  }

  const handleSelectNote = (noteId: string) => {
    const note = notes.find(n => n.id === noteId)
    if (note) {
      setSelectedNoteId(noteId)
      useTabsStore.getState().openOrFocusTab('notes', note.title, { noteId })
    }
  }

  const handleRenameNote = async (noteId: string, newTitle: string) => {
    if (!currentProject?.id) return

    try {
      await notesApi.update(currentProject.id, noteId, { title: newTitle })

      setNotes(prev => prev.map(n =>
        n.id === noteId
          ? { ...n, title: newTitle, updatedAt: new Date() }
          : n
      ))

      // Mettre à jour le titre de l'onglet si ouvert
      const tabsStore = useTabsStore.getState()
      const tab = tabsStore.tabs.find(t => t.data?.noteId === noteId)
      if (tab) {
        tabsStore.updateTab(tab.id, { title: newTitle })
      }
    } catch (error) {
      console.error('Erreur lors du renommage de la note:', error)
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    if (!currentProject?.id) return

    try {
      await notesApi.delete(currentProject.id, noteId)

      setNotes(prev => prev.filter(n => n.id !== noteId))

      if (selectedNoteId === noteId) {
        setSelectedNoteId(null)
      }

      // Fermer l'onglet si ouvert
      const tabsStore = useTabsStore.getState()
      const tab = tabsStore.tabs.find(t => t.data?.noteId === noteId)
      if (tab) {
        tabsStore.removeTab(tab.id)
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de la note:', error)
    }
  }

  const handleUpdateNoteContent = async (noteId: string, content: string) => {
    if (!currentProject?.id) return

    try {
      await notesApi.update(currentProject.id, noteId, { content })

      setNotes(prev => prev.map(n =>
        n.id === noteId
          ? { ...n, content, updatedAt: new Date() }
          : n
      ))
    } catch (error) {
      console.error('Erreur lors de la mise à jour du contenu:', error)
    }
  }

  return (
    <div
      className={cn('flex flex-1 overflow-hidden min-h-0', className)}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Sidebar gauche - Barre d'icônes */}
      <LeftSidebar
        activePanel={activeLeftPanel}
        onPanelChange={setActiveLeftPanel}
      />

      {/* Panneaux gauche - toujours montés pour préserver l'état */}
      <div
        className={cn(
          "flex-shrink-0 flex",
          !activeLeftPanel && "hidden"
        )}
      >
        {/* Explorateur */}
        <div className={activeLeftPanel !== 'explorer' ? "hidden" : ""}>
          <ProjectTreePanel
            width={leftPanelWidth}
            selectedElementId={selectedElementId}
            onSelect={handleExplorerSelect}
            className="flex-shrink-0"
          />
        </div>

        {/* Notes */}
        <div className={activeLeftPanel !== 'notes' ? "hidden" : ""}>
          <NotesPanel
            width={leftPanelWidth}
            notes={notes}
            selectedNoteId={selectedNoteId}
            onSelectNote={handleSelectNote}
            onCreateNote={handleCreateNote}
            onRenameNote={handleRenameNote}
            onDeleteNote={handleDeleteNote}
            canCreate={!!currentProject}
            className="flex-shrink-0"
          />
        </div>

        {/* Plan d'action */}
        <div className={activeLeftPanel !== 'action-plan' ? "hidden" : ""}>
          <ActionPlanPanel
            width={leftPanelWidth}
            projectId={currentProject?.id}
            className="flex-shrink-0"
          />
        </div>

        {/* Analyse panel */}
        <div
          className={cn(
            "flex-shrink-0 bg-background border-r flex flex-col",
            activeLeftPanel !== 'analysis' && "hidden"
          )}
          style={{ width: `${leftPanelWidth}px`, height: '100%' }}
        >
          <div className="h-9 px-3 border-b flex items-center bg-muted/30 flex-shrink-0">
            <span className="text-sm font-medium">Analyse</span>
          </div>
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 min-h-0">
            <AnalysisPanel
              analysis={(useVsmStore.getState().diagram as any)?.analysis}
              onIssueClick={(nodeId: string) => {
                console.log('Centrer sur le nœud:', nodeId);
              }}
            />
          </div>
        </div>

      </div>
      
      {/* Poignée de redimensionnement gauche - visible uniquement si un panneau est actif */}
      {activeLeftPanel && (
        <div
          className="w-1 cursor-col-resize hover:bg-primary/50 active:bg-primary transition-colors flex-shrink-0"
          onMouseDown={() => setIsResizingLeft(true)}
        />
      )}

      {/* Zone centrale - Système d'onglets */}
      <div className="flex-1 overflow-hidden bg-muted/30">
        <TabsContainer
          renderContent={(activeTabType, activeTabId) => {
            // Afficher le contenu selon le type d'onglet
            switch (activeTabType) {
              case 'diagram':
                return children;
              case 'configuration':
                return (
                  <div className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Configuration du diagramme</h2>
                    <p className="text-muted-foreground">Configuration à implémenter...</p>
                  </div>
                );
              case 'action-plan':
                return (
                  <div className="flex-1 flex items-center justify-center text-muted-foreground">
                    <p>Utilisez le panneau Plan d'action à gauche</p>
                  </div>
                );
              case 'notes':
                {
                  // Récupérer la note depuis les données de l'onglet
                  const activeTab = useTabsStore.getState().tabs.find(t => t.id === activeTabId);
                  const noteId = activeTab?.data?.noteId;
                  const note = notes.find(n => n.id === noteId);

                  if (!note) {
                    return (
                      <div className="flex-1 flex items-center justify-center text-muted-foreground">
                        <p>Note introuvable</p>
                      </div>
                    );
                  }

                  return (
                    <div className="flex-1 flex flex-col p-4">
                      <TipTapEditor
                        content={note.content}
                        onChange={(content) => {
                          handleUpdateNoteContent(note.id, content)
                        }}
                        placeholder="Écrivez vos notes ici..."
                        editable={true}
                        className="h-full"
                      />
                    </div>
                  );
                }
              case 'data-sources':
                return (
                  <div className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Sources de données</h2>
                    <p className="text-muted-foreground">Gestion des sources de données à implémenter...</p>
                  </div>
                );
              case 'analysis':
                return (
                  <div className="p-6 overflow-auto h-full">
                    <AnalysisPanel
                      analysis={(useVsmStore.getState().diagram as any)?.analysis}
                      onIssueClick={(nodeId: string) => {
                        console.log('Centrer sur le nœud:', nodeId);
                      }}
                    />
                  </div>
                );
              case 'future-diagram':
                {
                  // Pour l'état futur, on utilise un canvas dédié avec son propre état
                  const activeTab = useTabsStore.getState().tabs.find(t => t.id === activeTabId);
                  const futureDiagram = activeTab?.data?.diagram;
                  
                  if (!futureDiagram) {
                    return (
                      <div className="flex-1 w-full h-full flex items-center justify-center text-muted-foreground">
                        <div className="text-center">
                          <p>Diagramme d'état futur non trouvé</p>
                          <p className="text-xs mt-2">Créez un état futur depuis le panneau d'analyse</p>
                        </div>
                      </div>
                    );
                  }
                  
                  return (
                    <FutureDiagramCanvas
                      ref={(handle) => {
                        if (activeTabId) {
                          futureDiagramCanvasRefs.current.set(activeTabId, handle);
                        }
                      }}
                      diagram={futureDiagram}
                      tabId={activeTabId || 'unknown'}
                    />
                  );
                }
              case 'comparison':
                {
                  const activeTab = useTabsStore.getState().tabs.find(t => t.id === activeTabId);
                  const currentState = activeTab?.data?.currentState;
                  const futureState = activeTab?.data?.futureState;

                  if (!currentState || !futureState) {
                    return (
                      <div className="flex-1 w-full h-full flex items-center justify-center text-muted-foreground">
                        <div className="text-center">
                          <p>Données de comparaison manquantes</p>
                          <p className="text-xs mt-2">Créez d'abord un état futur depuis le panneau d'analyse</p>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <ComparisonPanel
                      currentDiagram={currentState}
                      futureDiagram={futureState}
                    />
                  );
                }
              default:
                return children;
            }
          }}
        />
      </div>

      {/* Section droite - Barre verticale + Panneau */}
      <>
        {/* Po gnée de redimensionnement droite */}
        {activeRightPanel && (
          <div
            className="w-1 cursor-col-resize hover:bg-primary/50 active:bg-primary transition-colors"
            onMouseDown={() => setIsResizingRight(true)}
          />
        )}

        {/* Contenu du panneau selon la sélection */}
        {activeRightPanel === 'properties' && (
          <PropertiesPanel
            width={rightPanelWidth}
            selectedElementId={selectedElementId}
            className="flex-shrink-0"
          />
        )}

        {activeRightPanel === 'assistant' && (
          <AgentChatAssistant
            width={rightPanelWidth}
            className="flex-shrink-0"
            onUIEvent={(event: AgentUIEvent) => {
              // Gérer les événements UI de l'agent
              console.log('Agent UI Event:', event)
              if (event.type === 'select_node' && event.payload?.nodeId) {
                setSelectedElementId(event.payload.nodeId)
              }
              if (event.type === 'open_config') {
                useVsmStore.getState().openConfigDialog()
              }
              if (event.type === 'zoom_to' && canvasRef?.current) {
                // Zoomer sur l'élément si le canvas supporte cette méthode
                // canvasRef.current.zoomToElement?.(event.payload?.elementId)
              }
            }}
          />
        )}

        {/* Barre verticale avec icônes */}
        <RightSidebar
          activePanel={activeRightPanel}
          onPanelChange={setActiveRightPanel}
        />
      </>

      {/* Dialog pour créer une nouvelle note */}
      <Dialog open={isNewNoteDialogOpen} onOpenChange={setIsNewNoteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nouvelle note</DialogTitle>
            <DialogDescription>
              Donnez un titre à votre nouvelle note
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Titre de la note"
              value={newNoteTitle}
              onChange={(e) => setNewNoteTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleConfirmCreateNote();
                }
              }}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewNoteDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleConfirmCreateNote} disabled={!newNoteTitle.trim()}>
              Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
})

MainLayout.displayName = 'MainLayout'
