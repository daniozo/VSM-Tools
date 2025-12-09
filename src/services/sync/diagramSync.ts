/**
 * Service de synchronisation des diagrammes VSM avec le backend
 */

import { VSMDiagram, Node, NodeType } from '@/shared/types/vsm-model'
import { diagramsApi } from '@/services/api'

/**
 * Convertit un VSMDiagram en format API pour la sauvegarde
 */
export function convertDiagramToApiFormat(diagram: VSMDiagram, diagramId: string) {
  // Convertir les nodes en format API
  const nodes = diagram.nodes.map(node => ({
    id: node.id,
    type: node.type,
    name: node.name,
    properties: {
      description: node.description,
      operators: node.operators,
      dataSource: node.dataSource
    },
    position_x: 0, // Les positions sont calculées par le layout
    position_y: 0,
    indicators: node.indicators ? {
      cycleTime: node.indicators.find(i => i.code === 'CT')?.value,
      changeoverTime: node.indicators.find(i => i.code === 'CO')?.value,
      uptime: node.indicators.find(i => i.code === 'UP')?.value,
      batchSize: node.indicators.find(i => i.code === 'BS')?.value,
      operators: node.operators,
      wip: node.indicators.find(i => i.code === 'WIP')?.value,
      leadTime: node.indicators.find(i => i.code === 'LT')?.value
    } : undefined
  }))

  // Convertir les flux en edges
  const edges: any[] = []
  
  // Flux matériels
  diagram.flowSequences.forEach(seq => {
    if (seq.fromNodeId && seq.toNodeId) {
      edges.push({
        source_id: seq.fromNodeId,
        target_id: seq.toNodeId,
        type: 'material',
        properties: {
          flowType: seq.flowType,
          intermediateElements: seq.intermediateElements
        }
      })
    }
  })

  // Flux d'information
  diagram.informationFlows.forEach(flow => {
    edges.push({
      source_id: flow.sourceNodeId,
      target_id: flow.targetNodeId,
      type: 'information',
      properties: {
        description: flow.description,
        transmissionType: flow.transmissionType,
        frequency: flow.frequency
      }
    })
  })

  // Data contenant toute la structure VSM
  const data = {
    metaData: diagram.metaData,
    actors: diagram.actors,
    dataSources: diagram.dataSources,
    flowSequences: diagram.flowSequences,
    informationFlows: diagram.informationFlows,
    improvementPoints: diagram.improvementPoints,
    textAnnotations: diagram.textAnnotations
  }

  return {
    name: diagram.metaData.name,
    type: diagram.metaData.type,
    data,
    nodes,
    edges
  }
}

/**
 * Sauvegarde un diagramme VSM dans le backend
 */
export async function saveDiagram(diagram: VSMDiagram, diagramId: string): Promise<void> {
  try {
    const apiData = convertDiagramToApiFormat(diagram, diagramId)
    await diagramsApi.update(diagramId, apiData)
    console.log('✅ Diagramme sauvegardé avec succès:', diagramId)
  } catch (error) {
    console.error('❌ Erreur lors de la sauvegarde du diagramme:', error)
    throw error
  }
}

/**
 * Charge un diagramme depuis le backend et le convertit en VSMDiagram
 */
export async function loadDiagram(diagramId: string): Promise<VSMDiagram | null> {
  try {
    const apiDiagram = await diagramsApi.get(diagramId)
    
    // Si le diagramme a un champ data complet, l'utiliser
    if (apiDiagram.data && typeof apiDiagram.data === 'object') {
      return {
        ...apiDiagram.data,
        metaData: {
          ...apiDiagram.data.metaData,
          name: apiDiagram.name,
          type: apiDiagram.type,
          lastModified: new Date(apiDiagram.updated_at)
        }
      } as VSMDiagram
    }

    // Sinon, construire depuis nodes/edges (format legacy)
    console.warn('⚠️ Format legacy détecté, reconstruction du diagramme')
    return null // À implémenter si nécessaire
  } catch (error) {
    console.error('❌ Erreur lors du chargement du diagramme:', error)
    throw error
  }
}

/**
 * Vérifie si un diagramme nécessite une synchronisation
 */
export function needsSync(diagram: VSMDiagram): boolean {
  // Pour l'instant, on considère qu'un diagramme modifié (isDirty) nécessite une sync
  // Cette logique peut être améliorée avec un timestamp ou hash
  return true
}
