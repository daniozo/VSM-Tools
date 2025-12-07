/**
 * Bibliothèque d'indicateurs standards pour le VSM
 * 
 * Cette bibliothèque fournit une liste prédéfinie d'indicateurs issus
 * de la méthodologie Lean et du VSM, offrant un langage commun pour
 * l'amélioration continue.
 * 
 * @date 7 décembre 2025
 * @see collection_indicateurs.md
 */

/**
 * Catégories d'indicateurs
 */
export type IndicatorCategory = 'Temps' | 'Qualité' | 'Ressources' | 'Efficacité'

/**
 * Interface pour un indicateur standard
 */
export interface StandardIndicator {
  /** Identifiant unique de l'indicateur standard */
  id: string
  /** Nom de l'indicateur (français) */
  name: string
  /** Nom technique (anglais) */
  technicalName: string
  /** Catégorie de l'indicateur */
  category: IndicatorCategory
  /** Unité de mesure */
  unit: string
  /** Description détaillée */
  description: string
  /** Mode de récupération par défaut */
  defaultMode: 'Statique' | 'Dynamique' | 'Manuel'
  /** Sources de données potentielles (pour aide) */
  potentialSources: string[]
}

/**
 * Liste des indicateurs standards organisés par catégorie
 */
export const STANDARD_INDICATORS: StandardIndicator[] = [
  // ============================================================================
  // CATÉGORIE 1 : INDICATEURS DE TEMPS (Le Cœur du VSM)
  // ============================================================================
  {
    id: 'std_cycle_time',
    name: 'Temps de Cycle',
    technicalName: 'Cycle Time (C/T)',
    category: 'Temps',
    unit: 'secondes',
    description: 'Temps réel nécessaire pour réaliser toutes les opérations d\'une étape sur une seule unité. C\'est le temps de travail effectif.',
    defaultMode: 'Dynamique',
    potentialSources: ['MES', 'SCADA', 'Chronométrage manuel']
  },
  {
    id: 'std_changeover_time',
    name: 'Temps de Changement de Série',
    technicalName: 'Changeover Time (C/O)',
    category: 'Temps',
    unit: 'minutes',
    description: 'Temps total écoulé entre la production de la dernière bonne pièce d\'une série A et la première bonne pièce d\'une série B.',
    defaultMode: 'Manuel',
    potentialSources: ['MES', 'Logiciel de planification']
  },
  {
    id: 'std_production_rate',
    name: 'Taux de Production',
    technicalName: 'Production Rate',
    category: 'Temps',
    unit: 'unités/heure',
    description: 'Le nombre d\'unités produites par une étape sur une période donnée (heure, jour).',
    defaultMode: 'Dynamique',
    potentialSources: ['MES', 'Compteurs d\'automates']
  },
  {
    id: 'std_takt_time',
    name: 'Temps Takt',
    technicalName: 'Takt Time',
    category: 'Temps',
    unit: 'secondes',
    description: 'Ce n\'est pas un indicateur de processus, mais une cible. C\'est le rythme auquel le client demande les produits (Temps disponible / Demande client).',
    defaultMode: 'Dynamique',
    potentialSources: ['ERP (demande)', 'Données de production (temps disponible)']
  },
  {
    id: 'std_lead_time',
    name: 'Lead Time',
    technicalName: 'Lead Time (L/T)',
    category: 'Temps',
    unit: 'jours',
    description: 'Temps total de traversée d\'une pièce à travers l\'ensemble du processus, incluant les temps d\'attente et de stockage.',
    defaultMode: 'Dynamique',
    potentialSources: ['MES', 'ERP', 'Calcul VSM']
  },
  {
    id: 'std_processing_time',
    name: 'Temps de Transformation',
    technicalName: 'Processing Time (P/T)',
    category: 'Temps',
    unit: 'minutes',
    description: 'Temps réel pendant lequel la pièce est effectivement transformée (valeur ajoutée).',
    defaultMode: 'Dynamique',
    potentialSources: ['MES', 'Chronométrage']
  },
  {
    id: 'std_wait_time',
    name: 'Temps d\'Attente',
    technicalName: 'Wait Time',
    category: 'Temps',
    unit: 'heures',
    description: 'Temps pendant lequel la pièce attend entre deux opérations (non-valeur ajoutée).',
    defaultMode: 'Dynamique',
    potentialSources: ['MES', 'Calcul (Lead Time - Processing Time)']
  },

  // ============================================================================
  // CATÉGORIE 2 : INDICATEURS DE QUALITÉ
  // ============================================================================
  {
    id: 'std_first_pass_yield',
    name: 'Rendement Première Passe',
    technicalName: 'First Pass Yield (FPY)',
    category: 'Qualité',
    unit: '%',
    description: 'Pourcentage d\'unités qui traversent une étape et sont conformes du premier coup, sans aucune retouche.',
    defaultMode: 'Dynamique',
    potentialSources: ['Système de contrôle qualité (QMS)', 'MES']
  },
  {
    id: 'std_scrap_rate',
    name: 'Taux de Rebut',
    technicalName: 'Scrap Rate',
    category: 'Qualité',
    unit: '%',
    description: 'Pourcentage d\'unités qui sont déclarées non conformes et jetées à une étape donnée.',
    defaultMode: 'Dynamique',
    potentialSources: ['QMS', 'MES', 'ERP (déclarations de rebut)']
  },
  {
    id: 'std_rework_rate',
    name: 'Taux de Retouche',
    technicalName: 'Rework Rate',
    category: 'Qualité',
    unit: '%',
    description: 'Pourcentage d\'unités qui nécessitent une ou plusieurs opérations supplémentaires pour devenir conformes.',
    defaultMode: 'Dynamique',
    potentialSources: ['QMS', 'MES']
  },
  {
    id: 'std_defect_rate',
    name: 'Taux de Défauts',
    technicalName: 'Defect Rate',
    category: 'Qualité',
    unit: 'ppm',
    description: 'Nombre de défauts par million d\'opportunités (Parts Per Million).',
    defaultMode: 'Dynamique',
    potentialSources: ['QMS', 'SPC']
  },
  {
    id: 'std_quality_rate',
    name: 'Taux de Qualité',
    technicalName: 'Quality Rate',
    category: 'Qualité',
    unit: '%',
    description: 'Pourcentage de pièces conformes produites par rapport au total.',
    defaultMode: 'Dynamique',
    potentialSources: ['MES', 'QMS']
  },

  // ============================================================================
  // CATÉGORIE 3 : INDICATEURS DE RESSOURCES ET D'EFFICACITÉ
  // ============================================================================
  {
    id: 'std_uptime',
    name: 'Taux de Disponibilité',
    technicalName: 'Uptime / Availability',
    category: 'Efficacité',
    unit: '%',
    description: 'Pourcentage du temps planifié où l\'équipement est effectivement capable de produire (non en panne, non en changement de série...).',
    defaultMode: 'Dynamique',
    potentialSources: ['MES', 'Système de suivi OEE']
  },
  {
    id: 'std_oee',
    name: 'TRS / OEE',
    technicalName: 'Overall Equipment Effectiveness',
    category: 'Efficacité',
    unit: '%',
    description: 'Le "roi des indicateurs". Indicateur composite mesurant l\'efficacité globale d\'un équipement. OEE = Disponibilité × Performance × Qualité.',
    defaultMode: 'Dynamique',
    potentialSources: ['MES (calcul automatique)', 'Calcul depuis 3 métriques sources']
  },
  {
    id: 'std_performance_rate',
    name: 'Taux de Performance',
    technicalName: 'Performance Rate',
    category: 'Efficacité',
    unit: '%',
    description: 'Rapport entre la cadence réelle et la cadence nominale (théorique) de l\'équipement.',
    defaultMode: 'Dynamique',
    potentialSources: ['MES', 'SCADA']
  },
  {
    id: 'std_operators',
    name: 'Nombre d\'Opérateurs',
    technicalName: 'Number of Operators',
    category: 'Ressources',
    unit: 'personnes',
    description: 'Le nombre de personnes requises pour faire fonctionner l\'étape de processus.',
    defaultMode: 'Statique',
    potentialSources: ['Donnée statique', 'Logiciel de gestion du personnel']
  },
  {
    id: 'std_batch_size',
    name: 'Taille de Lot',
    technicalName: 'Batch Size',
    category: 'Ressources',
    unit: 'unités',
    description: 'Le nombre d\'unités produites en une seule fois avant de passer à un autre type de produit.',
    defaultMode: 'Dynamique',
    potentialSources: ['ERP (gamme de production)', 'MES']
  },
  {
    id: 'std_shifts',
    name: 'Nombre de Shifts',
    technicalName: 'Number of Shifts',
    category: 'Ressources',
    unit: 'équipes',
    description: 'Le nombre d\'équipes de travail par jour (1, 2 ou 3 shifts).',
    defaultMode: 'Statique',
    potentialSources: ['Donnée statique', 'Planning RH']
  },
  {
    id: 'std_working_hours',
    name: 'Heures de Travail',
    technicalName: 'Working Hours',
    category: 'Ressources',
    unit: 'heures',
    description: 'Nombre d\'heures de travail disponibles par jour.',
    defaultMode: 'Statique',
    potentialSources: ['Planning', 'Convention collective']
  },

  // ============================================================================
  // INDICATEURS SUPPLÉMENTAIRES (Usage courant en industrie)
  // ============================================================================
  {
    id: 'std_mtbf',
    name: 'MTBF',
    technicalName: 'Mean Time Between Failures',
    category: 'Efficacité',
    unit: 'heures',
    description: 'Temps moyen entre deux pannes. Indicateur de fiabilité de l\'équipement.',
    defaultMode: 'Dynamique',
    potentialSources: ['GMAO', 'MES']
  },
  {
    id: 'std_mttr',
    name: 'MTTR',
    technicalName: 'Mean Time To Repair',
    category: 'Efficacité',
    unit: 'minutes',
    description: 'Temps moyen de réparation après une panne.',
    defaultMode: 'Dynamique',
    potentialSources: ['GMAO', 'MES']
  },
  {
    id: 'std_wip',
    name: 'En-cours (WIP)',
    technicalName: 'Work In Progress',
    category: 'Ressources',
    unit: 'unités',
    description: 'Nombre d\'unités en cours de traitement ou en attente entre deux étapes.',
    defaultMode: 'Dynamique',
    potentialSources: ['MES', 'ERP', 'Comptage manuel']
  },
  {
    id: 'std_inventory_days',
    name: 'Jours de Stock',
    technicalName: 'Inventory Days',
    category: 'Ressources',
    unit: 'jours',
    description: 'Nombre de jours de production couverts par le stock actuel.',
    defaultMode: 'Dynamique',
    potentialSources: ['ERP', 'Calcul (Stock / Demande journalière)']
  },
  {
    id: 'std_energy_consumption',
    name: 'Consommation Énergétique',
    technicalName: 'Energy Consumption',
    category: 'Ressources',
    unit: 'kWh',
    description: 'L\'énergie consommée par l\'équipement pour produire une unité ou par heure.',
    defaultMode: 'Dynamique',
    potentialSources: ['SCADA', 'Capteurs IoT']
  },
  {
    id: 'std_cost_per_unit',
    name: 'Coût par Unité',
    technicalName: 'Cost per Unit',
    category: 'Ressources',
    unit: '€',
    description: 'Le coût de production pour une seule unité à cette étape (main d\'œuvre, matière, énergie...).',
    defaultMode: 'Dynamique',
    potentialSources: ['ERP (calcul de coût de revient)']
  }
]

/**
 * Obtenir les indicateurs par catégorie
 */
export function getIndicatorsByCategory(category: IndicatorCategory): StandardIndicator[] {
  return STANDARD_INDICATORS.filter(ind => ind.category === category)
}

/**
 * Obtenir toutes les catégories disponibles
 */
export function getAllCategories(): IndicatorCategory[] {
  return ['Temps', 'Qualité', 'Efficacité', 'Ressources']
}

/**
 * Rechercher des indicateurs par nom ou description
 */
export function searchIndicators(query: string): StandardIndicator[] {
  const lowerQuery = query.toLowerCase()
  return STANDARD_INDICATORS.filter(ind =>
    ind.name.toLowerCase().includes(lowerQuery) ||
    ind.technicalName.toLowerCase().includes(lowerQuery) ||
    ind.description.toLowerCase().includes(lowerQuery)
  )
}

/**
 * Obtenir un indicateur standard par son ID
 */
export function getStandardIndicatorById(id: string): StandardIndicator | undefined {
  return STANDARD_INDICATORS.find(ind => ind.id === id)
}
