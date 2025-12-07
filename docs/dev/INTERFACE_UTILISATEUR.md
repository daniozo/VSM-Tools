# Interface Utilisateur VSM-Tools

## Vue d'ensemble

Ce document décrit l'interface utilisateur de l'application VSM-Tools, conçue pour la création et l'analyse de cartographies des flux de valeur (Value Stream Mapping). L'interface adopte une structure classique d'application de bureau professionnelle avec des menus, barres d'outils, panneaux latéraux et zone d'édition centrale.


## Structure principale

L'interface est composée des éléments suivants :

1. **Barre de menus** - Située en haut de l'application
2. **Barre d'outils principale** - Sous la barre de menus
3. **Panneau latéral gauche** - Palette de symboles et outils
4. **Zone d'édition centrale** - Canevas d'édition principal
5. **Panneau latéral droit** - Propriétés et informations contextuelles
6. **Barre d'état/navigation** - En bas de l'interface

## Description détaillée des composants

### 1. Barre de menus

Barre de menus classique horizontale en haut de l'application, comprenant :

- **Fichier**
  - Nouveau
  - Ouvrir...
  - Récents
  - Enregistrer
  - Enregistrer sous...
  - Exporter (PNG, SVG, PDF, Excel)
  - Imprimer...
  - Quitter

- **Édition**
  - Annuler
  - Rétablir
  - Couper
  - Copier
  - Coller
  - Supprimer
  - Sélectionner tout
  - Préférences...

- **Affichage**
  - Zoom (Zoom+, Zoom-, Zoom 100%)
  - Plein écran
  - Afficher/masquer panneaux latéraux
  - Afficher/masquer grille
  - Afficher/masquer règles
  - Thème (Clair, Sombre, Système)

- **Carte**
  - Ajouter élément
  - Propriétés de la carte...
  - État actuel/futur
  - Calculer indicateurs
  - Plan d'action

- **Aide**
  - Documentation
  - Raccourcis clavier
  - À propos
  - Vérifier les mises à jour

### 2. Barre d'outils principale

Située directement sous la barre de menus, contient les outils fréquemment utilisés :

- **Groupe Fichier** 
  - Nouveau (icône)
  - Ouvrir (icône)
  - Enregistrer (icône)

- **Groupe Édition**
  - Annuler (icône)
  - Rétablir (icône)
  - Couper/Copier/Coller (icônes)

- **Groupe Affichage**
  - Contrôle de zoom (champ numérique éditable + menu déroulant)
  - Zoom+ (icône)
  - Zoom- (icône)
  - Ajuster à la fenêtre (icône)

- **Groupe Panneaux**
  - Afficher/masquer panneau gauche (icône)
  - Afficher/masquer panneau droit (icône)
  - Plein écran (icône)

- **Groupe Outils**
  - Sélection (icône)
  - Connexion (icône)
  - Texte (icône)
  - Main (pour navigation panoramique)

### 3. Panneau latéral gauche - Palette de symboles

Panneau vertical à bordure nette (sans ombres) sur le côté gauche de l'interface :

- **En-tête avec titre "Outils" et bouton de fermeture**
- **Onglets ou accordéons pour catégories de symboles** :
  
  - **Processus**
    - Processus standard
    - Processus automatisé
    - Opérateur
    - Workstation

  - **Stockage**
    - Inventaire/Stock
    - Supermarché
    - FIFO
    - Buffer

  - **Flux**
    - Flux de matière (push)
    - Flux tiré
    - Flux d'information
    - Livraison

  - **Entités externes**
    - Fournisseur
    - Client
    - Transport

  - **Kaizen/Analyse**
    - Kaizen Burst
    - Point de mesure
    - Commentaire
    - Zone problématique

  - **Données**
    - Boîte de données
    - Tableau
    - Diagramme
    - Timeline

- **Chaque symbole est représenté par une icône claire avec libellé**
- **Fonctionnalité de recherche/filtre pour trouver rapidement des symboles**

