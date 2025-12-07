# Issues et Améliorations Identifiées - Session du 6 Décembre 2025

## Contexte Général

Projet VSM-Tools en cours de migration d'une approche Canvas-First vers Model-First. Le dialogue de configuration (`ConfigurationDialog.tsx`) contient 8 onglets pour éditer la structure logique du diagramme VSM avant génération automatique du layout.

**Référence Eclipse**: `d:\dev\workspace-vsm\com.vsmtools.vsm.studio.main\src\com\vsmtools\vsm\studio\main\dialogs\ConfigurationDialog.java` (3065 lignes)

## Travaux Complétés Cette Session

### ✅ Corrections Majeures Effectuées

1. **ProcessStepsTab** - Colonnes corrigées (Ordre + Nom uniquement), champ Opérateurs retiré
2. **Tous les émojis retirés** - Interface épurée conforme à Eclipse
3. **InventoriesTab restructuré** - Structure Eclipse: Stock Initial + Table Entre Étapes + Stock Final
4. **MaterialFlowsTab simplifié** - Table simple 4 colonnes (De/Vers/Type/Description), concept IntermediateElement supprimé
5. **IndicatorsTab corrigé** - N'affiche que les étapes de production (pas les acteurs)
6. **InformationFlowsTab amélioré** - Terminologie "Source/Cible" au lieu de "Nœud"
7. **Placeholders clarifiés** - Textes d'aide pertinents sans "Ex:" systématique
8. **Dates restaurées** dans GeneralInfoTab (sans helper texts)
9. **Navigation des onglets** - Scroll ajouté pour voir tous les onglets
10. **InventoryType corrigé** - Enum aligné avec Eclipse: RAW_MATERIAL, WIP, FINISHED_GOODS, SUPERMARKET

## Issues Non Résolues (À Traiter Prochainement)

### 🔴 Priorité HAUTE - Onglet Stocks & Inventaires

**Fichier**: `c:\wk\VSM-Tools\src\renderer\components\dialogs\configuration\tabs\InventoriesTab.tsx`

#### Issue 1: Valeurs par défaut manquantes pour les types de stock

**Problème**: Les champs `Type` (Select) n'ont pas de valeur par défaut définie.

**Localisation**:
- Stock Initial: ligne ~243-257
- Stock Final: ligne ~353-367  
- Stocks Entre Étapes: dans BetweenStockData interface (ligne ~44-55)

**Solution à implémenter**:
```typescript
// Stock Initial - ligne ~64
const [initialStockType, setInitialStockType] = useState<InventoryType>(InventoryType.RAW_MATERIAL) // ✅ Déjà correct

// Stock Final - ligne ~70
const [finalStockType, setFinalStockType] = useState<InventoryType>(InventoryType.FINISHED_GOODS) // ✅ Déjà correct

// Stocks Entre Étapes - ligne ~108 dans useEffect
newBetweenStocks.push({
  id: generateId('stock'),
  fromStep: fromStep.name,
  toStep: toStep.name,
  enabled: false,
  name: '(aucun)',
  type: InventoryType.WIP, // ✅ Déjà défini
  quantity: 100,
  durationDays: 1,
  source: 'Statique'
})
```

**Note**: Les valeurs par défaut semblent déjà présentes dans le code. Le problème vient peut-être du composant Select qui n'affiche pas correctement la valeur sélectionnée.

**Vérification à faire**:
- Vérifier que le composant `Select` de shadcn/ui gère correctement les valeurs d'enum
- S'assurer que `SelectValue` affiche le label approprié et non la valeur brute de l'enum

#### Issue 2: Affichage des types en français

**Problème**: Les types s'affichent en anglais brut (RAW_MATERIAL, WIP, FINISHED_GOODS, SUPERMARKET) au lieu de texte français lisible.

**Solution à implémenter**:

1. Créer un mapping des labels:
```typescript
const inventoryTypeLabels: Record<InventoryType, string> = {
  [InventoryType.RAW_MATERIAL]: 'Matière Première',
  [InventoryType.WIP]: 'En-Cours (WIP)',
  [InventoryType.FINISHED_GOODS]: 'Produits Finis',
  [InventoryType.SUPERMARKET]: 'Supermarché'
}
```

2. Utiliser ce mapping dans les SelectItem (3 endroits):
```tsx
<SelectContent>
  <SelectItem value={InventoryType.RAW_MATERIAL}>
    {inventoryTypeLabels[InventoryType.RAW_MATERIAL]}
  </SelectItem>
  <SelectItem value={InventoryType.WIP}>
    {inventoryTypeLabels[InventoryType.WIP]}
  </SelectItem>
  <SelectItem value={InventoryType.FINISHED_GOODS}>
    {inventoryTypeLabels[InventoryType.FINISHED_GOODS]}
  </SelectItem>
  <SelectItem value={InventoryType.SUPERMARKET}>
    {inventoryTypeLabels[InventoryType.SUPERMARKET]}
  </SelectItem>
</SelectContent>
```

