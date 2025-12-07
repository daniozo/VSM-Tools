# Migration vers l'Approche Model-First

**Date** : 6 décembre 2025  
**Auteur** : Équipe VSM-Tools  
**Version** : 1.0

---

## 📋 Contexte

Le projet VSM-Tools Electron a été initialement développé avec une approche **"Canvas-First"** (drag & drop libre sur un canvas). Cependant, le document de conception officiel (`conception_vsm_studio.md`) spécifie une approche **"Model-First"** fondamentalement différente.

Cette migration vise à aligner l'implémentation Electron avec la vision architecturale définie dans le document de conception Eclipse RCP.

---

## 🎯 Différences Philosophiques

### ❌ Approche Actuelle (Canvas-First)

**Principe** : L'utilisateur dessine librement sur un canvas
- Drag & drop d'éléments depuis une palette
- Manipulation directe des formes (move, resize)
- Le diagramme est la source de vérité
- Risque d'incohérence métier (ex: relier deux stocks)

**Workflow** :
```
Utilisateur dessine → Crée des formes → Remplit les propriétés → Diagramme final
```

### ✅ Approche Cible (Model-First)

**Principe** : Le modèle de données structuré est la source de vérité
- Configuration via un **Dialogue Central** multi-onglets
- L'utilisateur construit le modèle via des formulaires guidés
- Le diagramme est **généré automatiquement** par un algorithme de layout
- Garantie de cohérence métier par construction

**Workflow** :
```
Utilisateur configure le modèle → Validation → Génération automatique → Diagramme final
```

**Avantages** :
- ✅ Impossible de créer un VSM sémantiquement incorrect
- ✅ Guidage actif de l'utilisateur
- ✅ Qualité et standardisation garanties
- ✅ Focus sur le métier, pas sur le dessin

---

## 🏗️ Architecture Cible

### Structure de l'Interface Principale

```
┌────────────────────────────────────────────────────────────┐
│ Barre de Menus (Fichier, Édition, Affichage, Projet...)  │
├────────────────────────────────────────────────────────────┤
│ Toolbar (Nouveau, Enregistrer, Annuler, Rétablir...)      │
├──────────────┬────────────────────────────┬────────────────┤
│              │                            │                │
│ Explorateur  │      Canvas Central        │  Propriétés   │
│ de Projets   │   (Mode Rendu Seul)        │   (Lecture)   │
│  (Gauche)    │                            │   (Droite)    │
│              │  [Diagramme Généré]        │                │
│  📁 Projet1  │                            │  Nom: Step1   │
│    📄 .vsmx  │  [Supplier] → [Step1] →   │  Type: Process│
│      👤 Acteurs                            │  Opérateurs: 2│
│      ⚙️  Étapes │  [Step2] → [Customer]    │                │
│    📝 notes  │                            │                │
│              │                            │                │
└──────────────┴────────────────────────────┴────────────────┘
│ Barre d'État (Projet actif, Statut sync, Zoom...)        │
└────────────────────────────────────────────────────────────┘
```

---

## 📊 État Actuel de l'Implémentation Electron

### ✅ Ce qui existe déjà

#### Services Métier
- ✅ `CalculationService` : Tous les calculs VSM (VA%, Lead Time, Takt Time, TRS...)
- ✅ `StorageService` : Sauvegarde locale (électron-store)
- ✅ `ApiService` : Structure pour l'intégration backend

#### Composants UI (shadcn/ui)
- ✅ Button, Card, Dialog, Input, Select
- ✅ Sonner (notifications)
- ✅ Système de thème (clair/sombre)

#### Store Zustand
- ✅ Gestion des éléments VSM
- ✅ Sélection d'éléments
- ✅ Outils actifs

#### Types TypeScript
- ✅ `VsmElementType` (enum)
- ✅ `ProcessData`, `StockData`
- ✅ `VsmMap`, `MapMetaData`
- ✅ `FlowType`

### ⚠️ Ce qui doit être refait

#### Canvas
- ❌ Actuellement : Drag & drop libre avec maxGraph
- ✅ Cible : Mode "rendu seul" qui affiche le layout calculé

#### Modèle de Données
- ❌ Actuellement : Éléments indépendants sans hiérarchie
- ✅ Cible : Modèle structuré avec DataSources, Nodes, Sequences, Indicators

#### Interface
- ❌ Actuellement : Palette d'outils + Canvas central
- ✅ Cible : Explorateur + Canvas + Propriétés + Dialogue Central

---

## 🎨 Le Dialogue de Configuration Central

### Vue d'Ensemble

Le Dialogue Central est **LA** interface principale pour construire/éditer un diagramme VSM. C'est une fenêtre modale avec :
- **Barre d'onglets verticale** (gauche)
- **Zone de contenu** (droite) affichant le formulaire de l'onglet actif
- **Boutons d'action** (bas) : OK, Appliquer, Annuler

### Structure des Onglets (MISE À JOUR)

D'après le code source actuel (`ConfigurationDialog.java`), l'implémentation a **8 onglets** (et non 6 comme dans le document original). Voici la structure complète :