### 4. Zone d'édition centrale

Zone principale de l'application :

- **Canevas d'édition** avec grille optionnelle
- **Arrière-plan clair avec grille légère** (points ou lignes fines)
- **Règles** (optionnelles) sur les côtés horizontal et vertical
- **Système de zoom** avec indicateur visuel de niveau de zoom
- **Barre de défilement** horizontale et verticale pour les cartes dépassant la vue
- **Aperçu en miniature** (optionnel) pour naviguer facilement dans les grandes cartes

### 5. Panneau latéral droit - Propriétés

Panneau vertical à bordure nette sur le côté droit :

- **En-tête avec titre "Propriétés" et bouton de fermeture**
- **Contenu dynamique selon l'élément sélectionné :**
  
  - **Aucune sélection :** Propriétés générales de la carte (nom, description, date, auteur)
  
  - **Sélection d'un processus :**
    - Nom du processus
    - Temps de cycle
    - Temps de changement
    - Nombre d'opérateurs
    - Temps disponible
    - Taux de qualité
    - TRS/OEE
    - Commentaires
  
  - **Sélection d'un stock :**
    - Type de stock
    - Quantité
    - Unité
    - Délai
    - Politique de gestion
  
  - **Sélection d'un flux :**
    - Type de flux
    - Fréquence
    - Quantité par livraison
    - Mode de déclenchement
  
  - **Sélection multiple :** Propriétés communes aux éléments sélectionnés

- **Organisé en sections collapsibles** pour les caractéristiques regroupées
- **Validations en temps réel** des valeurs saisies

### 6. Barre d'état/navigation

Barre horizontale en bas de l'interface :

- **Sélecteur d'onglets** pour basculer entre :
  - État actuel
  - État futur
  - Comparaison
  
- **Informations de statut** :
  - Coordonnées de la souris sur le canevas
  - Dimensions de sélection
  - État de sauvegarde
  
- **Indicateurs calculés** :
  - Lead Time total
  - Temps à valeur ajoutée
  - Ratio VA/NVA
  
- **Contrôles supplémentaires** :
  - Bouton d'aide contextuelle
  - Indicateur de connectivité (si fonctionnalité cloud)

## Principes de design

- **Minimalisme fonctionnel** : Interface claire sans éléments décoratifs excessifs
- **Bordures nettes plutôt qu'ombres** pour délimiter les zones
- **Palette de couleurs limitée** avec accents pour les éléments interactifs
- **Hauteur d'en-tête réduite** pour maximiser l'espace de travail
- **Cohérence** : Comportements uniformes dans toute l'application
- **Personnalisation** : Possibilité de masquer/afficher les panneaux selon les besoins
- **Accessibilité** : Contraste suffisant et alternatives au contrôle par souris

## Comportements spécifiques

- **Drag-and-drop** des symboles depuis la palette vers le canevas
- **Sélection** par clic ou rectangle de sélection
- **Connexions** entre éléments via mode connexion
- **Redimensionnement** des éléments via poignées visibles
- **Édition in-place** des textes avec double-clic
- **Zoom** via molette de souris, raccourcis clavier ou boutons dédiés
- **Pan** (déplacement du canevas) via clic-milieu ou mode main
- **Snap-to-grid** pour alignement facile des éléments
- **Undo/Redo** pour toutes les actions d'édition
- **Auto-sauvegarde** périodique avec indicateur visuel

## Modes spéciaux

- **Mode plein écran** : Masque les éléments d'interface pour maximiser la zone d'édition
- **Mode présentation** : Optimisé pour la présentation de la carte sans les outils d'édition
- **Mode comparaison** : Affichage côte à côte des états actuel et futur

## Raccourcis clavier

Les raccourcis suivants seront implémentés pour une utilisation efficace :

