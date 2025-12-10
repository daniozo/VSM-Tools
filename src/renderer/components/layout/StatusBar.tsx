/**
 * StatusBar - Barre d'état en bas de l'application
 * 
 * Selon conception_vsm_studio.md :
 * - Affiche le projet actif
 * - Statut de la sauvegarde
 * - Niveau de zoom
 * - Statut de synchronisation avec l'Engine (vert/jaune/rouge)
 */

import React from 'react'
import {
  Cloud,
  CloudOff,
  Loader2,
  Folder,
  Save,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useProjectsStore } from '@/store/projectsStore'

type SyncStatus = 'synced' | 'syncing' | 'error' | 'disconnected'

interface StatusBarProps {
  hasUnsavedChanges?: boolean
  className?: string
}

export const StatusBar: React.FC<StatusBarProps> = ({
  hasUnsavedChanges = false,
  className
}) => {
  // Utiliser les sélecteurs individuels pour un re-render optimal
  const connectionStatus = useProjectsStore(state => state.connectionStatus);
  const currentProject = useProjectsStore(state => state.currentProject);
  const projectName = currentProject?.name || null;
  
  // Mapper connectionStatus vers SyncStatus
  const syncStatus: SyncStatus = 
    connectionStatus === 'connected' ? 'synced' :
    connectionStatus === 'connecting' ? 'syncing' :
    connectionStatus === 'error' ? 'error' : 'disconnected';
  const getSyncIcon = () => {
    switch (syncStatus) {
      case 'synced':
        return <Cloud className="h-3.5 w-3.5 text-green-500" />
      case 'syncing':
        return <Loader2 className="h-3.5 w-3.5 text-yellow-500 animate-spin" />
      case 'error':
        return <AlertCircle className="h-3.5 w-3.5 text-red-500" />
      case 'disconnected':
        return <CloudOff className="h-3.5 w-3.5 text-muted-foreground" />
    }
  }

  const getSyncLabel = () => {
    switch (syncStatus) {
      case 'synced':
        return 'Synchronisé'
      case 'syncing':
        return 'Synchronisation...'
      case 'error':
        return 'Erreur de sync'
      case 'disconnected':
        return 'Hors ligne'
    }
  }

  const getSyncColor = () => {
    switch (syncStatus) {
      case 'synced':
        return 'text-green-600'
      case 'syncing':
        return 'text-yellow-600'
      case 'error':
        return 'text-red-600'
      case 'disconnected':
        return 'text-muted-foreground'
    }
  }

  return (
    <div className={cn(
      'flex items-center justify-between h-6 px-3 bg-muted/50 border-t text-xs',
      className
    )}>
      {/* Partie gauche - Projet et sauvegarde */}
      <div className="flex items-center gap-4">
        {/* Projet actif */}
        <div className="flex items-center gap-1.5">
          <Folder className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-muted-foreground">
            {projectName || 'Aucun projet'}
          </span>
        </div>

        {/* Statut de sauvegarde */}
        {projectName && (
          <div className="flex items-center gap-1.5">
            {hasUnsavedChanges ? (
              <>
                <Save className="h-3.5 w-3.5 text-yellow-500" />
                <span className="text-yellow-600">Non enregistré</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                <span className="text-green-600">Enregistré</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Partie droite - Zoom et sync */}
      <div className="flex items-center gap-4">
        {/* Statut sync Engine */}
        <div className={cn('flex items-center gap-1.5', getSyncColor())}>
          {getSyncIcon()}
          <span>{getSyncLabel()}</span>
        </div>
      </div>
    </div>
  )
}
