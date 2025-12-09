/**
 * Service pour gérer la persistance de la configuration VSM
 */

import { API_CONFIG } from './config';

export interface ConfigurationSection {
  metaData?: any;
  dataSources?: any[];
  actors?: any;
  nodes?: any[];
  flowSequences?: any[];
  informationFlows?: any[];
  improvementPoints?: any[];
  textAnnotations?: any[];
  analysisConfig?: any;
}

// Helper pour gérer les réponses
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || 'Request failed');
  }
  return response.json();
}

/**
 * API pour la configuration des diagrammes VSM
 */
export const configurationApi = {
  /**
   * Récupère toute la configuration d'un diagramme
   */
  async getConfiguration(diagramId: string): Promise<ConfigurationSection> {
    const response = await fetch(`${API_CONFIG.baseUrl}/api/diagrams/${diagramId}/configuration`);
    return handleResponse<ConfigurationSection>(response);
  },

  /**
   * Met à jour toute la configuration d'un diagramme
   */
  async updateConfiguration(diagramId: string, data: ConfigurationSection): Promise<void> {
    const response = await fetch(`${API_CONFIG.baseUrl}/api/diagrams/${diagramId}/configuration`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data }),
    });
    await handleResponse(response);
  },

  /**
   * Met à jour une section spécifique de la configuration
   */
  async updateSection(diagramId: string, section: string, data: any): Promise<void> {
    const response = await fetch(`${API_CONFIG.baseUrl}/api/diagrams/${diagramId}/configuration/${section}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    await handleResponse(response);
  },

  /**
   * Initialise un diagramme avec des valeurs par défaut
   */
  async initialize(diagramId: string, defaultValues: ConfigurationSection): Promise<void> {
    const response = await fetch(`${API_CONFIG.baseUrl}/api/diagrams/${diagramId}/initialize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ defaultValues }),
    });
    await handleResponse(response);
  },
};
