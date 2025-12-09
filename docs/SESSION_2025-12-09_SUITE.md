# Session VSM Layout - 9 décembre 2025 (Suite)

**Date :** 9 décembre 2025  
**Session précédente :** `LAYOUT_IMPLEMENTATION_2025-12-09.md`

---

## 📋 Contexte de la Session

Cette session fait suite à l'implémentation de l'algorithme de layout strict selon `algo.md`. Plusieurs ajustements visuels et fonctionnels ont été apportés.

---

## ✅ Corrections Appliquées

### 1. **Positionnement des Stocks (Inventories)**

**Évolution :**
- **Initial :** `Y_PRODUCTION_FLOW + 20` (en dessous de la ligne)
- **Tentative 1 :** `Y_PRODUCTION_FLOW - INVENTORY_HEIGHT - 10` (trop haut)
- **Final :** `Y_PRODUCTION_FLOW - 20` (légèrement au-dessus, superposés sur les flèches)

**Résultat :** Les triangles de stock sont maintenant superposés sur les flèches matérielles entre les étapes, comme souhaité.

---

### 2. **Suppression des Flèches Directes Supplier/Customer**

**Problème :** Des flèches directes apparaissaient entre :
- Fournisseur → Première étape
- Dernière étape → Client

**Solution :**
```typescript
// Dans layoutConnections()
for (const seq of diagram.flowSequences) {
  if (seq.fromNodeId && seq.toNodeId) {
    // Ignorer les connexions directes vers supplier ou customer
    if (seq.fromNodeId === 'supplier' || seq.toNodeId === 'supplier' ||
        seq.fromNodeId === 'customer' || seq.toNodeId === 'customer') {
      continue
    }
    // ... créer la connexion
  }
}
```

**Flux matériel final :**
```
Supplier → Réception → Première étape → ... → Dernière étape → Livraison → Customer
```

---

### 3. **Centre de Contrôle**

**Modifications :**
- ✅ Largeur augmentée : `140px → 180px`
- ✅ Hauteur augmentée : `60px → 80px`
- ✅ Position Y : `Y_ACTORS_CONTROL` (50px) - identique aux autres acteurs

**Note :** Tous les acteurs (Supplier, Customer, Control Center) ont leur **haut aligné** à `Y_ACTORS_CONTROL = 50px`. Les différences de hauteur ne devraient pas affecter l'alignement visuel du haut des rectangles.

---

### 4. **Labels des Flux d'Information avec Données Réelles**

**Customer → Control Center :**
```typescript
const customerLabel = diagram.actors.customer.dailyDemand 
  ? `Commandes (${diagram.actors.customer.dailyDemand}/jour)`
  : 'Commandes'
```
**Exemple :** "Commandes (100/jour)" au lieu de "Commandes"

**Control Center → Supplier :**
```typescript
const supplierLabel = diagram.actors.supplier.deliveryFrequency
  ? `Prévisions (${diagram.actors.supplier.deliveryFrequency})`
  : 'Prévisions'
```
**Exemple :** "Prévisions (Hebdomadaire)" au lieu de "Prévisions"

**Source des données :** Onglets "Acteurs" et "Flux d'Information" du ConfigurationDialog

---

### 5. **Orientation des Triangles de Stock**

**Évolution :**
- `direction: 'east'` → pointe à droite ❌
- `direction: 'west'` → pointe à gauche ❌
- `direction: 'north'` → pointe en haut ✅

**Résultat :** Triangle avec la pointe vers le haut, base en bas.

---

### 6. **Quantité des Stocks Affichée**

**Avant :**
```typescript
label = metadata?.name || ''  // Affichait "Stock Matière Première"
```

**Après :**
```typescript
const qty = metadata?.quantity as string || ''
const unit = metadata?.unit as string || ''
label = qty ? `${qty} ${unit}`.trim() : ''  // Affiche "500 unités"
```

---

### 7. **Suppression des Emojis**

**Acteurs :**
- 🏭 → "Fournisseur"
- 🏪 → "Client"

**Opérateurs :**
- 👤 5 → "5 Opérateurs"
- 👤 1 → "1 Opérateur"

---

### 8. **Corrections des Onglets de Configuration**

#### A. **Onglet Stocks (InventoriesTab)**

