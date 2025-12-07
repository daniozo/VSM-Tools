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
import { cn } from '@/lib/utils'

interface MainLayoutProps {
  children: React.ReactNode
  className?: string
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  className
}) => {
  // État des panneaux
  const [leftPanelVisible, setLeftPanelVisible] = useState(true)
  const [rightPanelVisible, setRightPanelVisible] = useState(true)
  const [leftPanelWidth, setLeftPanelWidth] = useState(280)
  const [rightPanelWidth, setRightPanelWidth] = useState(280)

  // État du projet actif
  const [activeProject] = useState<string | null>(null)
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null)

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
            activeProject={activeProject}
            selectedElementId={selectedElementId}
            onSelect={handleExplorerSelect}
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

      {/* Panneau droit - Propriétés */}
      {rightPanelVisible && (
        <>
          {/* Poignée de redimensionnement droite */}
          <div
            className="w-1 cursor-col-resize hover:bg-primary/50 active:bg-primary transition-colors"
            onMouseDown={() => setIsResizingRight(true)}
          />
          <PropertiesPanel
            width={rightPanelWidth}
            selectedElementId={selectedElementId}
            className="flex-shrink-0"
          />
        </>
      )}
    </div>
  )
}
