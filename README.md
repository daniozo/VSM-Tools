# VSM-Tools

## Introduction

VSM-Tools est une application de bureau **développée dans le cadre d'un projet académique**. Elle est conçue pour la création, la visualisation et l'analyse des cartographies de la chaîne de valeur (Value Stream Mapping - VSM). Elle vise à aider les entreprises à identifier les gaspillages, localiser les goulots d'étranglement et optimiser leurs flux de production et processus pour améliorer la performance globale, en surmontant les limitations des outils traditionnels (papier, tableurs, dessin générique).

L'objectif est de fournir un outil intuitif mais puissant, rendant l'analyse VSM plus accessible, rapide et basée sur les données, pour les responsables production, logistique, qualité, les équipes d'amélioration continue et la direction.

## Fonctionnalités Clés

*   **Modélisation Visuelle Intuitive :** Création facile de VSM par glisser-déposer depuis une palette de symboles standards (Processus, Stock, Flux, Fournisseur/Client, etc.).
*   **Enrichissement des Données :** Saisie simple des métriques clés (temps de cycle, temps de changement, opérateurs, quantité en stock, TRS/OEE, etc.) via un panneau de propriétés contextuel.
*   **Calculs Automatiques :** Calcul instantané des indicateurs Lean essentiels (Lead Time total, Temps de Cycle total, Temps à Valeur Ajoutée, Taux de Valeur Ajoutée - %VA, Takt Time).
*   **Timeline Dynamique :** Visualisation temporelle du flux de valeur avec distinction VA/NVA.
*   **Analyse Guidée :** Identification visuelle des goulots d'étranglement (ex: processus avec TC > Takt Time) et des zones de gaspillage (via Kaizen Bursts).
*   **Gestion État Actuel / Futur :** Création, édition et comparaison des cartographies état actuel et état futur.
*   **Plan d'Action :** Association d'actions d'amélioration aux Kaizen Bursts (description, responsable, échéance).
*   **Export :** Exportation des cartes (PNG, SVG, PDF) et des données (CSV).
*   **Gestion des Cartes :** Création, ouverture, sauvegarde locale.

*(Fonctionnalités avancées envisagées : Simulation "What-if", Analyse Prédictive, Suggestions d'Optimisation, Collaboration temps réel, Intégration backend)*

## Technologies Utilisées

*   **Framework :** Electron
*   **Interface Utilisateur :** React avec TypeScript
*   **Bundler :** Vite
*   **Styling :** Tailwind CSS, CSS Modules
*   **Gestion d'état :** Redux ou Zustand (planifié)
*   **Canvas/Graphiques :** react-konva (planifié)
*   **Tests :** Jest (Unitaires), React Testing Library (UI), Playwright (E2E) (planifié)

## État du Projet

Le projet est en phase de développement actif. D'après le plan de développement et les documents de mi-parcours :
*   **Phase 1 (Configuration et infrastructure)** : Terminée.


## Structure du Projet (Simplifiée)

```
VSM-Tools/
├── docs/                    # Documentation (conception, diagrammes, rapports...)
├── electron/                # Configuration et build Electron
├── src/                     # Code source principal
│   ├── main/                # Processus principal Electron
│   ├── renderer/            # Processus de rendu (UI React)
│   ├── services/            # Logique métier, API, calculs...
│   ├── shared/              # Code partagé (types, utils, composants...)
│   └── assets/              # Ressources statiques
├── tests/                   # Tests automatisés (unit, integration, e2e)
├── index.html               # Point d'entrée HTML pour Vite/Renderer
├── package.json             # Dépendances et scripts
├── vite.config.mjs          # Configuration Vite
├── tailwind.config.js       # Configuration Tailwind CSS
└── README.md                # Ce fichier
```