- **Fichier** : Ctrl+N (nouveau), Ctrl+O (ouvrir), Ctrl+S (enregistrer)
- **Édition** : Ctrl+Z (annuler), Ctrl+Y (rétablir), Ctrl+X/C/V (couper/copier/coller), Del (supprimer)
- **Affichage** : Ctrl+ (zoom+), Ctrl- (zoom-), Ctrl+0 (zoom 100%), F11 (plein écran)
- **Outils** : V (sélection), C (connexion), T (texte), H (main)
- **Panneaux** : F4 (panneau gauche), F5 (panneau droit)
- **Navigation** : Tab (élément suivant), Shift+Tab (élément précédent)

## Considérations techniques

- **Responsive** : Adaptation à différentes tailles d'écran et résolutions
- **Performance** : Optimisation pour grande quantité d'éléments sans lag
- **Thèmes** : Support des thèmes clair et sombre
- **Localisation** : Structure adaptée à la traduction
- **Accessibilité** : Conformité aux normes WCAG pour accessibilité

---

## Approche alternative : Insertion guidée par rangées et bouton +

Afin de simplifier et fluidifier l’expérience utilisateur, une approche alternative à la construction des cartes VSM est proposée :

### Principe
- Le canevas est structuré en plusieurs rangées horizontales, chacune dédiée à un type d’élément VSM (ex : timeline, boîtes de données, processus, stocks, flux, etc.).
- Au démarrage, le canevas est vide mais les rangées sont visibles et bien délimitées.
- Sur chaque rangée, un bouton “+” permet d’ajouter un nouvel élément dans la catégorie correspondante.
- Au clic sur “+”, l’utilisateur choisit le type d’élément à insérer (menu ou boîte de dialogue).
- L’élément est automatiquement positionné sur la rangée, à la prochaine place disponible, sans drag-and-drop manuel.

### Fonctionnement détaillé
- **Placement automatique** : Les éléments sont alignés et espacés de façon cohérente, facilitant la lecture et l’organisation.
- **Ajout guidé** : L’utilisateur n’a qu’à cliquer sur “+” et sélectionner l’élément ; le système gère le placement.
- **Édition** : Les propriétés de chaque élément peuvent être modifiées via le panneau latéral droit.
- **Déplacement latéral** : Optionnellement, l’utilisateur peut réorganiser les éléments horizontalement sur la rangée.
- **Suppression** : Un bouton ou une action contextuelle permet de retirer un élément.

### Avantages
- Expérience utilisateur simplifiée, sans drag-and-drop complexe
- Structure visuelle claire et cohérente
- Rapidité de création des cartes
- Moins d’erreurs de manipulation
- Adapté aux utilisateurs novices ou non techniques

### Exemple visuel

```
+-------------------+-------------------+-------------------+
|    Flux           |   [ + ]           |                   |
+-------------------+-------------------+-------------------+
| Boîtes de données |   [ + ]           |                   |
+-------------------+-------------------+-------------------+
| Processus         |   [ + ]  [ + ]    |                   |
+-------------------+-------------------+-------------------+
| Stocks            |   [ + ]           |                   |
+-------------------+-------------------+-------------------+
| Timeline          |                   |                   |
+-------------------+-------------------+-------------------+
```

### Intégration technique
- Utilisation de Zustand pour la gestion d’état (éléments, rangées, sélection)
- Utilisation de maxGraph pour le rendu graphique et le placement automatique
- Synchronisation entre l’UI (boutons +, menus) et le modèle graphique

### Considérations
- Cette approche peut coexister avec le drag-and-drop classique pour les utilisateurs avancés
- Elle peut être activée/désactivée selon le mode d’édition choisi
- Elle facilite l’édition rapide et la structuration des cartes VSM

---

## Panneaux latéraux : description détaillée et disposition

Dans l’approche “insertion guidée”, les panneaux latéraux jouent un rôle clé pour l’édition, la navigation et l’accès aux outils complémentaires. Voici une description détaillée de chaque panneau :

### 1. Panneau latéral gauche : Navigation, outils et configuration

