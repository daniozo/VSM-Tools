/**
 * Data Sources Type Definitions (Frontend)
 * 
 * Types pour la gestion des sources de données externes
 */

// Types de sources de données
export type DataSourceType = 'REST_API' | 'DATABASE' | 'FILE';

// Modes de fonctionnement
export type DataSourceMode = 'static' | 'dynamic' | 'manual';

// Statuts de synchronisation
export type DataSourceStatus = 'active' | 'error' | 'disabled';

// Types d'authentification
export type AuthType = 'bearer' | 'apikey' | 'basic' | 'oauth' | 'none';

// Types de transformation
export type TransformationType = 'sum' | 'avg' | 'count' | 'last' | 'min' | 'max';

/**
 * Configuration d'authentification
 */
export interface AuthConfig {
  type: AuthType;
  credentials?: string;
  username?: string;
  headerName?: string;
}

/**
 * Configuration pour une API REST
 */
export interface RestApiConfig {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH';
  headers?: Record<string, string>;
  auth?: AuthConfig;
  body?: Record<string, any>;
  timeout?: number;
}

/**
 * Configuration pour une base de données
 */
export interface DatabaseConfig {
  type: 'postgresql' | 'mysql' | 'mongodb' | 'mssql';
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  query: string;
  ssl?: boolean;
}

/**
 * Configuration pour un fichier
 */
export interface FileConfig {
  filePath: string;
  format: 'csv' | 'excel' | 'json' | 'xml';
  delimiter?: string;
  sheetName?: string;
  polling?: {
    enabled: boolean;
    intervalMinutes: number;
  };
}

/**
 * Configuration unifiée selon le type
 */
export type DataSourceConfig = RestApiConfig | DatabaseConfig | FileConfig;

/**
 * Mapping d'un champ source vers un indicateur cible
 */
export interface FieldMapping {
  sourceField: string;
  targetIndicator: string;
  targetType: 'indicator' | 'inventory';
  transformation?: TransformationType;
  defaultValue?: number;
}

/**
 * Source de données complète
 */
export interface DataSource {
  id: string;
  diagram_id: string;
  name: string;
  type: DataSourceType;
  mode: DataSourceMode;
  config: DataSourceConfig;
  field_mappings: FieldMapping[];
  status: DataSourceStatus;
  last_sync?: string;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Données récupérées depuis une source
 */
export interface FetchedData {
  sourceId: string;
  timestamp: string;
  data: Record<string, any>;
  mappedValues: {
    targetIndicator: string;
    targetType: 'indicator' | 'inventory';
    value: number;
  }[];
}

/**
 * Résultat d'un test de connexion
 */
export interface ConnectionTestResult {
  success: boolean;
  message: string;
  latency?: number;
  sampleData?: Record<string, any>;
  error?: string;
}

/**
 * Requête pour créer/modifier une source de données
 */
export interface CreateDataSourceRequest {
  diagram_id: string;
  name: string;
  type: DataSourceType;
  mode: DataSourceMode;
  config: DataSourceConfig;
  field_mappings: FieldMapping[];
}

export interface UpdateDataSourceRequest {
  name?: string;
  mode?: DataSourceMode;
  config?: DataSourceConfig;
  field_mappings?: FieldMapping[];
  status?: DataSourceStatus;
}

/**
 * Entrée manuelle par un opérateur
 */
export interface OperatorInput {
  id: string;
  diagram_id: string;
  metric_type: 'indicator' | 'inventory';
  metric_id: string;
  metric_name: string;
  node_id?: string;
  unit: string;
  current_value?: number;
  last_updated?: string;
  operator_id?: string;
  station_id?: string;
  created_at: string;
}
