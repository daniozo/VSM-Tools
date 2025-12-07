/**
 * Modèle de données Model-First pour VSM-Tools
 * 
 * Ce modèle remplace l'approche Canvas-First par une approche Model-First
 * où le modèle de données structuré est la source de vérité et le diagramme
 * est généré automatiquement.
 * 
 * @date 6 décembre 2025
 * @version 1.0
 */

// ============================================================================
// ENUMS
// ============================================================================

/**
 * Types de nœuds dans le diagramme VSM
 */
export enum NodeType {
  /** Fournisseur externe */
  SUPPLIER = 'SUPPLIER',
  /** Étape de production/transformation */
  PROCESS_STEP = 'PROCESS_STEP',
  /** Client externe */
  CUSTOMER = 'CUSTOMER',
  /** Centre de contrôle/pilotage */
  CONTROL_CENTER = 'CONTROL_CENTER'
}

/**
 * Types de stocks (inventaires)
 */
export enum InventoryType {
  /** Matière première */
  RAW_MATERIAL = 'RAW_MATERIAL',
  /** En-cours de production (Work In Progress) */
  WIP = 'WIP',
  /** Produits finis */
  FINISHED_GOODS = 'FINISHED_GOODS',
  /** Stock tampon (supermarché) */
  SUPERMARKET = 'SUPERMARKET'
}

/**
 * Types de flux matériels entre étapes
 */
export enum FlowType {
  /** Flux poussé (production sur prévision) */
  PUSH = 'PUSH',
  /** Flux tiré (production à la demande) */
  PULL = 'PULL',
  /** File d'attente FIFO */
  FIFO_LANE = 'FIFO_LANE',
  /** Système Kanban */
  KANBAN = 'KANBAN'
}

/**
 * Types de transmission pour les flux d'information
 */
export enum TransmissionType {
  /** Système informatique */
  ELECTRONIC = 'ELECTRONIC',
  /** Manuel (papier) */
  MANUAL = 'MANUAL',
  /** Kanban physique */
  KANBAN = 'KANBAN',
  /** Planning périodique */
  SCHEDULE = 'SCHEDULE'
}

/**
 * Types de sources de données pour les indicateurs
 */
export enum DataSourceType {
  /** Base de données SQL (JDBC) */
  SQL = 'SQL',
  /** API REST */
  REST = 'REST',
  /** Valeur statique/fixe */
  STATIC = 'STATIC'
}

/**
 * Types d'authentification pour les API REST
 */
export enum AuthType {
  /** Pas d'authentification */
  NONE = 'NONE',
  /** Clé API dans header */
  API_KEY = 'API_KEY',
  /** Token Bearer */
  BEARER_TOKEN = 'BEARER_TOKEN',
  /** Basic Auth */
  BASIC = 'BASIC'
}

/**
 * Statut d'un point d'amélioration
 */
export enum ImprovementStatus {
  /** Identifié */
  IDENTIFIED = 'IDENTIFIED',
  /** En cours */
  IN_PROGRESS = 'IN_PROGRESS',
  /** Résolu */
  RESOLVED = 'RESOLVED'
}

/**
 * Fréquence de livraison pour le fournisseur
 */
export enum DeliveryFrequency {
  /** Quotidienne */
  DAILY = 'DAILY',
  /** Hebdomadaire */
  WEEKLY = 'WEEKLY',
  /** Mensuelle */
  MONTHLY = 'MONTHLY',
  /** Personnalisée */
  CUSTOM = 'CUSTOM'
}

// ============================================================================
// INTERFACES - MÉTADONNÉES & DIAGRAMME
// ============================================================================

/**
 * Métadonnées du diagramme VSM
 * Correspond à l'Onglet 1 : Informations Générales
 */
export interface MetaData {
  /** Nom du diagramme */
  name: string
  /** Description du diagramme (multiligne) */
  description?: string
  /** Version du diagramme (ex: "1.0", "2.1") */
  version: string
  /** Auteur(s) du diagramme */
  author: string
  /** Date de création (ISO 8601) */
  createdDate: string
  /** Date de dernière modification (ISO 8601) */
  modifiedDate: string
  /** Version de l'application qui a créé le diagramme */
  appVersion: string
}

