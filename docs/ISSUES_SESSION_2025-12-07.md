# Issues et Améliorations - Session du 7 Décembre 2025

## Contexte

Suite à la session du 6 décembre, plusieurs corrections majeures ont été apportées au projet VSM-Tools. Cette nouvelle session vise à comparer systématiquement chaque onglet de la version Electron avec sa version Eclipse pour assurer la conformité complète.

## Travaux Complétés Session du 7 Décembre

### ✅ Corrections Effectuées

1. **IndicatorDialog Refait Complètement**
   - Nouveau composant basé sur `IndicatorDialog.java` d'Eclipse
   - Structure 3 lignes: Nom+Unité, Source (Radio), Valeur/DataConnection
   - Support complet SQL et REST avec champs conditionnels
   - Ajout de l'option "Manuel" dans les sources
   - Composants UI créés: `RadioGroup`, `Label`, `Textarea`

2. **Modèle de Données Amélioré**
   - Interface `DataConnection` ajoutée (dataSourceId, sqlQuery, restEndpoint, jsonPath, parameters)
   - Interface `Indicator` mise à jour avec `source: 'Statique' | 'Dynamique' | 'Manuel'`
   - Suppression des anciennes interfaces `SQLIndicatorConfig`, `RESTIndicatorConfig`

3. **Flux Matériels Corrigés**
   - Correction enum: `FIFO` → `FIFO_LANE`, `SUPERMARKET` → `KANBAN`
   - Labels corrects: PUSH, PULL, FIFO, KANBAN

4. **Dialogue Stocks Entre Étapes Amélioré**
   - Layout réorganisé (De+Vers, Nom+Type, Source)
   - Bouton "Configurer..." aligné avec Select Source

5. **DataSourcesTab Corrigé**
   - Retrait du champ "Valeur par Défaut" pour type MANUAL
   - Configuration simplifiée pour saisie manuelle

## Plan de Validation Systématique

### Phase 1: Comparaison Onglet par Onglet avec Eclipse

Chaque onglet sera comparé en détail avec sa version Eclipse pour identifier les différences de:
- Structure des formulaires
- Champs disponibles
- Validations
- Comportements
- Messages d'aide

#### Onglet 1: Informations Générales ⏳
**Fichier**: `GeneralInfoTab.tsx` vs `ConfigurationDialog.java` (lignes ~300-500)

**À vérifier**:
- [ ] Champs: Nom du Projet, Description, Version, Auteur
- [ ] Dates: Date de Création, Date de Modification
- [ ] Format des dates et validation
- [ ] Placeholders et helper texts

#### Onglet 2: Sources de Données ⏳
**Fichier**: `DataSourcesTab.tsx`

**À vérifier**:
- [x] Type MANUAL sans champ de configuration
- [ ] Validation des champs SQL (jdbcUrl, driver, user, passwordRef)
- [ ] Validation des champs REST (baseUrl, authType, authSecretRef)
- [ ] Bouton "Tester la connexion"
- [ ] Affichage du statut de connexion
- [ ] Gestion des erreurs de connexion

**Référence Eclipse**: `DataSourceDialog.java` + configuration dans `ConfigurationDialog.java`

#### Onglet 3: Acteurs Externes ⏳
**Fichier**: `ActorsTab.tsx` vs `ConfigurationDialog.java` (section Acteurs)

**À vérifier**:
- [ ] Supplier: name, contact, deliveryFrequency, customFrequency, leadTime
- [ ] Customer: name, contact, dailyDemand, taktTime (calculé automatiquement)
- [ ] ControlCenter: name, description (optionnel)
- [ ] Calcul automatique du Takt Time
- [ ] Validation des champs numériques

#### Onglet 4: Étapes de Production ✅
**Fichier**: `ProcessStepsTab.tsx`

**Statut**: Corrigé - Colonne "Ordre" fonctionne correctement

**À vérifier**:
- [x] Colonne Ordre affiche 1, 2, 3...
- [x] Colonne Nom de l'étape
- [ ] Boutons Monter/Descendre pour réordonner
- [ ] Suppression avec avertissement sur les flux liés
- [ ] Dialogue d'édition simple (Nom uniquement)

#### Onglet 5: Indicateurs ✅
**Fichier**: `IndicatorsTab.tsx` + `IndicatorDialog.tsx`

**Statut**: Refait complètement conforme à Eclipse

**À vérifier**:
- [x] Structure Master-Detail (liste étapes + indicateurs)
- [x] Dialogue: Nom, Unité, Source (Statique/Dynamique/Manuel)
- [x] Configuration Dynamique avec DataConnection
- [x] Support SQL et REST
- [ ] Validation complète avant sauvegarde
- [ ] Messages d'erreur appropriés

**Référence Eclipse**: `IndicatorDialog.java`

#### Onglet 6: Stocks & Inventaires ✅
**Fichier**: `InventoriesTab.tsx`

**Statut**: Amélioré