**Problème :** Indicateur de modification apparaissait automatiquement sans action utilisateur.

**Cause :** `useEffect` avec auto-save déclenchant `saveInitialStock()` et `saveFinalStock()` au montage du composant.

**Solution :** Suppression des `useEffect` automatiques.

```typescript
// AVANT
useEffect(() => {
  saveInitialStock()
}, [initialStockEnabled, initialStockName, ...])

// APRÈS
// NOTE: Auto-save retiré pour éviter les modifications non sollicitées
```

**État actuel :** Les modifications ne sont sauvegardées que lors d'actions explicites (toggle, édition).

#### B. **Onglet Flux Matériels (MaterialFlowsTab)**

**Problème :** Les modifications de type de flux (PUSH, PULL, FIFO, KANBAN) n'étaient pas détectées ni enregistrées.

**Solution :** Ajout de `syncFlowsToFlowSequences()` dans `handleTypeChange`.

```typescript
const handleTypeChange = (flowId: string, newType: FlowType | '') => {
  const updatedFlows = flows.map(f => {
    if (f.id === flowId) {
      // ... mise à jour
    }
    return f
  })
  
  setFlows(updatedFlows)
  syncFlowsToFlowSequences(updatedFlows)  // ← Ajouté
}
```

#### C. **Onglet Flux d'Information (InformationFlowsTab)**

**Ajout :** Algorithme de validation des flux d'information selon les règles VSM.

**Règles implémentées :**
```typescript
✅ Customer → Control Center uniquement (commandes)
✅ Supplier → Control Center uniquement (confirmations)
✅ Control Center → Tout le monde (Supplier, Customer, Process Steps)
✅ Process Steps → Control Center uniquement (feedback)
❌ Process Steps ↔ Customer/Supplier (interdit)
```

**Fonction :**
```typescript
const validateInformationFlow = (sourceId: string, targetId: string): 
  { valid: boolean; error?: string }
```

---

### 9. **Uniformisation Largeur NVA**

**Problème :** Les NVA (segments Non-Value-Added de la timeline) avaient la largeur des inventories (60px) au lieu de la largeur des VA (120px).

**Solution :**
```typescript
// AVANT
width: pos.width  // 60px (largeur inventory)

// APRÈS
width: LayoutConstants.PROCESS_STEP_WIDTH  // 120px (uniformisé avec VA)
```

**Centrage :** Les NVA sont centrés sous les inventories :
```typescript
const nvaX = pos.x - (PROCESS_STEP_WIDTH - INVENTORY_WIDTH) / 2
```

---

### 10. **Position des NVA sous la Ligne Timeline**

**Structure finale de la timeline :**
```
┌─────────┐ ┌─────────┐
│   VA    │ │   VA    │   ← au-dessus (Y_TIMELINE)
└─────────┘ └─────────┘
━━━━━━━━━━━━━━━━━━━━━━━   ← ligne (Y_TIMELINE + VA_HEIGHT + 2)
┌─────────┐ ┌─────────┐
│   NVA   │ │   NVA   │   ← en dessous (Y_TIMELINE + VA_HEIGHT + LINE + 5)
└─────────┘ └─────────┘
```

---

### 11. **Bordures Réception/Livraison en Trait Plein**

**Avant :**
```typescript
dashed: true,
dashPattern: '5 5'
```

**Après :**
```typescript
strokeWidth: 2  // Trait plein, épaisseur augmentée
```

---

### 12. **Points d'Ancrage des Flux**

#### **Flux Matériels (MaterialFlow) :**
```typescript
exitX = 1.0, exitY = 0.5   // Sortie par le côté DROIT
entryX = 0.0, entryY = 0.5 // Entrée par le côté GAUCHE

// Cas spéciaux :
Supplier → reception : exitY = 1.0 (bas), entryX = 0.0 (gauche)
livraison → Customer : exitX = 1.0 (droite), entryY = 1.0 (bas)
```

#### **Flux d'Information (InformationFlow) :**
```typescript
// Ligne 1 (Acteurs) : côtés
Customer → ControlCenter : exitX = 0.0 (gauche)
ControlCenter → Supplier : exitX = 0.0, entryX = 1.0 (côtés)

// Vers ProcessSteps : haut/bas
ControlCenter → Step : exitY = 1.0 (bas), entryY = 0.0 (haut)
```

