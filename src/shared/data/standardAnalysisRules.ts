/**
 * Bibliothèque de règles d'analyse standards pour le VSM
 * 
 * Ces règles prédéfinies permettent de détecter automatiquement
 * les goulots d'étranglement, les gaspillages et les opportunités
 * d'amélioration selon la méthodologie Lean.
 * 
 * @date 7 décembre 2025
 */

import {
  AnalysisRule,
  AnalysisType,
  WasteType,
  generateId
} from '@/shared/types/vsm-model'

/**
 * Règles standards pré-configurées
 */
export const STANDARD_ANALYSIS_RULES: AnalysisRule[] = [
  // ============================================================================
  // GOULOTS D'ÉTRANGLEMENT
  // ============================================================================
  {
    id: 'rule_bottleneck_cycle_time',
    name: 'Goulot - Temps de Cycle',
    description: 'Détecte les étapes dont le temps de cycle dépasse le Takt Time (demande client)',
    type: AnalysisType.BOTTLENECK,
    condition: {
      indicatorName: 'Temps de Cycle',
      operator: '>',
      value: 0,
      compareToTaktTime: true,
      taktTimePercentage: 100
    },
    enabled: true,
    priority: 1,
    suggestedAction: 'Réduire le temps de cycle par l\'élimination des gaspillages, l\'équilibrage de ligne ou l\'ajout de capacité',
    isSystemRule: true
  },
  {
    id: 'rule_bottleneck_near_takt',
    name: 'Alerte - Proche du Takt Time',
    description: 'Avertit lorsqu\'une étape approche 90% du Takt Time (risque de devenir goulot)',
    type: AnalysisType.BOTTLENECK,
    condition: {
      indicatorName: 'Temps de Cycle',
      operator: '>=',
      value: 0,
      compareToTaktTime: true,
      taktTimePercentage: 90
    },
    enabled: true,
    priority: 2,
    suggestedAction: 'Surveiller cette étape - risque de devenir un goulot en cas de variabilité',
    isSystemRule: true
  },

  // ============================================================================
  // GASPILLAGES - STOCKS EXCESSIFS
  // ============================================================================
  {
    id: 'rule_waste_high_inventory',
    name: 'Stock Excessif (> 3 jours)',
    description: 'Détecte les stocks en-cours supérieurs à 3 jours de production',
    type: AnalysisType.WASTE,
    wasteType: WasteType.INVENTORY,
    condition: {
      indicatorName: 'Jours de Stock',
      operator: '>',
      value: 3
    },
    enabled: true,
    priority: 2,
    suggestedAction: 'Réduire les stocks en implémentant le flux tiré (Kanban) et en réduisant les tailles de lots',
    isSystemRule: true
  },
  {
    id: 'rule_waste_very_high_inventory',
    name: 'Stock Critique (> 7 jours)',
    description: 'Alerte critique pour les stocks dépassant 7 jours de production',
    type: AnalysisType.WASTE,
    wasteType: WasteType.INVENTORY,
    condition: {
      indicatorName: 'Jours de Stock',
      operator: '>',
      value: 7
    },
    enabled: true,
    priority: 1,
    suggestedAction: 'Action urgente requise - analyser les causes racines du surstock',
    isSystemRule: true
  },

  // ============================================================================
  // GASPILLAGES - ATTENTE
  // ============================================================================
  {
    id: 'rule_waste_low_uptime',
    name: 'Disponibilité Faible (< 85%)',
    description: 'Détecte les équipements avec un taux de disponibilité inférieur à 85%',
    type: AnalysisType.WASTE,
    wasteType: WasteType.WAITING,
    condition: {
      indicatorName: 'Taux de Disponibilité',
      operator: '<',
      value: 85
    },
    enabled: true,
    priority: 2,
    suggestedAction: 'Analyser les causes d\'arrêt (pannes, changements de série) et mettre en place un plan de maintenance préventive',
    isSystemRule: true
  },
  {
    id: 'rule_waste_long_changeover',
    name: 'Changement de Série Long',
    description: 'Détecte les temps de changement de série supérieurs à 30 minutes',
    type: AnalysisType.WASTE,
    wasteType: WasteType.WAITING,
    condition: {
      indicatorName: 'Temps de Changement de Série',
      operator: '>',
      value: 30
    },
    enabled: true,
    priority: 2,
    suggestedAction: 'Appliquer la méthodologie SMED pour réduire les temps de changement',
    isSystemRule: true
  },

  // ============================================================================
  // GASPILLAGES - DÉFAUTS
  // ============================================================================
  {
    id: 'rule_waste_low_fpy',
    name: 'Rendement Première Passe Faible (< 95%)',
    description: 'Détecte les étapes avec un FPY inférieur à 95%',
    type: AnalysisType.WASTE,
    wasteType: WasteType.DEFECTS,
    condition: {
      indicatorName: 'Rendement Première Passe',
      operator: '<',
      value: 95
    },
    enabled: true,
    priority: 1,
    suggestedAction: 'Analyser les défauts avec un Pareto, identifier les causes racines (5 Pourquoi), mettre en place des Poka-Yoke',
    isSystemRule: true
  },
  {
    id: 'rule_waste_high_scrap',
    name: 'Taux de Rebut Élevé (> 2%)',
    description: 'Détecte les étapes avec un taux de rebut supérieur à 2%',
    type: AnalysisType.WASTE,
    wasteType: WasteType.DEFECTS,
    condition: {
      indicatorName: 'Taux de Rebut',
      operator: '>',
      value: 2
    },
    enabled: true,
    priority: 1,
    suggestedAction: 'Réduire le rebut par l\'analyse des causes racines et l\'amélioration du processus',
    isSystemRule: true
  },

  // ============================================================================
  // OPPORTUNITÉS D'AMÉLIORATION
  // ============================================================================
  {
    id: 'rule_opportunity_low_oee',
    name: 'TRS/OEE Faible (< 75%)',
    description: 'Identifie les équipements avec un OEE inférieur à 75% (moyenne industrielle)',
    type: AnalysisType.OPPORTUNITY,
    condition: {
      indicatorName: 'TRS / OEE',
      operator: '<',
      value: 75
    },
    enabled: true,
    priority: 2,
    suggestedAction: 'Analyser les pertes OEE (disponibilité, performance, qualité) pour identifier les leviers d\'amélioration',
    isSystemRule: true
  },
  {
    id: 'rule_opportunity_excellent_oee',
    name: 'Potentiel OEE World-Class',
    description: 'Identifie les opportunités d\'atteindre l\'OEE world-class (> 85%)',
    type: AnalysisType.OPPORTUNITY,
    condition: {
      indicatorName: 'TRS / OEE',
      operator: '>=',
      value: 75
    },
    enabled: false, // Désactivé par défaut
    priority: 3,
    suggestedAction: 'Cet équipement peut atteindre le niveau world-class avec des améliorations ciblées',
    isSystemRule: true
  },
  {
    id: 'rule_opportunity_batch_reduction',
    name: 'Taille de Lot Importante',
    description: 'Identifie les opportunités de réduction de taille de lot',
    type: AnalysisType.OPPORTUNITY,
    condition: {
      indicatorName: 'Taille de Lot',
      operator: '>',
      value: 100
    },
    enabled: true,
    priority: 3,
    suggestedAction: 'Réduire la taille de lot pour améliorer le flux et réduire le lead time',
    isSystemRule: true
  },

  // ============================================================================
  // GASPILLAGES - SURPRODUCTION
  // ============================================================================
  {
    id: 'rule_waste_overproduction',
    name: 'Surproduction Potentielle',
    description: 'Détecte les étapes produisant plus que la demande (taux de production > Takt Time inversé)',
    type: AnalysisType.WASTE,
    wasteType: WasteType.OVERPRODUCTION,
    condition: {
      indicatorName: 'Taux de Production',
      operator: '>',
      value: 0,
      compareToTaktTime: true,
      taktTimePercentage: 120 // Produit 20% de plus que nécessaire
    },
    enabled: true,
    priority: 2,
    suggestedAction: 'Aligner la production sur la demande client, éviter de "pousser" la production',
    isSystemRule: true
  }
]

/**
 * Obtenir toutes les règles standards
 */
export function getAllStandardRules(): AnalysisRule[] {
  return STANDARD_ANALYSIS_RULES.map(rule => ({
    ...rule,
    id: generateId('rule') // Générer un nouvel ID pour éviter les conflits
  }))
}

/**
 * Obtenir les règles par type
 */
export function getRulesByType(type: AnalysisType): AnalysisRule[] {
  return STANDARD_ANALYSIS_RULES.filter(rule => rule.type === type)
}

/**
 * Obtenir les règles par type de gaspillage
 */
export function getRulesByWasteType(wasteType: WasteType): AnalysisRule[] {
  return STANDARD_ANALYSIS_RULES.filter(
    rule => rule.type === AnalysisType.WASTE && rule.wasteType === wasteType
  )
}

/**
 * Créer une règle personnalisée vide
 */
export function createEmptyRule(): AnalysisRule {
  return {
    id: generateId('rule'),
    name: '',
    description: '',
    type: AnalysisType.BOTTLENECK,
    condition: {
      operator: '>',
      value: 0
    },
    enabled: true,
    priority: 2,
    isSystemRule: false
  }
}
