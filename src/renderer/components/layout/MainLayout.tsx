/**
 * MainLayout - Structure principale de l'application VSM Studio
 * 
 * Implémente le layout décrit dans conception_vsm_studio.md :
 * - Panneau gauche : Explorateur de Projets
 * - Zone centrale : Canevas (children)
 * - Panneau droit : Propriétés
 * 
 * Note: Toolbar et StatusBar sont gérés par App.tsx
 */

import React, { useState, useCallback } from 'react'
import { ProjectExplorer } from './ProjectExplorer'
import { PropertiesPanel } from './PropertiesPanel'
import { RightSidebar, RightSidebarPanel } from './RightSidebar'
import { ChatAssistant } from './ChatAssistant'
import { AnalysisPanel } from '../panels/AnalysisPanel'
import { useVsmStore } from '@/store/vsmStore'
import { cn } from '@/lib/utils'

interface MainLayoutProps {
  children: React.ReactNode
  leftPanelVisible?: boolean
  rightPanelVisible?: boolean
  onNewProject?: () => void
  onOpenProject?: () => void
  currentProject?: any
  className?: string
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  leftPanelVisible = true,
  rightPanelVisible = true,
  onNewProject,
  onOpenProject,
  currentProject,
  className
}) => {
  // État des panneaux (largeur)
  const [leftPanelWidth, setLeftPanelWidth] = useState(280)
  const [rightPanelWidth, setRightPanelWidth] = useState(320)
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null)

  // État du panneau de droite (sidebar + contenu)
  const [activeRightPanel, setActiveRightPanel] = useState<RightSidebarPanel>('properties')

  // Gestion du redimensionnement des panneaux
  const [isResizingLeft, setIsResizingLeft] = useState(false)
  const [isResizingRight, setIsResizingRight] = useState(false)

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isResizingLeft) {
      const newWidth = Math.max(200, Math.min(400, e.clientX))
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

  // Handler pour la sélection dans l'explorateur
  const handleExplorerSelect = (elementId: string, elementType: string) => {
    setSelectedElementId(elementId)
    console.log('Élément sélectionné:', elementId, elementType)
  }

  return (
    <div
      className={cn('flex flex-1 overflow-hidden min-h-0', className)}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Panneau gauche - Explorateur de Projets */}
      {leftPanelVisible && (
        <>
          <ProjectExplorer
            width={leftPanelWidth}
            activeProject={currentProject?.id || null}
            selectedElementId={selectedElementId}
            onSelect={handleExplorerSelect}
            onNewProject={onNewProject}
            onOpenProject={onOpenProject}
            className="flex-shrink-0"
          />
          {/* Poignée de redimensionnement gauche */}
          <div
            className="w-1 cursor-col-resize hover:bg-primary/50 active:bg-primary transition-colors"
            onMouseDown={() => setIsResizingLeft(true)}
          />
        </>
      )}

      {/* Zone centrale - Canevas */}
      <div className="flex-1 overflow-hidden bg-muted/30">
        {children}
      </div>

      {/* Section droite - Barre verticale + Panneau */}
      {rightPanelVisible && (
        <>
          {/* Poignée de redimensionnement droite */}
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

          {activeRightPanel === 'analysis' && (
            <div
              className="flex-shrink-0 bg-background border-l overflow-hidden flex flex-col"
              style={{ width: `${rightPanelWidth}px` }}
            >
              <div className="p-4 border-b">
                <h2 className="font-semibold text-lg">Analyse VSM</h2>
              </div>
              <div className="flex-1 overflow-hidden p-4">
                <AnalysisPanel
                  analysis={(useVsmStore.getState().diagram as any)?.analysis}
                  onIssueClick={(nodeId) => {
                    console.log('Centrer sur le nœud:', nodeId);
                    // TODO: Implémenter la navigation vers le nœud
                  }}
                />
              </div>
            </div>
          )}

          {/* Barre verticale avec icônes */}
          <RightSidebar
            activePanel={activeRightPanel}
            onPanelChange={setActiveRightPanel}
          />
        </>
      )}
    </div>
  )
}
