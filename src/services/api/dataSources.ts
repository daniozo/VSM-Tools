/**
 * Data Sources API Service
 * 
 * Service pour interagir avec l'API backend des sources de données
 */

import { apiClient } from './client';
import {
  DataSource,
  CreateDataSourceRequest,
  UpdateDataSourceRequest,
  ConnectionTestResult,
  FetchedData
} from '../../shared/types/dataSources';

/**
 * Récupérer toutes les sources de données d'un diagramme
 */
export async function getDataSources(diagramId: string): Promise<DataSource[]> {
  const response = await apiClient.get<DataSource[]>('/data-sources', {
    params: { diagram_id: diagramId }
  });
  return response.data;
}

/**
 * Récupérer une source de données spécifique
 */
export async function getDataSource(id: string): Promise<DataSource> {
  const response = await apiClient.get<DataSource>(`/data-sources/${id}`);
  return response.data;
}

/**
 * Créer une nouvelle source de données
 */
export async function createDataSource(
  request: CreateDataSourceRequest
): Promise<DataSource> {
  const response = await apiClient.post<DataSource>('/data-sources', request);
  return response.data;
}

/**
 * Mettre à jour une source de données
 */
export async function updateDataSource(
  id: string,
  request: UpdateDataSourceRequest
): Promise<DataSource> {
  const response = await apiClient.put<DataSource>(`/data-sources/${id}`, request);
  return response.data;
}

/**
 * Mettre à jour le statut d'une source de données
 */
export async function updateDataSourceStatus(
  id: string,
  status: 'active' | 'error' | 'disabled',
  errorMessage?: string
): Promise<DataSource> {
  const response = await apiClient.patch<DataSource>(`/data-sources/${id}/status`, {
    status,
    error_message: errorMessage
  });
  return response.data;
}

/**
 * Supprimer une source de données
 */
export async function deleteDataSource(id: string): Promise<void> {
  await apiClient.delete(`/data-sources/${id}`);
}

/**
 * Tester la connexion à une source de données
 */
export async function testDataSourceConnection(
  id: string
): Promise<ConnectionTestResult> {
  const response = await apiClient.post<ConnectionTestResult>(
    `/data-sources/${id}/test`
  );
  return response.data;
}

/**
 * Synchroniser manuellement une source de données
 */
export async function syncDataSource(
  id: string
): Promise<{ message: string; data: FetchedData }> {
  const response = await apiClient.post<{ message: string; data: FetchedData }>(
    `/data-sources/${id}/sync`
  );
  return response.data;
}
