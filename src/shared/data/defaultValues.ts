/**
 * Valeurs par défaut pour un nouveau diagramme VSM
 * 
 * Ces valeurs sont automatiquement ajoutées lors de la création d'un projet
 * pour faciliter le démarrage avec le VSM.
 */

import { STANDARD_ANALYSIS_RULES } from './standardAnalysisRules';
import type {
  AnalysisConfig,
  Inventory,
  InventoryType,
  DataSourceMode
} from '@/shared/types/vsm-model';

/**
 * Configuration d'analyse par défaut
 * Utilise les règles standards avec analyse automatique activée
 */
export function getDefaultAnalysisConfig(): AnalysisConfig {
  return {
    rules: STANDARD_ANALYSIS_RULES.map(rule => ({ ...rule })),
    autoAnalyzeOnLoad: true,
    showAlertsOnDiagram: true
  };
}

/**
 * Stock initial par défaut (matière première)
 */
export function getDefaultInitialInventory(): Inventory {
  return {
    id: `inv_initial_${Date.now()}`,
    type: InventoryType.RAW_MATERIAL,
    name: 'Stock Initial',
    location: 'Entrée',
    quantity: 0,
    unit: 'pièces',
    daysOfStock: 0,
    mode: 'static' as DataSourceMode
  };
}

/**
 * Stock final par défaut (produits finis)
 */
export function getDefaultFinalInventory(): Inventory {
  return {
    id: `inv_final_${Date.now()}`,
    type: InventoryType.FINISHED_GOODS,
    name: 'Stock Final',
    location: 'Sortie',
    quantity: 0,
    unit: 'pièces',
    daysOfStock: 0,
    mode: 'static' as DataSourceMode
  };
}

/**
 * Configuration complète par défaut pour un nouveau projet
 */
export function getDefaultProjectConfiguration() {
  return {
    metaData: {
      name: 'Nouveau Diagramme VSM',
      description: '',
      version: '1.0',
      author: '',
      createdDate: new Date().toISOString(),
      modifiedDate: new Date().toISOString(),
      appVersion: '1.0.0'
    },
    dataSources: [],
    actors: {
      supplier: {
        name: '',
        contact: '',
        deliveryFrequency: 'DAILY',
        leadTime: 0
      },
      customer: {
        name: '',
        contact: '',
        dailyDemand: 0,
        taktTime: 0
      }
    },
    nodes: [],
    flowSequences: [],
    informationFlows: [],
    improvementPoints: [],
    textAnnotations: [],
    analysisConfig: getDefaultAnalysisConfig()
  };
}