**À vérifier**:
- [x] Stock Initial (checkbox + panel)
- [x] Table Stocks Entre Étapes auto-générée
- [x] Stock Final (checkbox + panel)
- [x] Labels français pour InventoryType
- [x] Bouton Configurer aligné avec Select Source
- [ ] Dialogue d'édition: validation complète
- [ ] Source Dynamique: configuration DataConnection
- [ ] Calcul automatique de la durée si quantité changée

#### Onglet 7: Flux Matériels ✅
**Fichier**: `MaterialFlowsTab.tsx`

**Statut**: Corrigé

**À vérifier**:
- [x] Table simple 4 colonnes (De, Vers, Type, Description)
- [x] Auto-génération depuis process steps
- [x] Types corrects: PUSH, PULL, FIFO_LANE, KANBAN
- [x] Descriptions automatiques selon type
- [ ] Persistance des choix lors des modifications d'étapes

#### Onglet 8: Flux d'Information ⏳
**Fichier**: `InformationFlowsTab.tsx`

**À vérifier**:
- [ ] Table: Description, Source, Cible, Type de Transmission
- [ ] Source/Cible: combo avec tous les nœuds (acteurs + étapes)
- [ ] Type de Transmission: ELECTRONIC, MANUAL, KANBAN, SCHEDULE
- [ ] Description automatique ou éditable
- [ ] Validation: source ≠ cible

**Référence Eclipse**: Section Flux Information dans `ConfigurationDialog.java`

#### Onglet 9: Points d'Amélioration ⏳
**Fichier**: `ImprovementPointsTab.tsx` (probablement manquant)

**À vérifier**:
- [ ] Table: Description, Priorité, Responsable, Date Échéance, Statut
- [ ] Priorité: 1=Haute, 2=Moyenne, 3=Basse
- [ ] Statut: IDENTIFIED, IN_PROGRESS, RESOLVED
- [ ] Positionnement sur canvas (x, y)

**Note**: Cet onglet est peut-être manquant dans la version Electron actuelle.

### Phase 2: Validation Fonctionnelle

#### Validation de la Persistence
- [ ] Sauvegarde du diagramme complet au format JSON
- [ ] Chargement correct de tous les champs
- [ ] Validation du schéma avec Zod
- [ ] Gestion des migrations de version

#### Validation de la Génération de Layout
- [ ] Algorithme de placement automatique des nœuds
- [ ] Calcul des positions x, y pour chaque élément
- [ ] Génération des connexions (flux matériels, flux info)
- [ ] Placement des stocks entre étapes
- [ ] Rendu sur canvas

#### Validation des Calculs
- [ ] Calcul du Takt Time (Customer)
- [ ] Calcul de la Lead Time totale
- [ ] Calcul du Value-Added Time
- [ ] Calcul des WIP (Work In Progress)
- [ ] Calcul du Process Cycle Efficiency (PCE)

### Phase 3: Comparaison Détaillée des Dialogues

#### ConfigurationDialog.java vs ConfigurationDialog.tsx

**Structure Eclipse** (3065 lignes):
- TabFolder avec 9 onglets
- Gestion d'état centralisée
- Validation à la sauvegarde
- Boutons OK/Cancel/Apply

**Structure Electron**:
- Tabs shadcn/ui
- État distribué par onglet
- Validation par onglet
- À comparer en détail

#### Dialogues Manquants à Créer
- [ ] `DataConnectionDialog.tsx` (pour configuration dynamique stocks)
- [ ] `ImprovementPointDialog.tsx`
- [ ] Dialogues de validation/preview avant sauvegarde

## Issues Identifiées à Traiter

### 🔴 Priorité HAUTE

#### Issue 1: Onglet Points d'Amélioration Manquant
**Description**: L'onglet 9 pour gérer les Kaizen Bursts n'existe pas dans la version Electron.

**Fichier à créer**: `c:\wk\VSM-Tools\src\renderer\components\dialogs\configuration\tabs\ImprovementPointsTab.tsx`

**Référence**: `ConfigurationDialog.java` section Improvement Points

**Solution**:
1. Créer le composant ImprovementPointsTab
2. Interface ImprovementPoint déjà définie dans vsm-model.ts
3. Table avec colonnes: Description, Priorité, Responsable, Date, Statut
4. Dialogue pour ajouter/éditer

#### Issue 2: Bouton "Tester la Connexion" Manquant
**Description**: DataSourcesTab n'a pas de bouton pour tester la connexion aux sources de données.

**Localisation**: `DataSourcesTab.tsx`

**Solution**:
1. Ajouter bouton "Tester" dans le dialogue
2. Implémenter fonction de test selon le type (SQL/REST)
3. Mettre à jour le statut (OK/ERROR/UNTESTED)
4. Afficher message d'erreur si échec

#### Issue 3: Calcul Automatique Takt Time
**Description**: Le Takt Time devrait être calculé automatiquement dans ActorsTab.

**Formule**: `Takt Time = Temps de travail disponible par jour / Demande quotidienne client`

**Localisation**: `ActorsTab.tsx` section Customer

**Solution**:
1. Ajouter champs: Working Hours per Day (ex: 8h = 28800s)
2. Calculer automatiquement: taktTime = workingTime / dailyDemand
3. Afficher en lecture seule
4. Recalculer à chaque changement de dailyDemand

