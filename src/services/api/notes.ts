/**
 * Notes API Service
 * Gestion des notes via le backend vsm-engine
 */

import { API_CONFIG } from './config';

export interface Note {
  id: string;
  project_id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface CreateNoteData {
  title: string;
  content?: string;
}

export interface UpdateNoteData {
  title?: string;
  content?: string;
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

export const notesApi = {
  /**
   * Liste toutes les notes d'un projet
   */
  async list(projectId: string): Promise<Note[]> {
    const response = await fetch(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.projects}/${projectId}/notes`
    );
    return handleResponse<Note[]>(response);
  },

  /**
   * Récupère une note spécifique
   */
  async get(projectId: string, noteId: string): Promise<Note> {
    const response = await fetch(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.projects}/${projectId}/notes/${noteId}`
    );
    return handleResponse<Note>(response);
  },

  /**
   * Crée une nouvelle note
   */
  async create(projectId: string, data: CreateNoteData): Promise<Note> {
    const response = await fetch(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.projects}/${projectId}/notes`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }
    );
    return handleResponse<Note>(response);
  },

  /**
   * Met à jour une note
   */
  async update(projectId: string, noteId: string, data: UpdateNoteData): Promise<Note> {
    const response = await fetch(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.projects}/${projectId}/notes/${noteId}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }
    );
    return handleResponse<Note>(response);
  },

  /**
   * Supprime une note
   */
  async delete(projectId: string, noteId: string): Promise<void> {
    const response = await fetch(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.projects}/${projectId}/notes/${noteId}`,
      {
        method: 'DELETE',
      }
    );
    await handleResponse(response);
  },
};