**Routing orthogonal :**
```typescript
edgeStyle: 'orthogonalEdgeStyle'  // Flèches en escalier
```

---

## 📊 État Actuel du Layout

### **Constantes de Layout**
```typescript
Y_ACTORS_CONTROL: 50px
Y_INFO_FLOWS: 150px
Y_PRODUCTION_FLOW: 250px
Y_DATA_BOXES: 360px  // Réduit de 380 à 360
Y_TIMELINE: 500px

PROCESS_STEP_WIDTH: 120px
PROCESS_STEP_HEIGHT: 80px
ACTOR_WIDTH: 100px
ACTOR_HEIGHT: 60px
CONTROL_CENTER_WIDTH: 180px  // Augmenté de 140
CONTROL_CENTER_HEIGHT: 80px   // Augmenté de 60
INVENTORY_WIDTH: 60px
INVENTORY_HEIGHT: 50px
DATA_BOX_WIDTH: 120px
```

### **Ordre d'Exécution de l'Algorithme**
```typescript
1. layoutProductionFlow()           // Ligne 3 (calcul horizontal)
2. layoutActorsAndControlCenterAfterProduction()  // Ligne 1
3. layoutDataBoxes()                // Ligne 4
4. layoutTimeline()                 // Ligne 5
5. layoutConnections()              // Ligne 2
```

---

## 🔍 Points à Vérifier pour la Prochaine Session

### 1. **Alignement Visuel du Control Center**

**Observation utilisateur :** "Les haut des rectangles ne sont pas au même niveau"

**Code actuel :** Tous les acteurs ont `y = Y_ACTORS_CONTROL = 50px`

**Hypothèses :**
- Problème de rendu maxGraph (vérifier l'attribut `verticalAlign`)
- Problème de style (padding/margin dans les styles)
- Hauteur différente créant une illusion d'optique

**À vérifier :**
```typescript
// Dans VSMGraphRenderer.ts
actor: {
  verticalAlign: 'middle'  // Pourrait causer un décalage
}

controlCenter: {
  verticalAlign: 'middle'  // Même chose
}
```

**Solution potentielle :** Forcer `verticalAlign: 'top'` pour tous les acteurs.

---

### 2. **Position Exacte des Triangles de Stock**

**Valeur actuelle :** `Y_PRODUCTION_FLOW - 20`

**À tester :** Différentes valeurs pour trouver le meilleur positionnement visuel :
- `-10` : plus proche de la ligne
- `-30` : plus éloigné de la ligne

---

### 3. **Taille des Triangles**

**Actuel :** `INVENTORY_WIDTH = 60px`, `INVENTORY_HEIGHT = 50px`

**À considérer :** Ajuster si les triangles semblent trop grands/petits par rapport aux autres éléments.

---

## 📁 Fichiers Modifiés

### **Layout & Rendering**
- ✅ `src/services/layout/VSMLayoutEngine.ts`
- ✅ `src/services/layout/VSMGraphRenderer.ts`

### **Configuration Dialog Tabs**
- ✅ `src/renderer/components/dialogs/configuration/tabs/InventoriesTab.tsx`
- ✅ `src/renderer/components/dialogs/configuration/tabs/MaterialFlowsTab.tsx`
- ✅ `src/renderer/components/dialogs/configuration/tabs/InformationFlowsTab.tsx`

### **Canvas**
- ✅ `src/renderer/components/editor/VsmCanvas.tsx`

---

## 🎯 Objectifs de la Prochaine Session

1. **Finaliser l'alignement visuel** du Control Center avec les autres acteurs
2. **Valider visuellement** la position des triangles de stock sur les flèches
3. **Tester** le système de validation des flux d'information avec différents scénarios
4. **Continuer** avec les phases suivantes de la roadmap (Phases 7-9)

---

## 📚 Références

- `docs/algo.md` : Spécifications de l'algorithme de layout
- `docs/LAYOUT_IMPLEMENTATION_2025-12-09.md` : Première partie de la session
- `docs/ROADMAP_PROCHAINES_ETAPES.md` : Phases 1-6 complétées