### 🟡 Priorité MOYENNE

#### Issue 4: Validation des Dates
**Description**: Les dates dans GeneralInfoTab ne sont pas validées correctement.

**Solution**:
1. Utiliser des date pickers appropriés
2. Valider format ISO 8601
3. Empêcher date de modification < date de création

#### Issue 5: Persistance des Flux Matériels
**Description**: Les types de flux ne sont pas sauvegardés dans le modèle.

**Solution**:
1. Créer structure MaterialFlow dans le modèle
2. Sauvegarder les choix dans flowSequences
3. Recharger lors de l'ouverture

#### Issue 6: Messages d'Aide Manquants
**Description**: Plusieurs champs manquent de helper texts explicatifs.

**À ajouter dans**:
- GeneralInfoTab: format de version, convention auteur
- DataSourcesTab: format passwordRef, exemples jdbcUrl
- ActorsTab: unités pour leadTime, dailyDemand

### 🟢 Priorité BASSE

#### Issue 7: Icônes et Visuels
**Description**: Améliorer les icônes pour les types de nœuds et flux.

**Solution**:
- Ajouter icônes pour SUPPLIER, CUSTOMER, CONTROL_CENTER
- Ajouter icônes pour flux types (PUSH, PULL, FIFO, KANBAN)
- Améliorer les indicateurs visuels de statut

#### Issue 8: Raccourcis Clavier
**Description**: Ajouter des raccourcis pour navigation rapide.

**À implémenter**:
- Ctrl+S: Sauvegarder
- Ctrl+Tab: Onglet suivant
- Ctrl+Shift+Tab: Onglet précédent
- Ctrl+N: Nouvelle étape/indicateur/flux

## Checklist de Validation Complète

### Conformité Eclipse
- [ ] Tous les onglets implémentés (9/9)
- [ ] Tous les champs présents
- [ ] Toutes les validations identiques
- [ ] Tous les dialogues fonctionnels
- [ ] Messages d'erreur cohérents

### Fonctionnalités
- [ ] Sauvegarde/Chargement JSON
- [ ] Génération de layout automatique
- [ ] Calculs automatiques (Takt Time, Lead Time, PCE)
- [ ] Export vers différents formats
- [ ] Import depuis Eclipse (.vsmx)

### Qualité du Code
- [ ] Aucune erreur TypeScript
- [ ] Tests unitaires pour le modèle
- [ ] Tests d'intégration pour les dialogues
- [ ] Documentation des composants
- [ ] Respect des guidelines shadcn/ui

### Performance
- [ ] Temps de chargement < 2s
- [ ] Réactivité des dialogues < 100ms
- [ ] Génération de layout < 1s pour 20 étapes
- [ ] Pas de memory leaks

## Prochaines Étapes Recommandées

### Session Immédiate: Validation Onglet 1-3
1. Comparer GeneralInfoTab avec Eclipse ligne par ligne
2. Comparer DataSourcesTab et ajouter bouton Test
3. Comparer ActorsTab et ajouter calcul Takt Time

### Session Suivante: Onglet 8-9
1. Valider/Corriger InformationFlowsTab
2. Créer ImprovementPointsTab
3. Tests fonctionnels complets

### Session Finale: Intégration & Tests
1. Sauvegarde/Chargement complet
2. Génération de layout
3. Tests utilisateurs
4. Documentation finale

## Références Techniques

### Fichiers Clés Electron
- `c:\wk\VSM-Tools\src\shared\types\vsm-model.ts` - Modèle de données
- `c:\wk\VSM-Tools\src\renderer\components\dialogs\configuration\ConfigurationDialog.tsx` - Dialogue principal
- `c:\wk\VSM-Tools\src\renderer\components\dialogs\configuration\tabs\*.tsx` - 8 onglets actuels

### Fichiers Clés Eclipse (Référence)
- `d:\dev\workspace-vsm\com.vsmtools.vsm.studio.main\src\com\vsmtools\vsm\studio\main\dialogs\ConfigurationDialog.java` (3065 lignes)
- `d:\dev\workspace-vsm\com.vsmtools.vsm.studio.main\src\com\vsmtools\vsm\studio\main\dialogs\IndicatorDialog.java`
- `d:\dev\workspace-vsm\com.vsmtools.vsm.model\vsm.ecore` - Modèle EMF

### Documentation
- `c:\wk\VSM-Tools\docs\ISSUES_SESSION_2025-12-06.md` - Session précédente
- `c:\wk\VSM-Tools\docs\dev\MIGRATION_MODEL_FIRST.md` - Architecture Model-First
- `c:\wk\VSM-Tools\docs\vsm\` - Documentation métier VSM

## Notes de Session

**Date**: 7 décembre 2025
**Durée**: ~1 heure
**Fichiers modifiés**: 5
**Issues corrigées**: 3
**Issues documentées**: 8

---

**Prochaine session**: Validation systématique onglet par onglet, en commençant par les onglets 1-3.