/**
 * Structure complète d'un diagramme VSM
 * Point d'entrée principal du modèle Model-First
 */
export interface VSMDiagram {
  /** Identifiant unique du diagramme */
  id: string

  /** Métadonnées du diagramme */
  metaData: MetaData

  /** Sources de données pour les indicateurs dynamiques */
  dataSources: DataSource[]

  /** Acteurs externes (Supplier, Customer, Control Center) */
  actors: Actors

  /** Nœuds (étapes de production) */
  nodes: Node[]

  /** Séquences de flux de production (ordre et éléments intermédiaires) */
  flowSequences: FlowSequence[]

  /** Flux d'information transverses */
  informationFlows: InformationFlow[]

  /** Points d'amélioration identifiés */
  improvementPoints: ImprovementPoint[]

  /** Annotations textuelles libres */
  textAnnotations: TextAnnotation[]
}

// ============================================================================
// INTERFACES - SOURCES DE DONNÉES (Onglet 2)
// ============================================================================

/**
 * Configuration pour une source de données SQL
 */
export interface SQLConfig {
  /** Type de base de données (PostgreSQL, MySQL, SQLite) */
  dbType: string
  /** Adresse serveur simplifiée (ex: localhost:5432/mydb ou C:/data/file.db pour SQLite) */
  serverUrl: string
  /** Nom d'utilisateur (optionnel pour SQLite) */
  username?: string
  /** Mot de passe chiffré (optionnel pour SQLite) */
  passwordRef?: string
}

/**
 * Configuration pour une source de données REST
 */
export interface RESTConfig {
  /** URL de base de l'API */
  baseUrl: string
  /** Type d'authentification */
  authType: AuthType
  /** Référence au secret d'authentification (ex: "{API_KEY}") */
  authSecretRef?: string
  /** Headers HTTP supplémentaires */
  headers?: Record<string, string>
}

/**
 * Type union pour les configurations de sources de données
 */
export type DataSourceConfig = SQLConfig | RESTConfig

/**
 * Source de données pour les indicateurs dynamiques
 * Correspond à l'Onglet 2 : Sources de Données
 */
export interface DataSource {
  /** Identifiant unique (référencé par les Indicators) */
  id: string
  /** Nom de la source */
  name: string
  /** Type de source */
  type: DataSourceType
  /** Configuration spécifique au type */
  config: DataSourceConfig
  /** Statut de la connexion (testé, OK, erreur) */
  status?: 'UNTESTED' | 'OK' | 'ERROR'
  /** Message d'erreur si status = ERROR */
  errorMessage?: string
}

// ============================================================================
// INTERFACES - DATA CONNECTION
// ============================================================================

/**
 * Configuration de connexion dynamique pour un indicateur
 * Correspond à l'objet DataConnection d'Eclipse
 */
export interface DataConnection {
  /** Référence à la source de données */
  dataSourceId: string
  /** Requête SQL (si DataSource de type SQL) */
  sqlQuery?: string
  /** Endpoint REST (si DataSource de type REST) */
  restEndpoint?: string
  /** JSON Path pour extraire la valeur (si REST) */
  jsonPath?: string
  /** Paramètres additionnels (format: key1=value1;key2=value2) */
  parameters?: string
}

// ============================================================================
// INTERFACES - ACTEURS EXTERNES (Onglet 3)
// ============================================================================

/**
 * Configuration du fournisseur (Supplier)
 */
export interface Supplier {
  /** Nom du fournisseur */
  name: string
  /** Contact du fournisseur */
  contact?: string
  /** Fréquence de livraison */
  deliveryFrequency: DeliveryFrequency
  /** Fréquence personnalisée (si deliveryFrequency = CUSTOM) */
  customFrequency?: string
  /** Délai de livraison (en jours) */
  leadTime: number
}

/**
 * Configuration du client (Customer)
 */
export interface Customer {
  /** Nom du client */
  name: string
  /** Contact du client */
  contact?: string
  /** Demande quotidienne (unités/jour) */
  dailyDemand: number
  /** Heures de travail disponibles par jour (ex: 8h = 8) */
  workingHoursPerDay?: number
  /** Takt Time calculé (secondes par unité) = (workingHoursPerDay * 3600) / dailyDemand */
  taktTime: number
}

