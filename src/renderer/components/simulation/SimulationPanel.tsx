/**
 * Panneau de simulation intégré au layout principal
 * Affiche les contrôles et l'état de la simulation
 */

import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/renderer/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/renderer/components/ui/select';
import { Badge } from '@/renderer/components/ui/badge';
import { Play, Pause, Activity, AlertTriangle, TrendingUp, Wrench, Zap } from 'lucide-react';
import { simulationClient, SimulationScenario, SimulationStatus, SimulationUpdate } from '@/services/simulation/simulationClient';
import { useVsmStore } from '@/store/vsmStore';
import { VsmCanvasHandle } from '@/renderer/components/editor/VsmCanvas';

interface SimulationPanelProps {
  canvasRef: React.RefObject<VsmCanvasHandle>;
}

export const SimulationPanel: React.FC<SimulationPanelProps> = ({ canvasRef }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [status, setStatus] = useState<SimulationStatus | null>(null);
  const [scenarios, setScenarios] = useState<SimulationScenario[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<string>('normal');
  const [lastUpdate, setLastUpdate] = useState<SimulationUpdate | null>(null);
  const [bottlenecks, setBottlenecks] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { diagram, updateNode } = useVsmStore();

  // Vérifier la connexion au démarrage
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const isHealthy = await simulationClient.checkHealth();
        setIsConnected(isHealthy);
        if (isHealthy) {
          const scenarioList = await simulationClient.getScenarios();
          setScenarios(scenarioList);
          simulationClient.connect();
        }
      } catch (error) {
        setIsConnected(false);
      }
    };

    checkConnection();

    // Écouter les mises à jour
    const unsubscribeUpdate = simulationClient.onUpdate(handleSimulationUpdate);
    const unsubscribeStatus = simulationClient.onStatusChange((newStatus) => {
      setStatus(newStatus);
    });

    return () => {
      unsubscribeUpdate();
      unsubscribeStatus();
    };
  }, []);

  // Mettre à jour les goulots visuellement quand ils changent
  useEffect(() => {
    if (canvasRef.current && bottlenecks.length >= 0) {
      canvasRef.current.updateBottlenecks(bottlenecks);
    }
  }, [bottlenecks, canvasRef]);

  const handleSimulationUpdate = (data: SimulationUpdate) => {
    setLastUpdate(data);
    
    // Détecter les goulots
    const detectedBottlenecks = detectBottlenecks(data.nodes);
    setBottlenecks(detectedBottlenecks);

    // Mettre à jour les indicateurs si un diagramme est chargé
    if (diagram) {
      updateNodeIndicators(data.nodes);
    }
  };

  const detectBottlenecks = (nodesData: any[]): string[] => {
    const newBottlenecks: string[] = [];
    
    const avgCycleTime = nodesData.reduce((sum, n) => sum + (n.cycleTime || 0), 0) / nodesData.length;
    const avgWip = nodesData.reduce((sum, n) => sum + (n.wip || 0), 0) / nodesData.length;

    if (!diagram) return [];

    for (let i = 0; i < nodesData.length && i < diagram.nodes.length; i++) {
      const nodeData = nodesData[i];
      const realNodeId = diagram.nodes[i].id;
      
      let isBottleneck = false;

      // Critère 1: Cycle time > 2x la moyenne
      if (nodeData.cycleTime && nodeData.cycleTime > avgCycleTime * 2) {
        isBottleneck = true;
      }
      // Critère 2: WIP > 2x la moyenne
      if (nodeData.wip && nodeData.wip > avgWip * 2) {
        isBottleneck = true;
      }
      // Critère 3: Uptime < 70%
      if (nodeData.uptime !== undefined && nodeData.uptime < 70) {
        isBottleneck = true;
      }
      // Critère 4: Status en panne
      if (nodeData.status === 'failure') {
        isBottleneck = true;
      }

      if (isBottleneck) {
        newBottlenecks.push(realNodeId);
      }
    }

    return newBottlenecks;
  };

  const updateNodeIndicators = (nodesData: any[]) => {
    if (!diagram) return;

    for (let i = 0; i < nodesData.length && i < diagram.nodes.length; i++) {
      const nodeData = nodesData[i];
      const realNode = diagram.nodes[i];
      
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

      updateNode(realNode.id, { indicators: updatedIndicators });
    }
  };

  const handleStart = async () => {
    setIsLoading(true);
    try {
      await simulationClient.start(selectedScenario, 2000);
      const newStatus = await simulationClient.getStatus();
      setStatus(newStatus);
    } catch (error) {
      console.error('Erreur lors du démarrage:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStop = async () => {
    setIsLoading(true);
    try {
      await simulationClient.stop();
      const newStatus = await simulationClient.getStatus();
      setStatus(newStatus);
      setBottlenecks([]); // Réinitialiser les goulots
    } catch (error) {
      console.error('Erreur lors de l\'arrêt:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleScenarioChange = async (scenario: string) => {
    setSelectedScenario(scenario);
    if (status?.isRunning) {
      try {
        await simulationClient.changeScenario(scenario);
      } catch (error) {
        console.error('Erreur lors du changement de scénario:', error);
      }
    }
  };

  const getScenarioIcon = (scenarioId: string) => {
    switch (scenarioId) {
      case 'normal': return <Activity className="h-4 w-4" />;
      case 'bottleneck': return <AlertTriangle className="h-4 w-4" />;
      case 'high-demand': return <TrendingUp className="h-4 w-4" />;
      case 'machine-failure': return <Wrench className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  if (!isConnected) {
    return (
      <div className="p-4 border-t">
        <div className="text-xs text-muted-foreground text-center">
          <Zap className="h-4 w-4 mx-auto mb-1 opacity-50" />
          Simulation non disponible
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border-t space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium flex items-center gap-2">
          <Zap className="h-4 w-4" />
          Simulation
        </h4>
        <Badge variant={status?.isRunning ? 'default' : 'outline'} className="text-xs">
          {status?.isRunning ? 'Active' : 'Arrêtée'}
        </Badge>
      </div>

      {/* Sélection scénario */}
      <Select value={selectedScenario} onValueChange={handleScenarioChange}>
        <SelectTrigger className="h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {scenarios.map((scenario) => (
            <SelectItem key={scenario.id} value={scenario.id}>
              <div className="flex items-center gap-2">
                {getScenarioIcon(scenario.id)}
                <span>{scenario.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Contrôles */}
      <div className="flex gap-2">
        {!status?.isRunning ? (
          <Button size="sm" onClick={handleStart} disabled={isLoading} className="flex-1 h-8">
            <Play className="h-3 w-3 mr-1" />
            Démarrer
          </Button>
        ) : (
          <Button size="sm" variant="destructive" onClick={handleStop} disabled={isLoading} className="flex-1 h-8">
            <Pause className="h-3 w-3 mr-1" />
            Arrêter
          </Button>
        )}
      </div>

      {/* État */}
      {status?.isRunning && lastUpdate && (
        <div className="text-xs space-y-1 p-2 bg-muted rounded">
          <div className="flex justify-between">
            <span>Cycle:</span>
            <span className="font-mono">#{lastUpdate.time}</span>
          </div>
          {bottlenecks.length > 0 && (
            <div className="flex items-center gap-1 text-destructive">
              <AlertTriangle className="h-3 w-3" />
              <span>{bottlenecks.length} goulot(s) détecté(s)</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
