/**
 * Schémas de validation Zod pour le modèle VSM Model-First
 * 
 * Ces schémas permettent de valider la structure et les données des diagrammes VSM
 * à l'exécution, garantissant la cohérence du modèle.
 * 
 * @date 6 décembre 2025
 * @version 1.0
 */

import { z } from 'zod'
import {
  NodeType,
  InventoryType,
  FlowType,
  TransmissionType,
  DataSourceType,
  AuthType,
  ImprovementStatus,
  DeliveryFrequency
} from './vsm-model'

// ============================================================================
// SCHÉMAS - ENUMS
// ============================================================================

export const NodeTypeSchema = z.nativeEnum(NodeType)
export const InventoryTypeSchema = z.nativeEnum(InventoryType)
export const FlowTypeSchema = z.nativeEnum(FlowType)
export const TransmissionTypeSchema = z.nativeEnum(TransmissionType)
export const DataSourceTypeSchema = z.nativeEnum(DataSourceType)
export const AuthTypeSchema = z.nativeEnum(AuthType)
export const ImprovementStatusSchema = z.nativeEnum(ImprovementStatus)
export const DeliveryFrequencySchema = z.nativeEnum(DeliveryFrequency)

// ============================================================================
// SCHÉMAS - MÉTADONNÉES & DIAGRAMME
// ============================================================================

export const MetaDataSchema = z.object({
  name: z.string().min(1, 'Le nom du diagramme est requis'),
  description: z.string().optional(),
  version: z.string().min(1, 'La version est requise'),
  author: z.string().min(1, 'L\'auteur est requis'),
  createdDate: z.string().datetime('Date de création invalide'),
  modifiedDate: z.string().datetime('Date de modification invalide'),
  appVersion: z.string().min(1, 'La version de l\'application est requise')
})

// ============================================================================
// SCHÉMAS - SOURCES DE DONNÉES
// ============================================================================

export const SQLConfigSchema = z.object({
  jdbcUrl: z.string().url('URL JDBC invalide').or(z.string().startsWith('jdbc:', 'L\'URL doit commencer par jdbc:')),
  driver: z.string().min(1, 'Le driver est requis'),
  user: z.string().min(1, 'Le nom d\'utilisateur est requis'),
  passwordRef: z.string().min(1, 'La référence au mot de passe est requise')
})

export const RESTConfigSchema = z.object({
  baseUrl: z.string().url('URL de base invalide'),
  authType: AuthTypeSchema,
  authSecretRef: z.string().optional(),
  headers: z.record(z.string()).optional()
})

export const DataSourceConfigSchema = z.union([
  SQLConfigSchema,
  RESTConfigSchema
])

export const DataSourceSchema = z.object({
  id: z.string().min(1, 'L\'ID est requis'),
  name: z.string().min(1, 'Le nom de la source est requis'),
  type: DataSourceTypeSchema,
  config: DataSourceConfigSchema,
  status: z.enum(['UNTESTED', 'OK', 'ERROR']).optional(),
  errorMessage: z.string().optional()
}).refine(
  (data) => {
    // Validation cohérence type <-> config
    if (data.type === DataSourceType.SQL && !('jdbcUrl' in data.config)) {
      return false
    }
    if (data.type === DataSourceType.REST && !('baseUrl' in data.config)) {
      return false
    }
    return true
  },
  {
    message: 'Le type de source et la configuration doivent correspondre'
  }
)

// ============================================================================
// SCHÉMAS - ACTEURS EXTERNES
// ============================================================================

export const SupplierSchema = z.object({
  name: z.string().min(1, 'Le nom du fournisseur est requis'),
  contact: z.string().optional(),
  deliveryFrequency: DeliveryFrequencySchema,
  customFrequency: z.string().optional(),
  leadTime: z.number().min(0, 'Le délai de livraison doit être positif')
}).refine(
  (data) => {
    // Si fréquence custom, customFrequency doit être défini
    if (data.deliveryFrequency === DeliveryFrequency.CUSTOM && !data.customFrequency) {
      return false
    }
    return true
  },
  {
    message: 'La fréquence personnalisée doit être spécifiée'
  }
)

export const CustomerSchema = z.object({
  name: z.string().min(1, 'Le nom du client est requis'),
  contact: z.string().optional(),
  dailyDemand: z.number().min(0, 'La demande quotidienne doit être positive'),
  taktTime: z.number().min(0, 'Le Takt Time doit être positif')
})

export const ControlCenterSchema = z.object({
  name: z.string().min(1, 'Le nom du centre de contrôle est requis'),
  description: z.string().optional()
})

export const ActorsSchema = z.object({
  supplier: SupplierSchema,
  customer: CustomerSchema,
  controlCenter: ControlCenterSchema.optional()
})

// ============================================================================
// SCHÉMAS - INDICATEURS
// ============================================================================