/**
 * Configuration du centre de contrôle (Control Center)
 */
export interface ControlCenter {
  /** Nom du centre de contrôle */
  name: string
  /** Description du système de pilotage */
  description?: string
}

/**
 * Ensemble des acteurs externes
 * Correspond à l'Onglet 3 : Acteurs Externes
 */
export interface Actors {
  /** Fournisseur */
  supplier: Supplier
  /** Client */
  customer: Customer
  /** Centre de contrôle */
  controlCenter?: ControlCenter
}

// ============================================================================
// INTERFACES - NŒUDS & ÉTAPES (Onglet 4)
// ============================================================================

/**
 * Nœud du diagramme (Supplier, Process Step, Customer, Control Center)
 * Correspond à l'Onglet 4 : Étapes de Production
 */
export interface Node {
  /** Identifiant unique */
  id: string
  /** Nom du nœud */
  name: string
  /** Type de nœud */
  type: NodeType
  /** Nombre d'opérateurs (seulement pour PROCESS_STEP) */
  operators?: number
  /** Indicateurs attachés à ce nœud */
  indicators: Indicator[]
}

// ============================================================================
// INTERFACES - INDICATEURS (Onglet 5)
// ============================================================================

/**
 * Configuration d'une requête SQL pour un indicateur
 */
export interface SQLIndicatorConfig {
  /** Requête SQL à exécuter */
  query: string
}

/**
 * Configuration d'une requête REST pour un indicateur
 */
export interface RESTIndicatorConfig {
  /** Endpoint à appeler (relatif au baseUrl) */
  endpoint: string
  /** Méthode HTTP */
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  /** Corps de la requête (pour POST/PUT) */
  body?: string
  /** JSONPath pour extraire la valeur de la réponse */
  jsonPath?: string
}

/**
 * Type union pour les configurations d'indicateurs
 */
export type IndicatorConfig = SQLIndicatorConfig | RESTIndicatorConfig

/**
 * Indicateur (KPI) attaché à un nœud ou un stock
 * Correspond à l'Onglet 5 : Indicateurs
 */
export interface Indicator {
  /** Identifiant unique */
  id: string
  /** Nom de l'indicateur (ex: "Cycle Time", "Uptime", "TRS") */
  name: string
  /** Unité de mesure (ex: "min", "%", "unités") */
  unit: string
  /** Mode de récupération: "Statique", "Dynamique" ou "Manuel" */
  mode: 'Statique' | 'Dynamique' | 'Manuel'
  /** Valeur statique ou manuelle (si mode = "Statique" ou "Manuel") */
  value?: string
  /** Configuration de connexion dynamique (si mode = "Dynamique") */
  dataConnection?: DataConnection
  /** Date de dernière mise à jour */
  lastUpdated?: string
}

// ============================================================================
// INTERFACES - SÉQUENCES & FLUX (Onglets 6, 7, 8)
// ============================================================================

/**
 * Stock (inventaire) entre deux nœuds
 * Correspond à l'Onglet 6 : Stocks
 */
export interface Inventory {
  /** Identifiant unique */
  id: string
  /** Nom du stock */
  name: string
  /** Type de stock */
  type: InventoryType
  /** Quantité en stock (nombre d'unités) */
  quantity: number
  /** Durée équivalente (en jours) */
  duration: number
  /** Référence à une source de données (pour valeurs dynamiques) */
  dataSourceId?: string
  /** Indicateurs attachés à ce stock */
  indicators: Indicator[]
}

/**
 * Flux matériel entre deux nœuds
 * Correspond à l'Onglet 7 : Flux Matériels
 */
export interface MaterialFlow {
  /** Identifiant unique */
  id: string
  /** Type de flux */
  flowType: FlowType
  /** Description/méthode du flux (ex: "Kanban avec 3 cartes") */
  method?: string
}

/**
 * Élément intermédiaire dans une séquence de flux
 * Peut être un stock ou un flux matériel
 */
export interface IntermediateElement {
  /** Position dans la liste d'éléments intermédiaires */
  order: number
  /** Type d'élément (INVENTORY ou MATERIAL_FLOW) */
  type: 'INVENTORY' | 'MATERIAL_FLOW'
  /** Stock (si type = INVENTORY) */
  inventory?: Inventory
  /** Flux matériel (si type = MATERIAL_FLOW) */
  materialFlow?: MaterialFlow
}

