### **Document de Conception Détaillée : VSM Studio**

**Version :** 1.0
**Auteur :** L'Équipe Projet
**Date :** 3 Novembre 2025

---

### **Partie 1 : Philosophie Générale & Vision du Produit**

#### **1.1. Introduction**

Ce document a pour vocation de servir de guide de conception et de spécification technique pour le développement de l'application **VSM Studio**. Il formalise les choix d'architecture, d'interface utilisateur (UI) et d'expérience utilisateur (UX) qui ont été définis. L'objectif est de fournir une source de vérité unique et non-ambiguë pour l'équipe de développement.

#### **1.2. Le Paradigme Fondamental : L'Approche "Model-First"**

Contrairement aux éditeurs de diagrammes traditionnels où l'utilisateur dessine librement sur un canevas (approche "Canvas-First"), le VSM Studio adoptera une approche **"Model-First"**.

Dans ce paradigme, la source de vérité n'est pas le dessin, mais un **modèle de données structuré** que l'utilisateur construit et édite via des formulaires guidés. Le diagramme affiché sur le canevas n'est qu'une **représentation visuelle générée automatiquement** à partir de ce modèle.

Ce choix stratégique est motivé par plusieurs avantages clés :

*   **Cohérence Garantie :** Il est techniquement impossible pour l'utilisateur de créer un diagramme VSM sémantiquement incorrect (ex: un flux d'information reliant deux stocks). Le modèle et l'interface de saisie imposent la logique métier.
*   **Guidage de l'Utilisateur :** L'application guide activement l'utilisateur dans la construction de sa VSM. Il n'est jamais confronté à une page blanche, mais à une série de formulaires logiques qui l'aident à ne rien oublier.
*   **Qualité et Standardisation :** Tous les diagrammes générés ont une apparence professionnelle, standardisée et propre, grâce à l'algorithme de layout automatique.
*   **Focalisation sur le Métier :** L'utilisateur se concentre sur la définition des données et des relations (le "quoi"), et non sur les aspects cosmétiques du dessin (le "comment").

#### **1.3. Le Flux de Travail Utilisateur (User Journey)**

Le parcours de l'utilisateur au sein de l'application suivra une séquence logique en quatre étapes :

1.  **Création & Organisation :** L'utilisateur commence par créer une structure de travail, le "Projet", qui encapsulera tous les fichiers relatifs à une VSM donnée.
2.  **Configuration du Modèle :** L'utilisateur ouvre un dialogue de configuration centralisé. C'est ici qu'il définit l'ensemble de sa VSM : les étapes, les acteurs, les flux, et la configuration des indicateurs. C'est l'étape de "construction" du modèle de données.
3.  **Visualisation & Analyse :** Une fois la configuration appliquée, le VSM Studio génère et affiche le diagramme sur le canevas. L'utilisateur peut alors naviguer dans les éléments du diagramme pour consulter leurs propriétés.
4.  **Enrichissement & Annotation :** L'utilisateur peut ajouter des éléments contextuels qui n'affectent pas la logique du flux, comme des points d'amélioration ("Explosions Kaizen"), directement sur le canevas.

### **Partie 2 : Structure de l'Environnement de Travail**

#### **2.1. Le "Projet" comme Conteneur Atomique**

L'unité de travail fondamentale dans le VSM Studio est le **Projet**. Un Projet est une abstraction qui correspond physiquement à un dossier sur le système de fichiers. Il est conçu pour regrouper de manière cohérente tous les artefacts liés à une seule analyse de Value Stream Mapping.

**2.1.1. Structure d'un Projet**

Lorsqu'un utilisateur crée un nouveau projet (ex: "Ligne_Production_Cintres"), le VSM Studio crée l'arborescence de dossiers et de fichiers suivante :

```
Ligne_Production_Cintres/
|
|-- diagram.vsmx
|-- action_plan.md
|-- notes.md
|-- exports/
```

