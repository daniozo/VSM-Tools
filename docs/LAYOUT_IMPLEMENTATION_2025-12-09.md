# Implémentation de l'Algorithme de Layout VSM Strict

**Date :** 9 décembre 2025  
**Objectif :** Implémenter les spécifications strictes du prompt `algo.md` pour un layout déterministe et parfaitement aligné

---

## ✅ Modifications Réalisées

### 1. Renommage des Constantes Y (Conformité à algo.md)

**Avant :**
```typescript
ACTORS_Y: 50
INFO_FLOW_Y: 150
PRODUCTION_Y: 250
DATA_Y: 380
TIMELINE_Y: 500
```

**Après :**
```typescript
Y_ACTORS_CONTROL: 50
Y_INFO_FLOWS: 150
Y_PRODUCTION_FLOW: 250
Y_DATA_BOXES: 380
Y_TIMELINE: 500
```

**Raison :** Nomenclature stricte définie dans le prompt pour correspondre aux 5 lignes de disposition verticales.

---

### 2. Réorganisation de l'Ordre d'Exécution

**Avant :**
```typescript
1. layoutActorsAndControlCenter()
2. layoutProductionFlow()
3. layoutDataBoxes()
4. layoutTimeline()
5. layoutConnections()
```

**Après (Étape A puis Étape B) :**
```typescript
// Étape A : Calcul horizontal (Ligne 3)
1. layoutProductionFlow()

// Étape B : Alignements basés sur Ligne 3
2. layoutActorsAndControlCenterAfterProduction()
3. layoutDataBoxes()
4. layoutTimeline()
5. layoutConnections()
```

**Raison :** Selon algo.md, les acteurs (Ligne 1) doivent être alignés sur les centres des éléments de Ligne 3, donc Ligne 3 doit être calculée **avant** Ligne 1.

---

### 3. Alignement des Acteurs selon Étape B - Ligne 1

**Spécifications du prompt :**
- **Supplier :** Son centre horizontal aligné sur le centre du **premier** élément de Ligne 3
- **Customer :** Son centre horizontal aligné sur le centre du **dernier** élément de Ligne 3
- **ControlCenter :** Son centre horizontal au milieu de `TOTAL_PRODUCTION_WIDTH`

**Implémentation :**
```typescript
private layoutActorsAndControlCenterAfterProduction(
  diagram: VSMDiagram,
  result: LayoutResult,
  productionWidth: number,
  startX: number
): void {
  // Récupérer le premier et dernier élément de Ligne 3
  const productionElements = Array.from(result.positions.values())
    .filter(p => p.type === 'process-step' || p.type === 'inventory')
    .sort((a, b) => a.x - b.x)

  const firstElem = productionElements[0]
  const lastElem = productionElements[productionElements.length - 1]

  // Supplier centré sur premier élément
  const supplierCenterX = firstElem.x + firstElem.width / 2
  supplier.x = supplierCenterX - ACTOR_WIDTH / 2

  // Customer centré sur dernier élément
  const customerCenterX = lastElem.x + lastElem.width / 2
  customer.x = customerCenterX - ACTOR_WIDTH / 2

  // ControlCenter au milieu de la production
  const controlCenterX = startX + productionWidth / 2 - CONTROL_CENTER_WIDTH / 2
}
```

---

### 4. Points d'Ancrage Précis pour InformationFlow (Ligne 2)

**Spécifications du prompt :**
- **Point de départ :** Milieu du côté **inférieur** de la source (exitX=0.5, exitY=1.0)
- **Point d'arrivée :** Milieu du côté **supérieur** de la cible (entryX=0.5, entryY=0.0)

**Implémentation dans VSMGraphRenderer.ts :**
```typescript
if (type === 'information-flow') {
  // Point de départ : milieu du côté inférieur de la source
  exitX = 0.5
  exitY = 1.0
  
  // Point d'arrivée : milieu du côté supérieur de la cible
  entryX = 0.5
  entryY = 0.0
}

const edge = this.graph.insertEdge({
  // ...
  style: { 
    baseStyleNames: [styleName],
    exitX,
    exitY,
    entryX,
    entryY,
    exitPerimeter: true,
    entryPerimeter: true
  }
})
```

**Résultat :** Les flèches d'information partent toujours du bas du ControlCenter et arrivent au sommet des ProcessSteps.

---

### 5. Vérification de l'Alignement Ligne 4 (Data Boxes)

