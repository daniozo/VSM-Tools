import { create } from 'zustand'
import {
  VSMDiagram,
  Node,
  DataSource,
  FlowSequence,
  InformationFlow,
  ImprovementPoint,
  TextAnnotation,
  Indicator,
  createEmptyVSMDiagram
} from '@/shared/types/vsm-model'

/**
 * État d'édition pour les éléments sélectionnés
 */
export type SelectedElementType =
  | { type: 'node', id: string }
  | { type: 'inventory', sequenceOrder: number, elementOrder: number }
  | { type: 'improvementPoint', id: string }
  | { type: 'textAnnotation', id: string }
  | null

/**
 * Store Zustand pour le modèle Model-First
 * Le diagramme VSM est la source unique de vérité
 */
export interface VsmStore {
  // État principal
  diagram: VSMDiagram | null

  // Sélection
  selectedElement: SelectedElementType

  // État de l'interface
  isConfigDialogOpen: boolean
  isDirty: boolean // Modifications non sauvegardées

  // ========================================
  // ACTIONS - GESTION DU DIAGRAMME
  // ========================================

  /**
   * Crée un nouveau diagramme vide
   */
  createNewDiagram: (name: string, author: string) => void

  /**
   * Charge un diagramme existant
   */
  loadDiagram: (diagram: VSMDiagram) => void

  /**
   * Réinitialise le store (fermeture)
   */
  resetDiagram: () => void

  /**
   * Met à jour les métadonnées
   */
  updateMetaData: (metaData: Partial<VSMDiagram['metaData']>) => void

  /**
   * Marque le diagramme comme sauvegardé
   */
  markAsSaved: () => void

  // ========================================
  // ACTIONS - DATA SOURCES
  // ========================================

  addDataSource: (dataSource: DataSource) => void
  updateDataSource: (id: string, dataSource: Partial<DataSource>) => void
  removeDataSource: (id: string) => void
  getDataSource: (id: string) => DataSource | undefined

  // ========================================
  // ACTIONS - ACTEURS
  // ========================================

  updateSupplier: (supplier: Partial<VSMDiagram['actors']['supplier']>) => void
  updateCustomer: (customer: Partial<VSMDiagram['actors']['customer']>) => void
  updateControlCenter: (controlCenter: Partial<VSMDiagram['actors']['controlCenter']>) => void

  // ========================================
  // ACTIONS - NODES
  // ========================================

  addNode: (node: Node) => void
  updateNode: (id: string, node: Partial<Node>) => void
  removeNode: (id: string) => void
  getNode: (id: string) => Node | undefined
  reorderNodes: (fromIndex: number, toIndex: number) => void

  // ========================================
  // ACTIONS - INDICATEURS
  // ========================================

  addIndicatorToNode: (nodeId: string, indicator: Indicator) => void
  updateIndicatorInNode: (nodeId: string, indicatorId: string, indicator: Partial<Indicator>) => void
  removeIndicatorFromNode: (nodeId: string, indicatorId: string) => void

  // ========================================
  // ACTIONS - SÉQUENCES DE FLUX
  // ========================================

  addFlowSequence: (sequence: FlowSequence) => void
  updateFlowSequence: (order: number, sequence: Partial<FlowSequence>) => void
  removeFlowSequence: (order: number) => void
  getFlowSequence: (order: number) => FlowSequence | undefined

  // ========================================
  // ACTIONS - FLUX D'INFORMATION
  // ========================================

  addInformationFlow: (flow: InformationFlow) => void
  updateInformationFlow: (id: string, flow: Partial<InformationFlow>) => void
  removeInformationFlow: (id: string) => void

  // ========================================
  // ACTIONS - POINTS D'AMÉLIORATION
  // ========================================

  addImprovementPoint: (point: ImprovementPoint) => void
  updateImprovementPoint: (id: string, point: Partial<ImprovementPoint>) => void
  removeImprovementPoint: (id: string) => void

