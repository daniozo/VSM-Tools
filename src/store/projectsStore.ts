import { create } from 'zustand';
import { projectsApi, diagramsApi, socketService, checkHealth } from '@/services/api';
import type { Project, Diagram } from '@/services/api';

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

interface ProjectsStore {
  // Connection state
  connectionStatus: ConnectionStatus;
  connectionError: string | null;

  // Projects state
  projects: Project[];
  currentProject: Project | null;
  isLoadingProjects: boolean;

  // Diagrams state  
  diagrams: Diagram[];
  currentDiagram: Diagram | null;
  isLoadingDiagram: boolean;

  // Actions - Connection
  connect: () => Promise<void>;
  disconnect: () => void;
  checkConnection: () => Promise<boolean>;

  // Actions - Projects
  fetchProjects: () => Promise<void>;
  createProject: (name: string, description?: string) => Promise<Project>;
  updateProject: (id: string, data: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  selectProject: (project: Project | null) => void;

  // Actions - Diagrams
  fetchDiagrams: (projectId: string) => Promise<void>;
  createDiagram: (projectId: string, name: string, type?: 'current' | 'future') => Promise<Diagram>;
  loadDiagram: (id: string) => Promise<Diagram>;
  saveDiagram: (id: string, data: Partial<Diagram>) => Promise<void>;
  deleteDiagram: (id: string) => Promise<void>;
  selectDiagram: (diagram: Diagram | null) => void;

  // Actions - Real-time
  joinDiagramRoom: (diagramId: string) => void;
  leaveDiagramRoom: (diagramId: string) => void;
}

export const useProjectsStore = create<ProjectsStore>((set, get) => ({
  // Initial state
  connectionStatus: 'disconnected',
  connectionError: null,
  projects: [],
  currentProject: null,
  isLoadingProjects: false,
  diagrams: [],
  currentDiagram: null,
  isLoadingDiagram: false,

  // Connection actions
  connect: async () => {
    set({ connectionStatus: 'connecting', connectionError: null });
    try {
      // Check API health first
      await checkHealth();
      
      // Connect WebSocket
      await socketService.connect();
      
      set({ connectionStatus: 'connected' });
      
      // Setup real-time event handlers
      setupRealtimeHandlers(set, get);
      
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Connection failed';
      set({ connectionStatus: 'error', connectionError: message });
      throw error;
    }
  },

  disconnect: () => {
    socketService.disconnect();
    set({ 
      connectionStatus: 'disconnected',
      connectionError: null,
      currentDiagram: null,
    });
  },

  checkConnection: async () => {
    try {
      await checkHealth();
      return true;
    } catch {
      return false;
    }
  },

  // Projects actions
  fetchProjects: async () => {
    set({ isLoadingProjects: true });
    try {
      const projects = await projectsApi.list();
      set({ projects, isLoadingProjects: false });
    } catch (error) {
      set({ isLoadingProjects: false });
      throw error;
    }
  },

  createProject: async (name: string, description?: string) => {
    const project = await projectsApi.create({ name, description });
    set((state) => ({ projects: [project, ...state.projects] }));
    return project;
  },

  updateProject: async (id: string, data: Partial<Project>) => {
    const updated = await projectsApi.update(id, data);
    set((state) => ({
      projects: state.projects.map((p) => (p.id === id ? updated : p)),
      currentProject: state.currentProject?.id === id ? updated : state.currentProject,
    }));
  },

  deleteProject: async (id: string) => {
    await projectsApi.delete(id);
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
      currentProject: state.currentProject?.id === id ? null : state.currentProject,
      diagrams: state.currentProject?.id === id ? [] : state.diagrams,
    }));
  },

  selectProject: (project: Project | null) => {
    set({ currentProject: project, diagrams: [], currentDiagram: null });
    if (project) {
      get().fetchDiagrams(project.id);
    }
  },

