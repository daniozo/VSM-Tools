/**
 * Service pour récupérer les données des sources dynamiques
 * et mettre à jour les indicateurs/stocks en temps réel
 */

import { DataConnection, DataSource, DataSourceType, Indicator, Inventory } from '@/shared/types/vsm-model'
import { apiClient } from './api/client'

interface DataCollectionResult {
  value: number | string
  timestamp: string
  error?: string
}

/**
 * Récupère la valeur d'un indicateur depuis sa source de données dynamique
 */
export async function fetchIndicatorValue(
  indicator: Indicator,
  dataSources: DataSource[]
): Promise<DataCollectionResult | null> {
  if (indicator.mode !== 'Dynamique' || !indicator.dataConnection) {
    return null
  }

  const dataConnection = indicator.dataConnection
  const dataSource = dataSources.find(ds => ds.id === dataConnection.dataSourceId)

  if (!dataSource) {
    return {
      value: 'N/A',
      timestamp: new Date().toISOString(),
      error: 'Source de données introuvable'
    }
  }

  try {
    let value: number | string

    if (dataSource.type === DataSourceType.SQL) {
      value = await fetchFromSQL(dataSource, dataConnection)
    } else if (dataSource.type === DataSourceType.REST) {
      value = await fetchFromREST(dataSource, dataConnection)
    } else {
      throw new Error(`Type de source non supporté: ${dataSource.type}`)
    }

    return {
      value,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    console.error('Erreur lors de la récupération de la valeur:', error)
    return {
      value: 'Erreur',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }
  }
}

/**
 * Récupère la valeur d'un stock depuis sa source de données dynamique
 */
export async function fetchInventoryValue(
  inventory: Inventory & { dataConnection?: DataConnection },
  dataSources: DataSource[]
): Promise<DataCollectionResult | null> {
  if (!inventory.dataConnection) {
    return null
  }

  const dataConnection = inventory.dataConnection
  const dataSource = dataSources.find(ds => ds.id === dataConnection.dataSourceId)

  if (!dataSource) {
    return {
      value: 'N/A',
      timestamp: new Date().toISOString(),
      error: 'Source de données introuvable'
    }
  }

  try {
    let value: number | string

    if (dataSource.type === DataSourceType.SQL) {
      value = await fetchFromSQL(dataSource, dataConnection)
    } else if (dataSource.type === DataSourceType.REST) {
      value = await fetchFromREST(dataSource, dataConnection)
    } else {
      throw new Error(`Type de source non supporté: ${dataSource.type}`)
    }

    return {
      value,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    console.error('Erreur lors de la récupération de la valeur du stock:', error)
    return {
      value: 'Erreur',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }
  }
}

/**
 * Récupère une valeur depuis une base de données SQL
 */
async function fetchFromSQL(
  dataSource: DataSource,
  dataConnection: DataConnection
): Promise<number | string> {
  if (!dataConnection.sqlQuery) {
    throw new Error('Aucune requête SQL configurée')
  }

  // Parser les paramètres
  const params = parseParameters(dataConnection.parameters)

  const response = await apiClient.post('/api/data-collection/execute-sql', {
    host: dataSource.host,
    port: dataSource.port,
    database: dataSource.database,
    username: dataSource.username,
    password: dataSource.password,
    query: dataConnection.sqlQuery,
    parameters: params
  })

  // Extraire la valeur du premier résultat
  if (response.data && response.data.results && response.data.results.length > 0) {
    const firstRow = response.data.results[0]
    const firstColumn = Object.values(firstRow)[0]
    return firstColumn as number | string
  }

  throw new Error('Aucune donnée retournée par la requête SQL')
}

/**
 * Récupère une valeur depuis une API REST
 */
async function fetchFromREST(
  dataSource: DataSource,
  dataConnection: DataConnection
): Promise<number | string> {
  if (!dataConnection.restEndpoint) {
    throw new Error('Aucun endpoint REST configuré')
  }

  // Construire l'URL complète
  const baseUrl = dataSource.url || ''
  const endpoint = dataConnection.restEndpoint
  const fullUrl = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint}`

  // Parser les paramètres
  const params = parseParameters(dataConnection.parameters)

  // Configurer les headers d'authentification
  const headers: Record<string, string> = {}
  
  if (dataSource.authType === 'bearer' && dataSource.authToken) {
    headers['Authorization'] = `Bearer ${dataSource.authToken}`
  } else if (dataSource.authType === 'apikey' && dataSource.authToken) {
    headers['X-API-Key'] = dataSource.authToken
  } else if (dataSource.authType === 'basic' && dataSource.authToken) {
    headers['Authorization'] = `Basic ${dataSource.authToken}`
  }

  const response = await apiClient.get(fullUrl, {
    params,
    headers
  })

  // Extraire la valeur avec JSON Path si configuré
  if (dataConnection.jsonPath) {
    const value = extractJsonPath(response.data, dataConnection.jsonPath)
    return value
  }

  // Sinon, retourner la réponse directe
  return response.data
}

/**
 * Parse les paramètres au format "key1=value1;key2=value2"
 */
function parseParameters(parameters?: string): Record<string, string> {
  if (!parameters) return {}

  const params: Record<string, string> = {}
  const pairs = parameters.split(';')

  for (const pair of pairs) {
    const [key, value] = pair.split('=')
    if (key && value) {
      params[key.trim()] = value.trim()
    }
  }

  return params
}

/**
 * Extrait une valeur depuis un objet JSON avec un JSON Path simplifié
 * Supporte: $.data.value, $.items[0].price, etc.
 */
function extractJsonPath(data: any, path: string): number | string {
  if (!path.startsWith('$.')) {
    throw new Error('Le JSON Path doit commencer par "$."')
  }

  // Enlever le "$." initial
  const cleanPath = path.substring(2)
  const parts = cleanPath.split('.')

  let current = data

  for (const part of parts) {
    // Gérer les index de tableau: items[0]
    const arrayMatch = part.match(/^(\w+)\[(\d+)\]$/)
    
    if (arrayMatch) {
      const [, key, index] = arrayMatch
      current = current[key]
      if (!Array.isArray(current)) {
        throw new Error(`${key} n'est pas un tableau`)
      }
      current = current[parseInt(index)]
    } else {
      current = current[part]
    }

    if (current === undefined) {
      throw new Error(`Chemin JSON invalide: ${path}`)
    }
  }

  return current
}

