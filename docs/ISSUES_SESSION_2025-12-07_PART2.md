# Issues Session 2025-12-07 - Partie 2

## Date : 7 décembre 2025

## Contexte
Corrections appliquées lors de la session :
- ✅ Suppression de MANUAL de DataSourceType (n'est pas une source de données, juste un mode d'indicateur)
- ✅ Suppression de STATIC de DataSourceType (n'est pas une source de données, juste un mode d'indicateur)
- ✅ Suppression de SQLite des types SQL (seulement PostgreSQL et MySQL)
- ✅ REST mis par défaut dans l'onglet Sources de Données
- ✅ Username et password sur la même ligne (grid-cols-2)
- ✅ Renommage partiel "Source" → "Mode" pour éviter confusion avec "Source de Données"
- ✅ Ajout de "Manuel (Saisie opérateur)" au lieu de juste "Manuel"

## 🔴 PROBLÈMES CRITIQUES NON RÉSOLUS

### 1. BOUTON "CONFIGURER" MAL PLACÉ (CRITIQUE)

**Comportement actuel (INCORRECT) :**
- ❌ Dans l'onglet **Stocks**, sections **Stock Initial** et **Stock Final** : le bouton "Configurer..." N'APPARAÎT PAS quand Mode = Dynamique
- ❌ Dans le dialogue **Modifier le Stock Entre Étapes** : le bouton "Configurer..." APPARAÎT alors qu'on n'en a pas besoin

**Comportement attendu (CORRECT) :**
- ✅ **Stock Initial/Final** (propriétés du nœud) : PAS de bouton "Configurer...", configuration directe dans le dialogue avec tous les champs visibles
- ✅ **Stock Entre Étapes** (entité dans tableau) : bouton "Configurer..." pour ouvrir un dialogue dédié de configuration

**Pourquoi c'est inversé :**
Le code a été modifié pour retirer les boutons des stocks initial/final, mais ils ont été retirés des MAUVAIS endroits. Le bouton a été retiré là où il devait rester et ajouté là où il ne devait pas être.

**Localisation du code :**
Fichier : `c:\wk\VSM-Tools\src\renderer\components\dialogs\configuration\tabs\InventoriesTab.tsx`

Lignes concernées :
- ~275-290 : Section Stock Initial (doit GARDER le bouton Configurer)
- ~375-390 : Section Stock Final (doit GARDER le bouton Configurer)  
- ~470-495 : Dialogue Stock Entre Étapes (doit RETIRER le bouton Configurer)

### 2. CHAMPS DYNAMIQUES NON AFFICHÉS

**Problème :**
Dans les sections Stock Initial et Stock Final, quand Mode = Dynamique, les champs de configuration (Source de Données, Requête SQL/Endpoint, etc.) n'apparaissent pas du tout.

**Solution :**
Reproduire exactement la structure du dialogue `IndicatorDialog.tsx` qui fonctionne correctement :

```tsx
// Dans IndicatorDialog.tsx (RÉFÉRENCE - FONCTIONNE)
{source === 'Dynamique' && (
  <>
    <FormField
      label="Source de Données"
      // ... select parmi availableDataSources
    />
    <FormField
      label="Requête SQL / Endpoint"
      // ... configuration de la requête
    />
  </>
)}
```

Cette structure doit être appliquée aux sections Stock Initial et Stock Final.

### 3. RENOMMAGE "SOURCE" → "MODE" INCOMPLET

**Endroits où "Source" n'a PAS été changé en "Mode" :**

#### Fichier : `IndicatorDialog.tsx`
- Ligne ~7 : Commentaire `// - Ligne 2 : Source (Radio Statique / Dynamique)`
  - Devrait être : `// - Ligne 2 : Mode (Radio Statique / Dynamique / Manuel)`

#### Fichier : `InventoriesTab.tsx`
- Variables d'état utilisent encore "source" au lieu de "mode" :
  ```tsx
  const [initialStockSource, setInitialStockSource] = ...  // Devrait être initialStockMode
  const [finalStockSource, setFinalStockSource] = ...      // Devrait être finalStockMode
  editingStock.source                                       // Devrait être editingStock.mode
  ```

#### Fichier : `vsm-model.ts`
- Interface `StockBetweenSteps` :
  ```tsx
  source: 'Statique' | 'Dynamique' | 'Manuel'  // Devrait être mode
  ```

- Interface `IndicatorFormData` :
  ```tsx
  source: 'Statique' | 'Dynamique' | 'Manuel'  // Devrait être mode
  ```

**ATTENTION :** Ces changements de noms de propriétés affecteront :
- La sérialisation XML (xml-serializer.ts)
- La validation (vsm-validation.ts)
- Tous les composants qui lisent ces propriétés

### 4. AUTRES OBSERVATIONS

**InformationFlowsTab.tsx :**
- Utilise "Source" pour désigner le nœud source d'un flux (ligne ~218)
- Ceci est CORRECT - il s'agit vraiment d'une source/cible de flux, pas du mode de récupération
- NE PAS changer dans ce contexte

**ProcessStepsTab.tsx :**
- Utilise "sourceNodeId" pour les flux (ligne ~82)
- Ceci est CORRECT - c'est l'ID du nœud source
- NE PAS changer

## 📋 PLAN D'ACTION POUR PROCHAINE SESSION

### Étape 1 : Corriger le bouton "Configurer" (PRIORITÉ HAUTE)

