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
  Settings2,
  ZoomIn,
  ZoomOut,
  RotateCcw
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useProjectsStore } from '@/store/projectsStore'
import { useVsmStore } from '@/store/vsmStore'
import { useTabsStore } from '@/store/tabsStore'

interface ToolbarAction {
  id: string
  icon: React.ReactNode
  label: string
  shortcut?: string
  disabled?: boolean
}

interface ToolbarProps {
  onAction: (actionId: string) => void
  className?: string
}

export const Toolbar: React.FC<ToolbarProps> = ({
  onAction,
  className
}) => {
  // Récupérer l'état des stores
  const currentProject = useProjectsStore(state => state.currentProject)
  const currentDiagram = useProjectsStore(state => state.currentDiagram)
  const isDirty = useVsmStore(state => state.isDirty)
  
  // Récupérer l'onglet actif pour adapter les boutons
  const activeTabId = useTabsStore(state => state.activeTabId)
  const tabs = useTabsStore(state => state.tabs)
  const activeTab = tabs.find(t => t.id === activeTabId)
  const activeTabType = activeTab?.type || 'diagram'

  // Logique d'activation des boutons selon le contexte
  const hasProject = !!currentProject
  const hasDiagram = !!currentDiagram
  
  // Le zoom est actif sur les onglets diagramme ET état futur
  const isDiagramTab = activeTabType === 'diagram'
  const isFutureDiagramTab = activeTabType === 'future-diagram'
  const canZoom = isDiagramTab || isFutureDiagramTab
  
  // La sauvegarde est active pour diagramme (si dirty) ou notes/plan-action
  const isNoteOrActionPlan = activeTabType === 'notes' || activeTabType === 'action-plan'
  const canSave = hasProject && ((isDiagramTab && hasDiagram && isDirty) || isNoteOrActionPlan)

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
      disabled: !canZoom || (!hasDiagram && isDiagramTab) // Actif sur diagramme et état futur
    },
    { 
      id: 'zoomOut', 
      icon: <ZoomOut className="h-4 w-4" />, 
      label: 'Zoom Arrière', 
      shortcut: 'Ctrl+-',
      disabled: !canZoom || (!hasDiagram && isDiagramTab) // Actif sur diagramme et état futur
    },
    { 
      id: 'zoomReset', 
      icon: <RotateCcw className="h-4 w-4" />, 
      label: 'Réinitialiser Zoom', 
      shortcut: 'Ctrl+0',
      disabled: !canZoom || (!hasDiagram && isDiagramTab) // Actif sur diagramme et état futur
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
      'flex items-center justify-center h-10 px-2 bg-background border-b',
      className
    )}>
      {/* Actions centrales */}
      <div className="flex items-center gap-1">
        {/* Fichier */}
        <div className="flex items-center">
          {fileActions.map(renderActionButton)}
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
    </div>
  )
}