*   **`diagram.vsmx` :** C'est le fichier **le plus important**. Il s'agit du document XML contenant le modèle de données complet de la VSM, tel que défini par l'utilisateur via le Dialogue de Configuration. C'est ce fichier qui est la source de vérité pour la génération du diagramme.
*   **`action_plan.md` :** Un fichier texte au format Markdown destiné à accueillir le plan d'action et le suivi des initiatives d'amélioration identifiées lors de l'analyse VSM. Il peut être édité directement dans le Studio via un éditeur de texte simple.
*   **`notes.md` :** Un fichier Markdown pour la prise de notes libres, les hypothèses, les observations faites durant l'analyse.
*   **`exports/` :** Un dossier, initialement vide, où l'application sauvegardera par défaut les artefacts générés par l'utilisateur, comme des captures d'écran du diagramme (PNG, SVG) ou des exports de données (CSV).

**2.1.2. Gestion des Projets**

Le VSM Studio devra permettre les opérations de base sur les projets :
*   Créer un nouveau projet.
*   Ouvrir un projet existant.
*   Renommer un projet.
*   Fermer un projet.
*   Supprimer un projet.

#### **2.2. Conception de l'Interface Utilisateur Principale**

L'interface principale est conçue comme une application de bureau standard, en s'inspirant des conventions ergonomiques des environnements de développement intégrés (IDE) pour offrir une expérience familière et efficace. Elle est basée sur le concept de **"Perspective"** d'Eclipse RCP.

**2.2.1. Composants de la Fenêtre Principale**

La fenêtre est composée de cinq zones principales :

*   **La Barre de Menus :**
    *   **`Fichier` :** Gérer les projets et les fichiers (`Nouveau Projet`, `Ouvrir Projet...`, `Enregistrer`, `Tout Enregistrer`, `Quitter`).
    *   **`Édition` :** Actions d'édition standard (`Annuler`, `Rétablir`, `Copier`, `Coller`, `Supprimer`). La plupart de ces actions s'appliqueront à la gestion des fichiers dans l'explorateur ou aux textes.
    *   **`Affichage` :** Gérer l'apparence du canevas (`Zoom Avant/Arrière`, `Ajuster à la vue`) et afficher/masquer les panneaux.
    *   **`Projet` :** Actions spécifiques au projet actif (`Éditer le Diagramme...`, `Ajouter une Note...`).
    *   **`Aide` :** Accès à la documentation et à la boîte "À propos".

*   **La Barre d'Outils (Toolbar) :**
    *   Située sous la barre de menus, elle offre des raccourcis icôniques pour les actions les plus fréquentes : `Nouveau Projet`, `Enregistrer`, `Tout Enregistrer`, `Annuler`, `Rétablir`.

*   **Le Panneau de l'Explorateur de Projets (Gauche) :**
    *   **Rôle :** Naviguer dans les projets et leurs contenus.
    *   **Affichage :** Une vue en arborescence.
        *   Le niveau supérieur liste les projets ouverts.
        *   Le niveau suivant liste les fichiers du projet (`diagram.vsmx`, `action_plan.md`...).
        *   **Fonctionnalité clé :** Le fichier `diagram.vsmx` est lui-même déroulable, révélant une vue hiérarchique des entités principales du modèle (Acteurs, Étapes, Inventaires...).
    *   **Interaction :**
        *   Un double-clic sur `diagram.vsmx` ouvre (ou met au premier plan) la vue du diagramme dans le canevas central.
        *   Un clic sur une entité dans l'arborescence (ex: l'étape "Façonnage") met en surbrillance l'élément correspondant sur le canevas et charge ses informations dans le Panneau des Propriétés.
        *   Un clic droit sur un élément de l'arbre ouvre un menu contextuel (`Renommer`, `Supprimer`, `Éditer le Diagramme...` sur le projet).

