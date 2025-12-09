/**
 * Client pour le serveur de simulation VSM
 */

import { io, Socket } from 'socket.io-client';

const SIMULATION_URL = 'http://localhost:3002';

export interface SimulationStatus {
  isRunning: boolean;
  scenario: 'normal' | 'bottleneck' | 'high-demand' | 'machine-failure';
  speed: number;
}

export interface SimulationScenario {
  id: string;
  name: string;
  description: string;
}

export interface SimulationNodeData {
  nodeId: string;
  timestamp: string;
  cycleTime?: number;
  uptime?: number;
  wip?: number;
  leadTime?: number;
  dailyDemand?: number;
  status?: string;
}

export interface SimulationUpdate {
  scenario: string;
  time: number;
  nodes: SimulationNodeData[];
}

class SimulationClient {
  private socket: Socket | null = null;
  private updateCallbacks: ((data: SimulationUpdate) => void)[] = [];
  private statusCallbacks: ((status: SimulationStatus) => void)[] = [];

  /**
   * Connexion au serveur de simulation
   */
  connect(): void {
    if (this.socket?.connected) return;

    this.socket = io(SIMULATION_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    this.socket.on('connect', () => {
      console.log('✅ Connecté au serveur de simulation');
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Déconnecté du serveur de simulation');
    });

    this.socket.on('simulation:update', (data: SimulationUpdate) => {
      this.updateCallbacks.forEach(cb => cb(data));
    });

    this.socket.on('simulation:status', (status: SimulationStatus) => {
      this.statusCallbacks.forEach(cb => cb(status));
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Erreur de connexion au serveur de simulation:', error.message);
    });
  }

  /**
   * Déconnexion du serveur
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * Écouter les mises à jour de simulation
   */
  onUpdate(callback: (data: SimulationUpdate) => void): () => void {
    this.updateCallbacks.push(callback);
    return () => {
      this.updateCallbacks = this.updateCallbacks.filter(cb => cb !== callback);
    };
  }

  /**
   * Écouter les changements de statut
   */
  onStatusChange(callback: (status: SimulationStatus) => void): () => void {
    this.statusCallbacks.push(callback);
    return () => {
      this.statusCallbacks = this.statusCallbacks.filter(cb => cb !== callback);
    };
  }

  /**
   * Récupérer le statut actuel
   */
  async getStatus(): Promise<SimulationStatus> {
    const response = await fetch(`${SIMULATION_URL}/api/simulation/status`);
    return response.json();
  }

  /**
   * Démarrer la simulation
   */
  async start(scenario?: string, speed?: number): Promise<void> {
    const response = await fetch(`${SIMULATION_URL}/api/simulation/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenario, speed })
    });
    if (!response.ok) {
      throw new Error('Erreur lors du démarrage de la simulation');
    }
  }

  /**
   * Arrêter la simulation
   */
  async stop(): Promise<void> {
    const response = await fetch(`${SIMULATION_URL}/api/simulation/stop`, {
      method: 'POST'
    });
    if (!response.ok) {
      throw new Error('Erreur lors de l\'arrêt de la simulation');
    }
  }

  /**
   * Changer de scénario
   */
  async changeScenario(scenario: string): Promise<void> {
    const response = await fetch(`${SIMULATION_URL}/api/simulation/scenario`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenario })
    });
    if (!response.ok) {
      throw new Error('Erreur lors du changement de scénario');
    }
  }

  /**
   * Récupérer la liste des scénarios disponibles
   */
  async getScenarios(): Promise<SimulationScenario[]> {
    const response = await fetch(`${SIMULATION_URL}/api/simulation/scenarios`);
    return response.json();
  }

  /**
   * Vérifier si le serveur est disponible
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${SIMULATION_URL}/api/simulation/status`, {
        method: 'GET',
        signal: AbortSignal.timeout(2000)
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const simulationClient = new SimulationClient();
