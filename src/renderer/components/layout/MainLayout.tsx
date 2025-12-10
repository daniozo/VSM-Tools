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

import React, { useState, useCallback, useEffect } from 'react'
import { ProjectTreePanel } from './ProjectTreePanel'
import { NotesPanel, Note } from './NotesPanel'
import { PropertiesPanel } from './PropertiesPanel'
import { LeftSidebar, LeftSidebarPanel } from './LeftSidebar'
import { RightSidebar, RightSidebarPanel } from './RightSidebar'
import { ChatAssistant } from './ChatAssistant'
import { TabsContainer } from './TabsContainer'
import { AnalysisPanel } from '../panels/AnalysisPanel'
import { ActionPlanPanel } from '../panels/ActionPlanPanel'
import { ActionPlanTab } from '../panels/ActionPlanTab'
import { SimulationPanel } from '../simulation/SimulationPanel'
import { TipTapEditor } from '../editor/TipTapEditor'
import { useVsmStore } from '@/store/vsmStore'
import { useTabsStore, TabType } from '@/store/tabsStore'
import { cn } from '@/lib/utils'
import { VsmCanvasHandle } from '../editor/VsmCanvas'
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

interface MainLayoutProps {
  children: React.ReactNode
  currentProject?: any
  canvasRef?: React.RefObject<VsmCanvasHandle>
  className?: string
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  currentProject,
  canvasRef,
  className
}) => {
  // État des panneaux
  const [activeLeftPanel, setActiveLeftPanel] = useState<LeftSidebarPanel>('explorer')
  const [activeRightPanel, setActiveRightPanel] = useState<RightSidebarPanel>('properties')
  const [leftPanelWidth, setLeftPanelWidth] = useState(280)
  const [rightPanelWidth, setRightPanelWidth] = useState(320)
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null)

  // Gestion des notes
  const [notes, setNotes] = useState<Note[]>([])
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null)
  const [isNewNoteDialogOpen, setIsNewNoteDialogOpen] = useState(false)
  const [newNoteTitle, setNewNoteTitle] = useState('')

  // Charger les notes
  useEffect(() => {
    const storageKey = currentProject?.id ? `vsm-notes-${currentProject.id}` : 'vsm-notes-default'
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
  }, [currentProject?.id])

  // Sauvegarder les notes
  const saveNotes = (updatedNotes: Note[]) => {
    const storageKey = currentProject?.id ? `vsm-notes-${currentProject.id}` : 'vsm-notes-default'
    localStorage.setItem(storageKey, JSON.stringify(updatedNotes))
    setNotes(updatedNotes)
  }

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
  }

  const handleCreateNote = () => {
    setIsNewNoteDialogOpen(true)
  }

  const handleConfirmCreateNote = () => {
    if (!newNoteTitle.trim()) return

    const newNote: Note = {
      id: `note-${Date.now()}`,
      title: newNoteTitle.trim(),
      content: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const updatedNotes = [...notes, newNote]
    saveNotes(updatedNotes)
    setSelectedNoteId(newNote.id)
    setNewNoteTitle('')
    setIsNewNoteDialogOpen(false)
    
    // Ouvrir l'onglet de la note
    useTabsStore.getState().openOrFocusTab('notes', newNote.title, { noteId: newNote.id })
  }

  const handleSelectNote = (noteId: string) => {
    const note = notes.find(n => n.id === noteId)
    if (note) {
      setSelectedNoteId(noteId)
      useTabsStore.getState().openOrFocusTab('notes', note.title, { noteId })
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

      {/* Panneaux gauche selon sélection */}
      {activeLeftPanel && (
        <>
          {activeLeftPanel === 'explorer' && (
            <ProjectTreePanel
              width={leftPanelWidth}
              selectedElementId={selectedElementId}
              onSelect={handleExplorerSelect}
              className="flex-shrink-0"
            />
          )}

          {activeLeftPanel === 'notes' && (
            <NotesPanel
              width={leftPanelWidth}
              notes={notes}
              selectedNoteId={selectedNoteId}
              onSelectNote={handleSelectNote}
              onCreateNote={handleCreateNote}
              canCreate={!!currentProject}
              className="flex-shrink-0"
            />
          )}

          {activeLeftPanel === 'action-plan' && (
            <ActionPlanPanel
              width={leftPanelWidth}
              projectId={currentProject?.id}
              className="flex-shrink-0"
            />
          )}

          {activeLeftPanel === 'analysis' && (
            <div
              className="flex-shrink-0 bg-background border-r overflow-hidden flex flex-col"
              style={{ width: `${leftPanelWidth}px` }}
            >
              <div className="h-9 px-3 border-b flex items-center bg-muted/30">
                <span className="text-sm font-medium">Analyse</span>
              </div>
              <div className="flex-1 overflow-auto p-2">
                <AnalysisPanel
                  analysis={(useVsmStore.getState().diagram as any)?.analysis}
                  onIssueClick={(nodeId) => {
                    console.log('Centrer sur le nœud:', nodeId);
                  }}
                />
              </div>
            </div>
          )}

          {/* Poignée de redimensionnement gauche */}
          <div
            className="w-1 cursor-col-resize hover:bg-primary/50 active:bg-primary transition-colors"
            onMouseDown={() => setIsResizingLeft(true)}
          />
        </>
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
                  <ActionPlanTab projectId={currentProject?.id} />
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
                          const updatedNotes = notes.map(n =>
                            n.id === note.id
                              ? { ...n, content, updatedAt: new Date() }
                              : n
                          );
                          saveNotes(updatedNotes);
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
                      onIssueClick={(nodeId) => {
                        console.log('Centrer sur le nœud:', nodeId);
                      }}
                    />
                  </div>
                );
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
            <ChatAssistant
              width={rightPanelWidth}
              projectContext={currentProject || undefined}
              className="flex-shrink-0"
            />
          )}

          {activeRightPanel === 'simulation' && (
            <div
              className="flex-shrink-0 bg-background border-l overflow-hidden flex flex-col"
              style={{ width: `${rightPanelWidth}px` }}
            >
              <div className="h-9 px-3 border-b flex items-center bg-muted/30">
                <span className="text-sm font-medium">Simulation</span>
              </div>
              <div className="flex-1 overflow-auto">
                <SimulationPanel canvasRef={canvasRef as React.RefObject<VsmCanvasHandle>} />
              </div>
            </div>
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
}
