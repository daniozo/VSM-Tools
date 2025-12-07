/**
 * useBackendConnection - Hook pour gérer la connexion au backend
 */

import { useEffect } from 'react';
import { useProjectsStore } from '@/store/projectsStore';

export function useBackendConnection() {
  const { connectionStatus, connect, disconnect, fetchProjects } = useProjectsStore();

  useEffect(() => {
    // Auto-connect on mount
    const initConnection = async () => {
      try {
        await connect();
        await fetchProjects();
      } catch (error) {
        console.error('Failed to connect to backend:', error);
      }
    };

    initConnection();

    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, []);

  return { connectionStatus };
}

/**
 * useRealtimeDiagram - Hook pour la synchronisation temps réel d'un diagramme
 */
export function useRealtimeDiagram(diagramId: string | null) {
  const { joinDiagramRoom, leaveDiagramRoom } = useProjectsStore();

  useEffect(() => {
    if (diagramId) {
      joinDiagramRoom(diagramId);
    }

    return () => {
      if (diagramId) {
        leaveDiagramRoom(diagramId);
      }
    };
  }, [diagramId, joinDiagramRoom, leaveDiagramRoom]);
}
