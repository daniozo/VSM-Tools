/**
 * StatusBar - Barre d'état en bas de l'application
 * 
 * Selon conception_vsm_studio.md :
 * - Affiche le projet actif
 * - Statut de la sauvegarde
 * - Niveau de zoom
 * - Statut de synchronisation avec l'Engine (vert/jaune/rouge)
 * - Score d'analyse (clique ouvre le panel analyse)
 * - Nombre d'actions (clique ouvre le panel plan d'action)
 */

import React, { useState, useEffect, useMemo } from 'react'
import {
  Cloud,
  CloudOff,
  Loader2,
  Folder,
  Save,
  CheckCircle2,
  AlertCircle,
  ClipboardList,
  AlertTriangle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useProjectsStore } from '@/store/projectsStore'
import { useVsmStore } from '@/store/vsmStore'
import { actionPlanApi } from '@/services/api'
import { VSMDiagram, NodeType } from '@/shared/types/vsm-model'

type SyncStatus = 'synced' | 'syncing' | 'error' | 'disconnected'

interface StatusBarProps {
  hasUnsavedChanges?: boolean
  className?: string
  onOpenAnalysisPanel?: () => void
  onOpenActionPlanPanel?: () => void
}

/**
 * Helper pour extraire une valeur d'indicateur
 */
function getIndicatorValue(indicators: any[], name: string): number {
  const indicator = indicators?.find((i: any) =>
    i.name?.toLowerCase().includes(name.toLowerCase())
  )
  return indicator?.value ? parseFloat(indicator.value) || 0 : 0
}

/**
 * Calculer le nombre de problèmes d'analyse
 */
function calculateAnalysisIssues(diagram: VSMDiagram | null): { issues: number; severity: 'low' | 'medium' | 'high' | 'critical' } | null {
  if (!diagram) return null

  const taktTime = diagram.actors?.customer?.taktTime || 0
  const processSteps = diagram.nodes?.filter(n => n.type === NodeType.PROCESS_STEP) || []
  
  let criticalCount = 0
  let highCount = 0
  let mediumCount = 0

  // Vérifier les goulots (temps de cycle vs Takt Time)
  processSteps.forEach(node => {
    const cycleTime = getIndicatorValue(node.indicators, 'cycle')
    const uptime = getIndicatorValue(node.indicators, 'uptime') || getIndicatorValue(node.indicators, 'disponibilité')
    const scrapRate = getIndicatorValue(node.indicators, 'rebut') || getIndicatorValue(node.indicators, 'scrap')

    // Goulot: temps de cycle > Takt Time
    if (taktTime > 0 && cycleTime > taktTime) {
      const ratio = cycleTime / taktTime
      if (ratio > 1.5) criticalCount++
      else if (ratio > 1.2) highCount++
      else mediumCount++
    }

    // Proche du Takt Time (alerte préventive)
    if (taktTime > 0 && cycleTime >= taktTime * 0.9 && cycleTime <= taktTime) {
      mediumCount++
    }

    // Faible disponibilité
    if (uptime > 0 && uptime < 70) highCount++
    else if (uptime > 0 && uptime < 85) mediumCount++

    // Taux de rebut élevé
    if (scrapRate > 5) highCount++
    else if (scrapRate > 2) mediumCount++
  })

  // Vérifier les stocks
  diagram.flowSequences?.forEach(seq => {
    seq.intermediateElements?.forEach(elem => {
      if (elem.type === 'INVENTORY' && elem.inventory) {
        const duration = elem.inventory.duration || 0
        const quantity = elem.inventory.quantity || 0
        
        // Stock excessif en durée
        if (duration > 7) highCount++
        else if (duration > 3) mediumCount++
        
        // Grande quantité
        if (quantity > 1000) highCount++
        else if (quantity > 500) mediumCount++
      }
    })
  })

  const totalIssues = criticalCount + highCount + mediumCount

  let severity: 'low' | 'medium' | 'high' | 'critical' = 'low'
  if (criticalCount > 0) severity = 'critical'
  else if (highCount > 2) severity = 'high'
  else if (totalIssues > 3) severity = 'medium'

  return { issues: totalIssues, severity }
}