**Disposition** :
- Largeur fixe (ex : 280px), bordure nette, fond discret
- En-tête avec titre (“Outils & Navigation”) et bouton de masquage
- Sections verticales organisées en accordéons ou onglets

**Contenu principal** :

#### a) Liste des éléments du diagramme
- Vue synthétique de tous les éléments présents sur le canvas, organisés par type (timeline, données, processus, stocks, flux…)
- Recherche rapide par nom ou type
- Sélection d’un élément pour le centrer sur le canvas
- Indicateur visuel de l’élément sélectionné

#### b) Outils et modules complémentaires
- Accès aux calculs automatiques (lead time, VA/NVA, indicateurs…)
- Génération de rapports ou exports (PDF, Excel, PNG, SVG)
- Visualisation de KPIs et graphiques
- Historique des modifications et annulation/rétablissement
- Accès à la configuration générale du diagramme (nom, description, auteur, date…)

#### c) Paramètres d’affichage du canvas
- Contrôle du zoom (slider, boutons +/-, valeur numérique)
- Activation/désactivation de la grille, des règles, des couches
- Filtres d’affichage (masquer certains types d’éléments, afficher uniquement les processus, etc.)
- Mode plein écran ou mode présentation

**Disposition interne** :
- Sections collapsibles pour chaque catégorie
- Icônes claires pour chaque action
- Boutons d’action en bas du panneau (ex : “Exporter”, “Rapport”, “Aide”)

---

### 2. Panneau latéral droit : Édition et actions contextuelles

**Disposition** :
- Largeur fixe (ex : 320px), bordure nette, fond discret
- En-tête avec titre (“Propriétés & Actions”) et bouton de masquage
- Contenu dynamique selon la sélection sur le canvas

**Contenu principal** :

#### a) Propriétés de l’élément sélectionné
- Affichage des propriétés principales (nom, type, couleur, notes…)
- Champs éditables (input, select, color picker, textarea…)
- Sections spécifiques selon le type d’élément :
  - **Processus** : temps de cycle, opérateurs, TRS/OEE, commentaires
  - **Stock** : quantité, unité, délai, politique de gestion
  - **Flux** : type, fréquence, quantité, mode de déclenchement
  - **Données** : valeurs, sources, calculs
  - **Timeline** : points clés, jalons
- Validation en temps réel des valeurs saisies
- Affichage des erreurs ou avertissements (ex : incohérence de données)

#### b) Actions sur l’élément
- Boutons pour dupliquer, supprimer, exporter l’élément
- Lier/délier à d’autres éléments (ex : connecter un flux à un processus)
- Historique des modifications sur l’élément
- Accès rapide à l’aide contextuelle (description, conseils, documentation)

#### c) Informations contextuelles et aide
- Description détaillée du type d’élément sélectionné
- Conseils d’utilisation, bonnes pratiques
- Liens vers la documentation ou tutoriels

**Disposition interne** :
- Sections collapsibles pour chaque groupe de propriétés
- Boutons d’action en haut ou en bas selon la logique d’édition
- Affichage dynamique : si aucune sélection, montrer les propriétés générales de la carte

---

### 3. Disposition générale et interactions

- Les panneaux latéraux sont masquables individuellement (icône “<” ou “>”)
- Ils peuvent être redimensionnables (drag sur la bordure)
- Les panneaux s’adaptent au mode plein écran ou présentation (masquage automatique)
- Les notifications, erreurs ou confirmations s’affichent en overlay ou dans le panneau concerné
- Les panneaux sont accessibles au clavier et compatibles avec la navigation tab/shift+tab

---

Cette structure pourra évoluer selon les retours utilisateurs et les besoins fonctionnels. Chaque panneau doit rester clair, accessible et orienté vers l’efficacité de l’édition et de la navigation dans les cartes VSM.

---

Ce document constitue une spécification initiale de l'interface utilisateur VSM-Tools et pourra évoluer au fil du développement et des retours utilisateurs.