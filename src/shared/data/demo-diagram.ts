/**
 * Diagramme VSM de démonstration
 * 
 * Exemple complet d'un flux de production pour tester le layout et le rendu
 */

import { 
  VSMDiagram, 
  NodeType, 
  InventoryType, 
  FlowType,
  TransmissionType,
  DeliveryFrequency
} from '../types/vsm-model'

export const demoDiagram: VSMDiagram = {
  metaData: {
    name: 'Ligne de Production - Démonstration',
    description: 'Exemple de VSM pour une ligne de production avec 4 étapes',
    version: '1.0',
    author: 'VSM-Tools',
    createdDate: new Date().toISOString(),
    modifiedDate: new Date().toISOString(),
    appVersion: '1.0.0'
  },

  actors: {
    supplier: {
      name: 'Fournisseur Acier',
      deliveryFrequency: DeliveryFrequency.WEEKLY,
      customFrequency: undefined,
      leadTime: 7,
      batchSize: 1000
    },
    customer: {
      name: 'Client Final',
      dailyDemand: 500,
      workingDaysPerMonth: 22,
      requiredTaktTime: 57.6
    },
    controlCenter: {
      name: 'Planification Production',
      planningHorizon: 'Hebdomadaire',
      systemName: 'SAP'
    }
  },

  dataSources: [],

  nodes: [
    {
      id: 'node-1',
      type: NodeType.PROCESS_STEP,
      name: 'Découpe',
      operators: 2,
      machines: 1,
      cycleTime: 45,
      changeoverTime: 30,
      uptime: 95,
      shifts: 2,
      workingHoursPerShift: 8,
      indicators: [
        { id: 'ind-1-1', name: 'CT', value: '45', unit: 's' },
        { id: 'ind-1-2', name: 'C/O', value: '30', unit: 'min' },
        { id: 'ind-1-3', name: 'Uptime', value: '95', unit: '%' }
      ]
    },
    {
      id: 'node-2',
      type: NodeType.PROCESS_STEP,
      name: 'Soudage',
      operators: 3,
      machines: 2,
      cycleTime: 120,
      changeoverTime: 45,
      uptime: 88,
      shifts: 2,
      workingHoursPerShift: 8,
      indicators: [
        { id: 'ind-2-1', name: 'CT', value: '120', unit: 's' },
        { id: 'ind-2-2', name: 'C/O', value: '45', unit: 'min' },
        { id: 'ind-2-3', name: 'Uptime', value: '88', unit: '%' }
      ]
    },
    {
      id: 'node-3',
      type: NodeType.PROCESS_STEP,
      name: 'Assemblage',
      operators: 4,
      machines: 1,
      cycleTime: 90,
      changeoverTime: 15,
      uptime: 92,
      shifts: 2,
      workingHoursPerShift: 8,
      indicators: [
        { id: 'ind-3-1', name: 'CT', value: '90', unit: 's' },
        { id: 'ind-3-2', name: 'C/O', value: '15', unit: 'min' },
        { id: 'ind-3-3', name: 'Uptime', value: '92', unit: '%' }
      ]
    },
    {
      id: 'node-4',
      type: NodeType.PROCESS_STEP,
      name: 'Expédition',
      operators: 2,
      machines: 0,
      cycleTime: 30,
      changeoverTime: 5,
      uptime: 99,
      shifts: 1,
      workingHoursPerShift: 8,
      indicators: [
        { id: 'ind-4-1', name: 'CT', value: '30', unit: 's' },
        { id: 'ind-4-2', name: 'C/O', value: '5', unit: 'min' },
        { id: 'ind-4-3', name: 'Uptime', value: '99', unit: '%' }
      ]
    }
  ],

  flowSequences: [
    {
      order: 1,
      fromNodeId: 'supplier',
      toNodeId: 'node-1',
      intermediateElements: [
        {
          order: 1,
          type: 'INVENTORY',
          inventory: {
            id: 'inv-1',
            name: 'MP Acier',
            type: InventoryType.RAW_MATERIAL,
            quantity: 2000,
            unit: 'pcs',
            duration: 4
          }
        }
      ]
    },
    {
      order: 2,
      fromNodeId: 'node-1',
      toNodeId: 'node-2',
      intermediateElements: [
        {
          order: 1,
          type: 'MATERIAL_FLOW',
          materialFlow: {
            flowType: FlowType.PUSH
          }
        },
        {
          order: 2,
          type: 'INVENTORY',
          inventory: {
            id: 'inv-2',
            name: 'WIP Découpe',
            type: InventoryType.WIP,
            quantity: 500,
            unit: 'pcs',
            duration: 2
          }
        }
      ]
    },
    {
      order: 3,
      fromNodeId: 'node-2',
      toNodeId: 'node-3',
      intermediateElements: [
        {
          order: 1,
          type: 'MATERIAL_FLOW',
          materialFlow: {
            flowType: FlowType.FIFO_LANE
          }
        },
        {
          order: 2,
          type: 'INVENTORY',
          inventory: {
            id: 'inv-3',
            name: 'FIFO Soudage',
            type: InventoryType.WIP,
            quantity: 100,
            unit: 'pcs',
            duration: 0.5
          }
        }
      ]
    },
    {
      order: 4,
      fromNodeId: 'node-3',
      toNodeId: 'node-4',
      intermediateElements: [
        {
          order: 1,
          type: 'MATERIAL_FLOW',
          materialFlow: {
            flowType: FlowType.PULL
          }
        },
        {
          order: 2,
          type: 'INVENTORY',
          inventory: {
            id: 'inv-4',
            name: 'PF Stock',
            type: InventoryType.FINISHED_GOODS,
            quantity: 800,
            unit: 'pcs',
            duration: 1.5
          }
        }
      ]
    },
    {
      order: 5,
      fromNodeId: 'node-4',
      toNodeId: 'customer',
      intermediateElements: []
    }
  ],

  informationFlows: [
    {
      id: 'info-1',
      sourceNodeId: 'control-center',
      targetNodeId: 'supplier',
      transmissionType: TransmissionType.ELECTRONIC,
      description: 'Commandes hebdo',
      frequency: 'Weekly'
    },
    {
      id: 'info-2',
      sourceNodeId: 'control-center',
      targetNodeId: 'node-1',
      transmissionType: TransmissionType.ELECTRONIC,
      description: 'Planning prod',
      frequency: 'Daily'
    },
    {
      id: 'info-3',
      sourceNodeId: 'customer',
      targetNodeId: 'control-center',
      transmissionType: TransmissionType.ELECTRONIC,
      description: 'Prévisions',
      frequency: 'Monthly'
    }
  ],

  improvementPoints: [],
  textAnnotations: []
}

/**
 * Crée un nouveau diagramme vide avec des valeurs par défaut
 */
export function createNewDemoDiagram(name: string, author: string): VSMDiagram {
  return {
    metaData: {
      name,
      description: '',
      version: '1.0',
      author,
      createdDate: new Date().toISOString(),
      modifiedDate: new Date().toISOString(),
      appVersion: '1.0.0'
    },
    actors: {
      supplier: {
        name: 'Fournisseur',
        deliveryFrequency: DeliveryFrequency.WEEKLY,
        leadTime: 7
      },
      customer: {
        name: 'Client',
        dailyDemand: 100,
        workingDaysPerMonth: 22
      },
      controlCenter: {
        name: 'Planification',
        planningHorizon: 'Hebdomadaire'
      }
    },
    dataSources: [],
    nodes: [],
    flowSequences: [],
    informationFlows: [],
    improvementPoints: [],
    textAnnotations: []
  }
}