export const SQLIndicatorConfigSchema = z.object({
  query: z.string().min(1, 'La requête SQL est requise')
})

export const RESTIndicatorConfigSchema = z.object({
  endpoint: z.string().min(1, 'L\'endpoint est requis'),
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE']),
  body: z.string().optional(),
  jsonPath: z.string().optional()
})

export const IndicatorConfigSchema = z.union([
  SQLIndicatorConfigSchema,
  RESTIndicatorConfigSchema
])

export const IndicatorSchema = z.object({
  id: z.string().min(1, 'L\'ID est requis'),
  name: z.string().min(1, 'Le nom de l\'indicateur est requis'),
  unit: z.string().min(1, 'L\'unité est requise'),
  dataSourceId: z.string().optional(),
  config: IndicatorConfigSchema.optional(),
  value: z.number().optional(),
  lastUpdated: z.string().datetime().optional()
}).refine(
  (data) => {
    // Si dataSourceId est défini, config doit être défini
    if (data.dataSourceId && !data.config) {
      return false
    }
    return true
  },
  {
    message: 'La configuration est requise si une source de données est spécifiée'
  }
)

// ============================================================================
// SCHÉMAS - NŒUDS & ÉTAPES
// ============================================================================

export const NodeSchema = z.object({
  id: z.string().min(1, 'L\'ID est requis'),
  name: z.string().min(1, 'Le nom du nœud est requis'),
  type: NodeTypeSchema,
  operators: z.number().int().min(0, 'Le nombre d\'opérateurs doit être positif').optional(),
  indicators: z.array(IndicatorSchema).default([])
}).refine(
  (data) => {
    // operators est requis pour PROCESS_STEP
    if (data.type === NodeType.PROCESS_STEP && data.operators === undefined) {
      return false
    }
    return true
  },
  {
    message: 'Le nombre d\'opérateurs est requis pour une étape de production'
  }
)

// ============================================================================
// SCHÉMAS - SÉQUENCES & FLUX
// ============================================================================

export const InventorySchema = z.object({
  id: z.string().min(1, 'L\'ID est requis'),
  name: z.string().min(1, 'Le nom du stock est requis'),
  type: InventoryTypeSchema,
  quantity: z.number().min(0, 'La quantité doit être positive'),
  duration: z.number().min(0, 'La durée doit être positive'),
  dataSourceId: z.string().optional(),
  indicators: z.array(IndicatorSchema).default([])
})

export const MaterialFlowSchema = z.object({
  id: z.string().min(1, 'L\'ID est requis'),
  flowType: FlowTypeSchema,
  method: z.string().optional()
})

export const IntermediateElementSchema = z.object({
  order: z.number().int().min(0, 'L\'ordre doit être un entier positif'),
  type: z.enum(['INVENTORY', 'MATERIAL_FLOW']),
  inventory: InventorySchema.optional(),
  materialFlow: MaterialFlowSchema.optional()
}).refine(
  (data) => {
    // Si type = INVENTORY, inventory doit être défini
    if (data.type === 'INVENTORY' && !data.inventory) {
      return false
    }
    // Si type = MATERIAL_FLOW, materialFlow doit être défini
    if (data.type === 'MATERIAL_FLOW' && !data.materialFlow) {
      return false
    }
    return true
  },
  {
    message: 'L\'élément intermédiaire doit correspondre à son type'
  }
)

export const FlowSequenceSchema = z.object({
  order: z.number().int().min(0, 'L\'ordre doit être un entier positif'),
  fromNodeId: z.string().min(1, 'L\'ID du nœud source est requis'),
  toNodeId: z.string().min(1, 'L\'ID du nœud cible est requis'),
  intermediateElements: z.array(IntermediateElementSchema).default([])
}).refine(
  (data) => {
    // fromNodeId et toNodeId doivent être différents
    if (data.fromNodeId === data.toNodeId) {
      return false
    }
    return true
  },
  {
    message: 'Le nœud source et le nœud cible doivent être différents'
  }
)

export const InformationFlowSchema = z.object({
  id: z.string().min(1, 'L\'ID est requis'),
  description: z.string().min(1, 'La description est requise'),
  sourceNodeId: z.string().min(1, 'L\'ID du nœud source est requis'),
  targetNodeId: z.string().min(1, 'L\'ID du nœud cible est requis'),
  transmissionType: TransmissionTypeSchema
}).refine(
  (data) => {
    // sourceNodeId et targetNodeId doivent être différents
    if (data.sourceNodeId === data.targetNodeId) {
      return false
    }
    return true
  },
  {
    message: 'Le nœud source et le nœud cible doivent être différents'
  }
)

// ============================================================================
// SCHÉMAS - AMÉLIORATIONS & ANNOTATIONS
// ============================================================================

