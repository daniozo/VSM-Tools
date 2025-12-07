# Algorithme de Layout Automatique VSM

## Vue d'ensemble

L'algorithme de layout automatique du VSM Studio transforme le modèle de données (diagramme VSM) en coordonnées (x, y) pour chaque élément graphique. Il est **déterministe** : pour un même modèle, il produit toujours le même résultat visuel.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│ VSMLayoutEngine                                             │
│  ├─ computeLayout() ──────────────────┐                     │
│  │                                     │                     │
│  ├─ layoutActorsAndControlCenter() ◄──┼─ Ligne 1 (Haut)    │
│  ├─ layoutInformationFlows()       ◄──┼─ Ligne 2           │
│  ├─ layoutProductionFlow()         ◄──┼─ Ligne 3 (Flux)    │
│  ├─ layoutDataBoxes()              ◄──┼─ Ligne 4 (KPIs)    │
│  └─ layoutTimeline()               ◄──┼─ Ligne 5 (Bas)     │
│                                        │                     │
│  Result: LayoutResult ─────────────────┘                    │
│   └─ Map<String, LayoutPosition>                            │
└─────────────────────────────────────────────────────────────┘
```

## Swimlanes (Lignes horizontales)

Le diagramme est divisé en 5 lignes horizontales (swimlanes) :

### **Ligne 1 : Acteurs & Contrôle** (Y = 50)
- **Fournisseurs** (Suppliers) : alignés à gauche
- **Centre de Contrôle** (Control Center) : au centre
- **Clients** (Customers) : alignés à droite

### **Ligne 2 : Flux d'Information** (Y calculé dynamiquement)
- Flèches reliant le Centre de Contrôle aux ProcessSteps
- Routage simple, évite les superpositions

### **Ligne 3 : Flux de Production Principal** (Y = 200)
- **ProcessSteps** : disposées de gauche à droite dans l'ordre séquentiel
- **Inventories** : triangles placés entre les ProcessSteps
- **MaterialFlows** : flèches connectant les éléments

### **Ligne 4 : Indicateurs (Data Boxes)** (Y = 330)
- Sous chaque ProcessStep
- Contient les KPIs (Indicators)
- Hauteur adaptative selon le nombre d'indicateurs

### **Ligne 5 : Timeline** (Y = 500)
- Segments "montagne" : temps à valeur ajoutée (ProcessingTime)
- Segments "vallée" : temps sans valeur ajoutée (LeadTime)
- Alignée avec les éléments au-dessus

## Constantes de Layout

### Dimensions des éléments
```java
PROCESS_STEP_WIDTH = 120px
PROCESS_STEP_HEIGHT = 80px
ACTOR_WIDTH = 100px
ACTOR_HEIGHT = 60px
INVENTORY_WIDTH = 60px
INVENTORY_HEIGHT = 50px
```

### Espacements
```java
HORIZONTAL_SPACING = 80px     // Entre deux ProcessSteps
VERTICAL_LANE_SPACING = 100px // Entre deux swimlanes
MARGIN_LEFT = 50px
MARGIN_TOP = 50px
```

## Algorithme : Étapes de calcul

### 1. Initialisation
```java
VSMLayoutEngine engine = new VSMLayoutEngine(vsmDiagram);
LayoutResult result = engine.computeLayout();
```

### 2. Placement des Acteurs (Ligne 1)
1. Catégoriser les acteurs : `Suppliers` / `Customers`
2. Placer les fournisseurs à gauche
3. Placer le Centre de Contrôle au centre (largeur totale / 2)
4. Placer les clients à droite

### 3. Placement du Flux de Production (Ligne 3)
1. Parcourir les `ProcessSteps` dans l'ordre
2. Pour chaque étape :
   - Placer à la position X courante
   - Incrémenter X de `PROCESS_STEP_WIDTH + HORIZONTAL_SPACING`
   - Si un `Inventory` suit cette étape, le placer entre deux étapes

### 4. Placement des Data Boxes (Ligne 4)
1. Pour chaque `ProcessStep` :
   - Récupérer ses `Indicators`
   - Calculer hauteur : `BASE_HEIGHT + (count * LINE_HEIGHT)`
   - Centrer horizontalement sous la ProcessStep

### 5. Placement des Flux d'Information (Ligne 2)
- Les flux sont des **connexions**, pas des éléments positionnés
- Utilisation des positions source/target pour le rendu

### 6. Calcul de la Timeline (Ligne 5)
1. Pour chaque `ProcessStep` :
   - Récupérer l'indicateur `ProcessingTime`
   - Dessiner segment "montagne" proportionnel
2. Pour chaque `Inventory` :
   - Récupérer l'indicateur `LeadTime`
   - Dessiner segment "vallée" proportionnel

## Format de sortie : LayoutResult

```java
LayoutResult {
  totalWidth: 1200,
  totalHeight: 800,
  positions: {
    "step1": LayoutPosition(id="step1", x=100, y=200, w=120, h=80),
    "step2": LayoutPosition(id="step2", x=300, y=200, w=120, h=80),
    "inventory1": LayoutPosition(id="inv1", x=230, y=225, w=60, h=50),
    ...
  }
}
```

## Sérialisation JSON pour l'Engine

```json
{
  "totalWidth": 1200,
  "totalHeight": 800,
  "elements": [
    {
      "id": "step1",
      "x": 100,
      "y": 200,
      "width": 120,
      "height": 80
    },
    {
      "id": "step2",
      "x": 300,
      "y": 200,
      "width": 120,
      "height": 80
    }
  ]
}
```

## Synchronisation avec l'Engine

### Workflow
```
1. Utilisateur sauvegarde (Ctrl+S)
   ↓
