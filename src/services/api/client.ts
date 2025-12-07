import { API_CONFIG } from './config';

// Types
export interface Project {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Diagram {
  id: string;
  project_id: string;
  name: string;
  type: 'current' | 'future';
  data: any;
  nodes?: DiagramNode[];
  edges?: DiagramEdge[];
  created_at: string;
  updated_at: string;
}

export interface DiagramNode {
  id: string;
  diagram_id: string;
  type: string;
  name: string;
  properties: any;
  position_x: number;
  position_y: number;
  indicators?: NodeIndicators;
}

export interface DiagramEdge {
  id: string;
  diagram_id: string;
  source_id: string;
  target_id: string;
  type: string;
  properties: any;
}

export interface NodeIndicators {
  cycleTime?: number;
  changeoverTime?: number;
  uptime?: number;
  batchSize?: number;
  operators?: number;
  wip?: number;
  leadTime?: number;
}

// API Error handling
class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new ApiError(response.status, error.error || 'Request failed');
  }
  return response.json();
}

// Projects API
export const projectsApi = {
  async list(): Promise<Project[]> {
    const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.projects}`);
    return handleResponse<Project[]>(response);
  },

  async get(id: string): Promise<Project> {
    const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.projects}/${id}`);
    return handleResponse<Project>(response);
  },

  async create(data: { name: string; description?: string }): Promise<Project> {
    const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.projects}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<Project>(response);
  },

  async update(id: string, data: Partial<Project>): Promise<Project> {
    const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.projects}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<Project>(response);
  },

  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.projects}/${id}`, {
      method: 'DELETE',
    });
    await handleResponse(response);
  },
};

// Diagrams API
export const diagramsApi = {
  async list(projectId?: string): Promise<Diagram[]> {
    const url = projectId
      ? `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.diagrams}?project_id=${projectId}`
      : `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.diagrams}`;
    const response = await fetch(url);
    return handleResponse<Diagram[]>(response);
  },

  async get(id: string): Promise<Diagram> {
    const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.diagrams}/${id}`);
    return handleResponse<Diagram>(response);
  },

  async create(data: { project_id: string; name: string; type?: 'current' | 'future'; data?: any }): Promise<Diagram> {
    const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.diagrams}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<Diagram>(response);
  },

  async update(id: string, data: Partial<Diagram> & { nodes?: any[]; edges?: any[] }): Promise<Diagram> {
    const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.diagrams}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<Diagram>(response);
  },

  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.diagrams}/${id}`, {
      method: 'DELETE',
    });
    await handleResponse(response);
  },
};

// Health check
export async function checkHealth(): Promise<{ status: string; database: string; websocket?: string }> {
  const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.health}`);
  return handleResponse(response);
}