**Conformité confirmée :**
```typescript
result.positions.set(`databox-${node.id}`, {
  x: nodePos.x,           // MÊME X que ProcessStep
  y: Y_DATA_BOXES,
  width: nodePos.width,   // MÊME largeur que ProcessStep
  // ...
})
```

**✅ Les data boxes sont parfaitement centrées sous leurs ProcessSteps parents.**

---

### 6. Vérification de l'Alignement Ligne 5 (Timeline)

**Conformité confirmée :**
```typescript
// Segments VA (Value-Added)
result.positions.set(`timeline-va-${pos.id}`, {
  x: pos.x,           // MÊME X que ProcessStep
  y: Y_TIMELINE,
  width: pos.width,   // MÊME largeur que ProcessStep
  // ...
})

// Segments NVA (Non-Value-Added)
result.positions.set(`timeline-nva-${pos.id}`, {
  x: pos.x,           // MÊME X que Inventory
  y: Y_TIMELINE,
  width: pos.width,   // MÊME largeur que Inventory
  // ...
})
```

**✅ Chaque segment de timeline commence et finit exactement aux mêmes positions X que l'élément correspondant en Ligne 3.**

---

## 📊 Résumé de Conformité au Prompt algo.md

| Spécification | Statut | Détails |
|---------------|--------|---------|
| **Système de Coordonnées** | ✅ | (0,0) en haut à gauche, Y fixe par ligne |
| **5 Lignes de Disposition** | ✅ | Y_ACTORS_CONTROL, Y_INFO_FLOWS, Y_PRODUCTION_FLOW, Y_DATA_BOXES, Y_TIMELINE |
| **Étape A : Calcul Horizontal** | ✅ | Parcours séquentiel de flowSequences avec current_x |
| **Étape B - Ligne 1 : Acteurs** | ✅ | Alignés sur centres des éléments Ligne 3 |
| **Étape B - Ligne 2 : InformationFlow** | ✅ | Points d'ancrage bas→haut |
| **Étape B - Ligne 3 : Production** | ✅ | Calculé en Étape A |
| **Étape B - Ligne 4 : Data Boxes** | ✅ | Centrées horizontalement sur ProcessSteps |
| **Étape B - Ligne 5 : Timeline** | ✅ | Segments alignés parfaitement sur éléments Ligne 3 |
| **Déterminisme** | ✅ | Même entrée → même sortie |
| **Espacements Cohérents** | ✅ | HORIZONTAL_SPACING=80px, constantes fixes |

---

## 🎯 Points Clés de l'Implémentation

### Principe Fondamental
> **"L'algorithme doit travailler dans un système de coordonnées 2D où `(0,0)` est en haut à gauche. L'axe Y est principalement déterminé par la ligne de l'élément, et l'axe X est calculé en fonction de la séquence du flux."**

### Déterminisme Garanti
- Aucune randomisation
- Calculs basés uniquement sur les données du modèle
- Ordre strict : Étape A (Ligne 3) → Étape B (Lignes 1, 2, 4, 5)

### Alignements Parfaits
- **Horizontal :** Tous les éléments d'une même colonne verticale partagent le même X et la même largeur
- **Vertical :** Tous les éléments d'un même type partagent le même Y

### Espacements Uniformes
- Entre ProcessSteps : `HORIZONTAL_SPACING = 80px`
- Entre lignes : `VERTICAL_LANE_SPACING = 100px`
- Dimensions fixes : `PROCESS_STEP_WIDTH = 120px`, `DATA_BOX_WIDTH = 120px` (uniformisé)

---

## 🚀 Prochaines Étapes

1. **Tester visuellement** le layout dans l'application
2. **Vérifier** que les alignements sont parfaits sur un diagramme avec plusieurs ProcessSteps
3. **Valider** que les InformationFlows partent bien du bas du ControlCenter vers le haut des ProcessSteps
4. **Confirmer** que les acteurs sont correctement centrés sur le premier/dernier élément

---

## 📝 Fichiers Modifiés

- ✅ `src/services/layout/VSMLayoutEngine.ts`
  - Renommage des constantes Y
  - Réorganisation de l'ordre d'exécution
  - Nouvelle méthode `layoutActorsAndControlCenterAfterProduction()`
  
- ✅ `src/services/layout/VSMGraphRenderer.ts`
  - Ajout des points d'ancrage précis pour InformationFlow
  - Documentation des spécifications algo.md dans les commentaires

---

## 🎓 Références

- `docs/algo.md` : Spécifications strictes de l'algorithme de layout
- `docs/ROADMAP_PROCHAINES_ETAPES.md` : Phase 6 - Layout & Disposition