**Ordre des onglets dans le code** :
1. `createGeneralInfoTab()` - Informations Générales
2. `createDataSourcesTab()` - Sources de Données
3. `createActorsTab()` - Acteurs Externes (Supplier, Customer, Control Center)
4. `createProcessStepsTab()` - Étapes de Production
5. `createIndicatorsTab()` - Indicateurs (KPIs)
6. `createInventoriesTab()` - Stocks (Initial, Final, Between Steps)
7. `createMaterialFlowsTab()` - Flux Matériels
8. `createInfoFlowsTab()` - Flux d'Information

---

#### Onglet 1 : Informations Générales
**Rôle** : Métadonnées du diagramme

**Champs** :
- Nom du Diagramme (obligatoire)
- Description (multiligne)
- Version (ex: "1.0")
- Auteur(s)
- Date de création (lecture seule)
- Date de modification (lecture seule)

#### Onglet 2 : Sources de Données
**Rôle** : Bibliothèque de connexions aux systèmes externes

**Interface** :
- Table : `ID | Type | Statut`
- Actions : Ajouter, Modifier, Supprimer, **Tester la Connexion**

**Types supportés** :
- `SQL` (JDBC) : URL, Driver, User, Password (référence secret)
- `REST` : URL Base, Auth Type (None, API Key, Bearer Token)
- `STATIC` : Valeur fixe

#### Onglet 3 : Acteurs Externes
**Rôle** : Définir les acteurs externes au processus (Supplier, Customer, Control Center)

**Interface** : Trois sections distinctes avec formulaires

**Section Fournisseur (Supplier)** :
- Nom du fournisseur
- Contact
- Fréquence de livraison (Daily, Weekly, Monthly, Custom)
- Lead Time (délai de livraison)

**Section Client (Customer)** :
- Nom du client
- Contact
- Demande quotidienne (unités/jour)
- Takt Time (temps par unité)

**Section Centre de Contrôle (Control Center)** :
- Nom
- Description du système de pilotage

**Note** : Cet onglet a été ajouté séparément après la conception initiale pour isoler la configuration des acteurs externes.

#### Onglet 4 : Étapes de Production (Process Steps)
**Rôle** : Définir les étapes de traitement/transformation dans le flux de production

**Interface** :
- Table : `Nom | Nombre d'Opérateurs`
- Actions : Ajouter, Modifier, Supprimer, Monter, Descendre (pour réordonner)

**Champs par étape** :
- Nom de l'étape (ex: "Nettoyage", "Façonnage", "Assemblage")
- Nombre d'opérateurs

**Note** : L'ordre des étapes dans cette table définit l'ordre du flux de production principal de gauche à droite.

#### Onglet 5 : Indicateurs (KPIs)
**Rôle** : Attacher les métriques dynamiques aux étapes et stocks

**Interface** : Vue maître-détail
- **Zone Maître** (gauche) : Liste des Étapes et Stocks
- **Zone Détail** (droite) : Table des Indicators de l'élément sélectionné
  - Colonnes : `Nom | Unité | Source de Données`
  - Actions : Ajouter, Modifier, Supprimer