*   **Le Panneau des Propriétés (Droite) :**
    *   **Rôle :** Afficher les attributs de l'objet actuellement sélectionné (dans l'explorateur ou sur le canevas).
    *   **Affichage :** Un formulaire en lecture seule ou avec des champs éditables pour des modifications mineures qui ne cassent pas la structure du modèle (ex: le nom d'un `ImprovementPoint`). Les propriétés principales du flux VSM (nom d'une étape, etc.) sont en lecture seule ici, pour renforcer le paradigme que leur modification doit se faire via le Dialogue Central.

*   **La Zone Centrale (Canevas) :**
    *   **Rôle :** Afficher la représentation graphique du diagramme VSM généré à partir du fichier `diagram.vsmx`.
    *   **Interaction :**
        *   L'utilisateur peut sélectionner des éléments en cliquant dessus.
        *   Le zoom et le panoramique sont possibles (molette, clic du milieu).
        *   Le clic droit sur un élément ou sur le fond du canevas ouvre un menu contextuel pour des actions spécifiques (détaillées plus tard).
        *   Le Drag-and-Drop n'est pas utilisé pour modifier la structure du flux. Il pourrait être utilisé pour déplacer des éléments d'annotation comme les `ImprovementPoint`.

*   **La Barre d'État (Bas) :**
    *   Affiche des informations contextuelles : le projet actif, le statut de la sauvegarde, le niveau de zoom, etc.

### **Partie 3 : Le Dialogue de Configuration Central**

#### **3.1. Objectif et Principes de Conception**

Le Dialogue de Configuration Central est une fenêtre modale qui sert d'interface unique pour la création et l'édition de la structure logique et des données d'un diagramme VSM. Il est lancé via l'action "Éditer le Diagramme..." sur un projet.

Les principes de sa conception sont :

*   **Progression Logique :** La disposition des onglets suit un ordre naturel de construction : d'abord on définit les briques de base (les nœuds, les sources de données), puis on assemble ces briques (les flux), et enfin on les enrichit (les indicateurs).
*   **Validation Continue :** L'interface doit intégrer des règles de validation pour empêcher la saisie de données incohérentes et guider l'utilisateur.
*   **Séparation des Préoccupations :** Chaque onglet est dédié à la gestion d'un ensemble cohérent d'entités du modèle, évitant ainsi de surcharger l'utilisateur d'informations.

#### **3.2. Structure Générale de l'Interface**

L'interface du dialogue est composée comme suit :

