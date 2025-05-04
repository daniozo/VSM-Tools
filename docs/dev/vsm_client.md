# Documentation Technique : Client VSM (Application de Bureau Electron)

<br>

<!-- TOC -->
* [Documentation Technique : Client VSM (Application de Bureau Electron)](#documentation-technique--client-vsm-application-de-bureau-electron)
  * [1. Introduction et Objectifs](#1-introduction-et-objectifs)
  * [2. Fonctionnalités Principales (Vue Utilisateur)](#2-fonctionnalités-principales-vue-utilisateur)
  * [3. Architecture Interne (Client Electron)](#3-architecture-interne-client-electron)
  * [4. Interface Utilisateur (UI) et Interactions](#4-interface-utilisateur-ui-et-interactions)
  * [5. Gestion des Données](#5-gestion-des-données)
  * [6. Communication avec le Backend](#6-communication-avec-le-backend)
  * [7. Fonctionnalités Spécifiques (Implémentation Client)](#7-fonctionnalités-spécifiques-implémentation-client)
  * [8. Modules Complémentaires](#8-modules-complémentaires)
    * [8.1 Module de Configuration](#81-module-de-configuration)
    * [8.2 Module d'Acquisition des Données](#82-module-dacquisition-des-données)
    * [8.3 Module de Calcul](#83-module-de-calcul)
    * [8.4 Module de Visualisation et Tableaux de Bord](#84-module-de-visualisation-et-tableaux-de-bord)
    * [8.5 Module d'Export et Rapports](#85-module-dexport-et-rapports)
  * [9. Considérations Techniques](#9-considérations-techniques)
    * [9.1 Performance et Optimisation](#91-performance-et-optimisation)
    * [9.2 Gestion des Erreurs et Robustesse](#92-gestion-des-erreurs-et-robustesse)
    * [9.3 Configuration et Maintenance](#93-configuration-et-maintenance)
  * [10. Déploiement et Installation](#10-déploiement-et-installation)
  * [11. Évolution Future et Extensibilité](#11-évolution-future-et-extensibilité)
  * [12. Conclusion](#12-conclusion)
<!-- TOC -->

## 1. Introduction et Objectifs

Ce document décrit la conception et le fonctionnement du client VSM, une application de bureau développée avec le framework Electron et JavaScript/TypeScript. Ce client permet aux utilisateurs de créer, visualiser, analyser et gérer des cartographies de la chaîne de valeur (Value Stream Maps).

Il s'agit d'un client **riche** interagissant avec un **serveur backend** via une API. Le client gère l'interface utilisateur, les interactions directes, la visualisation des données et délègue au backend la persistance centrale des données, la logique métier complexe éventuelle, et la gestion de la collaboration.

**Objectifs principaux du client :**

* Fournir une interface graphique intuitive pour dessiner et éditer des VSM (état actuel et futur).
* Permettre la saisie et l'affichage des données associées à chaque élément de la VSM (temps de cycle, stocks, TRS, etc.).
* Visualiser les flux de matière et d'information.
* Demander au backend ou calculer localement les indicateurs clés (Lead Time, %VA, Takt Time, etc.).
* Aider à l'identification des gaspillages et des goulots d'étranglement.
* Faciliter la conception et la comparaison de l'état futur.
* Interagir avec le backend pour sauvegarder, charger et partager les VSM.
* Gérer l'authentification utilisateur.
* Permettre l'export des VSM et des données associées.

## 2. Fonctionnalités Principales (Vue Utilisateur)

* **Gestion des Cartes :** Créer, ouvrir, sauvegarder (localement et sur le serveur), supprimer, lister les cartes VSM.
* **Édition Visuelle :**
  * Dessiner des processus, stocks, fournisseurs/clients, flux via une palette d'outils et du drag-and-drop.
  * Connecter les éléments avec des flèches de flux (matière, information, poussé, tiré, FIFO, électronique, etc.).
  * Ajouter des "Kaizen Bursts" pour marquer les opportunités d'amélioration.
  * Zoomer, dézoomer, naviguer dans la carte.
* **Saisie de Données :** Sélectionner un élément et saisir/modifier ses attributs (temps de cycle, VA, NVA, opérateurs, TRS, quantité en stock, etc.) via des panneaux de propriétés dédiés.
* **Calculs et Analyse :**
  * Afficher la ligne de temps (Timeline) calculée avec distinction VA/NVA et Lead Time total.
  * Afficher le %VA global.
  * Calculer et afficher le Takt Time (basé sur les entrées utilisateur).
  * Visualiser les goulots (par ex., par couleur ou icône sur les processus dont TC > Takt Time).
* **Gestion État Actuel / Futur :** Basculer entre la vue "État Actuel" et "État Futur", dupliquer l'état actuel pour démarrer l'état futur, comparer les indicateurs clés.
* **Plan d'Action :** Associer des actions concrètes (description, responsable, échéance) aux Kaizen Bursts.
* **Authentification :** Connexion/Déconnexion utilisateur via interaction avec le backend.
* **Export :** Exporter la VSM en format image (PNG, SVG) ou document (PDF), exporter les données et le plan d'action (CSV).

## 3. Architecture Interne (Client Electron)

Le client est développé avec Electron et TypeScript. Les principaux composants sont :

* **Processus Main (Main Process) :**
  * **`main.ts` :** Point d'entrée de l'application Electron. Gère la création de fenêtres, les menus natifs, l'intégration avec l'OS.
  * **`AppWindow` :** Classe gérant la fenêtre principale de l'application (BrowserWindow). Gère le cycle de vie, dimensions, état.
  * **`MenuBuilder` :** Construction des menus natifs de l'application (Fichier, Édition, etc.)
  * **`SystemIntegration` :** Gestion des intégrations OS (raccourcis, associations de fichiers).

* **Processus Renderer (Renderer Process) :**
  * **Architecture Front-end :** Basée sur React/Vue.js/Svelte (à choisir) pour gérer l'interface utilisateur.
  * **Composants UI :**
    * `App` : Composant racine
    * `MainLayout` : Structure globale avec sidebars, toolbar, zone principale
    * `VsmEditor` : Zone centrale pour éditer la carte VSM
    * `PropertyPanel` : Panneau de propriétés pour l'élément sélectionné
    * `SymbolPalette` : Palette d'outils et symboles
    * `TimelineView` : Visualisation de la timeline VA/NVA

* **Éléments Graphiques :**
  * Utilisation de bibliothèques comme `react-konva`, `fabric.js` ou `D3.js` pour le rendu et l'interaction canvas.
  * Classes/interfaces représentant les éléments visuels :
    * `ProcessShape` : Représente une boîte de processus
    * `StockShape` : Représente un symbole de stock
    * `FlowArrow` : Flèche de flux (matière ou information)
    * `DataBox` : Affichage des données sur la carte
    * `KaizenBurst` : Symbole d'amélioration

* **Modèles de Données :** Interfaces/Classes TypeScript pour représenter les données métier :
  * `VsmMap` : Contient toutes les informations de la carte
  * `ProcessData`, `StockData`, `FlowData` : Données spécifiques aux éléments
  * Utilisation de bibliothèques comme `immer` pour gestion immutable des états

* **État de l'Application :**
  * Gestion d'état via Redux, MobX ou Context API (selon préférence)
  * Store organisé en "slices" :
    * `mapSlice` : État courant de la carte VSM
    * `uiSlice` : État de l'interface (sélection, mode d'édition, zoom)
    * `authSlice` : Données d'authentification
    * `settingsSlice` : Paramètres utilisateur

* **Services :**
  * `ApiService` : Communication avec le backend via Axios ou Fetch API
  * `StorageService` : Persistance locale via Electron's API (fs)
  * `CalculationService` : Calculs VSM
  * `ExportService` : Export de fichiers (PDF, SVG, CSV)

* **Communication Inter-Process :**
  * Utilisation d'IPC (Inter-Process Communication) d'Electron pour les opérations nécessitant des privilèges natifs

## 4. Interface Utilisateur (UI) et Interactions

* **Structure :**
  * Interface modulaire avec zones redimensionnables (via react-split-pane ou similaire)
  * Thème clair/sombre et personnalisable (via styled-components ou CSS-in-JS)
  * Responsive design pour s'adapter aux différentes tailles d'écran

* **Éditeur VSM :**
  * **Ajout d'éléments :** Drag-and-drop depuis la palette vers le canvas
  * **Sélection :** Clic ou sélection rectangle (multi-sélection avec Shift)
  * **Propriétés :** Panneau latéral dynamique affichant les propriétés de l'élément sélectionné
  * **Connexion :** Mode "connexion" activable pour créer des flèches entre éléments
  * **Manipulation :** Déplacement, redimensionnement via handles visuels
  * **Menu Contextuel :** Options spécifiques au contexte via clic-droit

* **Interactions :**
  * Gestes tactiles pour les appareils compatibles
  * Raccourcis clavier pour les actions fréquentes
  * Animations fluides lors des transitions d'état
  * Auto-sauvegarde avec indicateur d'état (unsaved changes)

* **Navigation :**
  * Zoom et pan avec souris/trackpad
  * Minimap pour visualisation globale
  * Historique d'actions (undo/redo) via pattern Command

## 5. Gestion des Données

* **Modèle Central :**
  * Structure de données TypeScript fortement typée
  * État immutable géré par le store (Redux/MobX)
  * Updates atomiques via actions/reducers

* **Liaison UI-Modèle :**
  * Pattern Flux/Redux pour les mises à jour unidirectionnelles
  * Composants React connectés au store via hooks/HOC

* **Synchronisation Backend :**
  * **Chargement :** Requêtes API asynchrones, updating loading states
  * **Middleware :** Middleware Redux pour la logique API
  * **Optimistic UI :** Mises à jour optimistes de l'interface avant confirmation serveur

* **Stockage Local :**
  * Utilisation de l'API Electron fs (filesystem)
  * Format JSON avec versioning
  * Option de travail hors-ligne avec synchronisation différée

## 6. Communication avec le Backend

* **Protocole :** API RESTful
* **Client HTTP :** Axios configuré avec intercepteurs
* **Format :** JSON
* **Authentification :**
  * OAuth2/JWT implémenté via Axios interceptors
  * Stockage sécurisé des tokens via electron-store
  * Refresh token automatique

* **Endpoints API :** (similaires à la version précédente)
  * `POST /api/auth/login` : Authentification
  * `GET /api/maps` : Liste des cartes
  * `POST /api/maps` : Création carte
  * `GET /api/maps/{mapId}` : Détails d'une carte
  * `PUT /api/maps/{mapId}` : Mise à jour carte
  * `DELETE /api/maps/{mapId}` : Suppression carte
  * `GET /api/maps/{mapId}/calculate` : Calculs d'indicateurs
  * `GET/POST/PUT /api/maps/{mapId}/actions` : Gestion plan d'action

* **Gestion d'Erreurs :**
  * Intercepteurs Axios pour traitement unifié
  * Retry automatique pour les erreurs réseau
  * Affichage contextualisé des erreurs (via toast notifications)

## 7. Fonctionnalités Spécifiques (Implémentation Client)

* **Calculs :**
  * **Côté Client :** Service TypeScript avec méthodes pures pour calculs locaux
  * **Côté Backend :** Appel API avec gestion de chargement/erreurs
  * **Memoization :** Mise en cache des résultats pour optimisation

* **État Futur :**
  * Basculement d'état via switch dans le store
  * Vue comparative via layout splitté
  * Duplication d'état avec modifications traçables

* **Export :**
  * **PNG/JPG :** Capture du canvas via html-to-image ou capture d'Electron
  * **SVG :** Export du DOM SVG ou conversion via bibliotheques
  * **PDF :** Génération via electron-pdf ou jsPDF
  * **Données (CSV/Excel) :** Export via bibliotheques comme csv-stringify ou exceljs

## 8. Modules Complémentaires

### 8.1 Module de Configuration

* **UI :**
  * Composants React/Vue pour formulaires de configuration
  * Validation de formulaires via bibliotheques comme Formik, Yup
  * Sections pour configuration :
    * Connexion base de données
    * Définition des processus/ateliers
    * Paramètres des postes de travail
    * Produits/Familles
    * Configuration du temps disponible
* **Logique :**
  * Sauvegarde dans electron-store
  * Validation et sanitization des entrées

### 8.2 Module d'Acquisition des Données

* **Saisie Manuelle :**
  * **UI :** Composants de formulaires modernes avec validation temps réel
  * **Logique :** Validation TypeScript, stockage temporaire et envoi batch

* **Acquisition Semi-Automatique :**
  * **Logique :**
    * Accès aux périphériques via node-serialport dans le Main Process
    * Communication IPC pour remonter les événements au Renderer
    * Parseurs configurables pour codes-barres/QR codes

* **Acquisition Automatique :**
  * **Logique :**
    * **Automates :** Bibliothèques Node.js pour protocoles industriels (node-modbus, node-opcua)
    * **Bases de Données :** Connexion directe via node-postgres, sequelize, etc.
    * **API :** Intégration via Axios, avec adapters pour formats variés

### 8.3 Module de Calcul

* **Logique :**
  * Fonctions pures TypeScript pour tous les calculs VSM
  * Services organisés par domaine (LeadTimeService, TRSService, etc.)
  * Utilitaires d'agrégation et de calcul statistique

* **Déclenchement :**
  * API déclarative (hooks si React)
  * Calculs à la demande ou automatisés via observers
  * Workers pour calculs intensifs (WebWorkers)

### 8.4 Module de Visualisation et Tableaux de Bord

* **UI :**
  * Composants graphiques via Chart.js, D3.js ou Victory
  * Tableaux de bord personnalisables via react-grid-layout
  * Visualisations spécialisées :
    * TimelineChart
    * ProcessComparisonChart
    * TRSGauge
    * LeadTimeHistory
    * StockLevelChart

* **Logique :**
  * Adaptateurs de données pour formater les données pour les visualisations
  * Hooks personnalisés pour lier l'état aux composants graphiques
  * Exports paramétrisables des visualisations

### 8.5 Module d'Export et Rapports

* **UI :**
  * Assistant d'export étape par étape
  * Prévisualisation des exports
  * Options configurables par type d'export

* **Logique :**
  * Génération de PDF via jsPDF ou electron-pdf
  * Export Excel via exceljs
  * Export SVG via svg-crowbar ou extraction directe
  * Templates Handlebars ou EJS pour les rapports

## 9. Considérations Techniques

### 9.1 Performance et Optimisation

* **Gestion des Données Volumineuses :**
  * Virtualisation des listes longues (react-virtualized, react-window)
  * Pagination côté client pour grands datasets
  * WebWorkers pour calculs intensifs
  * IndexedDB pour cache local des données volumineuses

* **Optimisation UI :**
  * Memoization des composants React (memo, useMemo, useCallback)
  * Rendu conditionnel et lazy loading
  * Throttling/debouncing des événements fréquents
  * Canvas optimisé pour grands diagrammes (plutôt que DOM)

### 9.2 Gestion des Erreurs et Robustesse

* **Validation des Entrées :**
  * TypeScript pour validation statique
  * Zod ou Yup pour validation runtime
  * Principes de design défensif

* **Traitement des Erreurs :**
  * Error Boundaries React pour isolation des crashs
  * Monitoring global via ErrorHandler
  * Logging structuré (winston, pino)
  * Recovery automatique quand possible

* **Sauvegarde et Récupération :**
  * Auto-sauvegarde via middleware
  * Historique de versions locales via Git-like storage
  * Possibilité de "Time Travel" dans les modifications

### 9.3 Configuration et Maintenance

* **Paramètres Utilisateur :**
  * electron-store pour stockage sécurisé
  * Synchronisation cloud optionnelle
  * Profils utilisateurs multiples

* **Mise à Jour :**
  * electron-updater pour auto-update
  * Migrations de données entre versions
  * Release notes intégrées

* **Support :**
  * Collecte de diagnostics (logs, config, screenshots)
  * Feedback in-app
  * Documentation contextuelle intégrée

## 10. Déploiement et Installation

* **Empaquetage :**
  * electron-builder pour création d'installateurs
  * Support multi-plateforme (Windows, macOS, Linux)
  * Auto-update via GitHub/S3/Custom server

* **Configuration Système :**
  * Installation silencieuse pour déploiement entreprise
  * Associations de fichiers .vsm
  * Intégration avec le système d'exploitation

* **Mode Administrateur :**
  * Interface séparée pour configuration avancée
  * Outils de diagnostic et réparation

## 11. Évolution Future et Extensibilité

* **Architecture Plugin :**
  * Système modulaire pour extensions
  * API publique documentée
  * Hot-loading de modules

* **Développement Futur :**
  * Mode collaboratif temps réel (via WebSockets)
  * Intégration IA pour suggestions d'amélioration
  * Applications mobiles compagnon (React Native)
  * Mode VR pour visualisation immersive
  * Intégration IoT pour données temps réel

* **Cycle de Vie du Produit :**
  * API versionné avec politique de compatibilité
  * Migrations automatisées
  * Feature flags pour déploiement progressif

## 12. Conclusion

Le client VSM Electron représente une solution moderne, flexible et puissante pour la création, l'analyse et la gestion des Value Stream Maps. L'utilisation de technologies web (TypeScript, React/Vue, Electron) offre des avantages significatifs en termes de :

1. Développement rapide et productif
2. Interface utilisateur riche et réactive
3. Déploiement cross-platform simplifié
4. Large écosystème de bibliothèques
5. Facilité d'extension et personnalisation

Les priorités de développement restent :
1. Stabilité et performances
2. Expérience utilisateur intuitive
3. Précision des calculs et analyses
4. Intégration avec systèmes existants
5. Architecture extensible et maintenable

Cette documentation technique servira de référence pour guider le développement, la maintenance et l'évolution du client VSM dans sa nouvelle architecture basée sur Electron et TypeScript.

---

*Note : Ce document est une conception conceptuelle. Les choix spécifiques de frameworks UI (React/Vue/Svelte), bibliothèques graphiques, et patterns d'architecture peuvent être adaptés selon les besoins et préférences de l'équipe de développement.*