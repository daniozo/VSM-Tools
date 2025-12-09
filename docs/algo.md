### **Prompt : Spécifications Détaillées pour l'Algorithme de Layout Automatique d'un Diagramme VSM**

#### **Objectif**

L'objectif de ce document est de fournir un ensemble de règles strictes et non-ambiguës pour un algorithme qui doit prendre en entrée un modèle de données VSM (tel que défini dans notre fichier de configuration) et produire en sortie un diagramme 2D parfaitement disposé, aligné et lisible.

#### **Principes Fondamentaux**

1.  **Déterministe :** Pour un même modèle de données en entrée, l'algorithme doit toujours produire exactement le même résultat en sortie.
2.  **Basé sur des Lignes (Swimlanes) :** La disposition verticale est fixe et basée sur des "lignes" horizontales conceptuelles. Chaque type d'élément a une ligne de destination.
3.  **Lisibilité Avant Tout :** Les espacements doivent être cohérents et suffisants pour éviter toute superposition. Les alignements doivent être parfaits.
4.  **Piloté par le Modèle :** Toutes les positions sont calculées à partir des données du modèle, en particulier de la liste ordonnée des **Séquençages du Flux Principal**.

#### **Le Système de Coordonnées et la Grille Conceptuelle**

L'algorithme doit travailler dans un système de coordonnées 2D où `(0,0)` est en haut à gauche. L'axe Y est principalement déterminé par la ligne de l'élément, et l'axe X est calculé en fonction de la séquence du flux.

Nous définissons les **lignes de disposition verticales (Y)** suivantes, chacune ayant une hauteur de base et un espacement :

| Ligne (ID) | Y (Position Verticale) | Contenu Principal |
| :--- | :--- | :--- |
| **Ligne 1** | `Y_ACTORS_CONTROL` | `ExternalActor` (Fournisseurs, Clients), `ControlCenter` |
| **Ligne 2** | `Y_INFO_FLOWS` | Flèches des `InformationFlow` |
| **Ligne 3** | `Y_PRODUCTION_FLOW` | Séquence principale : `ProcessStep` et `Inventory` |
| **Ligne 4** | `Y_DATA_BOXES` | Boîtes de données des `Indicator`s |
| **Ligne 5** | `Y_TIMELINE` | La `Timeline` calculée |

---

### **L'Algorithme de Placement Horizontal (Axe X) - Étape par Étape**

C'est l'étape la plus critique. L'algorithme doit procéder dans cet ordre :

**Étape A : Calcul de la Largeur de la Scène de Production (Ligne 3)**

1.  Initialiser `current_x = 0`.
2.  Parcourir la liste ordonnée des **segments du flux principal**.
3.  Pour chaque segment :
    *   **Placer le Nœud de Départ** (ex: une `ProcessStep`). Lui assigner une largeur fixe (`PROCESS_STEP_WIDTH`). Sa position `x` est `current_x`.
    *   **Placer les Éléments Intermédiaires :**
        *   Parcourir la liste ordonnée des éléments intermédiaires de ce segment.
        *   Pour un `Inventory` : ajouter un espacement (`HORIZONTAL_SPACING`), puis placer le triangle de l'inventaire (`INVENTORY_WIDTH`). Mettre à jour `current_x`. Si plusieurs inventaires se suivent, ils sont placés les uns à côté des autres horizontalement.
        *   Pour un `MaterialFlow` (flèche) : sa largeur est l'espacement entre les deux nœuds.
        *   Pour des éléments intermédiaires empilés verticalement (selon votre règle) : la largeur horizontale consommée est celle de l'élément le plus large du tas.
    *   Mettre à jour `current_x` pour inclure la largeur du Nœud de Départ et de tous ses éléments intermédiaires.
4.  Le `x` final du dernier élément + sa largeur définit la `TOTAL_PRODUCTION_WIDTH`.

**Étape B : Règles de Placement Détaillées par Ligne**

Une fois la `TOTAL_PRODUCTION_WIDTH` et les positions `x` de tous les éléments de la Ligne 3 connues, nous pouvons placer tous les autres éléments par alignement.

#### **Ligne 1 : Acteurs & Contrôle**

