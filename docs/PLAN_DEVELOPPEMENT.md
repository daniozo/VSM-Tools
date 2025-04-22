# Plan de développement VSM-Tools

## Table des matières

- [Introduction](#introduction)
- [Phase 1 : Configuration et infrastructure de base](#phase-1--configuration-et-infrastructure-de-base)
- [Phase 2 : Fonctionnalités fondamentales](#phase-2--fonctionnalités-fondamentales)
- [Phase 3 : Éditeur VSM](#phase-3--éditeur-vsm)
- [Phase 4 : Gestion des données et calculs](#phase-4--gestion-des-données-et-calculs)
- [Phase 5 : Fonctionnalités avancées](#phase-5--fonctionnalités-avancées)
- [Phase 6 : Optimisation et finitions](#phase-6--optimisation-et-finitions)
- [Phase 7 : Packaging et déploiement](#phase-7--packaging-et-déploiement)
- [Annexe : Priorités des fonctionnalités](#annexe--priorités-des-fonctionnalités)

## Introduction

Ce document présente le plan de développement détaillé pour l'application VSM-Tools, une application de bureau développée avec Electron et React/TypeScript pour la création et l'analyse de cartographies des flux de valeur (Value Stream Mapping). Le plan est organisé en phases logiques, chacune se concentrant sur un aspect spécifique du développement.

## Phase 1 : Configuration et infrastructure de base

### 1.1 Mise en place de l'environnement de développement
- Initialisation du projet avec Electron, TypeScript et React
- Configuration de Vite pour le bundling
- Mise en place d'ESLint et Prettier selon les guidelines
- Configuration du système de compilation (tsconfig.json)
- Mise en place de Git et structure initiale des branches

### 1.2 Architecture de base de l'application
- Création des processus Electron (main et renderer)
- Configuration du préchargement et des IPC
- Structure des dossiers selon guidelines
- Configuration de l'isolation du contexte pour la sécurité

### 1.3 Structure de base de l'interface utilisateur
- Mise en place du composant App principal avec React
- Création du layout principal (toolbar, sidebars, zone centrale)
- Implémentation du système de thème (clair/sombre)
- Mise en place de l'ErrorBoundary global

### 1.4 Configuration du système de tests
- Mise en place de Jest pour les tests unitaires
- Configuration de React Testing Library
- Mise en place de Playwright pour les tests e2e
- Création des tests de base pour l'infrastructure

## Phase 2 : Fonctionnalités fondamentales

### 2.1 Système de gestion d'état
- Implémentation du store global (avec Redux ou Zustand)
- Création des slices principaux (mapSlice, uiSlice, authSlice)
- Développement des actions et reducers
- Mise en place des sélecteurs (avec reselect si Redux)

### 2.2 Services de base
- Implémentation du service de stockage local (StorageService)
- Développement du service API (ApiService)
- Création du service d'authentification (AuthService)
- Mise en place du service de journalisation (LogService)

### 2.3 Menus et raccourcis
- Implémentation des menus natifs Electron
- Création des raccourcis clavier globaux
- Configuration du menu contextuel (clic droit)
- Mise en place des accélérateurs Electron

### 2.4 Système de notifications
- Création du composant Toast pour notifications
- Implémentation du système de notification global
- Gestion des erreurs et notifications associées
- Configuration des notifications natives du système

## Phase 3 : Éditeur VSM

### 3.1 Canvas d'édition
- Implémentation du composant canvas avec react-konva
- Mise en place du système de zoom et panoramique
- Gestion de la grille et du snap-to-grid
- Configuration du système de coordonnées

### 3.2 Palette d'outils
- Création du panneau de palette d'outils
- Implémentation du drag-and-drop depuis la palette
- Développement des différentes catégories d'outils
- Système de sélection d'outils actifs

### 3.3 Éléments VSM de base
- Implémentation des formes de base :
  - Processus
  - Stock
  - Fournisseur/Client
  - Flèches de flux (matière, information)
  - Texte et annotations
- Configuration des propriétés par défaut

### 3.4 Manipulation des éléments
- Système de sélection (simple et multiple)
- Implémentation du déplacement des éléments
- Gestion du redimensionnement
- Fonctionnalités couper/copier/coller
- Système d'annulation/rétablissement (undo/redo)

### 3.5 Connexions et flux
- Système de création de connexions entre éléments
- Types de flèches différents (push, pull, FIFO)
- Routage intelligent des connexions
- Points d'ancrage et connexions magnétiques

## Phase 4 : Gestion des données et calculs

### 4.1 Panneau de propriétés
- Développement du panneau dynamique de propriétés
- Création des champs spécifiques par type d'élément
- Validation des entrées en temps réel
- Mise à jour du modèle lors des modifications

### 4.2 Modèle de données VSM
- Finalisation du modèle de données complet
- Implémentation des transformations nécessaires
- Gestion de la sérialisation/désérialisation
- Validation du modèle complet

### 4.3 Calculs VSM
- Implémentation du service de calcul
- Calcul du temps de cycle total
- Calcul du lead time
- Calcul du temps à valeur ajoutée
- Calcul du ratio VA/NVA
- Calcul du takt time

### 4.4 Timeline et visualisation des données
- Création de la visualisation de la timeline
- Distinction VA/NVA sur la timeline
- Calcul et affichage des KPIs
- Indicateurs visuels de goulots d'étranglement

## Phase 5 : Fonctionnalités avancées

### 5.1 Gestion des cartes
- Système de création/ouverture de cartes
- Sauvegarde locale des cartes
- Gestion des métadonnées (nom, date, auteur)
- Système d'auto-sauvegarde

### 5.2 État actuel vs état futur
- Implémentation du système de basculement entre états
- Duplication de l'état actuel vers état futur
- Comparaison visuelle des deux états
- Tableau comparatif des KPIs

### 5.3 Kaizen et plan d'action
- Ajout d'éléments Kaizen Burst
- Système de notes et commentaires
- Création du plan d'action associé
- Suivi des améliorations

### 5.4 Intégration backend (optionnel)
- Authentification utilisateur
- Sauvegarde des cartes sur le serveur
- Synchronisation des données
- Gestion des conflits

## Phase 6 : Optimisation et finitions

### 6.1 Performance
- Optimisation du rendu canvas
- Memoization des composants et fonctions
- Lazy loading des parties non-critiques
- Profiling et optimisation des goulots d'étranglement

### 6.2 Expérience utilisateur
- Améliorations UI/UX basées sur les retours
- Animations et transitions
- Tooltips et aides contextuelles
- Tour guidé pour nouveaux utilisateurs

### 6.3 Accessibilité
- Support du clavier pour toutes les fonctionnalités
- Contraste et lisibilité
- Alternatives textuelles pour éléments visuels
- Tests d'accessibilité

### 6.4 Export
- Export en PNG/JPG
- Export en SVG
- Export en PDF
- Export des données en CSV/Excel

## Phase 7 : Packaging et déploiement

### 7.1 Configuration du packaging
- Configuration d'electron-builder
- Définition des cibles (Windows, macOS, Linux)
- Gestion des icônes et ressources
- Configuration des installateurs

### 7.2 Système de mise à jour
- Implémentation du système auto-update
- Gestion des versions et changelog
- Notifications de mise à jour
- Rollback en cas d'échec

### 7.3 Documentation
- Finalisation de la documentation technique
- Création de la documentation utilisateur
- Mise en place d'un système d'aide intégré
- Création des vidéos tutorielles

### 7.4 Déploiement
- Création des packages d'installation
- Tests sur différentes plateformes
- Signature des applications si nécessaire
- Publication sur les canaux de distribution

## Annexe : Priorités des fonctionnalités

### Priorité haute (MVP)
- Éditeur VSM de base (ajout d'éléments, connexions)
- Manipulation basique des éléments
- Sauvegarde/chargement local
- Panneau de propriétés simple
- Calculs de base (lead time, VA/NVA)

### Priorité moyenne
- Timeline et visualisation des KPIs
- Export PNG/PDF
- Gestion état actuel/futur
- Système undo/redo
- Kaizen Bursts

### Priorité basse (améliorations)
- Intégration backend complète
- Export avancé (SVG, Excel)
- Animations et effets visuels
- Plan d'action détaillé
- Collaboration temps réel (si applicable)

---

Ce plan de développement est conçu pour être flexible et itératif. Chaque phase peut être développée de manière incrémentale, avec des tests continus et des ajustements basés sur les retours. Les priorités peuvent être ajustées selon les besoins spécifiques des utilisateurs et les contraintes du projet.