3. Aussi dans la colonne Type du tableau (ligne ~157):
```tsx
{
  key: 'type',
  label: 'Type',
  width: '15%',
  render: (item) => item.enabled ? inventoryTypeLabels[item.type] : ''
}
```

**Localisations à modifier**:
- Stock Initial: ligne ~247-256
- Stock Final: ligne ~357-366
- Dialog d'édition Between Stocks: ligne ~463-472
- Colonne du tableau: ligne ~157

#### Issue 3: Bouton "Configurer..." mal positionné

**Problème**: Le bouton "Configurer..." apparaît dans une ligne séparée au lieu d'être à côté du Select "Source" quand "Dynamique" est sélectionné.

**Localisation**:
- Stock Initial: ligne ~287-291
- Stock Final: ligne ~405-409

**Solution à implémenter**:

Changer la structure du layout pour que Source et Configurer soient côte à côte:

```tsx
<div>
  <label className="text-sm font-medium mb-2 block">Source :</label>
  <div className="flex gap-2">
    <Select
      value={initialStockSource}
      onValueChange={(value) =>
        setInitialStockSource(value as 'Statique' | 'Dynamique' | 'Manuel')
      }
      className="flex-1"
    >
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="Statique">Statique</SelectItem>
        <SelectItem value="Dynamique">Dynamique</SelectItem>
        <SelectItem value="Manuel">Manuel</SelectItem>
      </SelectContent>
    </Select>
    
    {initialStockSource === 'Dynamique' && (
      <Button variant="outline">
        Configurer...
      </Button>
    )}
  </div>
</div>
```

Répéter pour Stock Final (ligne ~399-413).

### 🔴 Priorité HAUTE - Onglet Étapes de Production

**Fichier**: `c:\wk\VSM-Tools\src\renderer\components\dialogs\configuration\tabs\ProcessStepsTab.tsx`

#### Issue 4: Colonne "Ordre" affiche NaN

**Problème**: La colonne "Ordre" dans le tableau des étapes affiche `NaN` au lieu du numéro séquentiel.

**Localisation**: Ligne ~42-47 (définition de la colonne)

**Cause probable**: 
- Les nodes n'ont pas de propriété `order` 
- Le calcul `(index + 1)` ne fonctionne pas correctement avec le filtrage des nodes

**Code actuel**:
```tsx
{
  key: 'order',
  label: 'Ordre',
  width: '20%',
  render: (node, index) => <span className="font-mono">{index + 1}</span>
}
```

**Solution à implémenter**:

1. **Option A - Calculer l'index à partir du tableau filtré** (recommandé):
```tsx
const processSteps = diagram.nodes.filter(n => n.type === NodeType.PROCESS_STEP)

// Dans la définition des colonnes
{
  key: 'order',
  label: 'Ordre',
  width: '20%',
  render: (node) => {
    const index = processSteps.findIndex(n => n.id === node.id)
    return <span className="font-mono">{index + 1}</span>
  }
}
```

2. **Option B - Stocker l'ordre dans le modèle**:
Ajouter une propriété `order: number` dans l'interface Node et la maintenir lors des réordonnancements (handleMoveUp/handleMoveDown).

**Option recommandée**: Option A car plus simple et l'ordre est dérivé de la position dans le tableau.

### 🟡 Priorité MOYENNE - Onglet Flux Matériels

**Fichier**: `c:\wk\VSM-Tools\src\renderer\components\dialogs\configuration\tabs\MaterialFlowsTab.tsx`

#### Issue 5: Bouton "Types de flux" à retirer

**Problème**: Le bouton d'aide "Types de flux" avec icône Info et le panneau d'aide associé doivent être retirés.

**Localisation**:
- Bouton: ligne ~170-178
- État showHelp: ligne ~48
- Panneau d'aide: ligne ~183-194

**Solution à implémenter**:

1. Retirer l'état:
```typescript
// SUPPRIMER ligne ~48
const [showHelp, setShowHelp] = useState(false)
```

2. Retirer le bouton (ligne ~170-178):
```tsx
// SUPPRIMER
<Button
  variant="ghost"
  size="sm"
  onClick={() => setShowHelp(!showHelp)}
>
  <Info className="h-4 w-4 mr-1" />
  Types de flux
</Button>
```

3. Retirer le panneau conditionnel (ligne ~183-194):
```tsx
// SUPPRIMER
{showHelp && (
  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
    ...
  </div>
)}
```

4. Supprimer l'import Info de lucide-react:
```typescript
// Ligne ~8, retirer Info de:
import { Info } from 'lucide-react'
```

## Prochaines Étapes Recommandées

### Phase 1: Corrections Critiques (Session Prochaine)
1. ✅ Corriger affichage "Ordre" dans ProcessStepsTab (Issue 4)
2. ✅ Ajouter labels français pour InventoryType (Issue 2)
3. ✅ Repositionner bouton "Configurer..." (Issue 3)
4. ✅ Retirer bouton "Types de flux" (Issue 5)
5. ✅ Vérifier valeurs par défaut des Select (Issue 1)