  // ========================================
  // ACTIONS - ANNOTATIONS TEXTUELLES
  // ========================================

  addTextAnnotation: (annotation: TextAnnotation) => void
  updateTextAnnotation: (id: string, annotation: Partial<TextAnnotation>) => void
  removeTextAnnotation: (id: string) => void

  // ========================================
  // ACTIONS - UI
  // ========================================

  selectElement: (element: SelectedElementType) => void
  openConfigDialog: () => void
  closeConfigDialog: () => void
}

export const useVsmStore = create<VsmStore>((set, get) => ({
  // État initial
  diagram: null,
  selectedElement: null,
  isConfigDialogOpen: false,
  isDirty: false,

  // ========================================
  // IMPLÉMENTATIONS - GESTION DU DIAGRAMME
  // ========================================

  createNewDiagram: (name: string, author: string) => set(() => ({
    diagram: createEmptyVSMDiagram(name, author),
    selectedElement: null,
    isDirty: false
  })),

  loadDiagram: (diagram: VSMDiagram) => set(() => ({
    diagram,
    selectedElement: null,
    isDirty: false
  })),

  resetDiagram: () => set(() => ({
    diagram: null,
    selectedElement: null,
    isConfigDialogOpen: false,
    isDirty: false
  })),

  updateMetaData: (metaData) => set((state) => {
    if (!state.diagram) return state
    return {
      diagram: {
        ...state.diagram,
        metaData: {
          ...state.diagram.metaData,
          ...metaData,
          modifiedDate: new Date().toISOString()
        }
      },
      isDirty: true
    }
  }),

  markAsSaved: () => set(() => ({ isDirty: false })),

  // ========================================
  // IMPLÉMENTATIONS - DATA SOURCES
  // ========================================

  addDataSource: (dataSource) => set((state) => {
    if (!state.diagram) return state
    return {
      diagram: {
        ...state.diagram,
        dataSources: [...state.diagram.dataSources, dataSource]
      },
      isDirty: true
    }
  }),

  updateDataSource: (id, updates) => set((state) => {
    if (!state.diagram) return state
    return {
      diagram: {
        ...state.diagram,
        dataSources: state.diagram.dataSources.map(ds =>
          ds.id === id ? { ...ds, ...updates } : ds
        )
      },
      isDirty: true
    }
  }),

  removeDataSource: (id) => set((state) => {
    if (!state.diagram) return state
    return {
      diagram: {
        ...state.diagram,
        dataSources: state.diagram.dataSources.filter(ds => ds.id !== id)
      },
      isDirty: true
    }
  }),

  getDataSource: (id) => {
    const state = get()
    return state.diagram?.dataSources.find(ds => ds.id === id)
  },

  // ========================================
  // IMPLÉMENTATIONS - ACTEURS
  // ========================================

  updateSupplier: (supplier) => set((state) => {
    if (!state.diagram) return state
    return {
      diagram: {
        ...state.diagram,
        actors: {
          ...state.diagram.actors,
          supplier: {
            ...state.diagram.actors.supplier,
            ...supplier
          }
        }
      },
      isDirty: true
    }
  }),

  updateCustomer: (customer) => set((state) => {
    if (!state.diagram) return state
    return {
      diagram: {
        ...state.diagram,
        actors: {
          ...state.diagram.actors,
          customer: {
            ...state.diagram.actors.customer,
            ...customer
          }
        }
      },
      isDirty: true
    }
  }),

  updateControlCenter: (controlCenter) => set((state) => {
    if (!state.diagram) return state
    return {
      diagram: {
        ...state.diagram,
        actors: {
          ...state.diagram.actors,
          controlCenter: controlCenter ? {
            ...state.diagram.actors.controlCenter,
            ...controlCenter
          } as any : undefined
        }
      },
      isDirty: true
    }
  }),

  // ========================================
  // IMPLÉMENTATIONS - NODES
  // ========================================

  addNode: (node) => set((state) => {
    if (!state.diagram) return state
    return {
      diagram: {
        ...state.diagram,
        nodes: [...state.diagram.nodes, node]
      },
      isDirty: true
    }
  }),

  updateNode: (id, updates) => set((state) => {
    if (!state.diagram) return state
    return {
      diagram: {
        ...state.diagram,
        nodes: state.diagram.nodes.map(n =>
          n.id === id ? { ...n, ...updates } : n
        )
      },
      isDirty: true
    }
  }),

  removeNode: (id) => set((state) => {
    if (!state.diagram) return state
    return {
      diagram: {
        ...state.diagram,
        nodes: state.diagram.nodes.filter(n => n.id !== id),
        // Supprimer aussi les séquences et flux d'info qui référencent ce nœud
        flowSequences: state.diagram.flowSequences.filter(
          seq => seq.fromNodeId !== id && seq.toNodeId !== id
        ),
        informationFlows: state.diagram.informationFlows.filter(
          flow => flow.sourceNodeId !== id && flow.targetNodeId !== id
        )
      },
      isDirty: true,
      selectedElement: state.selectedElement?.type === 'node' && state.selectedElement.id === id
        ? null
        : state.selectedElement
    }
  }),

  getNode: (id) => {
    const state = get()
    return state.diagram?.nodes.find(n => n.id === id)
  },

  reorderNodes: (fromIndex, toIndex) => set((state) => {
    if (!state.diagram) return state
    const nodes = [...state.diagram.nodes]
    const [removed] = nodes.splice(fromIndex, 1)
    nodes.splice(toIndex, 0, removed)
    return {
      diagram: {
        ...state.diagram,
        nodes
      },
      isDirty: true
    }
  }),

  // ========================================
  // IMPLÉMENTATIONS - INDICATEURS
  // ========================================

  addIndicatorToNode: (nodeId, indicator) => set((state) => {
    if (!state.diagram) return state
    return {
      diagram: {
        ...state.diagram,
        nodes: state.diagram.nodes.map(n =>
          n.id === nodeId
            ? { ...n, indicators: [...n.indicators, indicator] }
            : n
        )
      },
      isDirty: true
    }
  }),

  updateIndicatorInNode: (nodeId, indicatorId, updates) => set((state) => {
    if (!state.diagram) return state
    return {
      diagram: {
        ...state.diagram,
        nodes: state.diagram.nodes.map(n =>
          n.id === nodeId
            ? {
              ...n,
              indicators: n.indicators.map(ind =>
                ind.id === indicatorId ? { ...ind, ...updates } : ind
              )
            }
            : n
        )
      },
      isDirty: true
    }
  }),

  removeIndicatorFromNode: (nodeId, indicatorId) => set((state) => {
    if (!state.diagram) return state
    return {
      diagram: {
        ...state.diagram,
        nodes: state.diagram.nodes.map(n =>
          n.id === nodeId
            ? { ...n, indicators: n.indicators.filter(ind => ind.id !== indicatorId) }
            : n
        )
      },
      isDirty: true
    }
  }),

  // ========================================
  // IMPLÉMENTATIONS - SÉQUENCES DE FLUX
  // ========================================

  addFlowSequence: (sequence) => set((state) => {
    if (!state.diagram) return state
    return {
      diagram: {
        ...state.diagram,
        flowSequences: [...state.diagram.flowSequences, sequence]
      },
      isDirty: true
    }
  }),

  updateFlowSequence: (order, updates) => set((state) => {
    if (!state.diagram) return state
    return {
      diagram: {
        ...state.diagram,
        flowSequences: state.diagram.flowSequences.map(seq =>
          seq.order === order ? { ...seq, ...updates } : seq
        )
      },
      isDirty: true
    }
  }),

  removeFlowSequence: (order) => set((state) => {
    if (!state.diagram) return state
    return {
      diagram: {
        ...state.diagram,
        flowSequences: state.diagram.flowSequences.filter(seq => seq.order !== order)
      },
      isDirty: true
    }
  }),

  getFlowSequence: (order) => {
    const state = get()
    return state.diagram?.flowSequences.find(seq => seq.order === order)
  },

  // ========================================
  // IMPLÉMENTATIONS - FLUX D'INFORMATION
  // ========================================

  addInformationFlow: (flow) => set((state) => {
    if (!state.diagram) return state
    return {
      diagram: {
        ...state.diagram,
        informationFlows: [...state.diagram.informationFlows, flow]
      },
      isDirty: true
    }
  }),

  updateInformationFlow: (id, updates) => set((state) => {
    if (!state.diagram) return state
    return {
      diagram: {
        ...state.diagram,
        informationFlows: state.diagram.informationFlows.map(flow =>
          flow.id === id ? { ...flow, ...updates } : flow
        )
      },
      isDirty: true
    }
  }),

  removeInformationFlow: (id) => set((state) => {
    if (!state.diagram) return state
    return {
      diagram: {
        ...state.diagram,
        informationFlows: state.diagram.informationFlows.filter(flow => flow.id !== id)
      },
      isDirty: true
    }
  }),

  // ========================================
  // IMPLÉMENTATIONS - POINTS D'AMÉLIORATION
  // ========================================

  addImprovementPoint: (point) => set((state) => {
    if (!state.diagram) return state
    return {
      diagram: {
        ...state.diagram,
        improvementPoints: [...state.diagram.improvementPoints, point]
      },
      isDirty: true
    }
  }),

  updateImprovementPoint: (id, updates) => set((state) => {
    if (!state.diagram) return state
    return {
      diagram: {
        ...state.diagram,
        improvementPoints: state.diagram.improvementPoints.map(point =>
          point.id === id ? { ...point, ...updates } : point
        )
      },
      isDirty: true
    }
  }),

  removeImprovementPoint: (id) => set((state) => {
    if (!state.diagram) return state
    return {
      diagram: {
        ...state.diagram,
        improvementPoints: state.diagram.improvementPoints.filter(point => point.id !== id)
      },
      isDirty: true,
      selectedElement: state.selectedElement?.type === 'improvementPoint' && state.selectedElement.id === id
        ? null
        : state.selectedElement
    }
  }),

  // ========================================
  // IMPLÉMENTATIONS - ANNOTATIONS TEXTUELLES
  // ========================================

  addTextAnnotation: (annotation) => set((state) => {
    if (!state.diagram) return state
    return {
      diagram: {
        ...state.diagram,
        textAnnotations: [...state.diagram.textAnnotations, annotation]
      },
      isDirty: true
    }
  }),

  updateTextAnnotation: (id, updates) => set((state) => {
    if (!state.diagram) return state
    return {
      diagram: {
        ...state.diagram,
        textAnnotations: state.diagram.textAnnotations.map(annotation =>
          annotation.id === id ? { ...annotation, ...updates } : annotation
        )
      },
      isDirty: true
    }
  }),

  removeTextAnnotation: (id) => set((state) => {
    if (!state.diagram) return state
    return {
      diagram: {
        ...state.diagram,
        textAnnotations: state.diagram.textAnnotations.filter(annotation => annotation.id !== id)
      },
      isDirty: true,
      selectedElement: state.selectedElement?.type === 'textAnnotation' && state.selectedElement.id === id
        ? null
        : state.selectedElement
    }
  }),

  // ========================================
  // IMPLÉMENTATIONS - UI
  // ========================================

  selectElement: (element) => set(() => ({ selectedElement: element })),

  openConfigDialog: () => set(() => ({ isConfigDialogOpen: true })),

  closeConfigDialog: () => set(() => ({ isConfigDialogOpen: false }))
}))
