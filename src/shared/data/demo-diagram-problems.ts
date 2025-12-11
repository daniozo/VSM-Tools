/**
 * Diagramme VSM de démonstration avec problèmes
 * 
 * Ce diagramme contient intentionnellement des problèmes pour tester
 * le système d'analyse et de détection :
 * - Goulots d'étranglement (temps de cycle > Takt Time)
 * - Gaspillages (stocks excessifs, faible disponibilité)
 * - Opportunités d'amélioration
 */

import {
  VSMDiagram,
  NodeType,
  InventoryType,
  FlowType,
  TransmissionType,
  DeliveryFrequency,
  DiagramType
} from '../types/vsm-model'

/**
 * Diagramme avec problèmes de performance
 * - Takt Time: 60s (demande 480 pcs/jour sur 8h)
 * - Étape "Soudage" a un CT de 90s > Takt Time = GOULOT
 * - Étape "Peinture" a un CT de 55s proche du Takt Time = ALERTE
 * - Disponibilité faible sur "Soudage" (75%)
 * - Stocks excessifs (5 jours sur le premier stock)
 */
export const demoDiagramWithProblems: VSMDiagram = {
  id: 'demo-problems-001',
  diagramType: DiagramType.CURRENT,

  metaData: {
    name: 'Ligne Production - Avec Problèmes',
    description: 'Exemple de VSM avec goulots, gaspillages et opportunités d\'amélioration identifiables',
    version: '1.0',
    author: 'VSM-Tools Demo',
    createdDate: new Date().toISOString(),
    modifiedDate: new Date().toISOString(),
    appVersion: '1.0.0'
  },

  actors: {
    supplier: {
      name: 'Fournisseur Composants',
      deliveryFrequency: DeliveryFrequency.WEEKLY,
      leadTime: 14 // 2 semaines - long délai
    },
    customer: {
      name: 'Client Automobile',
      dailyDemand: 480, // 480 pièces/jour
      workingHoursPerDay: 8, // 8 heures
      taktTime: 60 // (8h * 3600s) / 480 = 60 secondes par pièce
    }
    // Pas de controlCenter - opportunité d'amélioration
  },

  dataSources: [],

  nodes: [
    {
      id: 'step-decoupe',
      type: NodeType.PROCESS_STEP,
      name: 'Découpe',
      operators: 2,
      indicators: [
        { id: 'ind-decoupe-ct', name: 'Temps de Cycle', value: '45', unit: 's', mode: 'Statique' },
        { id: 'ind-decoupe-co', name: 'Changement Série', value: '20', unit: 'min', mode: 'Statique' },
        { id: 'ind-decoupe-up', name: 'Disponibilité', value: '92', unit: '%', mode: 'Statique' }
      ]
    },
    {
      id: 'step-soudage',
      type: NodeType.PROCESS_STEP,
      name: 'Soudage',
      operators: 3,
      indicators: [
        // GOULOT: 90s > 60s Takt Time
        { id: 'ind-soudage-ct', name: 'Temps de Cycle', value: '90', unit: 's', mode: 'Statique' },
        { id: 'ind-soudage-co', name: 'Changement Série', value: '45', unit: 'min', mode: 'Statique' },
        // GASPILLAGE: Disponibilité faible < 85%
        { id: 'ind-soudage-up', name: 'Disponibilité', value: '75', unit: '%', mode: 'Statique' },
        // GASPILLAGE: Taux de rebut élevé
        { id: 'ind-soudage-scrap', name: 'Taux Rebut', value: '4.5', unit: '%', mode: 'Statique' }
      ]
    },
    {
      id: 'step-peinture',
      type: NodeType.PROCESS_STEP,
      name: 'Peinture',
      operators: 2,
      indicators: [
        // ALERTE: 55s est proche du Takt Time de 60s (> 90%)
        { id: 'ind-peinture-ct', name: 'Temps de Cycle', value: '55', unit: 's', mode: 'Statique' },
        { id: 'ind-peinture-co', name: 'Changement Série', value: '30', unit: 'min', mode: 'Statique' },
        { id: 'ind-peinture-up', name: 'Disponibilité', value: '88', unit: '%', mode: 'Statique' }
      ]
    },
    {
      id: 'step-assemblage',
      type: NodeType.PROCESS_STEP,
      name: 'Assemblage Final',
      operators: 4,
      indicators: [
        { id: 'ind-assemblage-ct', name: 'Temps de Cycle', value: '50', unit: 's', mode: 'Statique' },
        { id: 'ind-assemblage-co', name: 'Changement Série', value: '10', unit: 'min', mode: 'Statique' },
        { id: 'ind-assemblage-up', name: 'Disponibilité', value: '95', unit: '%', mode: 'Statique' }
      ]
    }
  ],

  flowSequences: [
    // Fournisseur → Découpe
    {
      order: 0,
      fromNodeId: 'supplier',
      toNodeId: 'step-decoupe',
      intermediateElements: [
        {
          order: 1,
          type: 'INVENTORY',
          inventory: {
            id: 'inv-mp',
            name: 'Stock Matière Première',
            type: InventoryType.RAW_MATERIAL,
            // GASPILLAGE: Stock excessif > 3 jours
            quantity: 2400, // 5 jours de stock
            duration: 5, // 5 jours
            indicators: []
          }
        }
      ]
    },
    // Découpe → Soudage
    {
      order: 1,
      fromNodeId: 'step-decoupe',
      toNodeId: 'step-soudage',
      intermediateElements: [
        {
          order: 1,
          type: 'MATERIAL_FLOW',
          materialFlow: {
            id: 'flow-1',
            flowType: FlowType.PUSH, // Tous en PUSH = opportunité
            method: 'Lot de 100 pièces'
          }
        },
        {
          order: 2,
          type: 'INVENTORY',
          inventory: {
            id: 'inv-wip1',
            name: 'En-Cours Découpe',
            type: InventoryType.WIP,
            // GASPILLAGE: Stock WIP excessif
            quantity: 960, // 2 jours
            duration: 2,
            indicators: []
          }
        }
      ]
    },
    // Soudage → Peinture
    {
      order: 2,
      fromNodeId: 'step-soudage',
      toNodeId: 'step-peinture',
      intermediateElements: [
        {
          order: 1,
          type: 'MATERIAL_FLOW',
          materialFlow: {
            id: 'flow-2',
            flowType: FlowType.PUSH,
            method: 'Lot de 50 pièces'
          }
        },
        {
          order: 2,
          type: 'INVENTORY',
          inventory: {
            id: 'inv-wip2',
            name: 'En-Cours Soudage',
            type: InventoryType.WIP,
            // GASPILLAGE CRITIQUE: Stock très élevé > 7 jours
            quantity: 3840, // 8 jours - accumulation avant goulot
            duration: 8,
            indicators: []
          }
        }
      ]
    },
    // Peinture → Assemblage
    {
      order: 3,
      fromNodeId: 'step-peinture',
      toNodeId: 'step-assemblage',
      intermediateElements: [
        {
          order: 1,
          type: 'MATERIAL_FLOW',
          materialFlow: {
            id: 'flow-3',
            flowType: FlowType.PUSH,
            method: 'Transfert par lot'
          }
        },
        {
          order: 2,
          type: 'INVENTORY',
          inventory: {
            id: 'inv-wip3',
            name: 'En-Cours Peinture',
            type: InventoryType.WIP,
            quantity: 480, // 1 jour
            duration: 1,
            indicators: []
          }
        }
      ]
    },
    // Assemblage → Client
    {
      order: 4,
      fromNodeId: 'step-assemblage',
      toNodeId: 'customer',
      intermediateElements: [
        {
          order: 1,
          type: 'INVENTORY',
          inventory: {
            id: 'inv-pf',
            name: 'Stock Produits Finis',
            type: InventoryType.FINISHED_GOODS,
            // GASPILLAGE: Stock PF élevé
            quantity: 1440, // 3 jours
            duration: 3,
            indicators: []
          }
        }
      ]
    }
  ],

  informationFlows: [
    {
      id: 'info-cmd-client',
      sourceNodeId: 'customer',
      targetNodeId: 'step-decoupe', // Direct au premier poste - pas de planification centrale
      transmissionType: TransmissionType.MANUAL, // Manuel = opportunité
      description: 'Commandes clients',
      frequency: 'Hebdomadaire'
    }
  ],

  improvementPoints: [],
  textAnnotations: []
}

/**
 * Résumé des problèmes dans ce diagramme:
 * 
 * GOULOTS (2):
 * 1. Soudage: CT 90s > Takt Time 60s (50% au-dessus) - CRITIQUE
 * 2. Peinture: CT 55s proche du Takt Time 60s (92%) - ALERTE
 * 
 * GASPILLAGES (6):
 * 1. Stock MP: 5 jours > 3 jours objectif
 * 2. En-Cours Soudage: 8 jours > 7 jours critique
 * 3. Stock PF: 3 jours (limite)
 * 4. Disponibilité Soudage: 75% < 85%
 * 5. Taux rebut Soudage: 4.5% > 2%
 * 6. Surstock: quantités > 1000 unités
 * 
 * OPPORTUNITÉS (3):
 * 1. Tous les flux en PUSH - passer en PULL
 * 2. Pas de centre de contrôle
 * 3. Information manuelle - passer en électronique
 */

export default demoDiagramWithProblems
