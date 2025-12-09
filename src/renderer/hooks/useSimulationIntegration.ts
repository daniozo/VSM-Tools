/**
 * Hook pour intégrer les données de simulation dans le store VSM
 * Met à jour les indicateurs des nodes en temps réel
 */

import { useEffect, useCallback, useState } from 'react';
import { useVsmStore } from '@/store/vsmStore';
import { simulationClient, SimulationUpdate, SimulationNodeData } from '@/services/simulation/simulationClient';

export interface SimulationIntegrationState {
  isConnected: boolean;
  isRunning: boolean;
  currentScenario: string | null;
  lastUpdateTime: number;
  bottlenecks: string[]; // IDs des nodes identifiés comme goulots
}

/**
 * Hook pour intégrer les données de simulation dans le diagramme VSM
 */
export function useSimulationIntegration() {
  const [state, setState] = useState<SimulationIntegrationState>({
    isConnected: false,
    isRunning: false,
    currentScenario: null,
    lastUpdateTime: 0,
    bottlenecks: []
  });

  const { diagram, updateNode } = useVsmStore();

  /**
   * Détecte les goulots d'étranglement basés sur les données de simulation
   */
  const detectBottlenecks = useCallback((nodesData: SimulationNodeData[]): string[] => {
    const bottlenecks: string[] = [];
    
    // Calculer les moyennes pour comparaison
    const avgCycleTime = nodesData.reduce((sum, n) => sum + (n.cycleTime || 0), 0) / nodesData.length;
    const avgWip = nodesData.reduce((sum, n) => sum + (n.wip || 0), 0) / nodesData.length;

    for (const nodeData of nodesData) {
      let isBottleneck = false;
      const reasons: string[] = [];

      // Critère 1: Cycle time > 2x la moyenne
      if (nodeData.cycleTime && nodeData.cycleTime > avgCycleTime * 2) {
        isBottleneck = true;
        reasons.push(`CT élevé (${nodeData.cycleTime.toFixed(1)} vs moy ${avgCycleTime.toFixed(1)})`);
      }

      // Critère 2: WIP > 2x la moyenne
      if (nodeData.wip && nodeData.wip > avgWip * 2) {
        isBottleneck = true;
        reasons.push(`WIP élevé (${nodeData.wip.toFixed(0)} vs moy ${avgWip.toFixed(0)})`);
      }

      // Critère 3: Uptime < 70%
      if (nodeData.uptime !== undefined && nodeData.uptime < 70) {
        isBottleneck = true;
        reasons.push(`Uptime faible (${nodeData.uptime.toFixed(0)}%)`);
      }

      // Critère 4: Status en panne
      if (nodeData.status === 'failure') {
        isBottleneck = true;
        reasons.push('Machine en panne');
      }

      if (isBottleneck) {
        bottlenecks.push(nodeData.nodeId);
        console.log(`🔴 Goulot détecté: ${nodeData.nodeId} - ${reasons.join(', ')}`);
      }
    }

    return bottlenecks;
  }, []);

  /**
   * Met à jour les indicateurs d'un node avec les données de simulation
   */
  const updateNodeIndicators = useCallback((nodeData: SimulationNodeData) => {
    if (!diagram) return;

    // Trouver le node correspondant dans le diagramme
    // Le nodeId de la simulation est "node-1", "node-2", etc.
    // On doit mapper vers les vrais IDs du diagramme
    const nodeIndex = parseInt(nodeData.nodeId.replace('node-', '')) - 1;
    const nodes = diagram.nodes;
    
    if (nodeIndex >= 0 && nodeIndex < nodes.length) {
      const realNode = nodes[nodeIndex];
      
      // Mettre à jour les indicateurs existants
      const updatedIndicators = realNode.indicators.map(indicator => {
        switch (indicator.code) {
          case 'CT':
            return { ...indicator, value: nodeData.cycleTime?.toFixed(1) || indicator.value };
          case 'UP':
            return { ...indicator, value: nodeData.uptime?.toFixed(0) || indicator.value };
          case 'WIP':
            return { ...indicator, value: nodeData.wip?.toFixed(0) || indicator.value };
          case 'LT':
            return { ...indicator, value: nodeData.leadTime?.toFixed(2) || indicator.value };
          default:
            return indicator;
        }
      });

      // Appeler updateNode du store
      updateNode(realNode.id, { indicators: updatedIndicators });
    }
  }, [diagram, updateNode]);

  /**
   * Gère les mises à jour de simulation
   */
  const handleSimulationUpdate = useCallback((data: SimulationUpdate) => {
    // Détecter les goulots
    const bottlenecks = detectBottlenecks(data.nodes);

    // Mettre à jour l'état
    setState(prev => ({
      ...prev,
      isRunning: true,
      currentScenario: data.scenario,
      lastUpdateTime: data.time,
      bottlenecks
    }));

    // Mettre à jour les indicateurs des nodes
    for (const nodeData of data.nodes) {
      updateNodeIndicators(nodeData);
    }
  }, [detectBottlenecks, updateNodeIndicators]);

  /**
   * Connexion au serveur de simulation
   */
  useEffect(() => {
    const checkAndConnect = async () => {
      const isHealthy = await simulationClient.checkHealth();
      setState(prev => ({ ...prev, isConnected: isHealthy }));

      if (isHealthy) {
        simulationClient.connect();
      }
    };

    checkAndConnect();

    // Écouter les mises à jour
    const unsubscribe = simulationClient.onUpdate(handleSimulationUpdate);

    // Écouter les changements de statut
    const unsubscribeStatus = simulationClient.onStatusChange((status) => {
      setState(prev => ({
        ...prev,
        isRunning: status.isRunning,
        currentScenario: status.scenario
      }));
    });

    return () => {
      unsubscribe();
      unsubscribeStatus();
    };
  }, [handleSimulationUpdate]);

  return {
    ...state,
    // Actions
    startSimulation: (scenario?: string) => simulationClient.start(scenario),
    stopSimulation: () => simulationClient.stop(),
    changeScenario: (scenario: string) => simulationClient.changeScenario(scenario),
    // Helper pour vérifier si un node est un goulot
    isBottleneck: (nodeId: string) => state.bottlenecks.includes(nodeId)
  };
}