/**
 * Met à jour tous les indicateurs dynamiques d'un diagramme
 */
export async function updateDynamicIndicators(
  nodes: any[],
  dataSources: DataSource[]
): Promise<any[]> {
  const updatedNodes = [...nodes]

  for (let i = 0; i < updatedNodes.length; i++) {
    const node = updatedNodes[i]
    if (!node.indicators || node.indicators.length === 0) continue

    const updatedIndicators = [...node.indicators]

    for (let j = 0; j < updatedIndicators.length; j++) {
      const indicator = updatedIndicators[j]
      
      if (indicator.mode === 'Dynamique' && indicator.dataConnection) {
        const result = await fetchIndicatorValue(indicator, dataSources)
        
        if (result) {
          updatedIndicators[j] = {
            ...indicator,
            value: result.value.toString(),
            lastUpdated: result.timestamp,
            error: result.error
          }
        }
      }
    }

    updatedNodes[i] = {
      ...node,
      indicators: updatedIndicators
    }
  }

  return updatedNodes
}

/**
 * Met à jour tous les stocks dynamiques d'un diagramme
 */
export async function updateDynamicInventories(
  inventories: (Inventory & { dataConnection?: DataConnection })[],
  dataSources: DataSource[]
): Promise<(Inventory & { dataConnection?: DataConnection })[]> {
  const updatedInventories = [...inventories]

  for (let i = 0; i < updatedInventories.length; i++) {
    const inventory = updatedInventories[i]
    
    if (inventory.dataConnection) {
      const result = await fetchInventoryValue(inventory, dataSources)
      
      if (result && typeof result.value === 'number') {
        updatedInventories[i] = {
          ...inventory,
          quantity: result.value
        }
      }
    }
  }

  return updatedInventories
}