1. **Stock Initial (lignes ~275-310)** :
   ```tsx
   <div className="flex gap-2">
     <Select value={initialStockSource} ...>
       // ... options
     </Select>
     
     {initialStockSource === 'Dynamique' && (
       <Button variant="outline" onClick={handleConfigureInitialStock}>
         Configurer...
       </Button>
     )}
   </div>
   
   {/* Afficher les champs directement ici, pas dans un panneau séparé */}
   {initialStockSource === 'Dynamique' && (
     <div className="space-y-4">
       <FormField label="Source de Données" ... />
       <FormField label="Requête SQL / Endpoint" ... />
     </div>
   )}
   ```

2. **Stock Final (lignes ~375-410)** :
   - Même structure que Stock Initial

3. **Stock Entre Étapes (lignes ~470-520)** :
   ```tsx
   {/* RETIRER le bouton Configurer et le panneau avec flex gap-2 */}
   <div>
     <label>Mode :</label>
     <Select value={editingStock.source} ...>
       // ... options (pas de bouton Configurer)
     </Select>
   </div>
   
   {/* Garder seulement l'affichage conditionnel des champs */}
   {editingStock.source === 'Statique' && (
     // ... champs quantité/durée
   )}
   
   {editingStock.source === 'Dynamique' && (
     // ... champs source de données + requête
   )}
   ```

### Étape 2 : Renommage complet "source" → "mode" (PRIORITÉ MOYENNE)

1. **Modèle de données** (`vsm-model.ts`) :
   - `source` → `mode` dans interfaces
   - Mettre à jour les types unions

2. **Validation** (`vsm-validation.ts`) :
   - Mettre à jour les schémas Zod

3. **Sérialisation** (`xml-serializer.ts`) :
   - Mapper `mode` vers `source` en XML pour compatibilité backend
   - Ou mettre à jour le backend pour accepter `mode`

4. **Composants** :
   - Renommer toutes les variables `*Source` en `*Mode`
   - Mettre à jour les props et états

### Étape 3 : Tests de validation

1. Tester Stock Initial en mode Dynamique → champs doivent apparaître
2. Tester Stock Final en mode Dynamique → champs doivent apparaître
3. Tester Stock Entre Étapes → pas de bouton Configurer, champs conditionnels
4. Tester Indicateurs → vérifier que rien n'a cassé
5. Tester sérialisation XML → vérifier compatibilité backend

## 🎯 LOGIQUE CORRECTE (MÉMO)

**Sources de Données (Onglet 2)** = Connexions réutilisables aux systèmes externes :
- SQL (PostgreSQL, MySQL)
- REST (API)

**Mode** = Comment obtenir une valeur pour un indicateur/stock :
- **Statique** : valeur fixe saisie dans l'interface
- **Dynamique** : récupérée via une Source de Données (requête SQL ou appel REST)
- **Manuel** : saisie par l'opérateur sur le terrain (interface opérateur)

**Différence Stock Initial/Final vs Stock Entre Étapes :**
- **Initial/Final** : Propriétés du nœud → configuration directe dans le dialogue NodePropertiesDialog
- **Entre Étapes** : Entités séparées dans un tableau → dialogue dédié "Modifier le Stock Entre Étapes"

**Pattern de configuration :**
- Entité dans un tableau → Bouton "Configurer..." ouvre dialogue dédié
- Propriété d'un objet → Champs affichés directement dans le dialogue parent

## 📝 NOTES SUPPLÉMENTAIRES

### Référence : IndicatorDialog.tsx (FONCTIONNE CORRECTEMENT)

Structure à reproduire pour les stocks :

```tsx
{/* Ligne 1 : Nom */}
<FormField label="Nom" ... />

{/* Ligne 2 : Mode */}
<RadioGroup value={source} ...>
  <RadioGroupItem value="Statique" />
  <RadioGroupItem value="Dynamique" />
  <RadioGroupItem value="Manuel" />
</RadioGroup>

{/* Ligne 3 : Valeur (si Statique) */}
{source === 'Statique' && (
  <FormField label="Valeur" ... />
)}

{/* Lignes 4-5 : Config Dynamique */}
{source === 'Dynamique' && (
  <>
    <FormField label="Source de Données" ... />
    <FormField label="Requête SQL / Endpoint" ... />
  </>
)}

{/* Manuel : aucun champ supplémentaire */}
```

### Avancement de la session

**Corrections réussies :**
- Architecture des sources de données clarifiée (SQL, REST seulement)
- Interface utilisateur améliorée (dbType dropdown, username/password sur une ligne)
- Terminologie partiellement corrigée (Mode au lieu de Source dans certains endroits)

**Corrections échouées :**
- Bouton Configurer au mauvais endroit
- Champs Dynamique non affichés pour Stock Initial/Final
- Renommage incomplet source → mode

**Leçon apprise :**
Toujours valider visuellement après chaque modification. Le code peut compiler sans erreur mais avoir une logique inversée.

## 🔗 FICHIERS CONCERNÉS

1. `c:\wk\VSM-Tools\src\renderer\components\dialogs\configuration\tabs\InventoriesTab.tsx` (PRINCIPAL)
2. `c:\wk\VSM-Tools\src\shared\types\vsm-model.ts`
3. `c:\wk\VSM-Tools\src\shared\types\vsm-validation.ts`
4. `c:\wk\VSM-Tools\src\services\serialization\xml-serializer.ts`
5. `c:\wk\VSM-Tools\src\renderer\components\dialogs\configuration\IndicatorDialog.tsx` (RÉFÉRENCE)
6. `c:\wk\VSM-Tools\src\renderer\components\dialogs\configuration\tabs\IndicatorsTab.tsx`

---

**Date de création :** 7 décembre 2025  
**Statut :** EN ATTENTE DE CORRECTION  
**Priorité :** HAUTE (bloque l'utilisation correcte des modes Dynamique pour les stocks)
