/**
 * Panneau de contrôle de simulation VSM
 * Permet de démarrer/arrêter la simulation et choisir les scénarios
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/renderer/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/renderer/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/renderer/components/ui/card';
import { Badge } from '@/renderer/components/ui/badge';
import { Play, Pause, RefreshCw, Activity, AlertTriangle, TrendingUp, Wrench } from 'lucide-react';
import { simulationClient, SimulationScenario, SimulationStatus, SimulationUpdate } from '@/services/simulation/simulationClient';

export const SimulationControl: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [status, setStatus] = useState<SimulationStatus | null>(null);
  const [scenarios, setScenarios] = useState<SimulationScenario[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<string>('normal');
  const [lastUpdate, setLastUpdate] = useState<SimulationUpdate | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Vérifier la connexion au serveur
    checkConnection();

    // Charger les scénarios
    loadScenarios();

    // Connecter au WebSocket
    simulationClient.connect();

    // Écouter les mises à jour
    const unsubscribeUpdate = simulationClient.onUpdate((data) => {
      setLastUpdate(data);
    });

    const unsubscribeStatus = simulationClient.onStatusChange((newStatus) => {
      setStatus(newStatus);
    });

    return () => {
      unsubscribeUpdate();
      unsubscribeStatus();
      simulationClient.disconnect();
    };
  }, []);

  const checkConnection = async () => {
    const healthy = await simulationClient.checkHealth();
    setIsConnected(healthy);
  };

  const loadScenarios = async () => {
    try {
      const scenarioList = await simulationClient.getScenarios();
      setScenarios(scenarioList);
    } catch (error) {
      console.error('Erreur lors du chargement des scénarios:', error);
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
      case 'normal':
        return <Activity className="h-4 w-4" />;
      case 'bottleneck':
        return <AlertTriangle className="h-4 w-4" />;
      case 'high-demand':
        return <TrendingUp className="h-4 w-4" />;
      case 'machine-failure':
        return <Wrench className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Simulation VSM
            </CardTitle>
            <CardDescription>
              Simulez différents scénarios de production en temps réel
            </CardDescription>
          </div>
          <Badge variant={isConnected ? 'default' : 'destructive'}>
            {isConnected ? 'Connecté' : 'Déconnecté'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Sélection du scénario */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Scénario</label>
          <Select
            value={selectedScenario}
            onValueChange={handleScenarioChange}
            disabled={!isConnected}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {scenarios.map((scenario) => (
                <SelectItem key={scenario.id} value={scenario.id}>
                  <div className="flex items-center gap-2">
                    {getScenarioIcon(scenario.id)}
                    <div>
                      <div className="font-medium">{scenario.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {scenario.description}
                      </div>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Contrôles */}
        <div className="flex gap-2">
          {!status?.isRunning ? (
            <Button
              onClick={handleStart}
              disabled={!isConnected || isLoading}
              className="flex-1"
            >
              <Play className="h-4 w-4 mr-2" />
              Démarrer
            </Button>
          ) : (
            <Button
              onClick={handleStop}
              disabled={!isConnected || isLoading}
              variant="destructive"
              className="flex-1"
            >
              <Pause className="h-4 w-4 mr-2" />
              Arrêter
            </Button>
          )}
        </div>

        {/* Statut de la simulation */}
        {status?.isRunning && lastUpdate && (
          <div className="border rounded-lg p-4 space-y-2 bg-muted/50">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Simulation en cours</span>
              <Badge variant="outline">
                Cycle #{lastUpdate.time}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">Scénario:</span>
                <span className="ml-2 font-medium">{status.scenario}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Vitesse:</span>
                <span className="ml-2 font-medium">{status.speed}ms</span>
              </div>
            </div>

            {/* Aperçu des données */}
            {lastUpdate.nodes.length > 0 && (
              <div className="mt-2 pt-2 border-t">
                <div className="text-xs font-medium mb-1">Dernières données:</div>
                <div className="space-y-1">
                  {lastUpdate.nodes.slice(0, 3).map((node, index) => (
                    <div key={index} className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{node.nodeId}:</span>
                      <span className="font-mono">
                        CT: {node.cycleTime?.toFixed(1)} | 
                        UP: {node.uptime?.toFixed(0)}% |
                        WIP: {node.wip?.toFixed(0)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Message si déconnecté */}
        {!isConnected && (
          <div className="border border-destructive/50 rounded-lg p-4 bg-destructive/10">
            <p className="text-sm text-destructive">
              ⚠️ Serveur de simulation non disponible. 
              Assurez-vous que le serveur est démarré avec <code className="bg-muted px-1 py-0.5 rounded">npm run simulate</code>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