export const StatusBar: React.FC<StatusBarProps> = ({
  hasUnsavedChanges = false,
  className,
  onOpenAnalysisPanel,
  onOpenActionPlanPanel
}) => {
  // Utiliser les sélecteurs individuels pour un re-render optimal
  const connectionStatus = useProjectsStore(state => state.connectionStatus);
  const currentProject = useProjectsStore(state => state.currentProject);
  const projectName = currentProject?.name || null;
  
  // Récupérer le diagramme pour l'analyse
  const diagram = useVsmStore(state => state.diagram);
  
  // État pour le nombre d'actions
  const [actionItemsCount, setActionItemsCount] = useState<{ total: number; pending: number }>({ total: 0, pending: 0 });
  
  // Calculer les problèmes d'analyse
  const analysisResult = useMemo(() => calculateAnalysisIssues(diagram), [diagram]);
  
  // Charger le nombre d'actions du plan d'action
  useEffect(() => {
    const loadActionItemsCount = async () => {
      if (!currentProject?.id) {
        setActionItemsCount({ total: 0, pending: 0 });
        return;
      }
      
      try {
        const items = await actionPlanApi.list(currentProject.id);
        const pending = items.filter((item: any) => item.status !== 'completed').length;
        setActionItemsCount({ total: items.length, pending });
      } catch (error) {
        // Fallback au localStorage
        const storageKey = `vsm-action-plan-${currentProject.id}`;
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const items = JSON.parse(stored);
          const pending = items.filter((item: any) => item.status !== 'completed').length;
          setActionItemsCount({ total: items.length, pending });
        }
      }
    };
    
    loadActionItemsCount();
    
    // Écouter les changements du store
    const unsubscribe = useProjectsStore.subscribe(
      state => state.currentProject?.id,
      () => loadActionItemsCount()
    );
    
    // Rafraîchir périodiquement (toutes les 30s)
    const interval = setInterval(loadActionItemsCount, 30000);
    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, [currentProject?.id]);
  
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

      {/* Partie droite - Analyse, Actions et sync */}
      <div className="flex items-center gap-4">
        {/* Nombre de problèmes - cliquable */}
        {analysisResult && (
          <button
            onClick={onOpenAnalysisPanel}
            className={cn(
              'flex items-center gap-1.5 hover:bg-muted px-1.5 py-0.5 rounded transition-colors cursor-pointer',
              analysisResult.issues > 0 ? (
                analysisResult.severity === 'critical' ? 'text-red-600' :
                analysisResult.severity === 'high' ? 'text-orange-600' :
                analysisResult.severity === 'medium' ? 'text-yellow-600' :
                'text-green-600'
              ) : 'text-green-600'
            )}
            title="Cliquez pour ouvrir le panneau d'analyse"
          >
            {analysisResult.issues > 0 && <AlertTriangle className="h-3.5 w-3.5" />}
            <span>{analysisResult.issues} problème{analysisResult.issues > 1 ? 's' : ''}</span>
          </button>
        )}
        
        {/* Nombre d'actions - cliquable */}
        {currentProject && (
          <button
            onClick={onOpenActionPlanPanel}
            className={cn(
              'flex items-center gap-1.5 hover:bg-muted px-1.5 py-0.5 rounded transition-colors cursor-pointer',
              actionItemsCount.pending > 0 ? 'text-blue-600' : 'text-muted-foreground'
            )}
            title="Cliquez pour ouvrir le plan d'action"
          >
            <ClipboardList className="h-3.5 w-3.5" />
            <span>
              {actionItemsCount.pending > 0 
                ? `${actionItemsCount.pending} action${actionItemsCount.pending > 1 ? 's' : ''} en cours`
                : actionItemsCount.total > 0 
                  ? `${actionItemsCount.total} action${actionItemsCount.total > 1 ? 's' : ''}`
                  : 'Aucune action'
              }
            </span>
          </button>
        )}
        
        {/* Statut sync Engine */}
        <div className={cn('flex items-center gap-1.5', getSyncColor())}>
          {getSyncIcon()}
          <span>{getSyncLabel()}</span>
        </div>
      </div>
    </div>
  )
}