**Dialogue d'ajout/modification** :
- Nom de l'indicateur (ex: "Cycle Time", "Uptime")
- Unité (%, min, unités...)
- Source de Données (référence à un DataSource de l'onglet 2)
- Configuration spécifique selon le type de source :
  - SQL : Requête SQL
  - REST : Endpoint, JSONPath
  - MANUAL : Saisie manuelle (pas de DataSource)

**Sauvegarde automatique** : Les indicateurs sont sauvegardés automatiquement lors du changement d'élément sélectionné.

#### Onglet 6 : Stocks (Inventories)
**Rôle** : Gérer les stocks initiaux, finaux et entre étapes

**Interface** : Trois sections

**Section Stock Initial** (avant la première étape) :
- Case à cocher "Activer le stock initial"
- Nom du stock
- Type (Standard, Supermarket, FIFO, Safety Stock)
- Quantité (nombre d'unités)
- Durée équivalente (jours)
- Source de données (pour valeurs dynamiques)

**Section Stock Final** (après la dernière étape) :
- Case à cocher "Activer le stock final"
- Même structure que Stock Initial

**Section Stocks Entre Étapes** :
- Table : `Entre | Nom | Type | Quantité | Durée`
- Génération automatique des paires d'étapes ([Step1 → Step2], [Step2 → Step3]...)
- Configuration pour chaque paire si un stock existe entre elles

**Types de stocks** :
- `STANDARD` : Stock classique
- `SUPERMARKET` : Stock tampon
- `FIFO` : File d'attente
- `SAFETY_STOCK` : Stock de sécurité

#### Onglet 7 : Flux Matériels (Material Flows)
**Rôle** : Définir le type de flux matériel entre chaque paire d'étapes

**Interface** :
- Table : `Entre | Type de Flux | Méthode`
- Génération automatique des paires d'étapes
- Pour chaque paire, sélection du type de flux

**Types de flux matériels** :
- `PUSH` : Flux poussé (production sur prévision)
- `PULL` : Flux tiré (production à la demande)
- `FIFO_LANE` : File d'attente FIFO
- `KANBAN` : Système Kanban

**Méthode** : Description textuelle du mécanisme de flux (ex: "Kanban avec 3 cartes")

**Note** : Cet onglet complète l'onglet Stocks en définissant la dynamique du flux entre les étapes.

#### Onglet 8 : Flux d'Information (Information Flows)
**Rôle** : Définir les flux transverses (non matériels) - communications, ordres, plannings

**Interface** :
- Table : `Description | Source | Cible | Type Transmission`
- Actions : Ajouter, Modifier, Supprimer

**Champs** :
- Description (ex: "Planning de Production", "Commande Client")
- Source (menu déroulant : Acteurs + Étapes)
- Cible (menu déroulant : Acteurs + Étapes, validation source ≠ cible)
- Type de Transmission : 
  - `ELECTRONIC` : Système informatique
  - `MANUAL` : Papier, téléphone
  - `KANBAN` : Signal visuel
  - `SCHEDULE` : Planning périodique

**Rendu** : Ces flux apparaissent sur la ligne 2 (Info Flows) du diagramme avec des flèches en pointillés.

---

## 🔄 Nouveau Modèle de Données

### Structure Cible

```typescript
export interface VSMDiagram {
  // Métadonnées (Onglet 1)
  metadata: {
    name: string
    description?: string
    version?: string
    author?: string
    createdDate: string
    modifiedDate: string
  }
  
  // Sources de Données (Onglet 2)
  dataSources: DataSource[]
  
  // Nœuds Principaux (Onglet 3)
  nodes: Node[]
  
  // Séquençage du Flux (Onglet 4)
  sequences: FlowSequence[]
  
  // Flux d'Information (Onglet 5)
  informationFlows: InformationFlow[]
  
  // Indicateurs (Onglet 6)
  indicators: Indicator[]
  
  // Éléments d'annotation (ajoutés sur le canvas)
  improvementPoints: ImprovementPoint[]
  textAnnotations: TextAnnotation[]
  
  // Onglets 7 & 8 (à définir)
  // ...
}

export interface DataSource {
  id: string // Unique, référencé par les Indicators
  type: 'SQL' | 'REST' | 'STATIC'
  config: SQLConfig | RESTConfig | StaticConfig
}

export interface SQLConfig {
  jdbcUrl: string
  driverClass: string
  username: string
  passwordRef: string // Référence au secret, ex: "{DB_PASSWORD}"
}

export interface RESTConfig {
  baseUrl: string
  authType: 'NONE' | 'API_KEY' | 'BEARER_TOKEN'
  authSecretRef?: string
}

export interface StaticConfig {
  value: number
}

export interface Node {
  id: string // Unique
  type: 'SUPPLIER' | 'CUSTOMER' | 'CONTROL_CENTER' | 'PROCESS_STEP'
  displayName: string
  operators?: number // Seulement pour PROCESS_STEP
}

export interface FlowSequence {
  order: number // Position dans la séquence globale
  fromNodeId: string
  toNodeId: string
  intermediateElements: IntermediateElement[]
}

export interface IntermediateElement {
  order: number // Position dans la liste intermédiaire
  type: 'INVENTORY' | 'MATERIAL_FLOW'
  inventoryType?: InventoryType // Si type = INVENTORY
  flowType?: FlowType // Si type = MATERIAL_FLOW
}

export enum InventoryType {
  STANDARD = 'STANDARD',
  SUPERMARKET = 'SUPERMARKET',
  FIFO = 'FIFO',
  SAFETY_STOCK = 'SAFETY_STOCK'
}

export enum FlowType {
  PUSH = 'PUSH',
  PULL = 'PULL',
  FIFO_LANE = 'FIFO_LANE',
  KANBAN = 'KANBAN'
}

export interface InformationFlow {
  id: string
  description: string
  fromNodeId: string
  toNodeId: string
  transmissionType: 'ELECTRONIC' | 'MANUAL' | 'KANBAN' | 'SCHEDULE'
}

export interface Indicator {
  id: string
  nodeId: string // Référence au Node ou Inventory
  name: string
  unit: string
  dataSourceId: string // Référence à DataSource
  queryConfig: {
    sqlQuery?: string
    restEndpoint?: string
    jsonPath?: string
    staticValue?: number
  }
}

export interface ImprovementPoint {
  id: string
  x: number // Position libre sur le canvas
  y: number
  problemDescription: string
  actionTicketId?: string
  priority?: 'LOW' | 'MEDIUM' | 'HIGH'
  status?: 'IDENTIFIED' | 'IN_PROGRESS' | 'RESOLVED'
}

export interface TextAnnotation {
  id: string
  x: number
  y: number
  text: string
  fontSize?: number
  color?: string
}
```

---

## 🎨 Algorithme de Layout Automatique

### Principe

L'algorithme parcourt le modèle de données et calcule les positions (x, y) de chaque élément pour générer un diagramme standardisé.

### Les 5 Lignes (Swimlanes)

```
Y = 50   │ Ligne 1: Acteurs & Contrôle
         │ [Supplier]     [ControlCenter]     [Customer]
─────────┼─────────────────────────────────────────────────
Y = 150  │ Ligne 2: Flux d'Information
         │     ↓ (flèches info)    ↓
─────────┼─────────────────────────────────────────────────
Y = 200  │ Ligne 3: Flux de Production Principal
         │ [Step1] → △ → [Step2] → △ → [Step3]
─────────┼─────────────────────────────────────────────────
Y = 330  │ Ligne 4: Data Boxes (Indicateurs)
         │ ┌──────┐  ┌──────┐  ┌──────┐
         │ │CT: 45│  │CT: 60│  │CT: 30│
         │ │UP: 74│  │UP: 70│  │UP: 55│
         │ └──────┘  └──────┘  └──────┘
─────────┼─────────────────────────────────────────────────
Y = 500  │ Ligne 5: Timeline
         │ ▲──▼──▲──▼──▲  (VA / NVA)
```

### Constantes de Layout

```typescript
export const LAYOUT_CONFIG = {
  // Dimensions des éléments
  PROCESS_STEP_WIDTH: 120,
  PROCESS_STEP_HEIGHT: 80,
  ACTOR_WIDTH: 100,
  ACTOR_HEIGHT: 60,
  INVENTORY_WIDTH: 60,
  INVENTORY_HEIGHT: 50,
  DATA_BOX_BASE_HEIGHT: 60,
  
  // Espacements
  HORIZONTAL_SPACING: 80,
  VERTICAL_LANE_SPACING: 100,
  MARGIN_LEFT: 50,
  MARGIN_TOP: 50,
  
  // Y des lignes
  ACTORS_Y: 50,
  INFO_FLOWS_Y: 150,
  PRODUCTION_FLOW_Y: 200,
  DATA_BOXES_Y: 330,
  TIMELINE_Y: 500
}
```

### Implémentation (TypeScript)

```typescript
export class VSMLayoutEngine {
  private diagram: VSMDiagram
  private config = LAYOUT_CONFIG

  constructor(diagram: VSMDiagram) {
    this.diagram = diagram
  }

  computeLayout(): LayoutResult {
    const positions = new Map<string, LayoutPosition>()
    
    // Ligne 1 : Acteurs & Contrôle
    this.layoutActorsAndControlCenter(positions)
    
    // Ligne 3 : Flux de Production
    this.layoutProductionFlow(positions)
    
    // Ligne 4 : Data Boxes
    this.layoutDataBoxes(positions)
    
    // Ligne 5 : Timeline
    this.layoutTimeline(positions)
    
    // Calculer les dimensions totales
    const totalWidth = this.calculateTotalWidth(positions)
    const totalHeight = this.config.TIMELINE_Y + 150
    
    return { totalWidth, totalHeight, positions }
  }

  private layoutProductionFlow(positions: Map<string, LayoutPosition>) {
    let currentX = this.config.MARGIN_LEFT
    const y = this.config.PRODUCTION_FLOW_Y
    
    // Trier les séquences par ordre
    const sortedSequences = [...this.diagram.sequences].sort((a, b) => a.order - b.order)
    
    for (const sequence of sortedSequences) {
      // Placer le nœud de départ
      const fromNode = this.findNode(sequence.fromNodeId)
      if (!positions.has(fromNode.id)) {
        positions.set(fromNode.id, {
          id: fromNode.id,
          type: 'NODE',
          x: currentX,
          y,
          width: this.config.PROCESS_STEP_WIDTH,
          height: this.config.PROCESS_STEP_HEIGHT
        })
        currentX += this.config.PROCESS_STEP_WIDTH
      }
      
      // Trier les éléments intermédiaires par ordre
      const sortedElements = [...sequence.intermediateElements].sort((a, b) => a.order - b.order)
      
      // Placer les éléments intermédiaires
      for (const elem of sortedElements) {
        if (elem.type === 'INVENTORY') {
          const inventoryId = `inv_${sequence.fromNodeId}_${sequence.toNodeId}_${elem.order}`
          positions.set(inventoryId, {
            id: inventoryId,
            type: 'INVENTORY',
            x: currentX + 10,
            y: y + 15,
            width: this.config.INVENTORY_WIDTH,
            height: this.config.INVENTORY_HEIGHT
          })
          currentX += this.config.INVENTORY_WIDTH + 20
        }
        // MaterialFlow est une connexion, pas un élément positionné
      }
      
      currentX += this.config.HORIZONTAL_SPACING
    }
    
    // Placer le dernier nœud (Customer ou dernière étape)
    const lastSequence = sortedSequences[sortedSequences.length - 1]
    const toNode = this.findNode(lastSequence.toNodeId)
    if (!positions.has(toNode.id)) {
      positions.set(toNode.id, {
        id: toNode.id,
        type: 'NODE',
        x: currentX,
        y,
        width: this.config.PROCESS_STEP_WIDTH,
        height: this.config.PROCESS_STEP_HEIGHT
      })
    }
  }

  // ... autres méthodes de layout
}

export interface LayoutResult {
  totalWidth: number
  totalHeight: number
  positions: Map<string, LayoutPosition>
}

export interface LayoutPosition {
  id: string
  type: 'NODE' | 'INVENTORY' | 'DATA_BOX' | 'TIMELINE_SEGMENT'
  x: number
  y: number
  width: number
  height: number
}
```

---

## 🔄 Workflow Utilisateur Complet

### Cas d'Usage 1 : Créer une Nouvelle VSM

1. **Menu : Fichier > Nouveau Projet**
   ```typescript
   const handleNewProject = async () => {
     const name = await promptProjectName()
     const location = await selectDirectory()
     
     // Créer l'arborescence
     await createProjectStructure(location, name)
     
     // Ouvrir automatiquement le Dialogue de Configuration
     openConfigurationDialog(name)
   }
   ```

2. **L'utilisateur configure le modèle dans le Dialogue :**
   - Onglet 1 : Remplit les infos générales
   - Onglet 2 : Ajoute une source SQL (connexion MES)
   - Onglet 3 : Crée les nœuds (Supplier, Step1, Step2, Customer)
   - Onglet 4 : Séquence [Supplier→Step1→Step2→Customer] avec inventaires
   - Onglet 5 : Ajoute flux d'info (ControlCenter → Step1)
   - Onglet 6 : Configure les indicateurs (CT, Uptime) sur chaque step

3. **Clique sur "OK" :**
   ```typescript
   const handleOK = async () => {
     // 1. Valider le modèle
     const errors = validateModel(currentModel)
     if (errors.length > 0) {
       showValidationErrors(errors)
       return
     }
     
     // 2. Sauvegarder en mémoire
     updateDiagram(currentModel)
     
     // 3. Calculer le layout
     const engine = new VSMLayoutEngine(currentModel)
     const layoutResult = engine.computeLayout()
     updateLayoutResult(layoutResult)
     
     // 4. Fermer le dialogue
     closeDialog()
     
     // 5. Le canvas se redessine automatiquement (useEffect)
   }
   ```

4. **Le diagramme apparaît sur le canvas, proprement disposé**

5. **Menu : Fichier > Enregistrer**
   ```typescript
   const handleSave = async () => {
     // 1. Sérialiser en XML
     const xml = serializeToXML(diagram)
     await fs.writeFile(`${projectPath}/diagram.vsmx`, xml)
     
     // 2. Sync avec Engine (si configuré)
     await syncWithEngine(xml, layoutResult)
   }
   ```

### Cas d'Usage 2 : Modifier une VSM Existante

1. **Double-clic sur `diagram.vsmx` dans l'Explorateur**
   → Ouvre le Dialogue de Configuration pré-rempli

2. **L'utilisateur modifie (ex: ajoute une étape)**
   - Onglet 3 : Ajoute "Step3"
   - Onglet 4 : Insère Step3 dans la séquence

3. **Clique sur "Appliquer"**
   → Le dialogue reste ouvert
   → Le canvas se met à jour en arrière-plan

4. **Continue à modifier, puis "OK"**
   → Le dialogue se ferme

5. **Enregistre**

### Cas d'Usage 3 : Ajouter un Point d'Amélioration

1. **Clic droit sur le canvas → "Ajouter un Point d'Amélioration"**
   ```typescript
   const handleAddImprovementPoint = (x: number, y: number) => {
     const point: ImprovementPoint = {
       id: generateId(),
       x,
       y,
       problemDescription: '',
       priority: 'MEDIUM',
       status: 'IDENTIFIED'
     }
     addImprovementPoint(point)
   }
   ```

2. **L'icône ⚡ apparaît à l'emplacement du clic**

3. **Sélection → Le Panneau de Propriétés s'active**
   - L'utilisateur peut éditer la description
   - Peut déplacer l'icône par drag & drop

4. **Enregistre → Sync auto avec l'Engine**

---

## 🔀 Synchronisation avec le VSM Engine

### Principe

Le Studio et l'Engine sont deux applications distinctes mais synchronisées :
- **Studio** : Outil de conception (desktop Electron)
- **Engine** : Moteur de calcul et visualisation web (Spring Boot)

### Workflow de Sync

```
Studio (Electron)                    Engine (Spring Boot)
─────────────────                    ────────────────────

1. Utilisateur sauvegarde
   │
   ├─> Écrit diagram.vsmx (local)
   │
   ├─> Calcule layout
   │
   ├─> Sérialise en JSON
   │
   └─> POST /api/vsm/upload ─────────> Reçoit XML + Layout
       {                                │
         "xml": "...",                  ├─> Parse XML
         "layout": {...}                │
       }                                ├─> Stocke en base
                                        │
   <───── 200 OK ─────────────────────┘
   │
   └─> Update status bar: 🟢 Synchronisé
```

### États de Synchronisation

```typescript
enum SyncStatus {
  NOT_CONFIGURED = 'NOT_CONFIGURED', // ⚫ Engine URL non configurée
  SYNCHRONIZED = 'SYNCHRONIZED',     // 🟢 Sync réussie
  SYNCING = 'SYNCING',               // 🟡 En cours...
  ERROR = 'ERROR'                    // 🔴 Échec
}
```

### Configuration

```typescript
// Préférences du Studio
interface EngineConfig {
  enabled: boolean
  url: string // Ex: "http://localhost:8080"
  apiKey?: string
  autoSync: boolean // Sync automatique à chaque sauvegarde
}
```

---

## 📦 Structure de Fichiers d'un Projet

```
MonProjetVSM/
├── diagram.vsmx           # Modèle de données (XML)
├── action_plan.md         # Plan d'action (Markdown)
├── notes.md               # Notes libres
└── exports/               # Exports générés
    ├── diagram.png
    ├── diagram.pdf
    └── data.csv
```

### Format diagram.vsmx (XML)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<VSMDiagram name="Production de Cintres" version="1.0">
  <MetaData>
    <Author>Jean Dupont</Author>
    <CreatedDate>2025-12-06T10:00:00</CreatedDate>
    <ModifiedDate>2025-12-06T15:30:00</ModifiedDate>
  </MetaData>
  
  <DataSources>
    <DataSource id="mes_db" type="SQL">
      <JdbcUrl>jdbc:postgresql://localhost:5432/mes</JdbcUrl>
      <DriverClass>org.postgresql.Driver</DriverClass>
      <Username>mes_user</Username>
      <PasswordRef>{MES_DB_PASSWORD}</PasswordRef>
    </DataSource>
  </DataSources>
  
  <Nodes>
    <Node id="supplier1" type="SUPPLIER" displayName="Fournisseur Matière"/>
    <Node id="step1" type="PROCESS_STEP" displayName="Nettoyage" operators="2"/>
    <Node id="step2" type="PROCESS_STEP" displayName="Façonnage" operators="3"/>
    <Node id="customer1" type="CUSTOMER" displayName="Client Final"/>
  </Nodes>
  
  <Sequences>
    <Sequence order="1" from="supplier1" to="step1">
      <IntermediateElement order="1" type="INVENTORY" inventoryType="STANDARD"/>
      <IntermediateElement order="2" type="MATERIAL_FLOW" flowType="PUSH"/>
    </Sequence>
    <Sequence order="2" from="step1" to="step2">
      <IntermediateElement order="1" type="INVENTORY" inventoryType="SUPERMARKET"/>
      <IntermediateElement order="2" type="MATERIAL_FLOW" flowType="PULL"/>
    </Sequence>
    <Sequence order="3" from="step2" to="customer1">
      <IntermediateElement order="1" type="MATERIAL_FLOW" flowType="PUSH"/>
    </Sequence>
  </Sequences>
  
  <InformationFlows>
    <InfoFlow id="info1" description="Planning Production" 
              from="control_center" to="step1" 
              transmissionType="ELECTRONIC"/>
  </InformationFlows>
  
  <Indicators>
    <Indicator id="ind1" nodeId="step1" name="Cycle Time" unit="min">
      <DataSource ref="mes_db"/>
      <Query>SELECT cycle_time FROM process_data WHERE step='step1'</Query>
    </Indicator>
    <Indicator id="ind2" nodeId="step1" name="Uptime" unit="%">
      <DataSource ref="mes_db"/>
      <Query>SELECT uptime FROM process_data WHERE step='step1'</Query>
    </Indicator>
  </Indicators>
  
  <ImprovementPoints>
    <Point id="kz1" x="250" y="180" priority="HIGH">
      <Description>Réduire le temps de changement de série</Description>
      <ActionTicket>PROJ-123</ActionTicket>
    </Point>
  </ImprovementPoints>
</VSMDiagram>
```

---

## 📋 Plan de Migration Détaillé

### Phase 1 : Refactorisation du Modèle (Semaine 1)

#### Jour 1-2 : Nouveau Modèle de Données
- [ ] Créer `src/shared/types/vsm-model.ts`
- [ ] Définir toutes les interfaces (VSMDiagram, DataSource, Node, etc.)
- [ ] Créer les validateurs Zod pour chaque interface
- [ ] Tests unitaires du modèle

#### Jour 3-4 : Service de Sérialisation
- [ ] Créer `src/services/serialization/xml-serializer.ts`
- [ ] Implémenter `serializeToXML(diagram: VSMDiagram): string`
- [ ] Implémenter `deserializeFromXML(xml: string): VSMDiagram`
- [ ] Implémenter `serializeToJSON(diagram: VSMDiagram): string` (pour Engine)
- [ ] Tests unitaires avec fixtures XML

#### Jour 5 : Migration du Store
- [ ] Mettre à jour `vsmStore.ts` pour le nouveau modèle
- [ ] Remplacer `elements: VsmElement[]` par `diagram: VSMDiagram`
- [ ] Adapter les actions (updateNode, addSequence, etc.)

### Phase 2 : Dialogue de Configuration (Semaine 2)

#### Structure
```
src/renderer/components/dialogs/configuration/
├── ConfigurationDialog.tsx          # Container principal
├── TabNavigation.tsx                # Barre d'onglets verticale
├── tabs/
│   ├── GeneralInfoTab.tsx          # Onglet 1 : Infos générales
│   ├── DataSourcesTab.tsx          # Onglet 2 : Sources de données
│   ├── ActorsTab.tsx               # Onglet 3 : Acteurs externes
│   ├── ProcessStepsTab.tsx         # Onglet 4 : Étapes de production
│   ├── IndicatorsTab.tsx           # Onglet 5 : KPIs
│   ├── InventoriesTab.tsx          # Onglet 6 : Stocks
│   ├── MaterialFlowsTab.tsx        # Onglet 7 : Flux matériels
│   └── InformationFlowsTab.tsx     # Onglet 8 : Flux d'information
└── shared/
    ├── FormTable.tsx               # Composant table réutilisable
    ├── OrderableList.tsx           # Liste réordonnables (↑↓)
    └── ValidationErrors.tsx        # Affichage des erreurs
```

#### Jour 1-2 : Squelette du Dialogue
- [ ] Créer `ConfigurationDialog.tsx` avec structure de base
- [ ] Implémenter `TabNavigation.tsx`
- [ ] Intégration shadcn/ui (Dialog, Tabs, Button)
- [ ] State management local (useState pour chaque onglet)

#### Jour 3 : Onglets 1-2-3
- [ ] `GeneralInfoTab` : Formulaire simple (métadonnées)
- [ ] `DataSourcesTab` : Table + Dialogue d'ajout/modification (SQL/REST/MANUAL)
- [ ] `ActorsTab` : Trois sections (Supplier, Customer, Control Center)

#### Jour 4 : Onglets 4-5
- [ ] `ProcessStepsTab` : Table avec réordonnancement (↑↓)
- [ ] `IndicatorsTab` : Vue maître-détail (liste étapes + table KPIs)
- [ ] Sauvegarde automatique des indicateurs

#### Jour 5 : Onglets 6-7-8
- [ ] `InventoriesTab` : Stocks (Initial, Final, Between Steps)
- [ ] `MaterialFlowsTab` : Table des types de flux entre étapes
- [ ] `InformationFlowsTab` : Table des flux transverses

### Phase 3 : Algorithme de Layout (Semaine 3)

#### Structure
```
src/services/layout/
├── layout-engine.ts                # Classe principale
├── swimlane-layout.ts              # Logique des 5 lignes
├── element-renderer.ts             # Fonctions de rendu
└── layout-types.ts                 # Types (LayoutResult, LayoutPosition)
```

#### Jour 1-2 : Implémentation de base
- [ ] Port de `VSMLayoutEngine` de Java vers TypeScript
- [ ] Implémentation de `layoutActorsAndControlCenter()`
- [ ] Implémentation de `layoutProductionFlow()`

#### Jour 3 : Indicateurs et Timeline
- [ ] Implémentation de `layoutDataBoxes()`
- [ ] Implémentation de `layoutTimeline()`
- [ ] Calcul des dimensions totales

#### Jour 4-5 : Tests et optimisation
- [ ] Tests avec différents modèles (simple, complexe, edge cases)
- [ ] Optimisation des espacements
- [ ] Gestion des superpositions

### Phase 4 : Canvas en Mode Rendu (Semaine 4)

#### Jour 1-2 : Refactorisation du Canvas
- [ ] Supprimer le code drag & drop de maxGraph
- [ ] Passer en mode "lecture seule" avec rendu Canvas 2D
- [ ] Implémenter `renderLayoutResult(ctx, layoutResult, diagram)`

#### Jour 3 : Interactions de base
- [ ] Sélection d'éléments (clic)
- [ ] Zoom (molette)
- [ ] Pan (clic milieu ou drag)
- [ ] Synchronisation avec PropertiesPanel

#### Jour 4-5 : Annotations
- [ ] Drag & drop pour ImprovementPoints
- [ ] Ajout de TextAnnotations
- [ ] Menu contextuel (clic droit)

### Phase 5 : Interface Principale (Semaine 5)

#### Structure
```
src/renderer/components/ui/
├── ProjectExplorer.tsx             # Panneau gauche
├── PropertiesPanel.tsx             # Panneau droit
├── MainMenu.tsx                    # Barre de menus
├── Toolbar.tsx                     # Barre d'outils
└── StatusBar.tsx                   # Barre d'état
```

#### Jour 1-2 : Explorateur de Projets
- [ ] Arborescence avec react-tree
- [ ] Affichage hiérarchique du modèle
- [ ] Actions contextuelles (clic droit)
- [ ] Synchronisation avec la sélection

#### Jour 3 : Panneau de Propriétés
- [ ] Formulaire dynamique selon le type d'élément
- [ ] Mode lecture seule pour les éléments du flux
- [ ] Mode éditable pour les annotations

#### Jour 4-5 : Menus et Toolbar
- [ ] Barre de menus complète (Fichier, Édition, Affichage, Projet, Aide)
- [ ] Toolbar avec icônes (Nouveau, Enregistrer, Annuler, Rétablir...)
- [ ] StatusBar avec indicateurs (projet actif, zoom, sync status)

### Phase 6 : Workflow et Intégration (Semaine 6)

#### Jour 1-2 : Gestion des Projets
- [ ] Nouveau Projet (création arborescence)
- [ ] Ouvrir Projet
- [ ] Fermer Projet
- [ ] Renommer/Supprimer Projet

#### Jour 3 : Sauvegarde et Chargement
- [ ] Sérialisation XML lors de l'enregistrement
- [ ] Désérialisation XML lors de l'ouverture
- [ ] Auto-save toutes les 30 secondes

#### Jour 4-5 : Synchronisation Engine
- [ ] Service de synchronisation
- [ ] Envoi POST /api/vsm/upload
- [ ] Gestion des erreurs de connexion
- [ ] Feedback visuel dans StatusBar

### Phase 7 : Tests et Polissage (Semaine 7)

#### Jour 1-3 : Tests Fonctionnels
- [ ] Tests du workflow complet (créer → configurer → visualiser → sauvegarder)
- [ ] Tests des validations (formulaires)
- [ ] Tests des calculs de layout
- [ ] Tests de la synchronisation

#### Jour 4-5 : Polissage
- [ ] Amélioration des messages d'erreur
- [ ] Tooltips et aide contextuelle
- [ ] Animations et transitions
- [ ] Documentation utilisateur

---

## 🎯 Effort Total Estimé

| Phase | Semaines | Jours | Complexité |
|-------|----------|-------|------------|
| 1. Modèle de données | 1 | 5 | Moyenne |
| 2. Dialogue (8 onglets) | 1 | 5 | Haute |
| 3. Algorithme de layout | 1 | 5 | Haute |
| 4. Canvas mode rendu | 1 | 5 | Moyenne |
| 5. Interface principale | 1 | 5 | Moyenne |
| 6. Workflow & intégration | 1 | 5 | Moyenne |
| 7. Tests & polissage | 1 | 5 | Faible |
| **TOTAL** | **7 semaines** | **35 jours** | - |

**Avec marge de sécurité** : **8-9 semaines**

---

## 📚 Références

### Documents de Conception
- `conception_vsm_studio.md` : Document principal (philosophie, architecture, UI)
- `LAYOUT_ALGORITHM.md` : Spécification de l'algorithme de layout

### Code Source Actuel
- `c:\wk\VSM-Tools\` : Projet Electron actuel
- `d:\dev\workspace-vsm\` : Projet Eclipse RCP (référence)

### Technologies
- **Electron** : Framework desktop
- **React + TypeScript** : UI
- **Zustand** : State management
- **shadcn/ui** : Composants UI
- **Zod** : Validation
- **Canvas 2D** : Rendu du diagramme

---

## ⚠️ Points d'Attention

### Évolution du Modèle depuis la Conception

**IMPORTANT** : Le document de conception original (`conception_vsm_studio.md`) spécifiait 6 onglets, mais l'implémentation Eclipse actuelle en a **8 onglets**. Cette évolution reflète une meilleure séparation des responsabilités :

**Onglets ajoutés post-conception** :
- **Onglet 3 (Acteurs)** : Séparé des "Nœuds Principaux" pour isoler la config des acteurs externes
- **Onglet 7 (Flux Matériels)** : Séparé de "Séquençage" pour clarifier Push/Pull/Kanban

**Réorganisation logique** :
1. **Contexte** (Onglets 1-3) : Métadonnées, Connexions, Acteurs
2. **Structure** (Onglets 4-6) : Étapes, KPIs, Stocks
3. **Dynamique** (Onglets 7-8) : Flux Matériels, Flux Info

Cette structure doit être **reproduite à l'identique** dans l'implémentation Electron pour garantir la compatibilité avec les fichiers `.vsmx` existants.

### Compatibilité avec l'Engine

Le format XML et JSON doit être compatible avec l'API Spring Boot existante :
- `POST /api/vsm/upload` : Accepte XML + Layout JSON
- Vérifier la structure attendue par l'Engine
- Tester la synchronisation end-to-end

### Migration Progressive

Il est possible de migrer progressivement :
1. Garder l'interface actuelle fonctionnelle
2. Implémenter le nouveau Dialogue en parallèle
3. Basculer une fois que tout est prêt
4. Supprimer l'ancien code

Cela permet de continuer à travailler pendant la migration.

---

## ✅ Checklist de Démarrage

Avant de commencer la migration, s'assurer que :

- [x] Les 8 onglets sont tous documentés (voir structure complète ci-dessus)
- [ ] Le modèle de données cible est validé
- [ ] L'API de l'Engine est documentée
- [ ] Un projet de test est prêt pour validation
- [ ] Les fixtures XML de test sont créées
- [ ] L'environnement de dev est configuré (npm install, etc.)

---

**Auteur** : VSM-Tools Team  
**Dernière mise à jour** : 6 décembre 2025  
**Version** : 1.0
