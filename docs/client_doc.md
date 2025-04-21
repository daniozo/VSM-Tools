# Documentation Technique : Client VSM (Application de Bureau Qt)

<br>

<!-- TOC --> 1
* [Documentation Technique : Client VSM (Application de Bureau Qt)](#documentation-technique--client-vsm-application-de-bureau-qt)
  * [1. Introduction et Objectifs](#1-introduction-et-objectifs)
  * [2. Fonctionnalités Principales (Vue Utilisateur)](#2-fonctionnalités-principales-vue-utilisateur)
  * [3. Architecture Interne (Client Qt)](#3-architecture-interne-client-qt)
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

Ce document décrit la conception et le fonctionnement du client VSM, une application de bureau développée avec le framework Qt (C++). Ce client permet aux utilisateurs de créer, visualiser, analyser et gérer des cartographies de la chaîne de valeur (Value Stream Maps).

Il s'agit d'un client **riche** interagissant avec un **serveur backend** via une API. Le client gère l'interface utilisateur, les interactions directes, la visualisation des données et délègue au backend la persistance centrale des données, la logique métier complexe éventuelle, et la gestion de la collaboration.

**Objectifs principaux du client :**

*   Fournir une interface graphique intuitive pour dessiner et éditer des VSM (état actuel et futur).
*   Permettre la saisie et l'affichage des données associées à chaque élément de la VSM (temps de cycle, stocks, TRS, etc.).
*   Visualiser les flux de matière et d'information.
*   Demander au backend ou calculer localement les indicateurs clés (Lead Time, %VA, Takt Time, etc.).
*   Aider à l'identification des gaspillages et des goulots d'étranglement.
*   Faciliter la conception et la comparaison de l'état futur.
*   Interagir avec le backend pour sauvegarder, charger et partager les VSM.
*   Gérer l'authentification utilisateur.
*   Permettre l'export des VSM et des données associées.

## 2. Fonctionnalités Principales (Vue Utilisateur)

*   **Gestion des Cartes :** Créer, ouvrir, sauvegarder (localement et sur le serveur), supprimer, lister les cartes VSM.
*   **Édition Visuelle :**
    *   Dessiner des processus, stocks, fournisseurs/clients, flux via une palette d'outils et du drag-and-drop.
    *   Connecter les éléments avec des flèches de flux (matière, information, poussé, tiré, FIFO, électronique, etc.).
    *   Ajouter des "Kaizen Bursts" pour marquer les opportunités d'amélioration.
    *   Zoomer, dézoomer, naviguer dans la carte.
*   **Saisie de Données :** Sélectionner un élément et saisir/modifier ses attributs (temps de cycle, VA, NVA, opérateurs, TRS, quantité en stock, etc.) via des panneaux de propriétés dédiés.
*   **Calculs et Analyse :**
    *   Afficher la ligne de temps (Timeline) calculée avec distinction VA/NVA et Lead Time total.
    *   Afficher le %VA global.
    *   Calculer et afficher le Takt Time (basé sur les entrées utilisateur).
    *   Visualiser les goulots (par ex., par couleur ou icône sur les processus dont TC > Takt Time).
*   **Gestion État Actuel / Futur :** Basculer entre la vue "État Actuel" et "État Futur", dupliquer l'état actuel pour démarrer l'état futur, comparer les indicateurs clés.
*   **Plan d'Action :** Associer des actions concrètes (description, responsable, échéance) aux Kaizen Bursts.
*   **Authentification :** Connexion/Déconnexion utilisateur via interaction avec le backend.
*   **Export :** Exporter la VSM en format image (PNG, SVG) ou document (PDF), exporter les données et le plan d'action (CSV).

## 3. Architecture Interne (Client Qt)

Le client est développé en C++ avec Qt. Les principaux composants sont :

*   **`MainWindow` (QMainWindow) :** Fenêtre principale de l'application. Contient la barre de menus, la barre d'outils, la barre de statut, et gère l'agencement des docks et de la zone centrale.
*   **`VsmGraphicsView` (QGraphicsView) :** Widget central affichant la carte VSM. Associé à une `VsmGraphicsScene`. Gère le zoom, le déplacement, la sélection.
*   **`VsmGraphicsScene` (QGraphicsScene) :** Contient tous les éléments graphiques de la VSM. Gère la logique de positionnement et d'interaction de base des items.
*   **Items Graphiques (Classes héritant de `QGraphicsItem` ou `QGraphicsObject`) :**
    *   `ProcessItem` : Représente une boîte de processus. Gère son apparence et ses points de connexion.
    *   `StockItem` : Représente un symbole de stock.
    *   `FlowArrowItem` : Représente une flèche de flux (matière ou information), gère le tracé et l'apparence (pointillés, type de flèche...).
    *   `DataBoxItem` : (Optionnel) Peut être un item séparé ou intégré aux autres pour afficher les données clés directement sur la carte.
    *   `KaizenBurstItem` : Symbole éclair Kaizen.
    *   Autres items pour Fournisseur/Client, Transport, etc.
*   **Modèles de Données C++ :** Classes simples (structs ou classes) pour représenter la logique métier de la VSM (indépendamment de l'UI Qt) :
    *   `VsmMap` : Contient toutes les informations d'une carte (liste des processus, stocks, flux, métadonnées, état actuel/futur).
    *   `ProcessData`, `StockData`, `FlowData` : Contiennent les attributs spécifiques à chaque type d'élément.
*   **Panneaux de Propriétés (`QWidget` ou `QDockWidget`) :**
    *   `PropertyEditorPanel` : Affiche les champs de saisie correspondant à l'élément VSM sélectionné. Utilise des `QLineEdit`, `QSpinBox`, `QComboBox`, etc.
    *   `SymbolPalettePanel` : Affiche les symboles VSM disponibles pour le drag-and-drop.
    *   `TimelineWidget` : Affiche la ligne de temps VA/NVA calculée.
*   **`NetworkManager` (QObject) :** Module responsable de toute la communication avec l'API du backend. Utilise `QNetworkAccessManager` pour envoyer des requêtes HTTP (GET, POST, PUT, DELETE) et traiter les réponses (souvent JSON). Gère l'authentification (ex: stockage et envoi de tokens).
*   **`CalculationEngine` (QObject ou classes statiques) :** (Si les calculs sont faits côté client) Contient la logique pour calculer le Lead Time, %VA, Taux d'utilisation, etc., à partir des données du `VsmMap`.
*   **`LocalStorageManager` (QObject) :** (Optionnel) Gère la sauvegarde et le chargement des cartes sur le disque local (ex: pour brouillons ou mode hors-ligne simple) en utilisant `QFile`, `QJsonDocument`, ou `QtSql` (SQLite).
*   **`ActionPlanManager` :** Gère la logique liée au plan d'action (création, modification, liaison aux Kaizen Bursts), potentiellement avec un `QTableView` pour l'affichage.

## 4. Interface Utilisateur (UI) et Interactions

*   **Fenêtre Principale :** Structure classique avec menu (Fichier, Édition, Vue, Outils, Aide), barre d'outils pour accès rapide aux actions courantes (Nouveau, Ouvrir, Sauver, Symboles, Zoom), et zone centrale pour l'éditeur VSM.
*   **Éditeur VSM :**
    *   **Ajout d'éléments :** Drag-and-drop depuis la palette de symboles vers la scène.
    *   **Sélection :** Clic gauche sur un élément. Sélection multiple possible (Shift+Clic ou zone de sélection).
    *   **Modification des propriétés :** Sélectionner un élément affiche ses propriétés dans le panneau dédié. La modification des champs met à jour l'objet de données C++ associé.
    *   **Connexion :** Mode "Connexion" ou clic sur des points d'ancrage spécifiques des items pour dessiner les flèches de flux. Une boîte de dialogue peut apparaître pour définir le type de flux.
    *   **Déplacement/Redimensionnement :** Clic et glisser sur les éléments ou leurs poignées.
    *   **Menu Contextuel :** Clic droit sur un élément ou sur la scène pour accéder aux actions contextuelles (Supprimer, Modifier les propriétés, Ajouter Kaizen Burst...).
*   **Panneaux Latéraux/Docks :** Peuvent être affichés/masqués, déplacés, flottants (comportement standard des `QDockWidget`). Contiennent la palette, les propriétés, la timeline, la liste des actions, etc.

## 5. Gestion des Données

*   **Modèle Central :** L'instance `VsmMap` (et ses objets enfants) en mémoire C++ représente l'état actuel de la carte VSM en cours d'édition.
*   **Liaison UI-Modèle :** Les modifications dans l'UI (panneau de propriétés) mettent à jour directement l'objet `VsmMap`. Les modifications sur la scène graphique (déplacement, connexion) mettent également à jour le modèle `VsmMap`.
*   **Synchronisation Backend :**
    *   **Chargement :** Au démarrage ou à l'ouverture d'une carte, `NetworkManager` requête l'API backend, reçoit les données (probablement JSON), les désérialise et peuple l'objet `VsmMap`. L'UI est ensuite mise à jour pour afficher cette carte.
    *   **Sauvegarde :** L'utilisateur déclenche la sauvegarde. L'objet `VsmMap` est sérialisé (probablement en JSON) et envoyé au backend via une requête PUT ou POST par `NetworkManager`.
*   **Stockage Local :**
    *   Option pour "Sauvegarder localement" ou sauvegarde automatique de brouillons. `LocalStorageManager` sérialise `VsmMap` dans un fichier (JSON, XML ou format binaire) ou une base SQLite locale.
*   **Format d'Échange :** JSON est le format privilégié pour la communication API et potentiellement pour le stockage local simple.

## 6. Communication avec le Backend

*   **Protocole :** API RESTful (principalement) ou potentiellement gRPC.
*   **Module Qt :** `QNetworkAccessManager`, `QNetworkRequest`, `QNetworkReply`.
*   **Format de Données :** JSON.
*   **Authentification :**
    *   Écran de connexion initial.
    *   Requête POST vers un endpoint `/api/auth/login` avec identifiants.
    *   Le backend renvoie un token (ex: JWT) en cas de succès.
    *   `NetworkManager` stocke le token et l'ajoute aux en-têtes (`Authorization: Bearer <token>`) de toutes les requêtes suivantes.
    *   Gestion de l'expiration du token et du rafraîchissement si implémenté.
*   **Endpoints API Clés (Exemples) :**
    *   `POST /api/auth/login` : Connexion utilisateur.
    *   `GET /api/maps` : Lister les cartes VSM accessibles à l'utilisateur.
    *   `POST /api/maps` : Créer une nouvelle carte VSM.
    *   `GET /api/maps/{mapId}` : Récupérer les détails d'une carte spécifique.
    *   `PUT /api/maps/{mapId}` : Mettre à jour/Sauvegarder une carte existante.
    *   `DELETE /api/maps/{mapId}` : Supprimer une carte.
    *   `GET /api/maps/{mapId}/calculate` : (Si calculs backend) Demander les indicateurs calculés pour une carte.
    *   `GET/POST/PUT /api/maps/{mapId}/actions` : Gérer le plan d'action associé.
*   **Gestion des Erreurs :**
    *   Traiter les erreurs réseau (`QNetworkReply::NetworkError`).
    *   Traiter les erreurs applicatives du backend (codes HTTP 4xx, 5xx) et afficher des messages clairs à l'utilisateur.

## 7. Fonctionnalités Spécifiques (Implémentation Client)

*   **Calculs :**
    *   **Si Côté Client :** `CalculationEngine` prend l'objet `VsmMap` en entrée, parcourt les processus et les stocks, somme les temps VA et NVA, calcule le Lead Time total, le %VA, compare les TC au Takt Time (préalablement saisi par l'utilisateur). Met à jour les propriétés des items ou un modèle de données spécifique pour l'affichage (timeline, indicateurs).
    *   **Si Côté Backend :** `NetworkManager` envoie une requête (ex: `GET /api/maps/{mapId}/calculate`). La réponse contient les indicateurs calculés. Le client met à jour l'UI avec ces résultats.
*   **État Futur :** Géré comme une instance distincte de `VsmMap`, potentiellement liée à l'ID de la carte "État Actuel". L'UI permet de basculer l'affichage et les calculs entre les deux instances. Un widget de comparaison affiche côte à côte les indicateurs clés des deux états.
*   **Export :**
    *   **Image (PNG, JPG) :** Utiliser `QPixmap::grab()` sur `VsmGraphicsView` ou dessiner la `VsmGraphicsScene` sur un `QPixmap` hors écran pour enregistrer en fichier image.
    *   **Vectoriel (SVG) :** Utiliser `QSvgGenerator` et lui passer un `QPainter` pour dessiner la scène.
    *   **Document (PDF) :** Utiliser `QPdfWriter` et lui passer un `QPainter` pour dessiner la scène.
    *   **Données (CSV) :** Parcourir l'objet `VsmMap` et écrire les données pertinentes (propriétés des processus, stocks, actions) dans un fichier texte formaté en CSV, en utilisant `QFile` et `QTextStream`.

## 8. Modules Complémentaires

### 8.1 Module de Configuration

* **UI :**
  * Fenêtres/dialogues (`QDialog`) pour définir les paramètres généraux :
    * Configuration de la connexion à la base de données
    * Définition des lignes/ateliers/processus à cartographier
    * Paramétrage des postes de travail (nom, capacité théorique, TC standard, etc.)
    * Définition des produits/familles de produits
    * Configuration du Temps Disponible (horaires, pauses planifiées) pour le calcul du Takt Time
* **Logique :**
  * Sauvegarde/chargement de ces paramètres (via `QSettings` ou dans la base de données)

### 8.2 Module d'Acquisition des Données

C'est le cœur de la collecte. Il faut prévoir plusieurs modes d'entrée :

* **Saisie Manuelle :**
  * **UI :** Des formulaires (`QWidget` avec `QLineEdit`, `QSpinBox`, `QComboBox`, `QDateTimeEdit`) pour que les opérateurs ou superviseurs saisissent :
    * Quantités produites (bonnes, rebuts) par poste/période
    * Temps de cycle observés (si non automatiques)
    * Événements d'arrêt (début, fin, cause via liste déroulante standardisée - ex: panne, réglage, manque matière, réunion...)
    * Temps de passage manuel (si suivi physique)
    * Commandes reçues et livraisons effectuées (pour Taux de Service)
  * **Logique :** Validation des saisies, enregistrement horodaté dans la base de données

* **Acquisition Semi-Automatique (ex: Scanners) :**
  * **Logique :**
    * Écoute des périphériques d'entrée (ex: via `QSerialPort` si scanner série, ou simplement comme une entrée clavier si scanner USB HID)
    * Interprétation des codes-barres/QR codes pour identifier produits, lots, opérateurs, début/fin d'opération

* **Acquisition Automatique (Capteurs, Automates/PLC, MES/ERP) :**
  * **Logique :**
    * **Automates (PLC) :**
      * Communication via protocoles industriels (Modbus TCP/RTU, OPC UA)
      * Nécessite des bibliothèques tierces (libmodbus, open62541) intégrées au projet Qt, ou utilisation de solutions middleware
      * Le module Qt Network (`QTcpSocket`) est utilisé pour la communication TCP/IP
      * Des `QThread` seraient nécessaires pour gérer la communication en arrière-plan sans bloquer l'UI
      * Récupération des compteurs de pièces, états machine (marche, arrêt, défaut), temps de cycle machine
    * **Bases de Données (MES/ERP) :**
      * Connexion via Qt SQL pour lire directement les tables de production, d'arrêts, de qualité, de commandes, d'expéditions, si l'accès direct est permis et documenté
    * **API (MES/ERP) :**
      * Utilisation de `QNetworkAccessManager` pour interroger des API REST ou SOAP exposées par les systèmes tiers afin de récupérer les données nécessaires
      * Analyse des réponses (JSON, XML avec `QJsonDocument`, `QXmlStreamReader`)

### 8.3 Module de Calcul

* **Logique :**
  * Des classes C++ dédiées pour implémenter chaque formule VSM
  * Fonctions pour requêter la base de données (via le modèle) afin d'agréger les données brutes sur une période donnée (jour, semaine, mois, lot...)
  * Calcul des :
    * Temps VA (basé sur standards ou observations chronométrées stockées)
    * Lead Times (par suivi ou calcul Loi de Little basé sur stocks et débits)
    * Takt Time (basé sur demande et config temps dispo)
    * Temps de Cycle moyens
    * Taux d'Utilisation
    * TRS (avec ses composantes D, P, Q)
    * Taux de Rejet
    * Taux de Service
* **Déclenchement :**
  * Les calculs peuvent être déclenchés :
    * Manuellement (bouton ou menu "Recalculer" dans l'interface)
    * Automatiquement après chaque modification de données
    * Périodiquement (via `QTimer`) pour les tableaux de bord en temps réel
    * Lors de l'ouverture d'une carte ou changement de période d'analyse
  * Les résultats de calcul sont stockés dans un modèle de données (ex: `CalculationResultsModel`) qui peut être :
    * Affiché directement dans l'UI (tableaux, widgets dédiés)
    * Utilisé pour colorer/annoter les éléments graphiques de la VSM (ex: colorer en rouge les processus goulots)
    * Exporté dans les rapports

### 8.4 Module de Visualisation et Tableaux de Bord

* **UI :**
  * Tableau de bord principal (`QWidget` composite) avec disposition en grille (`QGridLayout`)
  * Widgets graphiques personnalisés :
    * `TimelineChart` : Visualisation de la ligne de temps VA/NVA
    * `ProcessComparisonChart` : Comparaison des TC aux Takt Time (barres)
    * `TRSGaugeWidget` : Jauges semi-circulaires pour TRS et composantes
    * `LeadTimeHistoryChart` : Graphique d'évolution du Lead Time
    * `StockLevelChart` : Niveaux de stocks à chaque étape
  * Utilisation de bibliothèques graphiques :
    * Qt Charts pour les graphiques standards (histogrammes, courbes)
    * Possibilité d'intégrer QCustomPlot ou similaire pour des visualisations plus avancées
* **Logique :**
  * Des classes d'adaptation (`ChartDataAdapter`) pour transformer les données brutes du modèle en format attendu par les widgets graphiques
  * Actualisation automatique via signaux/slots lors de modifications des données
  * Filtres et sélecteurs pour changer la période, la famille de produits, la ligne analysée

### 8.5 Module d'Export et Rapports

* **UI :**
  * Dialogues de configuration d'export (`QDialog`) permettant de choisir :
    * Format (PDF, Excel, CSV, Image)
    * Contenu (carte complète, données uniquement, plan d'action, etc.)
    * Période et filtres
  * Aperçu avant export (notamment pour PDF)
* **Logique :**
  * Générateurs de rapport (`PDFReportGenerator`, `ExcelReportGenerator`) :
    * Utilisation de `QPdfWriter` et `QPainter` pour PDF
    * Bibliothèque tierce (QXlsx ou similaire) pour Excel
    * `QSvgGenerator` pour SVG
    * Templates prédéfinis (en-têtes, sections standard, mise en page)
  * Export de données brutes en CSV via `QFile` et `QTextStream`
  * Export d'images via `QGraphicsScene::render()` vers `QImage` ou `QPixmap`

## 9. Considérations Techniques

### 9.1 Performance et Optimisation

* **Gestion des Données Volumineuses :**
  * Chargement progressif des historiques
  * Aggrégation temporelle automatique (échantillonnage) pour les grands jeux de données
  * Utilisation de `QFuture` et `QtConcurrent` pour les calculs lourds en arrière-plan
  * Cache des résultats de calcul fréquents

* **Optimisation UI :**
  * Mise à jour intelligente des vues (ne redessiner que ce qui change)
  * Utilisation de viewport culling dans `QGraphicsView` pour ne dessiner que ce qui est visible
  * Désactivation temporaire des animations pendant les opérations lourdes
  * Niveau de détail adaptatif selon le niveau de zoom

### 9.2 Gestion des Erreurs et Robustesse

* **Validation des Entrées :**
  * Vérification des données à la saisie
  * Contraintes et limites appliquées aux champs (min/max)
  * Feedback visuel immédiat (ex: bordure rouge) sur les champs invalides

* **Traitement des Erreurs :**
  * Architecture d'exceptions C++ personnalisée (ex: `VsmDataException`, `VsmNetworkException`)
  * Journalisation complète (`QLoggingCategory`)
  * Affichage de messages d'erreur explicites via `QMessageBox`
  * Mécanisme de récupération après erreur (ex: rollback des modifications)

* **Sauvegarde et Récupération :**
  * Sauvegarde automatique périodique (local)
  * Fonction "Restaurer version précédente"
  * Historique des changements récents en mémoire

### 9.3 Configuration et Maintenance

* **Paramètres Utilisateur :**
  * Utilisation de `QSettings` pour stocker les préférences
  * Interface de configuration accessible depuis le menu Outils
  * Stockage des paramètres par utilisateur et/ou globaux

* **Mise à Jour :**
  * Mécanisme de vérification de version (via `NetworkManager`)
  * Notification de mises à jour disponibles
  * Option d'auto-mise à jour (nécessite logique supplémentaire d'installation)

* **Support :**
  * Fonction "Envoyer Rapport d'Erreur" avec capture du contexte
  * Manuel utilisateur intégré (HTML, accessible via QtHelp)
  * Information système (versions, config) pour le support technique

## 10. Déploiement et Installation

* **Empaquetage :**
  * Utilisation de Qt Installer Framework pour créer des installateurs
  * Options pour Windows (MSI, EXE), macOS (DMG), Linux (DEB, RPM)
  * Inclusion des dépendances (Qt, bibliothèques tierces)

* **Configuration Système :**
  * Création des raccourcis/icônes
  * Association de type de fichier (.vsm)
  * Installation des drivers/dépendances système nécessaires

* **Mode Administrateur :**
  * Interface spéciale pour les administrateurs système
  * Configuration des connexions aux bases de données/systèmes
  * Gestion des utilisateurs et droits (si non délégué au backend)

## 11. Évolution Future et Extensibilité

* **Architecture Plugin :**
  * Système de plugins via `QPluginLoader`
  * Points d'extension identifiés :
    * Nouveaux symboles VSM
    * Connecteurs pour systèmes externes (MES, ERP, etc.)
    * Algorithmes de calcul personnalisés
    * Visualisations et rapports

* **Développement Futur :**
  * Support multi-cartes (comparaison côte à côte)
  * Fonctionnalités de simulation (what-if)
  * Mode multi-utilisateurs temps réel (édition collaborative)
  * Intégration IoT pour données en temps réel
  * Analyse avancée (intelligence artificielle, prédiction, optimisation)

* **Cycle de Vie du Produit :**
  * Gestion de versions avec compatibilité ascendante
  * Stratégie de dépréciation des fonctionnalités obsolètes
  * Documentation des APIs publiques pour extensions tierces

## 12. Conclusion

Le client VSM Qt représente une solution complète pour la création, l'analyse et la gestion des Value Stream Maps. Son architecture modulaire garantit flexibilité et évolutivité, tandis que sa conception centrée sur l'utilisateur assure une expérience intuitive et productive.

Les principales priorités de développement sont :
1. Stabilité et performances de base
2. Ergonomie et simplicité d'utilisation
3. Précision des calculs et analyses
4. Connectivité avec les systèmes existants
5. Extensibilité pour les besoins spécifiques

Cette documentation technique servira de référence pour le développement, la maintenance et l'extension du client VSM dans les années à venir.


---

*Note : Ce document est une conception conceptuelle. Les noms de classes, les détails d'implémentation et les choix technologiques spécifiques (ex: REST vs gRPC, format de token) peuvent varier dans l'implémentation réelle.* 