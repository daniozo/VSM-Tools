# Context de Migration VSM-Tools vers Electron

**Date de création** : 7 décembre 2025  
**Statut** : 🟢 Phase de Développement Active  
**Version** : 1.0

---

## 📋 Table des Matières

1. [Vue d'Ensemble](#vue-densemble)
2. [Historique de Migration](#historique-de-migration)
3. [Architecture Actuelle](#architecture-actuelle)
4. [Travaux Réalisés](#travaux-réalisés)
5. [État Actuel du Code](#état-actuel-du-code)
6. [Prochaines Étapes](#prochaines-étapes)
7. [Documents de Référence](#documents-de-référence)
8. [Décisions Techniques](#décisions-techniques)

---

## 🎯 Vue d'Ensemble

### Contexte du Projet

VSM-Tools est une application de modélisation Value Stream Mapping (VSM) qui permet aux utilisateurs de créer, configurer et analyser des diagrammes de flux de valeur de manière **dynamique** et **connectée aux données en temps réel**.

### Migration : Eclipse RCP → Electron

Le projet a initialement été conçu comme une application Eclipse RCP (Rich Client Platform) en Java. Une **migration complète vers Electron** a été entreprise pour :

- ✅ Moderniser la stack technologique (React, TypeScript)
- ✅ Améliorer l'expérience utilisateur avec une UI moderne (shadcn/ui)
- ✅ Faciliter le déploiement multi-plateforme
- ✅ Permettre l'intégration avec des API web modernes
- ✅ Utiliser un écosystème npm/node.js plus flexible

---

## 📅 Historique de Migration

### Phase 1 : Fondations (Novembre 2025)
- Création du projet Electron + React + TypeScript
- Configuration de Vite pour le build
- Mise en place de l'architecture Model-First
- Définition des types de données (`vsm-model.ts`)

### Phase 2 : Interface de Configuration (Novembre-Décembre 2025)
- Création du dialogue de configuration central à 8 onglets
- Implémentation des onglets :
  - ✅ Informations Générales
  - ✅ Sources de Données (SQL, REST)
  - ✅ Fournisseurs & Clients
  - ✅ Étapes de Processus
  - ✅ Flux Matériels
  - ✅ Flux d'Information
  - ✅ Stocks (Initial, Final, Entre Étapes)
  - ✅ Indicateurs

### Phase 3 : Corrections UI et Terminologie (Décembre 2025)
- ✅ Renommage complet `source` → `mode` pour les indicateurs/stocks
- ✅ Suppression de `DataSourceType.STATIC` et `DataSourceType.MANUAL`
- ✅ Implémentation de la configuration dynamique pour Stock Initial/Final (dialogue modal)
- ✅ Configuration inline pour Stock Entre Étapes avec détection SQL/REST
- ✅ Fix des largeurs de Select (200px au lieu de flex-1)
- ✅ Correction des types TypeScript (deliveryFrequency)
- ✅ Définition de FlowType.PUSH par défaut dans MaterialFlowsTab

### Phase 4 : Analyse et Indicateurs Standards (7 décembre 2025)
- ✅ Bibliothèque d'indicateurs standards (`standardIndicators.ts`)
  - 25+ indicateurs prédéfinis (Temps, Qualité, Efficacité, Ressources)
  - Temps de Cycle, Takt Time, OEE, FPY, etc.
- ✅ Dialogue de sélection d'indicateurs standards (`StandardIndicatorDialog.tsx`)
  - Filtrage par catégorie et recherche
  - Aperçu détaillé via bouton Info
  - Présentation sobre (table HTML, sans emojis)
- ✅ Bouton "Ajouter depuis Standards" dans l'onglet Indicateurs
- ✅ Nouvel onglet "Analyse & Détection" (9ème onglet)
  - Détection automatique des goulots d'étranglement
  - Identification des 7 types de gaspillage (Muda)
  - Opportunités d'amélioration
  - 15+ règles standards pré-configurées
  - Interface de création de règles personnalisées
  - Analyse en temps réel (pas d'option toggle)
  - Alertes systématiquement affichées sur le diagramme
- ✅ Interfaces `AnalysisRule`, `RuleCondition`, `AnalysisConfig` dans `vsm-model.ts`
- ✅ UI sobre : pas d'emojis, icônes Lucide uniquement

---

## 🏗️ Architecture Actuelle

### Stack Technologique

```
┌─────────────────────────────────────────────────────────────┐
│                    Electron Desktop App                      │
├─────────────────────────────────────────────────────────────┤
│  Main Process (Node.js)                                     │
│  - main.ts : Point d'entrée Electron                        │
│  - appWindow.ts : Gestion des fenêtres                      │
│  - ipc.ts : Communication IPC                               │
│  - menu.ts : Menu natif                                     │
├─────────────────────────────────────────────────────────────┤
│  Renderer Process (React)                                   │
│  - React 18 + TypeScript                                    │
│  - shadcn/ui (Dialog, Select, Button, Card, etc.)          │
│  - Tailwind CSS                                             │
│  - Zustand (State Management)                               │
└─────────────────────────────────────────────────────────────┘
```

### Structure des Dossiers

```
VSM-Tools/
├── src/
│   ├── main/               # Electron Main Process
│   │   ├── main.ts
│   │   ├── appWindow.ts
│   │   ├── ipc.ts
│   │   ├── menu.ts
│   │   └── preload.ts
│   │
│   ├── renderer/           # React App
│   │   ├── App.tsx
│   │   ├── index.tsx
│   │   ├── components/
│   │   │   └── dialogs/
│   │   │       └── configuration/
│   │   │           ├── ConfigurationDialog.tsx
│   │   │           └── tabs/
│   │   │               ├── GeneralTab.tsx
│   │   │               ├── DataSourcesTab.tsx
│   │   │               ├── ActorsTab.tsx
│   │   │               ├── ProcessStepsTab.tsx
│   │   │               ├── MaterialFlowsTab.tsx
│   │   │               ├── InformationFlowsTab.tsx
│   │   │               ├── InventoriesTab.tsx
│   │   │               └── IndicatorsTab.tsx
│   │   └── styles/
│   │
│   ├── shared/             # Code partagé Main + Renderer
│   │   └── types/
│   │       ├── vsm-model.ts           # Types principaux
│   │       └── vsm-validation.ts      # Schémas Zod
│   │
│   ├── services/           # Logique métier
│   │   ├── calculation/    # Calculs VSM (Lead Time, etc.)
│   │   ├── serialization/  # Import/Export VSMX
│   │   ├── storage/        # Persistance locale
│   │   └── api/            # Clients API (SQL, REST)
│   │
│   └── store/
│       └── vsmStore.ts     # State management global (Zustand)
│
├── docs/                   # Documentation projet
│   ├── conception_vsm_studio.md
│   ├── collection_indicateurs.md
│   ├── INTERFACE_OPERATEUR_GUIDE.md
│   ├── CHATBOT_ASSISTANT.md
│   └── LAYOUT_ALGORITHM.md
│
└── electron/
    └── build/
        └── main.js         # Build Electron
```

### Principe Architectural : Model-First

Le cœur de l'architecture repose sur le paradigme **Model-First** :

1. **Source de Vérité** : Le modèle de données (`VSMDiagram`)
2. **Interface de Configuration** : Dialogue à 9 onglets pour éditer le modèle
3. **Génération Automatique** : Le diagramme visuel est généré à partir du modèle
4. **Pas de Dessin Libre** : L'utilisateur ne dessine jamais à la main

---

## ✅ Travaux Réalisés

### 1. Modèle de Données (`vsm-model.ts`)

**Fichier** : `c:\wk\VSM-Tools\src\shared\types\vsm-model.ts`

#### Interfaces Principales

```typescript
// Diagramme principal
interface VSMDiagram {
  id: string;
  name: string;
  description?: string;
  deliveryFrequency: DeliveryFrequency;
  
  suppliers: Supplier[];
  customers: Customer[];
  controlCenter?: ControlCenter;
  processSteps: ProcessStep[];
  materialFlows: MaterialFlow[];
  informationFlows: InformationFlow[];
  dataSources: DataSource[];
  inventories: Inventory[];
}

// Nœuds principaux
interface ProcessStep {
  id: string;
  name: string;
  description?: string;
  indicators: Indicator[];
}

interface Supplier { /* ... */ }
interface Customer { /* ... */ }
interface ControlCenter { /* ... */ }

// Flux
interface MaterialFlow {
  id: string;
  sourceId: string;
  targetId: string;
  type: FlowType;  // PUSH, PULL, FIFO
  description?: string;
}

interface InformationFlow {
  id: string;
  sourceId: string;
  targetId: string;
  type: 'Electronic' | 'Manual';
  frequency?: string;
}

// Stocks
interface Inventory {
  id: string;
  type: InventoryType;  // INITIAL, FINAL, BETWEEN_STEPS
  location?: string;
  betweenStockData?: BetweenStockData;
  // Configuration dynamique
  mode?: 'Statique' | 'Dynamique' | 'Manuel';
  dataSourceId?: string;
  sqlQuery?: string;
  restEndpoint?: string;
  jsonPath?: string;
  parameters?: string;
}

// Indicateurs
interface Indicator {
  id: string;
  name: string;
  unit: string;
  mode: 'Statique' | 'Dynamique' | 'Manuel';
  staticValue?: number;
  // Configuration dynamique
  dataSourceId?: string;
  sqlQuery?: string;
  restEndpoint?: string;
  jsonPath?: string;
  parameters?: string;
}

// Sources de données
interface DataSource {
  id: string;
  name: string;
  type: DataSourceType;  // SQL, REST uniquement
  
  // SQL
  jdbcUrl?: string;
  username?: string;
  password?: string;
  
  // REST
  baseUrl?: string;
  authType?: AuthType;
  authToken?: string;
}
```

#### Enums

```typescript
enum NodeType {
  SUPPLIER = 'Supplier',
  CUSTOMER = 'Customer',
  CONTROL_CENTER = 'ControlCenter',
  PROCESS_STEP = 'ProcessStep'
}

enum InventoryType {
  INITIAL = 'Initial',
  FINAL = 'Final',
  BETWEEN_STEPS = 'BetweenSteps'
}

enum DataSourceType {
  SQL = 'SQL',
  REST = 'REST'
  // STATIC et MANUAL ont été SUPPRIMÉS
}

enum FlowType {
  PUSH = 'PUSH',
  PULL = 'PULL',
  FIFO = 'FIFO'
}

enum DeliveryFrequency {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  CUSTOM = 'CUSTOM'
}

enum AuthType {
  NONE = 'None',
  BASIC = 'Basic',
  BEARER = 'Bearer',
  API_KEY = 'ApiKey'
}
```

### 2. Dialogue de Configuration Central

**Fichier** : `c:\wk\VSM-Tools\src\renderer\components\dialogs\configuration\ConfigurationDialog.tsx`

#### Structure

Le dialogue est organisé en **9 onglets** accessibles via un menu vertical à gauche :

1. **Général** : Métadonnées du diagramme
2. **Sources de Données** : Configuration SQL/REST
3. **Fournisseurs & Clients** : Acteurs externes
4. **Étapes de Processus** : Nœuds principaux
5. **Flux Matériels** : Connexions physiques (PUSH/PULL/FIFO)
6. **Flux d'Information** : Communications (Electronic/Manual)
7. **Stocks** : Initial, Final, Entre Étapes
8. **Indicateurs** : KPIs attachés aux étapes
9. **Analyse & Détection** : Goulots, gaspillages, opportunités (temps réel)emps réel)

#### État Actuel de l'Implémentation

| Onglet | Statut | Fonctionnalités |
|--------|--------|-----------------|
| Général | ✅ Complet | Nom, description, fréquence de livraison |
| Sources de Données | ✅ Complet | CRUD SQL/REST avec validation |
| Fournisseurs & Clients | ✅ Complet | CRUD acteurs avec fréquence |
| Étapes de Processus | ✅ Complet | CRUD étapes, ordre séquentiel |
| Flux Matériels | ✅ Complet | CRUD flux avec type par défaut (PUSH) |
| Flux d'Information | ✅ Complet | CRUD flux avec type et fréquence |
| Stocks | ✅ Complet | Config dynamique pour Initial/Final (dialogue modal), config inline pour Entre Étapes |
| Indicateurs | ✅ Complet | CRUD indicateurs avec mode, + ajout depuis bibliothèque standards |
| Analyse & Détection | ✅ Complet | Règles de détection auto, goulots, gaspillages, opportunités |

### 3. Corrections et Améliorations Récentes

#### Session du 7 décembre 2025 (Partie 2)

**Problèmes identifiés et résolus** :

1. **Bouton "Configurer..." mal placé**
   - ❌ Avant : Apparaissait dans Stock Entre Étapes
   - ✅ Après : Apparaît uniquement pour Stock Initial/Final en mode Dynamique

2. **Champs dynamiques non affichés**
   - ❌ Avant : Aucun champ pour configurer les requêtes SQL/REST
   - ✅ Après : Dialogue modal pour Initial/Final, champs inline pour Entre Étapes

3. **Renommage incomplet source → mode**
   - ❌ Avant : Mélange de "source" et "mode" dans le code
   - ✅ Après : 100% du code utilise "mode" pour Statique/Dynamique/Manuel

4. **Largeur des Select trop grande**
   - ❌ Avant : `className="flex-1"` prenait toute la largeur
   - ✅ Après : `className="w-[200px]"` fixe à 200px

5. **Erreurs TypeScript**
   - ❌ Avant : `frequency` au lieu de `deliveryFrequency`
   - ✅ Après : Type correct avec enum `DeliveryFrequency`

6. **Type de flux par défaut non défini**
   - ❌ Avant : Type vide lors de la création d'un flux matériel
   - ✅ Après : `FlowType.PUSH` avec description "Flux poussé standard"

**Fichiers modifiés** :
- `InventoriesTab.tsx` : Refonte complète avec états pour config dynamique
- `IndicatorDialog.tsx` : Mise à jour terminologie + commentaires
- `IndicatorsTab.tsx` : Colonnes et handlers mis à jour
- `vsm-model.ts` : Suppression `isStaticConfig`, mise à jour interfaces
- `vsm-validation.ts` : Nettoyage validations obsolètes
- `MaterialFlowsTab.tsx` : Ajout type par défaut PUSH

---

## 📊 État Actuel du Code

### Fichiers Clés et Leur Statut

| Fichier | Chemin | Statut | Notes |
|---------|--------|--------|-------|
| **vsm-model.ts** | `src/shared/types/` | ✅ Stable | Modèle complet, enums définis, interfaces Analyse |
| **vsm-validation.ts** | `src/shared/types/` | ✅ Stable | Schémas Zod, validations SQL/REST |
| **ConfigurationDialog.tsx** | `src/renderer/components/dialogs/configuration/` | ✅ Stable | Architecture 9 onglets fonctionnelle |
| **GeneralTab.tsx** | `.../tabs/` | ✅ Complet | Métadonnées du diagramme |
| **DataSourcesTab.tsx** | `.../tabs/` | ✅ Complet | CRUD sources SQL/REST |
| **ActorsTab.tsx** | `.../tabs/` | ✅ Complet | CRUD fournisseurs/clients |
| **ProcessStepsTab.tsx** | `.../tabs/` | ✅ Complet | CRUD étapes avec ordre |
| **MaterialFlowsTab.tsx** | `.../tabs/` | ✅ Complet | CRUD flux avec type défaut |
| **InformationFlowsTab.tsx** | `.../tabs/` | ✅ Complet | CRUD flux info |
| **InventoriesTab.tsx** | `.../tabs/` | ✅ Complet | Config dynamique implémentée |
| **IndicatorsTab.tsx** | `.../tabs/` | ✅ Complet | CRUD indicateurs + ajout depuis standards |
| **AnalysisTab.tsx** | `.../tabs/` | ✅ Complet | Règles de détection automatique |
| **IndicatorDialog.tsx** | `.../dialogs/` | ✅ Complet | Pattern de référence pour config dynamique |
| **StandardIndicatorDialog.tsx** | `.../dialogs/` | ✅ Complet | Sélection indicateurs standards |
| **standardIndicators.ts** | `src/shared/data/` | ✅ Complet | Bibliothèque 25+ indicateurs |
| **standardAnalysisRules.ts** | `src/shared/data/` | ✅ Complet | 15+ règles pré-configurées |

### Points d'Attention

- ⚠️ **Validation Zod** : Actuellement basique, pourrait être enrichie
- ⚠️ **Gestion d'erreurs** : À améliorer dans les formulaires
- ⚠️ **Tests unitaires** : Aucun test implémenté pour le moment

---

## 🚀 Prochaines Étapes

### ✅ Phase Implémentée : Analyse et Détection Automatique (7 décembre 2025)

> **Cette phase a été complétée !** Les fonctionnalités suivantes sont maintenant disponibles.

#### 1. ✅ Nouvel Onglet "Analyse & Détection" - IMPLÉMENTÉ

**Fichiers créés** :
- `src/renderer/components/dialogs/configuration/tabs/AnalysisTab.tsx`
- `src/shared/data/standardAnalysisRules.ts`

**Fonctionnalités implémentées** :
- Détection des goulots d'étranglement (Temps de Cycle > Takt Time)
- Identification des 7+1 types de gaspillage (Muda) : Surproduction, Attente, Transport, Sur-traitement, Stocks, Mouvements, Défauts, Compétences
- Opportunités d'amélioration (OEE faible, taille de lot importante, etc.)
- **Analyse en temps réel** : pas de toggle pour activer/désactiver
- **Alertes systématiques** : toujours affichées sur le diagramme
- **UI sobre** : icônes Lucide (AlertTriangle, AlertCircle, Lightbulb) sans emojis

**15+ règles standards pré-configurées** incluant :
| Règle | Type | Condition |
|-------|------|-----------|
| Goulot Temps de Cycle | Bottleneck | Temps de Cycle > Takt Time |
| Proche du Takt Time | Bottleneck | Temps de Cycle >= 90% Takt Time |
| Stock Excessif (> 3 jours) | Waste | Jours de Stock > 3 |
| Stock Critique (> 7 jours) | Waste | Jours de Stock > 7 |
| Disponibilité Faible | Waste | Uptime < 85% |
| Changement Long | Waste | Changeover > 30 min |
| FPY Faible | Waste | FPY < 95% |
| Rebut Élevé | Waste | Scrap > 2% |
| OEE Faible | Opportunity | OEE < 75% |

#### 2. ✅ Indicateurs Standards (Bibliothèque Pré-configurée) - IMPLÉMENTÉ

**Fichiers créés** :
- `src/shared/data/standardIndicators.ts` (25+ indicateurs)
- `src/renderer/components/dialogs/configuration/StandardIndicatorDialog.tsx`

**Catégories d'indicateurs** :
- **Temps** : Temps de Cycle, Changeover, Takt Time, Lead Time, Processing Time, Wait Time
- **Qualité** : FPY, Scrap Rate, Rework Rate, Defect Rate, Quality Rate
- **Efficacité** : Uptime, OEE, Performance Rate, MTBF, MTTR
- **Ressources** : Operators, Batch Size, Shifts, WIP, Inventory Days, Energy, Cost per Unit

**Interface** : Bouton "Ajouter depuis Standards" dans l'onglet Indicateurs, avec dialogue de sélection sobre (table HTML, bouton Info pour détails)
### Phase 2 : Rendu Visuel du Diagramme

#### Objectifs
- Implémenter le moteur de rendu du canevas
- Appliquer l'algorithme de layout automatique
- Afficher le diagramme généré à partir du modèle

#### Technologies à Intégrer
- **React Flow** ou **D3.js** pour le rendu graphique
- **Algorithm de Layout** (voir `LAYOUT_ALGORITHM.md`)

### Phase 3 : Connexion aux Données Réelles

#### Objectifs
- Implémenter les clients API pour SQL et REST
- Tester la récupération de données dynamiques
- Afficher les valeurs en temps réel sur le diagramme

#### Services à Développer
- `services/api/SqlClient.ts`
- `services/api/RestClient.ts`
- `services/calculation/IndicatorCalculator.ts`

### Phase 4 : Interface Opérateur

Voir `INTERFACE_OPERATEUR_GUIDE.md` pour les spécifications complètes.

#### Objectifs
- Créer une interface simplifiée pour la saisie manuelle
- Permettre aux opérateurs de terrain de renseigner les valeurs
- Intégration avec le backend Spring Boot

### Phase 5 : Assistant Chatbot

Voir `CHATBOT_ASSISTANT.md` pour les spécifications complètes.

#### Objectifs
- Intégrer un agent conversationnel IA
- Permettre la création de diagrammes par dialogue
- Fournir des analyses et suggestions intelligentes

---

## 📚 Documents de Référence

### Documentation Principale

| Document | Chemin | Description |
|----------|--------|-------------|
| **Conception VSM Studio** | `d:\dev\workspace-vsm\docs\conception_vsm_studio.md` | Architecture générale, paradigme Model-First, structure des dialogues |
| **Collection d'Indicateurs** | `d:\dev\workspace-vsm\docs\collection_indicateurs.md` | Liste exhaustive des indicateurs standards du VSM |
| **Algorithme de Layout** | `d:\dev\workspace-vsm\docs\LAYOUT_ALGORITHM.md` | Spécification de l'algorithme de placement automatique |
| **Interface Opérateur** | `d:\dev\workspace-vsm\docs\INTERFACE_OPERATEUR_GUIDE.md` | Guide pour la saisie manuelle des données |
| **Chatbot Assistant** | `d:\dev\workspace-vsm\docs\CHATBOT_ASSISTANT.md` | Spécifications de l'agent conversationnel IA |

### Sessions de Travail Récentes

| Document | Date | Sujet |
|----------|------|-------|
| `ISSUES_SESSION_2025-12-07.md` | 7 déc. 2025 | Problèmes de bouton "Configurer" et champs manquants |
| `ISSUES_SESSION_2025-12-07_PART2.md` | 7 déc. 2025 | Corrections finales UI et terminologie |

### Schémas et Diagrammes

| Document | Description |
|----------|-------------|
| `docs/diagrams/mermaid/mermaid_diagrams.md` | Diagrammes de flux et d'architecture |
| `docs/vsm/*.md` | Documentation métier sur la méthodologie VSM |

---

## 🎯 Décisions Techniques

### Principes de Conception

1. **Model-First Paradigm**
   - Le modèle de données est la source de vérité
   - Le diagramme est généré automatiquement
   - Pas de dessin libre

2. **Validation Stricte**
   - Schémas Zod pour toutes les entrées
   - Empêcher les configurations invalides
   - Guider l'utilisateur

3. **Séparation des Préoccupations**
   - Chaque onglet gère un ensemble cohérent d'entités
   - Types TypeScript stricts
   - Services découplés

4. **UX Moderne**
   - shadcn/ui pour une interface cohérente
   - Retour visuel immédiat (bouton "Appliquer")
   - Dialogues modaux pour les configurations complexes

### Choix Technologiques

| Choix | Justification |
|-------|---------------|
| **Electron** | Déploiement cross-platform, accès Node.js |
| **React + TypeScript** | Typage fort, écosystème riche |
| **shadcn/ui** | Composants modernes, accessibles, personnalisables |
| **Zustand** | State management léger, simple |
| **Zod** | Validation runtime + types TypeScript |
| **Tailwind CSS** | Styling rapide, cohérent |

### Conventions de Code

- **Naming** : camelCase pour variables/fonctions, PascalCase pour composants/types
- **Files** : Un composant = un fichier, nommé selon le composant
- **Imports** : Ordre alphabétique, types séparés
- **Comments** : JSDoc pour fonctions publiques, commentaires inline pour logique complexe

---

## 🔄 Synchronisation avec le Backend

### Backend Spring Boot (Engine)

Le projet `workspace-vsm/engine` contient un backend Spring Boot qui :
- Parse les fichiers `.vsmx`
- Calcule les métriques (Lead Time, goulots, etc.)
- Expose des API REST
- Fournit l'interface opérateur

### Points d'Intégration Futurs

- **POST /api/vsm/upload** : Synchroniser le modèle depuis Electron
- **GET /api/vsm/{id}/layout** : Récupérer le layout calculé
- **GET /api/vsm/{id}/metrics** : Récupérer les métriques en temps réel
- **POST /api/operator/submit** : Soumettre des données manuelles

---

## 🏁 Checklist pour la Nouvelle Session

### Avant de Commencer

- [ ] Lire ce document en entier
- [ ] Consulter `conception_vsm_studio.md` pour comprendre la vision
- [ ] Consulter `collection_indicateurs.md` pour les indicateurs standards
- [ ] Vérifier l'état des fichiers clés (voir section "État Actuel du Code")

### Pour Implémenter l'Onglet "Analyse & Détection"

- [x] Créer `AnalysisTab.tsx` dans `src/renderer/components/dialogs/configuration/tabs/`
- [x] Définir les interfaces `AnalysisRule`, `RuleCondition` dans `vsm-model.ts`
- [x] Créer la bibliothèque de règles standards
- [x] Ajouter l'onglet dans `ConfigurationDialog.tsx`
- [x] Implémenter le CRUD des règles
- [x] UI sobre : icônes Lucide, pas d'emojis
- [x] Analyse temps réel : pas d'options toggle
- [ ] Ajouter la validation Zod (à faire si nécessaire)

### Pour Implémenter la Bibliothèque d'Indicateurs Standards

- [x] Créer `standardIndicators.ts` avec la liste complète (basée sur `collection_indicateurs.md`)
- [x] Créer le composant `StandardIndicatorDialog.tsx`
- [x] Modifier `IndicatorsTab.tsx` pour ajouter le bouton "Ajouter depuis Standards"
- [x] Implémenter la recherche/filtrage par catégorie
- [x] UI sobre : table HTML, bouton Info pour détails, pas d'emojis
- [x] Tester l'ajout d'indicateurs standards

---

## 📞 Support et Ressources

### Questions Fréquentes

**Q : Où est défini le modèle de données ?**
R : Dans `src/shared/types/vsm-model.ts`

**Q : Comment ajouter un nouvel onglet au dialogue de configuration ?**
R : 
1. Créer le composant dans `src/renderer/components/dialogs/configuration/tabs/`
2. Ajouter dans `tabs/index.ts`
3. Ajouter dans la liste des onglets de `ConfigurationDialog.tsx`

**Q : Comment valider les données ?**
R : Utiliser les schémas Zod définis dans `src/shared/types/vsm-validation.ts`

**Q : Pourquoi "mode" et pas "source" ?**
R : Pour éviter la confusion avec "Source de Données". "Mode" désigne Statique/Dynamique/Manuel.

### Contact

- **Projet** : VSM-Tools
- **Workspace** : `c:\wk\VSM-Tools`
- **Référence Eclipse** : `d:\dev\workspace-vsm` (ancien projet, documentation seulement)

---

**Dernière mise à jour** : 7 décembre 2025  
**Document maintenu par** : L'équipe de développement VSM-Tools
