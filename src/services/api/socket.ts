import { io, Socket } from 'socket.io-client';
import { API_CONFIG } from './config';

// Types for socket events
export interface DiagramUpdateEvent {
  diagramId: string;
  changes: any;
  socketId: string;
  timestamp: string;
}

export interface NodeUpdateEvent {
  diagramId: string;
  nodeId: string;
  changes: any;
  socketId: string;
  timestamp: string;
}

export interface CursorMoveEvent {
  diagramId: string;
  userId: string;
  userName: string;
  x: number;
  y: number;
  socketId: string;
}

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve();
        return;
      }

      this.socket = io(API_CONFIG.wsUrl, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      this.socket.on('connect', () => {
        console.log('🔌 WebSocket connected');
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ WebSocket connection error:', error);
        reject(error);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('🔌 WebSocket disconnected:', reason);
      });

      // Setup event forwarding
      this.setupEventForwarding();
    });
  }

  private setupEventForwarding() {
    const events = [
      'diagram:updated',
      'diagram:user-joined',
      'diagram:user-left',
      'node:updated',
      'node:added',
      'node:deleted',
      'edge:added',
      'edge:deleted',
      'cursor:moved',
    ];

    events.forEach((event) => {
      this.socket?.on(event, (data) => {
        this.emit(event, data);
      });
    });
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  // Room management
  joinDiagram(diagramId: string) {
    this.socket?.emit('diagram:join', diagramId);
  }

  leaveDiagram(diagramId: string) {
    this.socket?.emit('diagram:leave', diagramId);
  }

  joinProject(projectId: string) {
    this.socket?.emit('project:join', projectId);
  }

  leaveProject(projectId: string) {
    this.socket?.emit('project:leave', projectId);
  }

  // Real-time updates
  sendDiagramUpdate(diagramId: string, changes: any) {
    this.socket?.emit('diagram:update', { diagramId, changes });
  }

  sendNodeUpdate(diagramId: string, nodeId: string, changes: any) {
    this.socket?.emit('node:update', { diagramId, nodeId, changes });
  }

  sendNodeAdd(diagramId: string, node: any) {
    this.socket?.emit('node:add', { diagramId, node });
  }

  sendNodeDelete(diagramId: string, nodeId: string) {
    this.socket?.emit('node:delete', { diagramId, nodeId });
  }

  sendEdgeAdd(diagramId: string, edge: any) {
    this.socket?.emit('edge:add', { diagramId, edge });
  }

  sendEdgeDelete(diagramId: string, edgeId: string) {
    this.socket?.emit('edge:delete', { diagramId, edgeId });
  }

  sendCursorMove(diagramId: string, userId: string, userName: string, x: number, y: number) {
    this.socket?.emit('cursor:move', { diagramId, userId, userName, x, y });
  }

  // Event subscription
  on(event: string, callback: (data: any) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
    
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  off(event: string, callback: (data: any) => void) {
    this.listeners.get(event)?.delete(callback);
  }

  private emit(event: string, data: any) {
    this.listeners.get(event)?.forEach((callback) => callback(data));
  }
}

export const socketService = new SocketService();
