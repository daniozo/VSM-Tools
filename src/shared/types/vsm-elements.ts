/**
 * Types pour les éléments de base d'une carte VSM
 */

/**
 * Métadonnées de la carte VSM
 */
export interface MapMetaData {
  /** Nom de la carte */
  name: string;
  /** Auteur de la carte */
  author: string;
  /** Date de création */
  createdDate: string;
  /** Date de dernière modification */
  modifiedDate: string;
  /** Version de l'application lors de la création */
  appVersion: string;
  /** Commentaires ou description */
  description?: string;
}

/**
 * Types d'éléments pouvant être ajoutés sur une carte VSM
 */
export enum VsmElementType {
  PROCESS = 'process',
  STOCK = 'stock',
  SUPPLIER = 'supplier',
  CUSTOMER = 'customer',
  FLOW_ARROW = 'flowArrow',
  KAIZEN_BURST = 'kaizenBurst',
  DATA_BOX = 'dataBox',
  TEXT = 'text',
}

/**
 * Types de flux entre éléments
 */
export enum FlowType {
  MATERIAL = 'material',    // Flux de matière
  INFORMATION = 'information', // Flux d'information
  PUSH = 'push',           // Flux poussé
  PULL = 'pull',           // Flux tiré
  FIFO = 'fifo',           // First In First Out
  ELECTRONIC = 'electronic', // Information électronique
}

/**
 * Base pour tous les éléments de la carte
 */
export interface BaseElement {
  /** Identifiant unique de l'élément */
  id: string;
  /** Type d'élément */
  type: VsmElementType;
  /** Position X sur la carte */
  x: number;
  /** Position Y sur la carte */
  y: number;
  /** Largeur de l'élément */
  width: number;
  /** Hauteur de l'élément */
  height: number;
  /** Nom ou libellé de l'élément */
  name: string;
  /** Couleur de fond de l'élément */
  backgroundColor?: string;
  /** Couleur de bordure de l'élément */
  borderColor?: string;
  /** Épaisseur de la bordure */
  borderWidth?: number;
  /** Commentaires ou notes */
  notes?: string;
}

/**
 * Données d'un processus
 */
export interface ProcessData extends BaseElement {
  type: VsmElementType.PROCESS;
  /** Temps de cycle (secondes) */
  cycleTime: number;
  /** Temps à valeur ajoutée (secondes) */
  valueAddedTime: number;
  /** Temps sans valeur ajoutée (secondes) */
  nonValueAddedTime: number;
  /** Nombre d'opérateurs */
  operators: number;
  /** Taux de rendement synthétique (pourcentage) */
  oee?: number;
  /** Disponibilité (pourcentage) */
  availability?: number;
  /** Performance (pourcentage) */
  performance?: number;
  /** Qualité (pourcentage) */
  quality?: number;
  /** Taux de rejet (pourcentage) */
  rejectRate?: number;
  /** Temps de changement de série (secondes) */
  changeoverTime?: number;
  /** Taille de lot */
  batchSize?: number;
  /** Nombre de postes */
  shifts?: number;
  /** Heures de travail par jour */
  workingHours?: number;
}

/**
 * Données d'un stock
 */
export interface StockData extends BaseElement {
  type: VsmElementType.STOCK;
  /** Quantité en stock */
  quantity: number;
  /** Durée de stockage (jours) */
  leadTime: number;
  /** Type de stock (matière première, encours, produit fini) */
  stockType?: string;
  /** Unité de mesure */
  unit?: string;
  /** Gestion du stock (FIFO, LIFO, etc.) */
  management?: string;
  /** Coût unitaire */
  unitCost?: number;
}

/**
 * Données d'un fournisseur
 */
export interface SupplierData extends BaseElement {
  type: VsmElementType.SUPPLIER;
  /** Fréquence de livraison */
  deliveryFrequency?: string;
  /** Délai d'approvisionnement */
  leadTime?: number;
  /** Taux de service */
  serviceRate?: number;
}

/**
 * Données d'un client
 */
export interface CustomerData extends BaseElement {
  type: VsmElementType.CUSTOMER;
  /** Demande journalière */
  dailyDemand?: number;
  /** Takt time (secondes) */
  taktTime?: number;
  /** Unité de mesure */
  unit?: string;
}

/**
 * Données d'une flèche de flux
 */
export interface FlowArrowData extends BaseElement {
  type: VsmElementType.FLOW_ARROW;
  /** ID de l'élément source */
  sourceId: string;
  /** ID de l'élément cible */
  targetId: string;
  /** Type de flux */
  flowType: FlowType;
  /** Points de contrôle de la flèche (pour les courbes) */
  points?: number[][];
  /** Épaisseur de la ligne */
  lineWidth?: number;
}

/**
 * Données d'une opportunité d'amélioration (Kaizen)
 */
export interface KaizenBurstData extends BaseElement {
  type: VsmElementType.KAIZEN_BURST;
  /** Description de l'opportunité */
  description: string;
  /** Priorité (1-5) */
  priority?: number;
  /** IDs des actions associées */
  actionIds?: string[];
}

/**
 * Données d'une boîte de données
 */
export interface DataBoxData extends BaseElement {
  type: VsmElementType.DATA_BOX;
  /** Données à afficher sous forme de liste clé-valeur */
  data: Array<{ key: string, value: string | number }>;
  /** Élément auquel la boîte est rattachée */
  attachedToId?: string;
}

/**
 * Tous les types possibles d'éléments d'une carte VSM
 */
export type VsmElement =
  | ProcessData
  | StockData
  | SupplierData
  | CustomerData
  | FlowArrowData
  | KaizenBurstData
  | DataBoxData;