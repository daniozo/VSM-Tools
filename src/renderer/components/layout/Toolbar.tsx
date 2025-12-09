/**
 * Toolbar - Barre d'outils principale VSM Studio
 * 
 * Actions disponibles selon conception_vsm_studio.md :
 * - Nouveau Projet
 * - Ouvrir Projet
 * - Enregistrer / Tout Enregistrer
 * - Annuler / Rétablir
 * - Configurer le diagramme
 * - Zoom avant/arrière
 * - Onglets (Notes, Plan d'action, Analyse)
 */

import React from 'react'
import { Button } from '@/renderer/components/ui/button'
import { Separator } from '@/renderer/components/ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/renderer/components/ui/tooltip'
import {
  FolderPlus,
  FolderOpen,
  Save,
  Undo2,
  Redo2,
  Settings2,
  ZoomIn,
  ZoomOut,
  PanelLeft,
  PanelRight,
  RotateCcw
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useProjectsStore } from '@/store/projectsStore'
import { useVsmStore } from '@/store/vsmStore'

interface ToolbarAction {
  id: string
  icon: React.ReactNode
  label: string
  shortcut?: string
  disabled?: boolean
}

interface ToolbarProps {
  onAction: (actionId: string) => void
  leftPanelVisible?: boolean
  rightPanelVisible?: boolean
  className?: string
}

export const Toolbar: React.FC<ToolbarProps> = ({
  onAction,
  leftPanelVisible = true,
  rightPanelVisible = true,
  className
}) => {
  // Récupérer l'état des stores
  const currentProject = useProjectsStore(state => state.currentProject)
  const currentDiagram = useProjectsStore(state => state.currentDiagram)
  const isDirty = useVsmStore(state => state.isDirty)

  // Logique d'activation des boutons
  const hasProject = !!currentProject
  const hasDiagram = !!currentDiagram
  const canSave = hasProject && hasDiagram && isDirty

  // Groupes d'actions
  const fileActions: ToolbarAction[] = [
    { 
      id: 'newProject', 
      icon: <FolderPlus className="h-4 w-4" />, 
      label: 'Nouveau Projet', 
      shortcut: 'Ctrl+N',
      disabled: false // Toujours activé
    },
    { 
      id: 'openProject', 
      icon: <FolderOpen className="h-4 w-4" />, 
      label: 'Ouvrir Projet', 
      shortcut: 'Ctrl+O',
      disabled: false // Toujours activé
    },
    { 
      id: 'save', 
      icon: <Save className="h-4 w-4" />, 
      label: 'Enregistrer', 
      shortcut: 'Ctrl+S',
      disabled: !canSave // Activé seulement si modifications non sauvegardées
    },
  ]

  const editActions: ToolbarAction[] = [
    { 
      id: 'undo', 
      icon: <Undo2 className="h-4 w-4" />, 
      label: 'Annuler', 
      shortcut: 'Ctrl+Z',
      disabled: !hasDiagram // Nécessite un diagramme ouvert
    },
    { 
      id: 'redo', 
      icon: <Redo2 className="h-4 w-4" />, 
      label: 'Rétablir', 
      shortcut: 'Ctrl+Y',
      disabled: !hasDiagram // Nécessite un diagramme ouvert
    },
  ]

  const configActions: ToolbarAction[] = [
    { 
      id: 'configure', 
      icon: <Settings2 className="h-4 w-4" />, 
      label: 'Configurer le Diagramme', 
      shortcut: 'Ctrl+K',
      disabled: !hasProject // Nécessite un projet ouvert
    },
  ]

  const zoomActions: ToolbarAction[] = [
    { 
      id: 'zoomIn', 
      icon: <ZoomIn className="h-4 w-4" />, 
      label: 'Zoom Avant', 
      shortcut: 'Ctrl++',
      disabled: !hasDiagram // Nécessite un diagramme ouvert
    },
    { 
      id: 'zoomOut', 
      icon: <ZoomOut className="h-4 w-4" />, 
      label: 'Zoom Arrière', 
      shortcut: 'Ctrl+-',
      disabled: !hasDiagram // Nécessite un diagramme ouvert
    },
    { 
      id: 'zoomReset', 
      icon: <RotateCcw className="h-4 w-4" />, 
      label: 'Réinitialiser Zoom', 
      shortcut: 'Ctrl+0',
      disabled: !hasDiagram // Nécessite un diagramme ouvert
    },
  ]

  const renderActionButton = (action: ToolbarAction) => (
    <TooltipProvider key={action.id} delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => onAction(action.id)}
            disabled={action.disabled}
          >
            {action.icon}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>{action.label}</p>
          {action.shortcut && (
            <p className="text-xs text-muted-foreground">{action.shortcut}</p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )

  return (
    <div className={cn(
      'flex items-center justify-between h-10 px-2 bg-background border-b',
      className
    )}>
      {/* Bouton panneau gauche */}
      <div className="flex items-center">
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={leftPanelVisible ? 'secondary' : 'ghost'}
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => onAction('toggleLeftPanel')}
              >
                <PanelLeft className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Explorateur de Projets</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Actions centrales */}
      <div className="flex items-center gap-1">
        {/* Fichier */}
        <div className="flex items-center">
          {fileActions.map(renderActionButton)}
        </div>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Édition */}
        <div className="flex items-center">
          {editActions.map(renderActionButton)}
        </div>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Configuration */}
        <div className="flex items-center">
          {configActions.map(renderActionButton)}
        </div>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Zoom */}
        <div className="flex items-center">
          {zoomActions.map(renderActionButton)}
        </div>
      </div>

      {/* Bouton panneau droit */}
      <div className="flex items-center">
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={rightPanelVisible ? 'secondary' : 'ghost'}
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => onAction('toggleRightPanel')}
              >
                <PanelRight className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Panneau des Propriétés</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  )
}