export const ImprovementPointSchema = z.object({
  id: z.string().min(1, 'L\'ID est requis'),
  description: z.string().min(1, 'La description est requise'),
  x: z.number(),
  y: z.number(),
  priority: z.number().int().min(1).max(3).optional(),
  owner: z.string().optional(),
  dueDate: z.string().datetime().optional(),
  status: ImprovementStatusSchema.optional()
})

export const TextAnnotationSchema = z.object({
  id: z.string().min(1, 'L\'ID est requis'),
  content: z.string().min(1, 'Le contenu est requis'),
  x: z.number(),
  y: z.number(),
  width: z.number().min(0).optional(),
  height: z.number().min(0).optional(),
  color: z.string().optional()
})

// ============================================================================
// SCHÉMA PRINCIPAL - VSMDiagram
// ============================================================================

export const VSMDiagramSchema = z.object({
  id: z.string().min(1, 'L\'ID est requis'),
  metaData: MetaDataSchema,
  dataSources: z.array(DataSourceSchema).default([]),
  actors: ActorsSchema,
  nodes: z.array(NodeSchema).default([]),
  flowSequences: z.array(FlowSequenceSchema).default([]),
  informationFlows: z.array(InformationFlowSchema).default([]),
  improvementPoints: z.array(ImprovementPointSchema).default([]),
  textAnnotations: z.array(TextAnnotationSchema).default([])
}).refine(
  (data) => {
    // Validation : tous les fromNodeId et toNodeId doivent exister dans nodes
    const nodeIds = new Set(data.nodes.map(n => n.id))

    for (const seq of data.flowSequences) {
      if (!nodeIds.has(seq.fromNodeId) || !nodeIds.has(seq.toNodeId)) {
        return false
      }
    }

    for (const flow of data.informationFlows) {
      if (!nodeIds.has(flow.sourceNodeId) || !nodeIds.has(flow.targetNodeId)) {
        return false
      }
    }

    return true
  },
  {
    message: 'Tous les ID de nœuds référencés doivent exister'
  }
).refine(
  (data) => {
    // Validation : tous les dataSourceId doivent exister dans dataSources
    const dataSourceIds = new Set(data.dataSources.map(ds => ds.id))

    // Vérifier les indicateurs des nœuds
    for (const node of data.nodes) {
      for (const indicator of node.indicators) {
        if (indicator.dataSourceId && !dataSourceIds.has(indicator.dataSourceId)) {
          return false
        }
      }
    }

    // Vérifier les indicateurs des stocks
    for (const seq of data.flowSequences) {
      for (const elem of seq.intermediateElements) {
        if (elem.type === 'INVENTORY' && elem.inventory) {
          for (const indicator of elem.inventory.indicators) {
            if (indicator.dataSourceId && !dataSourceIds.has(indicator.dataSourceId)) {
              return false
            }
          }
        }
      }
    }

    return true
  },
  {
    message: 'Tous les ID de sources de données référencés doivent exister'
  }
)

// ============================================================================
// FONCTIONS D'EXPORT
// ============================================================================

/**
 * Valide un diagramme VSM complet
 * @param data Données à valider
 * @returns Résultat de la validation Zod
 */
export function validateVSMDiagram(data: unknown) {
  return VSMDiagramSchema.safeParse(data)
}

/**
 * Valide un nœud
 * @param data Données à valider
 * @returns Résultat de la validation Zod
 */
export function validateNode(data: unknown) {
  return NodeSchema.safeParse(data)
}

/**
 * Valide une source de données
 * @param data Données à valider
 * @returns Résultat de la validation Zod
 */
export function validateDataSource(data: unknown) {
  return DataSourceSchema.safeParse(data)
}

/**
 * Valide un indicateur
 * @param data Données à valider
 * @returns Résultat de la validation Zod
 */
export function validateIndicator(data: unknown) {
  return IndicatorSchema.safeParse(data)
}

/**
 * Valide une séquence de flux
 * @param data Données à valider
 * @returns Résultat de la validation Zod
 */
export function validateFlowSequence(data: unknown) {
  return FlowSequenceSchema.safeParse(data)
}

/**
 * Valide un flux d'information
 * @param data Données à valider
 * @returns Résultat de la validation Zod
 */
export function validateInformationFlow(data: unknown) {
  return InformationFlowSchema.safeParse(data)
}

/**
 * Type inféré pour un VSMDiagram validé
 */
export type ValidatedVSMDiagram = z.infer<typeof VSMDiagramSchema>

/**
 * Type inféré pour un Node validé
 */
export type ValidatedNode = z.infer<typeof NodeSchema>

/**
 * Type inféré pour un DataSource validé
 */
export type ValidatedDataSource = z.infer<typeof DataSourceSchema>

/**
 * Type inféré pour un Indicator validé
 */
export type ValidatedIndicator = z.infer<typeof IndicatorSchema>