### Phase 2: Validation avec Eclipse
- Comparer chaque onglet ligne par ligne avec Eclipse
- Vérifier les validations de formulaires
- Tester les cas limites (aucune étape, aucun acteur, etc.)

### Phase 3: Intégration Modèle → Canvas
- Implémenter l'algorithme de layout automatique (Phase 3 du plan)
- Générer le diagramme visuel depuis VSMDiagram
- Synchronisation bidirectionnelle Modèle ↔ Canvas

### Phase 4: Persistance
- Sauvegarde/chargement des fichiers .vsmx
- Validation du schéma avec Zod
- Import/Export JSON

## Références Techniques

### Fichiers Clés

**Frontend (Electron + React)**:
- `c:\wk\VSM-Tools\src\renderer\components\dialogs\configuration\ConfigurationDialog.tsx` - Dialogue principal
- `c:\wk\VSM-Tools\src\renderer\components\dialogs\configuration\tabs\*.tsx` - 8 onglets
- `c:\wk\VSM-Tools\src\shared\types\vsm-model.ts` - Modèle de données TypeScript
- `c:\wk\VSM-Tools\src\store\vsmStore.ts` - Store Zustand

**Backend Eclipse (Référence)**:
- `d:\dev\workspace-vsm\com.vsmtools.vsm.studio.main\src\com\vsmtools\vsm\studio\main\dialogs\ConfigurationDialog.java`
- `d:\dev\workspace-vsm\com.vsmtools.vsm.model\vsm.ecore` - Modèle EMF

### Composants UI (shadcn/ui)
- Button: `c:\wk\VSM-Tools\src\components\ui\button.tsx`
- Card: `c:\wk\VSM-Tools\src\components\ui\card.tsx`
- Dialog: `c:\wk\VSM-Tools\src\components\ui\dialog.tsx`
- Select: `c:\wk\VSM-Tools\src\components\ui\select.tsx`
- Checkbox: `c:\wk\VSM-Tools\src\components\ui\checkbox.tsx` (créé cette session)
- Input: `c:\wk\VSM-Tools\src\components\ui\input.tsx`

### Composants Personnalisés
- FormTable: `c:\wk\VSM-Tools\src\renderer\components\dialogs\configuration\shared\FormTable.tsx`
- FormField: `c:\wk\VSM-Tools\src\renderer\components\dialogs\configuration\shared\FormField.tsx`
- TabNavigation: `c:\wk\VSM-Tools\src\renderer\components\dialogs\configuration\TabNavigation.tsx`

## État du Modèle de Données

### Enums Principaux
```typescript
NodeType: SUPPLIER | PROCESS_STEP | CUSTOMER | CONTROL_CENTER
InventoryType: RAW_MATERIAL | WIP | FINISHED_GOODS | SUPERMARKET
FlowType: PUSH | PULL | FIFO_LANE | KANBAN
TransmissionType: ELECTRONIC | MANUAL | KANBAN | SCHEDULE
DataSourceType: SQL | REST | STATIC | MANUAL
DeliveryFrequency: DAILY | WEEKLY | MONTHLY | CUSTOM
```

### Structure VSMDiagram
```typescript
interface VSMDiagram {
  metaData: MetaData
  actors: Actors (supplier, customer, controlCenter)
  nodes: Node[] (acteurs + étapes mélangés)
  dataSources: DataSource[]
  flowSequences: FlowSequence[] (OBSOLÈTE - à supprimer)
  informationFlows: InformationFlow[]
  improvementPoints: ImprovementPoint[]
}
```

**Note**: `flowSequences` avec `IntermediateElement` est maintenant obsolète suite à la simplification de MaterialFlowsTab. Les stocks sont gérés indépendamment dans InventoriesTab et les flux matériels sont une simple table De→Vers.

## Décisions de Design Prises

1. ✅ **Pas d'emojis** - Interface professionnelle
2. ✅ **Noms d'onglets explicites** au lieu de numéros
3. ✅ **Terminologie claire** - "Élément", "Source/Cible" au lieu de "Nœud"
4. ✅ **Placeholders pertinents** - Avec exemples contextualisés quand nécessaire
5. ✅ **Structure Eclipse respectée** - Chaque onglet fidèle à l'original
6. ✅ **Simplification MaterialFlows** - Table simple au lieu de séquences complexes
7. ✅ **Indicateurs uniquement pour étapes** - Pas pour les acteurs
8. ✅ **Scroll dans navigation** - Pour voir tous les onglets

## Commandes de Développement

```bash
# Démarrer l'application
npm run electron:dev

# Installer dépendances manquantes
npm install @radix-ui/react-checkbox
npm install @radix-ui/react-select

# Build de production
npm run electron:build
```

## Notes de Session

- **Durée totale**: ~2 heures
- **Lignes modifiées**: ~1500 lignes
- **Fichiers touchés**: 11 fichiers
- **Bugs critiques résolus**: 10
- **Issues documentées pour prochaine session**: 5

---

**Dernière mise à jour**: 6 décembre 2025, 18:30
**Prochaine session**: À planifier - Focus sur correction des 5 issues documentées ci-dessus