/**
 * Séquence de flux de production
 * Définit l'ordre des nœuds et les éléments intermédiaires
 */
export interface FlowSequence {
  /** Position dans la séquence globale (0, 1, 2...) */
  order: number
  /** ID du nœud source */
  fromNodeId: string
  /** ID du nœud cible */
  toNodeId: string
  /** Éléments intermédiaires (stocks, flux) */
  intermediateElements: IntermediateElement[]
}

/**
 * Flux d'information transverse
 * Correspond à l'Onglet 8 : Flux d'Information
 */
export interface InformationFlow {
  /** Identifiant unique */
  id: string
  /** Description du flux (ex: "Planning de Production", "Commande Client") */
  description: string
  /** ID du nœud source */
  sourceNodeId: string
  /** ID du nœud cible */
  targetNodeId: string
  /** Type de transmission */
  transmissionType: TransmissionType
  /** Fréquence de transmission (ex: "Quotidien", "Par lot", "Temps réel") */
  frequency?: string
}

// ============================================================================
// INTERFACES - AMÉLIORATIONS & ANNOTATIONS
// ============================================================================

/**
 * Point d'amélioration identifié (Kaizen Burst)
 */
export interface ImprovementPoint {
  /** Identifiant unique */
  id: string
  /** Description de l'amélioration */
  description: string
  /** Position X sur le canvas (pour placement libre) */
  x: number
  /** Position Y sur le canvas */
  y: number
  /** Priorité (1 = haute, 2 = moyenne, 3 = basse) */
  priority?: number
  /** Responsable */
  owner?: string
  /** Date d'échéance (ISO 8601) */
  dueDate?: string
  /** Statut */
  status?: ImprovementStatus
}

/**
 * Annotation textuelle libre
 */
export interface TextAnnotation {
  /** Identifiant unique */
  id: string
  /** Contenu du texte */
  content: string
  /** Position X sur le canvas */
  x: number
  /** Position Y sur le canvas */
  y: number
  /** Largeur (optionnelle) */
  width?: number
  /** Hauteur (optionnelle) */
  height?: number
  /** Couleur du texte */
  color?: string
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Vérifie si une config est de type SQLConfig
 */
export function isSQLConfig(config: DataSourceConfig): config is SQLConfig {
  return 'dbType' in config && 'serverUrl' in config
}

/**
 * Vérifie si une config est de type RESTConfig
 */
export function isRESTConfig(config: DataSourceConfig): config is RESTConfig {
  return 'baseUrl' in config
}

/**
 * Vérifie si un indicateur config est de type SQLIndicatorConfig
 */
export function isSQLIndicatorConfig(config: IndicatorConfig): config is SQLIndicatorConfig {
  return 'query' in config
}

/**
 * Vérifie si un indicateur config est de type RESTIndicatorConfig
 */
export function isRESTIndicatorConfig(config: IndicatorConfig): config is RESTIndicatorConfig {
  return 'endpoint' in config
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Crée un MetaData par défaut
 */
export function createDefaultMetaData(name: string, author: string): MetaData {
  const now = new Date().toISOString()
  return {
    name,
    description: '',
    version: '1.0',
    author,
    createdDate: now,
    modifiedDate: now,
    appVersion: '1.0.0'
  }
}

/**
 * Crée un VSMDiagram vide
 */
export function createEmptyVSMDiagram(name: string, author: string): VSMDiagram {
  return {
    id: `vsm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    metaData: createDefaultMetaData(name, author),
    dataSources: [],
    actors: {
      supplier: {
        name: 'Fournisseur',
        deliveryFrequency: DeliveryFrequency.WEEKLY,
        leadTime: 7
      },
      customer: {
        name: 'Client',
        dailyDemand: 100,
        workingHoursPerDay: 8,
        taktTime: 288 // (8 * 3600) / 100 = 288 seconds per unit
      }
    },
    nodes: [],
    flowSequences: [],
    informationFlows: [],
    improvementPoints: [],
    textAnnotations: []
  }
}

/**
 * Génère un nouvel ID unique
 */
export function generateId(prefix: string = 'id'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}
