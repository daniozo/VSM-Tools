/**
 * Action Plan API Service
 * Gestion du plan d'action via le backend vsm-engine
 */

import { API_CONFIG } from './config';

export type Priority = 'high' | 'medium' | 'low';
export type ActionStatus = 'pending' | 'in_progress' | 'completed';

export interface ActionItem {
  id: string;
  project_id: string;
  action: string;
  responsible: string;
  priority: Priority;
  notes: string;
  status: ActionStatus;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateActionItemData {
  action: string;
  responsible?: string;
  priority?: Priority;
  notes?: string;
  status?: ActionStatus;
  due_date?: string | null;
}

export interface UpdateActionItemData {
  action?: string;
  responsible?: string;
  priority?: Priority;
  notes?: string;
  status?: ActionStatus;
  due_date?: string | null;
}

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

export const actionPlanApi = {
  /**
   * Liste toutes les actions d'un projet
   */
  async list(projectId: string): Promise<ActionItem[]> {
    const response = await fetch(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.projects}/${projectId}/action-plan`
    );
    return handleResponse<ActionItem[]>(response);
  },

  /**
   * Récupère une action spécifique
   */
  async get(projectId: string, itemId: string): Promise<ActionItem> {
    const response = await fetch(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.projects}/${projectId}/action-plan/${itemId}`
    );
    return handleResponse<ActionItem>(response);
  },

  /**
   * Crée une nouvelle action
   */
  async create(projectId: string, data: CreateActionItemData): Promise<ActionItem> {
    const response = await fetch(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.projects}/${projectId}/action-plan`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }
    );
    return handleResponse<ActionItem>(response);
  },

  /**
   * Met à jour une action
   */
  async update(projectId: string, itemId: string, data: UpdateActionItemData): Promise<ActionItem> {
    const response = await fetch(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.projects}/${projectId}/action-plan/${itemId}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }
    );
    return handleResponse<ActionItem>(response);
  },

  /**
   * Supprime une action
   */
  async delete(projectId: string, itemId: string): Promise<void> {
    const response = await fetch(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.projects}/${projectId}/action-plan/${itemId}`,
      {
        method: 'DELETE',
      }
    );
    await handleResponse(response);
  },

  /**
   * Compte le nombre d'actions par statut
   */
  async getStats(projectId: string): Promise<{ total: number; pending: number; in_progress: number; completed: number }> {
    const items = await this.list(projectId);
    return {
      total: items.length,
      pending: items.filter(i => i.status === 'pending').length,
      in_progress: items.filter(i => i.status === 'in_progress').length,
      completed: items.filter(i => i.status === 'completed').length,
    };
  },
};
