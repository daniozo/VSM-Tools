/**
 * Hook React pour gérer le rafraîchissement automatique des données dynamiques
 */

import { useEffect, useRef, useState } from 'react'
import { VSMDiagram } from '@/shared/types/vsm-model'
import { updateDynamicIndicators, updateDynamicInventories } from '@/services/dataCollectionService'

interface UseDynamicDataRefreshOptions {
  /** Intervalle de rafraîchissement en millisecondes (défaut: 30000 = 30 secondes) */
  intervalMs?: number
  /** Activer ou désactiver le rafraîchissement automatique */
  enabled?: boolean
  /** Callback appelé après chaque mise à jour */
  onUpdate?: (diagram: VSMDiagram) => void
}

/**
 * Hook pour rafraîchir automatiquement les indicateurs et stocks dynamiques
 * 
 * @example
 * ```tsx
 * const { refreshing, lastUpdate, forceRefresh } = useDynamicDataRefresh(diagram, {
 *   intervalMs: 30000, // Rafraîchir toutes les 30 secondes
 *   enabled: true,
 *   onUpdate: (updatedDiagram) => {
 *     // Sauvegarder le diagramme mis à jour
 *     onUpdate(updatedDiagram)
 *   }
 * })
 * ```
 */
export function useDynamicDataRefresh(
  diagram: VSMDiagram | null,
  options: UseDynamicDataRefreshOptions = {}
) {
  const {
    intervalMs = 30000, // 30 secondes par défaut
    enabled = true,
    onUpdate
  } = options

  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const onUpdateRef = useRef(onUpdate)

  // Mettre à jour la ref du callback
  useEffect(() => {
    onUpdateRef.current = onUpdate
  }, [onUpdate])

  /**
   * Fonction pour rafraîchir les données dynamiques
   */
  const refresh = async () => {
    if (!diagram || refreshing) return

    setRefreshing(true)
    setError(null)

    try {
      // Rafraîchir les indicateurs dynamiques
      const updatedNodes = await updateDynamicIndicators(
        diagram.nodes,
        diagram.dataSources
      )

      // Rafraîchir les stocks dynamiques
      // TODO: Récupérer les inventaires depuis le diagramme et les mettre à jour
      // const updatedInventories = await updateDynamicInventories(...)

      // Créer un nouveau diagramme avec les données mises à jour
      const updatedDiagram: VSMDiagram = {
        ...diagram,
        nodes: updatedNodes
      }

      // Appeler le callback
      if (onUpdateRef.current) {
        onUpdateRef.current(updatedDiagram)
      }

      setLastUpdate(new Date())
    } catch (err) {
      console.error('Erreur lors du rafraîchissement des données dynamiques:', err)
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setRefreshing(false)
    }
  }

  /**
   * Démarrer le polling automatique
   */
  useEffect(() => {
    if (!enabled || !diagram) {
      // Nettoyer l'intervalle si désactivé ou pas de diagramme
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    // Rafraîchir immédiatement au montage
    refresh()

    // Configurer l'intervalle
    intervalRef.current = setInterval(refresh, intervalMs)

    // Nettoyer à la destruction
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [enabled, intervalMs, diagram?.id]) // Re-démarrer si le diagramme change

  return {
    /** Indique si un rafraîchissement est en cours */
    refreshing,
    /** Date du dernier rafraîchissement réussi */
    lastUpdate,
    /** Message d'erreur s'il y en a un */
    error,
    /** Fonction pour forcer un rafraîchissement manuel */
    forceRefresh: refresh
  }
}
