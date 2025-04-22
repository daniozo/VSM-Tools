/**
 * Type pour la structure complète d'une carte VSM
 */
import { MapMetaData, VsmElement } from './vsm-elements';

/**
 * États possibles d'une carte VSM
 */
export enum VsmMapState {
  CURRENT = 'current',  // État actuel
  FUTURE = 'future',    // État futur
}

/**
 * Action du plan d'action associé à la carte
 */
export interface ActionItem {
  /** Identifiant unique de l'action */
  id: string;
  /** ID de l'opportunité Kaizen associée */
  kaizenId?: string;
  /** Description de l'action */
  description: string;
  /** Personne responsable */
  owner: string;
  /** Date d'échéance */
  dueDate: string;
  /** Date de début */
  startDate?: string;
  /** Date de fin réelle */
  completionDate?: string;
  /** Statut (ex: 'pending', 'in_progress', 'completed') */
  status: string;
  /** Pourcentage d'avancement */
  progress?: number;
  /** Notes ou commentaires */
  notes?: string;
}

/**
 * Paramètres globaux de la carte VSM
 */
export interface VsmSettings {
  /** Temps disponible quotidien (secondes) */
  availableTime?: number;
  /** Demande client quotidienne (unités) */
  customerDemand?: number;
  /** Unité de temps (secondes, minutes, heures) */
  timeUnit?: string;
  /** Unité de quantité */
  quantityUnit?: string;
  /** Format d'affichage des dates */
  dateFormat?: string;
  /** Nombre de décimales pour les valeurs numériques */
  decimalPlaces?: number;
  /** Couleurs des éléments par défaut */
  defaultColors?: {
    process?: string;
    stock?: string;
    supplier?: string;
    customer?: string;
    kaizenBurst?: string;
    dataBox?: string;
  };
}

/**
 * Structure complète d'une carte VSM
 */
export interface VsmMap {
  /** Identifiant unique de la carte */
  id: string;
  /** Métadonnées de la carte */
  metaData: MapMetaData;
  /** État de la carte (actuel ou futur) */
  state: VsmMapState;
  /** ID de la carte associée (état futur -> état actuel ou vice-versa) */
  relatedMapId?: string;
  /** Paramètres globaux de la carte */
  settings: VsmSettings;
  /** Éléments de la carte */
  elements: VsmElement[];
  /** Actions associées à la carte */
  actions?: ActionItem[];
  /** Indicateurs calculés */
  indicators?: {
    /** Temps de traversée total (secondes) */
    totalLeadTime?: number;
    /** Temps à valeur ajoutée total (secondes) */
    totalValueAddedTime?: number;
    /** Pourcentage de valeur ajoutée */
    valueAddedPercentage?: number;
    /** Takt time calculé (secondes) */
    taktTime?: number;
    /** ID des processus identifiés comme goulots */
    bottleneckProcessIds?: string[];
  };
}

/**
 * Statistiques comparatives entre l'état actuel et futur
 */
export interface VsmComparison {
  /** ID de la carte d'état actuel */
  currentMapId: string;
  /** ID de la carte d'état futur */
  futureMapId: string;
  /** Comparaison des indicateurs */
  indicators: {
    /** Réduction du temps de traversée (pourcentage) */
    leadTimeReduction: number;
    /** Augmentation du pourcentage de valeur ajoutée (points de pourcentage) */
    valueAddedImprovement: number;
    /** Réduction des stocks (pourcentage) */
    inventoryReduction: number;
    /** Amélioration de la capacité (pourcentage) */
    capacityImprovement: number;
  };
}