*   **Une barre d'onglets verticale sur la gauche :** Elle contient des icônes et des libellés clairs pour chaque section de configuration.
*   **Une zone de contenu principale sur la droite :** Affiche le formulaire ou la liste correspondant à l'onglet sélectionné.
*   **Une barre de boutons en bas :** `OK` (Valide les changements, les sauvegarde dans le modèle en mémoire, et ferme le dialogue), `Appliquer` (Valide et sauvegarde, mais garde le dialogue ouvert pour continuer à travailler), et `Annuler` (Ignore tous les changements effectués depuis l'ouverture et ferme le dialogue). Le bouton `Appliquer` déclenchera la mise à jour immédiate du canevas en arrière-plan, donnant un retour visuel instantané.

#### **3.3. Spécification Détaillée des Onglets**

##### **Onglet 1 : "Informations Générales"**

*   **Rôle :** Éditer les métadonnées globales du diagramme.
*   **Interface :** Un formulaire simple contenant les champs suivants :
    *   `Nom du Diagramme` (Champ de texte, obligatoire).
    *   `Description` (Zone de texte multiligne, optionnelle).
    *   `Version` (Champ de texte, ex: "1.0", optionnel).
    *   `Auteur(s)` (Champ de texte, optionnel).

##### **Onglet 2 : "Sources de Données"**

*   **Rôle :** Définir et gérer la bibliothèque de connexions aux systèmes externes (ERP, MES...).
*   **Interface :**
    *   **Vue Principale :** Une table listant les sources de données déjà configurées.
        *   **Colonnes :** `ID de la Source` (le nom unique qui servira de référence), `Type` (SQL, REST, etc.).
    *   **Actions :** Des boutons `Ajouter...`, `Modifier...`, `Supprimer`, et `Tester la Connexion` (très important pour le feedback utilisateur).
    *   **Dialogue "Ajouter/Modifier une Source de Données" :**
        *   `ID de la Source` (Champ de texte, obligatoire, validation pour unicité).
        *   `Type de Source` (Menu déroulant, obligatoire). Le choix de ce type modifie dynamiquement le reste du formulaire.
        *   **Champs pour le type `SQL` :** `URL JDBC`, `Driver Class`, `Utilisateur`, `Référence au Secret du Mot de Passe` (champ texte informatif expliquant qu'il faut utiliser une référence comme `{DB_PASSWORD}`).
        *   **Champs pour le type `REST` :** `URL de Base`, `Type d'Authentification` (menu déroulant : "Aucune", "API Key", "Bearer Token"...), `Référence au Secret de la Clé`.

##### **Onglet 3 : "Nœuds Principaux"**

*   **Rôle :** Créer l'inventaire de tous les acteurs, centres de contrôle et étapes de processus qui formeront les piliers du flux.
*   **Interface :**
    *   **Vue Principale :** Une table listant tous les nœuds créés.
        *   **Colonnes :** `ID du Nœud` (nom unique), `Nom Affiché`, `Type` (Fournisseur, Client, Centre de Contrôle, Étape de Processus).
    *   **Actions :** Des boutons `Ajouter...`, `Modifier...`, `Supprimer`.
    *   **Dialogue "Ajouter/Modifier un Nœud" :**
        *   `Type de Nœud` (Menu déroulant, le choix est définitif à la création).
        *   `ID du Nœud` (Champ de texte, obligatoire, validation pour unicité).
        *   `Nom Affiché` (Champ de texte, obligatoire).
        *   **Champs contextuels :**
            *   Si `Type` est "Étape de Processus" : `Nombre d'Opérateurs` (Champ numérique).
            *   (Les autres types n'ont pas de champs spécifiques à ce stade).

##### **Onglet 4 : "Séquençage du Flux Principal"**

*   **Rôle :** Définir l'ordre séquentiel du flux de production et spécifier les éléments (flux, stocks) qui se trouvent entre chaque étape.
*   **Interface :** C'est l'interface la plus complexe.
    *   **Vue Principale :** Une liste ordonnée représentant les **segments** du flux (un segment est l'espace *entre* deux nœuds principaux).
        *   Chaque item de la liste affiche : `De : [Nom du Nœud de Départ]` -> `À : [Nom du Nœud d'Arrivée]`.
    *   **Actions sur la liste de segments :** `Ajouter un Segment...`, `Supprimer le Segment`, `Monter` (flèche haut), `Descendre` (flèche bas) pour réorganiser l'ordre global du flux.
    *   **Vue de Détail du Segment (lorsqu'un segment est sélectionné) :**
        *   `Nœud de Départ` (Menu déroulant non modifiable, listant les nœuds de l'onglet 3).
        *   `Nœud d'Arrivée` (Menu déroulant non modifiable).
        *   **"Éléments Intermédiaires" :** Une sous-liste ordonnée.
            *   **Actions sur la sous-liste :** `Ajouter un Inventaire`, `Ajouter un Flux Matériel...`, `Supprimer`, `Monter`, `Descendre`.
            *   Lors de l'ajout d'un flux, un dialogue demande de spécifier son type (`FlowType` : PUSH, FIFO...).
            *   Lors de l'ajout d'un inventaire, un dialogue demande de spécifier son type (`InventoryType` : Standard, Supermarket...).

##### **Onglet 5 : "Flux d'Information"**

*   **Rôle :** Définir les flux non matériels qui sont souvent transverses au flux principal.
*   **Interface :**
    *   **Vue Principale :** Une table listant les flux d'information.
        *   **Colonnes :** `Description`, `Source`, `Cible`, `Type de Transmission`.
    *   **Actions :** `Ajouter...`, `Modifier...`, `Supprimer`.
    *   **Dialogue "Ajouter/Modifier un Flux d'Information" :**
        *   `Description` (Champ de texte, ex: "Planning de Production").
        *   `Source` (Menu déroulant listant tous les `Nœuds Principaux`).
        *   `Cible` (Menu déroulant listant tous les `Nœuds Principaux`, validation pour empêcher source = cible).
        *   `Type de Transmission` (Menu déroulant : Électronique, Manuel, Kanban...).

##### **Onglet 6 : "Indicateurs (KPIs)"**

*   **Rôle :** Attacher les métriques dynamiques à chaque nœud pertinent et configurer leur connexion de données.
*   **Interface :** Une vue maître-détail.
    *   **Zone Maître (Gauche) :** Une arborescence simple qui liste tous les `Nœuds Principaux` et `Inventaires` créés.
    *   **Zone Détail (Droite) :** Lorsque l'utilisateur sélectionne un nœud dans l'arbre, cette zone affiche une table des `Indicator`s configurés pour ce nœud.
        *   **Colonnes de la table :** `Nom de l'Indicateur`, `Unité`, `Source de Données`.
    *   **Actions sur la table :** `Ajouter...`, `Modifier...`, `Supprimer`.
    *   **Dialogue "Ajouter/Modifier un Indicateur" :**
        *   `Nom de l'Indicateur` (Champ de texte, ex: "Uptime").
        *   `Unité` (Champ de texte, ex: "%").
        *   **Section "Connexion de Données" :**
            *   `Source de Données` (Menu déroulant, obligatoire, liste les IDs de l'onglet 2).
            *   Un formulaire contextuel apparaît en fonction du type de la source sélectionnée, demandant les paramètres spécifiques (`Requête SQL`, `Endpoint REST`, etc.).

Parfait. Maintenant que le modèle de données est construit de manière robuste grâce au Dialogue de Configuration, nous devons nous pencher sur la manière de le transformer en un diagramme clair et lisible. C'est le rôle de l'algorithme de layout et du canevas.

---

### **Partie 4 : Le Canevas et l'Algorithme de Layout Automatique**

#### **4.1. Le Canevas comme Surface de Rendu**

Contrairement à un éditeur classique, le canevas du VSM Studio n'est pas une surface de dessin libre. Son rôle principal est de **rendre** une représentation graphique du modèle de données. Il est le "moteur de visualisation" qui interprète le fichier `diagram.vsmx` et l'affiche.

*   **Mise à jour :** Le canevas se met à jour et se redessine complètement dans deux situations :
    1.  À l'ouverture d'un fichier `diagram.vsmx`.
    2.  Lorsque l'utilisateur clique sur `OK` ou `Appliquer` dans le Dialogue de Configuration Central.
*   **Interaction de Base :**
    *   **Sélection :** Un clic simple sur un élément du diagramme le sélectionne. Cette sélection est synchronisée : l'élément est aussi mis en surbrillance dans l'Explorateur de Projets et ses propriétés s'affichent dans le Panneau des Propriétés.
    *   **Navigation :** Le zoom (molette de la souris) et le panoramique (clic du milieu ou barres de défilement) sont possibles pour naviguer dans de grands diagrammes.

#### **4.2. L'Algorithme de Layout : Principes et Logique**

L'algorithme de layout est le composant technique clé qui traduit la structure de données en coordonnées `(x, y)` pour chaque élément. Il doit être déterministe, c'est-à-dire que pour un même modèle de données, il doit toujours produire exactement le même diagramme.

L'algorithme fonctionnera en suivant une logique de "lignes" ou "swimlanes" horizontales, comme vous l'avez suggéré.

**4.2.1. Les Lignes Horizontales de Disposition (Swimlanes)**

Le canevas sera conceptuellement divisé en plusieurs zones horizontales. Chaque type d'entité a une ligne de prédilection.

*   **Ligne 1 (Haut) : Acteurs & Contrôle**
    *   Contient les `ExternalActor` et le `ControlCenter`.
    *   **Logique :** Les acteurs de type `Supplier` sont placés à gauche. Le `ControlCenter` est placé au centre. Les acteurs de type `Customer` sont placés à droite. L'espacement est calculé pour occuper la largeur de la scène principale.

*   **Ligne 2 (Intermédiaire) : Flux d'Information**
    *   Contient les flèches représentant les `InformationFlow`.
    *   **Logique :** Les points de départ et d'arrivée de ces flèches sont "ancrés" aux centres des formes qu'elles connectent (ex: du `ControlCenter` à une `ProcessStep`). L'algorithme doit calculer un routage simple pour ces flèches, en évitant les superpositions si possible.

*   **Ligne 3 (Principale) : Flux de Production**
    *   Contient la séquence des `ProcessStep` et des `Inventory`, reliés par les `MaterialFlow`.
    *   **Logique :** C'est le cœur de l'algorithme. Il parcourt la liste des **segments** définie dans l'onglet "Séquençage du Flux".
        1.  Il place le premier nœud (`Supplier` ou la première `ProcessStep`) à gauche.
        2.  Pour chaque segment, il analyse les **éléments intermédiaires** :
            *   Pour un `Inventory` (ou tout autre élément de stock), il dessine la forme correspondante (triangle) à la suite du nœud précédent, avec un espacement standard. Si plusieurs `Inventory` sont définis en séquence, ils sont alignés horizontalement les uns à la suite des autres.
            *   Pour un `MaterialFlow`, il dessine la flèche correspondante (poussée, FIFO...).
            *   Si plusieurs éléments de types différents sont présents (ex: un stock puis un flux), ils sont empilés verticalement dans l'ordre défini par l'utilisateur. L'algorithme doit calculer la hauteur nécessaire pour ce segment.
        3.  Il place ensuite le nœud d'arrivée du segment, et continue jusqu'à la fin de la séquence.

*   **Ligne 4 (Données) : Indicateurs**
    *   Contient les "boîtes de données" associées à chaque `ProcessStep`.
    *   **Logique :** Pour chaque `ProcessStep` de la Ligne 3, l'algorithme récupère la liste de ses `Indicator`s. Il dessine alors un cadre sous la `ProcessStep` et y affiche chaque indicateur (`Nom : Valeur Unité`) sous forme de liste. La taille du cadre s'adapte au nombre d'indicateurs.

*   **Ligne 5 (Bas) : Ligne de Temps**
    *   Contient la `Timeline`.
    *   **Logique :** Cette partie est calculée après que tout le reste a été disposé. L'algorithme :
        1.  Récupère la valeur de tous les `Indicator`s de type `ProcessingTime` des `ProcessStep` pour dessiner les segments "montagne" (temps à valeur ajoutée). La largeur de chaque segment est proportionnelle à la position et à la taille de la `ProcessStep` correspondante au-dessus.
        2.  Récupère la valeur de tous les `Indicator`s de type `LeadTime` des `Inventory` pour dessiner les segments "vallée" (temps sans valeur ajoutée). La largeur de chaque segment correspond à l'espace occupé par l'`Inventory` sur la Ligne 3.

#### **4.3. Interaction sur le Canevas Post-Génération**

Une fois le diagramme affiché, l'interaction est volontairement limitée pour préserver la cohérence.

*   **Modification de la Structure :** Il est **impossible** de déplacer les `ProcessStep`, `Inventory`, ou tout autre élément du flux principal par glisser-déposer. Un message informatif pourrait indiquer à l'utilisateur d'utiliser le "Dialogue de Configuration" pour modifier la structure.

*   **Ajout d'Annotations (Clic Droit sur le Canevas) :**
    *   `Ajouter un Point d'Amélioration (Explosion Kaizen)` : Cette action fait apparaître une icône d'éclair à l'emplacement du clic. L'utilisateur peut ensuite la déplacer librement par glisser-déposer. Ses propriétés (`ProblemDescription`, etc.) sont éditables dans le Panneau des Propriétés.
    *   `Ajouter une Note Textuelle` : Similaire aux points d'amélioration, cela permet d'ajouter des blocs de texte libres sur le diagramme pour des annotations spécifiques.

*   **Actions Contextuelles (Clic Droit sur un Élément) :**
    *   `Afficher les Propriétés` : Met le focus sur le Panneau des Propriétés.
    *   `Trouver dans l'Explorateur` : Déroule l'arbre de l'Explorateur de Projets et sélectionne l'entité correspondante.
    *   `Configurer les Indicateurs...` : Un raccourci très utile. Ouvre directement le Dialogue de Configuration Central et pré-sélectionne le nœud cliqué dans l'onglet "Indicateurs".

Parfait. Concluons ce document de conception avec une vue d'ensemble du cycle de vie des données et des interactions, pour s'assurer que l'ensemble du système est cohérent et répond aux objectifs fixés.

---

### **Partie 5 : Cycle de Vie des Données et Cas d'Usage Principaux**

Cette partie synthétise le parcours des données à travers le VSM Studio, depuis leur création jusqu'à leur utilisation finale, en illustrant le rôle de chaque composant de l'interface.

#### **5.1. Le Cycle de Vie Complet de la Donnée de Configuration**

Le diagramme et ses données associées suivent un cycle de vie en quatre étapes au sein du VSM Studio :

1.  **Création/Édition (via le Dialogue Central) :**
    *   L'utilisateur interagit avec les formulaires du Dialogue de Configuration Central.
    *   À ce stade, les données existent uniquement dans l'état temporaire de la fenêtre de dialogue.
    *   Des validations en temps réel guident l'utilisateur (ex: un ID doit être unique, une liste ne peut être vide...).

2.  **Validation & Persistance en Mémoire (au clic sur `OK`/`Appliquer`) :**
    *   Le dialogue effectue une validation finale complète du modèle.
    *   Si la validation réussit, les données sont utilisées pour construire (ou mettre à jour) un **graphe d'objets Java en mémoire**, basé sur le modèle EMF. C'est la représentation "vivante" du modèle de données au sein de l'application.
    *   Le dialogue se ferme (ou reste ouvert si `Appliquer`).

3.  **Rendu Graphique (déclenché par la mise à jour du modèle) :**
    *   Le Canevas, qui écoute les changements sur le modèle de données en mémoire, détecte la mise à jour.
    *   Il invoque l'**algorithme de layout automatique**, qui parcourt le graphe d'objets en mémoire.
    *   L'algorithme calcule les positions et les tailles de chaque élément graphique.
    *   Le Canevas utilise ces informations pour dessiner (ou redessiner entièrement) le diagramme à l'écran.

4.  **Sauvegarde sur Disque (via l'action `Enregistrer`) :**
    *   Lorsque l'utilisateur enregistre son travail, l'application utilise un **sérialiseur** pour parcourir le graphe d'objets en mémoire.
    *   Le sérialiseur traduit chaque objet Java et ses attributs en sa représentation XML correspondante, en respectant la structure que nous avons définie.
    *   Le contenu XML résultant est écrit dans le fichier `diagram.vsmx`.

Ce cycle garantit une séparation claire entre l'édition, la représentation interne, la visualisation et la persistance.

#### **5.2. Cas d'Usage Détaillés**

##### **Cas d'Usage 1 : Création d'une Nouvelle VSM de A à Z**

1.  L'utilisateur lance le VSM Studio.
2.  Il choisit `Fichier > Nouveau Projet`. Une fenêtre lui demande le nom du projet et son emplacement.
3.  L'application crée l'arborescence de fichiers (`diagram.vsmx`, `notes.md`...).
4.  Le **Dialogue de Configuration Central** s'ouvre automatiquement.
5.  L'utilisateur navigue dans les onglets :
    *   Il définit les **Sources de Données** (connexion à la BDD du MES).
    *   Il crée les **Nœuds Principaux** (Fournisseur, Client, et les étapes "Nettoyage", "Façonnage", "Emballage").
    *   Il définit le **Séquençage** en créant des segments : [Fournisseur -> Nettoyage], [Nettoyage -> Façonnage], etc. Il ajoute les inventaires et les flux poussés entre chaque segment.
    *   Il ajoute les **Indicateurs** sur chaque étape (ex: "Uptime" sur "Façonnage") et les configure pour utiliser la source de données MES avec la bonne requête SQL.
6.  Il clique sur **`OK`**.
7.  Le dialogue se ferme. Le Canevas, jusqu'alors vide, s'actualise et affiche le diagramme complet, proprement disposé par l'algorithme de layout.
8.  L'utilisateur clique sur `Fichier > Enregistrer` pour sauvegarder son travail dans le fichier `diagram.vsmx`.

##### **Cas d'Usage 2 : Ajout d'un Point d'Amélioration**

1.  L'utilisateur ouvre un projet existant. Le diagramme s'affiche sur le canevas.
2.  Il remarque que le temps de changement de série sur l'étape "Façonnage" est un problème.
3.  Il fait un **clic droit** sur la boîte de données de l'étape "Façonnage" et sélectionne `Ajouter un Point d'Amélioration`.
4.  Une icône "Explosion Kaizen" apparaît à l'emplacement du clic.
5.  L'utilisateur sélectionne cette nouvelle icône. Le **Panneau des Propriétés** s'active.
6.  Dans le Panneau des Propriétés, il remplit le champ `ProblemDescription` : "Le C/O de 150 min est le principal goulot d'étranglement de la ligne." Il ajoute un `ActionTicketID` : "PROJ-123".
7.  Il peut ensuite déplacer l'icône par glisser-déposer pour la positionner exactement où il le souhaite, sans affecter le reste du diagramme.
8.  Il enregistre son projet. La sauvegarde déclenche automatiquement la synchronisation avec le VSM Engine.

##### **Cas d'Usage 3 : Synchronisation Automatique avec l'Engine**

Contrairement aux éditeurs traditionnels nécessitant un export manuel, le VSM Studio intègre une **synchronisation transparente** avec le VSM Engine :

1.  **Lors de la sauvegarde** (`Fichier > Enregistrer` ou `Ctrl+S`), le Studio :
    *   Écrit le fichier `diagram.vsmx` sur le disque local.
    *   **Détecte automatiquement** si un VSM Engine est configuré et accessible.
    *   **Envoie** une version optimisée du fichier à l'Engine via l'API REST (`POST /api/vsm/upload`).
    *   La version envoyée exclut les données purement UI (positions X/Y des annotations Kaizen, notes personnelles, etc.).
    *   **Conserve** toutes les données métier : nœuds, flows, indicateurs, DataSources, DataConnections.

2.  **Feedback utilisateur** :
    *   Une icône dans la **Barre d'État** indique l'état de la synchronisation :
        *   🟢 "Synchronisé avec l'Engine" (vert)
        *   🟡 "Synchronisation en cours..." (jaune)
        *   🔴 "Engine non accessible" (rouge)
    *   En cas d'erreur, un message discret apparaît : "La synchronisation avec l'Engine a échoué. Les données sont sauvegardées localement."

3.  **Avantages** :
    *   **Transparence totale** : L'utilisateur n'a pas à se soucier de l'export.
    *   **Temps réel** : Les données sont immédiatement disponibles dans l'Engine pour la visualisation dynamique.
    *   **Tolérance aux pannes** : Si l'Engine est indisponible, le travail continue en mode hors ligne, et la synchronisation reprendra automatiquement.

---

Ce document de conception en cinq parties couvre l'ensemble de la vision du produit VSM Studio, de ses principes philosophiques à ses détails d'implémentation et d'interaction.