  // Diagrams actions
  fetchDiagrams: async (projectId: string) => {
    try {
      const diagrams = await diagramsApi.list(projectId);
      set({ diagrams });
    } catch (error) {
      console.error('Failed to fetch diagrams:', error);
      throw error;
    }
  },

  createDiagram: async (projectId: string, name: string, type: 'current' | 'future' = 'current') => {
    const diagram = await diagramsApi.create({ project_id: projectId, name, type });
    set((state) => ({ diagrams: [...state.diagrams, diagram] }));
    return diagram;
  },

  loadDiagram: async (id: string) => {
    set({ isLoadingDiagram: true });
    try {
      const diagram = await diagramsApi.get(id);
      set({ currentDiagram: diagram, isLoadingDiagram: false });
      return diagram;
    } catch (error) {
      set({ isLoadingDiagram: false });
      throw error;
    }
  },

  saveDiagram: async (id: string, data: Partial<Diagram>) => {
    const updated = await diagramsApi.update(id, data);
    set((state) => ({
      diagrams: state.diagrams.map((d) => (d.id === id ? { ...d, ...updated } : d)),
      currentDiagram: state.currentDiagram?.id === id ? { ...state.currentDiagram, ...updated } : state.currentDiagram,
    }));
    
    // Notify other clients
    socketService.sendDiagramUpdate(id, data);
  },

  deleteDiagram: async (id: string) => {
    await diagramsApi.delete(id);
    set((state) => ({
      diagrams: state.diagrams.filter((d) => d.id !== id),
      currentDiagram: state.currentDiagram?.id === id ? null : state.currentDiagram,
    }));
  },

  selectDiagram: (diagram: Diagram | null) => {
    const current = get().currentDiagram;
    
    // Leave previous room
    if (current) {
      socketService.leaveDiagram(current.id);
    }
    
    set({ currentDiagram: diagram });
    
    // Join new room
    if (diagram) {
      socketService.joinDiagram(diagram.id);
    }
  },

  // Real-time actions
  joinDiagramRoom: (diagramId: string) => {
    socketService.joinDiagram(diagramId);
  },

  leaveDiagramRoom: (diagramId: string) => {
    socketService.leaveDiagram(diagramId);
  },
}));

// Setup real-time event handlers
function setupRealtimeHandlers(
  set: (state: Partial<ProjectsStore> | ((state: ProjectsStore) => Partial<ProjectsStore>)) => void,
  get: () => ProjectsStore
) {
  // Diagram updated by another client
  socketService.on('diagram:updated', (event) => {
    const { currentDiagram } = get();
    if (currentDiagram && event.diagramId === currentDiagram.id) {
      set({
        currentDiagram: {
          ...currentDiagram,
          ...event.changes,
        },
      });
    }
  });

  // Node updates
  socketService.on('node:added', (event) => {
    const { currentDiagram } = get();
    if (currentDiagram && event.diagramId === currentDiagram.id && currentDiagram.nodes) {
      set({
        currentDiagram: {
          ...currentDiagram,
          nodes: [...currentDiagram.nodes, event.node],
        },
      });
    }
  });

  socketService.on('node:updated', (event) => {
    const { currentDiagram } = get();
    if (currentDiagram && event.diagramId === currentDiagram.id && currentDiagram.nodes) {
      set({
        currentDiagram: {
          ...currentDiagram,
          nodes: currentDiagram.nodes.map((n) =>
            n.id === event.nodeId ? { ...n, ...event.changes } : n
          ),
        },
      });
    }
  });

  socketService.on('node:deleted', (event) => {
    const { currentDiagram } = get();
    if (currentDiagram && event.diagramId === currentDiagram.id && currentDiagram.nodes) {
      set({
        currentDiagram: {
          ...currentDiagram,
          nodes: currentDiagram.nodes.filter((n) => n.id !== event.nodeId),
        },
      });
    }
  });

  // User presence
  socketService.on('diagram:user-joined', (event) => {
    console.log('User joined diagram:', event);
  });

  socketService.on('diagram:user-left', (event) => {
    console.log('User left diagram:', event);
  });
}