2. Studio enregistre diagram.vsmx localement
   ↓
3. VSMLayoutEngine calcule le layout
   ↓
4. LayoutSerializer convertit en JSON
   ↓
5. EngineSyncService envoie POST /api/vsm/upload
   {
     "xml": "<contenu_diagram.vsmx>",
     "layout": { ... }
   }
   ↓
6. Engine reçoit et stocke
   ↓
7. Front-end Web peut afficher le diagramme
```

### Configuration
L'URL de l'Engine est configurable dans les préférences :
```java
EngineSyncService.getInstance().setEngineUrl("http://localhost:8080");
```

### États de synchronisation
- 🟢 **SYNCHRONIZED** : Envoi réussi
- 🟡 **SYNCING** : Envoi en cours
- 🔴 **ERROR** : Engine inaccessible
- ⚫ **NOT_CONFIGURED** : URL non configurée

## Utilisation dans le Studio

### Calcul du layout
```java
VSMLayoutEngine engine = new VSMLayoutEngine(vsmDiagram);
LayoutResult result = engine.computeLayout();

// Récupérer la position d'un élément
LayoutPosition stepPos = result.getPosition("step1");
int x = stepPos.getX();
int y = stepPos.getY();
```

### Synchronisation automatique
```java
// Lors de la sauvegarde
EngineSyncService.getInstance().syncInBackground(vsmDiagram, diagramFile);
```

## Évolutions futures

### Phase 2 : Layout avancé
- Détection automatique de l'ordre des segments via l'analyse des MaterialFlows
- Support des flux parallèles (branches)
- Optimisation de l'espacement pour éviter les superpositions

### Phase 3 : Layout interactif
- Permettre le déplacement manuel des annotations (ImprovementPoints)
- Sauvegarder les positions personnalisées
- Mode "auto-layout" vs "manuel"

### Phase 4 : Algorithmes alternatifs
- Layout vertical (top-to-bottom)
- Layout optimisé pour l'impression
- Export SVG avec layout vectoriel

---

**Auteur** : VSM Studio Team  
**Version** : 1.0  
**Date** : Novembre 2025