*   **Fournisseur (`ExternalActor` avec `Role=SUPPLIER`) :** Son centre horizontal doit être aligné sur le centre horizontal du **premier** élément de la Ligne 3.
*   **Client (`ExternalActor` avec `Role=CUSTOMER`) :** Son centre horizontal doit être aligné sur le centre horizontal du **dernier** élément de la Ligne 3.
*   **Centre de Contrôle (`ControlCenter`) :** Son centre horizontal est positionné exactement au milieu de la `TOTAL_PRODUCTION_WIDTH` (`TOTAL_PRODUCTION_WIDTH / 2`).

#### **Ligne 2 : Flux d'Information**

*   Chaque `InformationFlow` est une flèche.
*   **Point d'Ancrage de Départ :** Le point `(x, y)` de départ de la flèche est le **milieu du côté inférieur** de sa forme source (ex: le milieu du bas du `ControlCenter` en Ligne 1).
*   **Point d'Ancrage d'Arrivée :** Le point `(x, y)` d'arrivée de la flèche est le **milieu du côté supérieur** de sa forme cible (ex: le milieu du haut d'une `ProcessStep` en Ligne 3).
*   **Routage :** L'algorithme doit dessiner une ligne (pour l'instant simple, potentiellement orthogonale plus tard) entre ces deux points d'ancrage.

#### **Ligne 3 : Flux de Production (déjà calculé en Étape A)**

*   Les `ProcessStep` et `Inventory` sont placés aux positions `x` calculées lors de l'Étape A.
*   Leur position `y` est `Y_PRODUCTION_FLOW`.
*   Les `MaterialFlow` (flèches) sont dessinés pour connecter les côtés des formes. Par exemple, du milieu du côté droit de la `ProcessStep` A au milieu du côté gauche de l'`Inventory` B.

#### **Ligne 4 : Boîtes de Données**

*   Pour chaque `ProcessStep` en Ligne 3 :
    *   Dessiner un rectangle (la "boîte de données") sous la forme.
    *   **Alignement Horizontal :** Le centre horizontal de la boîte de données doit être parfaitement aligné avec le centre horizontal de sa `ProcessStep` parente.
    *   **Position Verticale :** Le haut de la boîte de données est placé à `Y_DATA_BOXES`, avec un espacement standard sous la `ProcessStep`.
    *   Le contenu (la liste des `Indicator`s) est affiché à l'intérieur de la boîte.

#### **Ligne 5 : Ligne de Temps**

*   La `Timeline` est dessinée en se basant sur les éléments de la Ligne 3.
*   Pour chaque `ProcessStep` :
    *   Dessiner un segment "montagne" (temps à valeur ajoutée) sur la timeline.
    *   **Alignement Horizontal :** Ce segment "montagne" doit commencer et finir exactement aux mêmes positions `x` que la `ProcessStep` correspondante au-dessus.
*   Pour chaque `Inventory` :
    *   Dessiner un segment "vallée" (temps sans valeur ajoutée) sur la timeline.
    *   **Alignement Horizontal :** Ce segment "vallée" doit commencer et finir exactement aux mêmes positions `x` que l' `Inventory` correspondant au-dessus.

#### **Gestion des Éléments Flottants : `ImprovementPoint`**

*   Un `ImprovementPoint` n'est pas placé par l'algorithme de layout principal.
*   Sa position est définie par l'utilisateur. Elle est stockée soit :
    *   **Absolue :** Des coordonnées `(x, y)` fixes sur le canevas.
    *   **Relative (mieux) :** Relative à son parent. L'algorithme place le point à `Position(Parent) + PositionRelative`. Cela garantit que si le diagramme est redessiné, l'annotation reste attachée à son élément parent.

---

### **Résumé des Attentes**

Le résultat final doit être un diagramme où les alignements verticaux (entre une `ProcessStep`, sa boîte de données et son segment de timeline) et horizontaux (la séquence du flux) sont parfaits. Les espacements doivent être cohérents et définis par des constantes (`HORIZONTAL_SPACING`, `VERTICAL_SPACING`). Il ne doit y avoir aucune superposition d'éléments.