# Roadmap - Prochaines Étapes VSM-Tools

*Date : 9 décembre 2025*

## ✅ Complété Aujourd'hui (9 décembre 2025)

### Connexion Studio-Engine
- ✅ Connexion backend établie (CORS configuré)
- ✅ Création/ouverture de projets fonctionnelle
- ✅ Dialogue de configuration s'ouvre automatiquement
- ✅ Arborescence affiche le projet actif
- ✅ Boutons toolbar activés intelligemment selon l'état
- ✅ Canvas masqué si diagramme vide
- ✅ Noms propres dans l'arborescence (Diagramme, Plan d'Action, Notes)

### Persistance des Données
- ✅ Auto-sauvegarde dans ConfigurationDialog
- ✅ Routes backend pour configuration (GET/PUT/PATCH/POST)
- ✅ Initialisation avec valeurs par défaut (stocks, règles d'analyse)
- ✅ Chargement du diagramme depuis la BD

### Interface Utilisateur
- ✅ ChatAssistant avec Gemini API (géré en interne)
- ✅ RightSidebar avec Propriétés/Assistant/Analyse
- ✅ ProjectExplorer avec arborescence VSM
- ✅ Dialogues corrigés (boutons ne débordent plus)

### Phase 1 : Infrastructure Sources de Données ✅
- ✅ Onglet Sources de Données simplifié (connexions SQL/REST uniquement)
- ✅ Backend : Routes dataCollection.ts (execute-sql, execute-rest, test-connection)
- ✅ Frontend : dataCollectionService.ts pour récupération automatique
- ✅ Support : Authentification (Bearer, API Key, Basic)
- ✅ Support : JSON Path pour extraction de valeurs REST

### Phase 2 : Mode Dynamique pour Indicateurs/Stocks ✅
- ✅ Modèle : Ajout de `mode` et `dataConnection` dans Indicator et Inventory
- ✅ IndicatorDialog : Sauvegarde complète de DataConnection
- ✅ InventoriesTab : Support DataConnection pour stocks dynamiques
- ✅ Service : fetchIndicatorValue et fetchInventoryValue
- ✅ Service : updateDynamicIndicators et updateDynamicInventories

### Phase 3 : Moteur d'Analyse Dynamique ✅
- ✅ AnalysisEngine : Lit les règles depuis analysisConfig
- ✅ AnalysisEngine : Applique uniquement les règles activées
- ✅ AnalysisEngine : Support opérateurs flexibles (>, <, >=, <=, =, !=)
- ✅ AnalysisEngine : Comparaison au Takt Time avec pourcentage
- ✅ Route : POST /api/diagrams/:id/recalculate avec analysisConfig
- ✅ Détection : Goulots d'étranglement basée sur règles
- ✅ Détection : Gaspillages (7 types LEAN) basée sur règles
- ✅ Détection : Opportunités basée sur règles
- ✅ Sévérité : Calculée selon priorité des règles (1=critique, 2=haute, 3=moyenne)

### Phase 4 : Visualisation des Résultats ✅
- ✅ AnalysisPanel : Affichage complet des résultats
- ✅ AnalysisPanel : Filtres par type et sévérité
- ✅ AnalysisPanel : Score global avec barre de progression
- ✅ AnalysisPanel : Click sur problème pour navigation
- ✅ IssueBadge : Composant pour badges visuels sur canvas
- ✅ IssueBadge : Couleurs dynamiques selon sévérité
- ✅ IssueBadge : Fonction groupIssuesByNode
- ✅ RightSidebar : Icône "Analyse" ajoutée
- ✅ MainLayout : Intégration du panneau d'analyse

### Phase 5 : Polling & Auto-refresh ✅
- ✅ Hook : useDynamicDataRefresh avec intervalle configurable
- ✅ ConfigurationDialog : Intégration du hook (30s par défaut)
- ✅ RefreshSettingsDialog : Interface de configuration
- ✅ Support : Intervalles de 10 secondes à 10 minutes
- ✅ Affichage : Dernier rafraîchissement et état
- ✅ Service : Collecte automatique des données dynamiques

---

## 🎯 Prochaines Tâches

### 1. Configuration des Sources de Données

**Objectif :** Permettre la connexion à des sources externes (ERP, MES, bases de données) pour alimenter dynamiquement les indicateurs et stocks.

#### Onglet Sources de Données - Améliorations
- [ ] **Interface de configuration**
  - Type de connexion : API REST, Base de données
  - Paramètres de connexion (URL, credentials, schéma)
  - Test de connexion en temps réel
  - Mapping des champs (mapper colonnes → indicateurs VSM)

#### Types de sources supportées (PHASE 1 UNIQUEMENT)**
  - **Sources déjà implémentées actuellement uniquement**
  - Pas d'ajout de nouvelles sources pour éviter la complexité
  - Focus sur la stabilisation de l'existant

- [ ] **Gestion des credentials**
  - Stockage sécurisé (côté serveur uniquement)
  - Variables d'environnement
  - Chiffrement des mots de passe

#### Structure de données suggérée
```typescript
interface DataSource {
  id: string;
  name: string;
  type: 'REST_API' | 'DATABASE';
  mode: 'static' | 'dynamic';
  
  // Configuration selon le type
  config: {
    // Pour REST API
    url?: string;
    method?: 'GET' | 'POST';
    headers?: Record<string, string>;
    auth?: {
      type: 'bearer' | 'apikey' | 'basic' | 'oauth';
      credentials: string; // Stocké côté serveur uniquement
    };
    
    // Pour Database
    connectionString?: string;
    query?: string;
    
    // Pour File
    filePath?: string;
    format?: 'csv' | 'excel' | 'json';
    polling?: {
      enabled: boolean;
      intervalMinutes: number;
    };
  };
  
  // Mapping des données
  fieldMappings: {
    sourceField: string;
    targetIndicator: string; // ID de l'indicateur VSM
    transformation?: 'sum' | 'avg' | 'count' | 'last';
  }[];
  
  // État
  lastSync?: string;
  status: 'active' | 'error' | 'disabled';
  errorMessage?: string;
}
```

---

### 2. Récupération/Utilisation des Données pour Indicateurs et Stocks

**Objectif :** Passer du mode statique au mode dynamique pour les KPIs.

#### Trois Modes pour les Indicateurs

**Mode Statique (actuel)**
- Valeurs saisies manuellement dans l'interface Studio
- Stockées directement dans la BD
- Pas de rafraîchissement automatique
- Utilisé pour les configurations de base

**Mode Dynamique (à implémenter)**
- Valeurs provenant automatiquement d'une source de données externe
- Rafraîchissement automatique en arrière-plan (pas de bouton manuel)
- Les données sont récupérées et mises à jour dans le studio automatiquement
- Pas d'affichage individuel de statut "Dernière màj" - tout est transparent
- Utilisé pour les données en temps réel (ERP, MES, bases de données)

**Mode Manuel (à implémenter)**
- Valeurs saisies par les opérateurs à leurs postes de production
- Interface dédiée pour les opérateurs
- Lorsqu'une métrique est mise en mode manuel :
  1. Elle est enregistrée dans le backend
  2. Elle apparaît dans l'interface opérateur
  3. L'opérateur peut saisir les valeurs
  4. Les valeurs remontent au studio automatiquement
- Utilisé pour les données terrain que seuls les opérateurs connaissent

#### Implémentation suggérée

##### Backend - Service de collecte de données
```typescript
// vsm-engine/src/services/dataCollector.ts
class DataCollectorService {
  async fetchFromSource(dataSourceId: string): Promise<any> {
    const source = await getDataSource(dataSourceId);
    
    switch (source.type) {
      case 'REST_API':
        return this.fetchFromAPI(source);
      case 'DATABASE':
        return this.fetchFromDatabase(source);
      case 'FILE':
        return this.fetchFromFile(source);
    }
  }
  
  async updateIndicators(diagramId: string): Promise<void> {
    // Récupérer toutes les sources de données du diagramme
    // Pour chaque source, fetcher les données
    // Appliquer les transformations et mappings
    // Mettre à jour les indicateurs dans diagram.data
  }
  
  startPolling(diagramId: string, intervalMinutes: number): void {
    // Démarrer un job cron pour rafraîchir automatiquement
  }
}
```

##### Frontend - Affichage des indicateurs dynamiques
- **Tout se fait automatiquement en arrière-plan**
- Pas de bouton "Rafraîchir" manuel
- Pas d'affichage individuel de timestamp ou statut
- Les valeurs sont simplement mises à jour automatiquement dans le studio
- L'utilisateur ne doit pas se préoccuper du refresh

##### Stocks et Indicateurs - Structure des modes
```typescript
interface Inventory {
  // ... existing fields
  mode: 'static' | 'dynamic' | 'manual';
  dataSourceId?: string; // Pour mode dynamique
  operatorInputId?: string; // Pour mode manuel
}

interface Indicator {
  // ... existing fields
  mode: 'static' | 'dynamic' | 'manual';
  dataSourceId?: string; // Pour mode dynamique
  operatorInputId?: string; // Pour mode manuel
}
```

##### Mode Manuel - Interface Opérateur
**Workflow :**
1. Dans le Studio, l'utilisateur met une métrique en mode "Manuel"
2. Backend enregistre cette métrique dans une table `operator_inputs`
3. L'interface opérateur récupère toutes les métriques en mode manuel
4. L'opérateur saisit les valeurs à son poste
5. Les valeurs remontent automatiquement au Studio
6. Le diagramme se met à jour avec les nouvelles valeurs

**Structure Backend :**
```typescript
// Table: operator_inputs
interface OperatorInput {
  id: string;
  diagram_id: string;
  metric_type: 'indicator' | 'inventory';
  metric_id: string; // ID de l'indicateur ou du stock
  metric_name: string;
  node_id?: string; // Pour les indicateurs de nodes
  unit: string;
  current_value?: number;
  last_updated?: string;
  operator_id?: string;
  station_id?: string; // Poste de travail
}
```

---

### 3. Recalcul du Diagramme

**Question clé :** Qui déclenche le recalcul - Frontend ou Backend ?

#### Option A : Frontend déclenche, Backend calcule
**✅ Recommandée**

**Flux :**
```
1. User modifie un indicateur
2. Frontend met à jour localDiagram
3. Frontend appelle POST /api/diagrams/:id/recalculate
4. Backend:
   - Récupère les nouvelles valeurs
   - Calcule les métriques dérivées (Lead Time, Value-Added %, etc.)
   - Applique les règles d'analyse
   - Détecte les problèmes
   - Retourne diagram + analysis results
5. Frontend affiche les résultats
```

**Avantages :**
- Control total sur quand recalculer
- Pas de calculs inutiles
- UX réactive (feedback immédiat)

**Backend API :**
```typescript
POST /api/diagrams/:id/recalculate
{
  "data": { /* VSMDiagram complet */ }
}

Response:
{
  "diagram": { /* Diagramme avec métriques calculées */ },
  "analysis": {
    "bottlenecks": [...],
    "wastes": [...],
    "improvements": [...]
  },
  "metrics": {
    "totalLeadTime": 245.5,
    "valueAddedTime": 89.2,
    "valueAddedPercentage": 36.3,
    "inventoryDays": 12.5
  }
}
```

#### Option B : Backend auto-recalcule
**Moins recommandée**

- À chaque PUT/PATCH, backend recalcule automatiquement
- Problème : trop de calculs si multiples changements rapides
- Pas de contrôle sur le timing

#### Décision : **Option A**

---

### 4. Analyse des Données et Détection

**Objectif :** Détecter automatiquement les problèmes dans la chaîne de valeur.

#### Règles d'Analyse - Selon l'onglet Analyse et Détection

**Les 3 types de détection définis dans l'onglet :**
1. **Goulots d'étranglement** (Bottlenecks)
   - Étape avec le cycle time le plus long
   - Étapes avec faible uptime
   - Capacité insuffisante par rapport à la demande

2. **Gaspillages** (Wastes - 7 types LEAN)
   - Surproduction
   - Attente
   - Transport
   - Surtraitement
   - Stocks
   - Mouvements
   - Défauts

3. **Opportunités d'amélioration** (Improvements)
   - Réduction des temps de cycle
   - Optimisation des stocks
   - Équilibrage de la charge
   - Amélioration de la qualité

**Note :** Ces 3 types sont déjà définis dans l'interface, on les implémente tels quels.

#### Moteur d'Analyse Backend

```typescript
// vsm-engine/src/services/analysisEngine.ts
class AnalysisEngine {
  analyze(diagram: VSMDiagram, rules: AnalysisRule[]): AnalysisResult {
    const results = {
      bottlenecks: this.detectBottlenecks(diagram),
      wastes: this.detectWastes(diagram, rules),
      imbalances: this.detectImbalances(diagram),
      inventoryIssues: this.detectInventoryIssues(diagram),
      opportunities: this.suggestImprovements(diagram)
    };
    
    return results;
  }
  
  private detectBottlenecks(diagram: VSMDiagram): Bottleneck[] {
    // Trouver l'étape avec le cycle time le plus long
    // Identifier les étapes avec faible uptime
    // Calculer le taux d'utilisation
  }
  
  private detectWastes(diagram: VSMDiagram, rules: AnalysisRule[]): Waste[] {
    // Appliquer chaque règle d'analyse
    // Surproduction : batchSize > dailyDemand
    // Attente : inventory.daysOfStock > threshold
    // Transport : distance entre étapes
    // Surtraitement : cycle time excessif
    // Stocks : WIP élevé
    // Mouvements : opérateurs > optimal
    // Défauts : scrap rate, rework
  }
}
```

#### Structure des Résultats d'Analyse

```typescript
interface AnalysisResult {
  timestamp: string;
  summary: {
    totalIssues: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
    score: number; // 0-100, 100 = parfait
  };
  
  bottlenecks: {
    nodeId: string;
    nodeName: string;
    type: 'cycle_time' | 'uptime' | 'capacity';
    severity: 'medium' | 'high' | 'critical';
    impact: string; // Description de l'impact
    recommendation: string;
    metrics: {
      current: number;
      optimal: number;
      difference: number;
    };
  }[];
  
  wastes: {
    type: 'overproduction' | 'waiting' | 'transport' | 'overprocessing' | 
          'inventory' | 'motion' | 'defects';
    location: string; // nodeId ou inventoryId
    severity: 'low' | 'medium' | 'high';
    description: string;
    suggestion: string;
    potentialSavings?: {
      timeReduction: number; // en minutes
      costReduction?: number; // en devise
    };
  }[];
  
  opportunities: {
    type: 'process_improvement' | 'inventory_reduction' | 'time_reduction';
    priority: 'low' | 'medium' | 'high';
    description: string;
    expectedBenefit: string;
    effort: 'low' | 'medium' | 'high';
  }[];
}
```

---

### 5. Visualisation des Problèmes Détectés

**Objectif :** Montrer visuellement les problèmes sur le diagramme.

#### Approches Visuelles

##### A. Badges et Icônes sur les Éléments
```typescript
// Sur chaque node du diagramme
{
  node: ProcessStep,
  issues: [
    { type: 'bottleneck', severity: 'critical', icon: '⚠️' },
    { type: 'waste', severity: 'medium', icon: '🚨' }
  ]
}
```

**Rendu :**
- Icône d'alerte en haut à droite du nœud
- Couleur de bordure selon sévérité :
  - 🟢 Vert : OK
  - 🟡 Jaune : Low
  - 🟠 Orange : Medium
  - 🔴 Rouge : High/Critical
- Badge avec nombre de problèmes

##### B. Panel Latéral d'Analyse
- Onglet "Analyse" dans RightSidebar
- Liste des problèmes détectés
- Cliquer sur un problème → zoom sur l'élément concerné
- Filtres par type/sévérité

##### C. Heatmap du Flow
- Colorier les étapes selon leur criticité
- Épaisseur des flèches selon le volume
- Animation des flux

##### D. Timeline des Problèmes
- Évolution dans le temps des problèmes détectés
- Graphiques de tendances
- Comparaison avant/après améliorations

#### Implémentation Suggérée

**1. Ajouter les résultats d'analyse au diagramme**
```typescript
interface VSMDiagram {
  // ... existing fields
  analysisResults?: AnalysisResult;
}
```

**2. Composant AnalysisPanel**
```tsx
// src/renderer/components/panels/AnalysisPanel.tsx
export const AnalysisPanel: React.FC = () => {
  const { diagram } = useVsmStore();
  const analysis = diagram?.analysisResults;
  
  return (
    <div className="p-4">
      <h2>Analyse du Diagramme</h2>
      
      {/* Score global */}
      <ScoreCard score={analysis?.summary.score} />
      
      {/* Liste des problèmes */}
      <IssuesList 
        bottlenecks={analysis?.bottlenecks}
        wastes={analysis?.wastes}
        onIssueClick={nodeId => centerOnNode(nodeId)}
      />
      
      {/* Opportunités */}
      <OpportunitiesList opportunities={analysis?.opportunities} />
    </div>
  );
};
```

**3. Rendu visuel sur le canvas**
```typescript
// Dans VSMGraphRenderer
renderNodeWithIssues(node: Node, issues: Issue[]) {
  // Bordure colorée selon sévérité
  const borderColor = getSeverityColor(issues);
  
  // Badge avec nombre de problèmes
  const badge = this.createBadge(issues.length);
  
  // Tooltip au survol
  const tooltip = this.createTooltip(issues);
  
  // ...
}
```

---

## 📊 Architecture Proposée

### Backend Services

```
vsm-engine/
  src/
    services/
      dataCollector.ts      # Récupération données sources
      analysisEngine.ts     # Moteur d'analyse LEAN
      metricsCalculator.ts  # Calcul des KPIs
      scheduleManager.ts    # Gestion polling/refresh
    routes/
      dataSources.ts        # CRUD sources de données
      analysis.ts           # Endpoints d'analyse
      metrics.ts            # Endpoints métriques
```

### Frontend Components

```
VSM-Tools/
  src/
    renderer/
      components/
        panels/
          AnalysisPanel.tsx        # Panel d'analyse
          DataSourcePanel.tsx      # Config sources
        dialogs/
          DataSourceDialog.tsx     # CRUD sources
        indicators/
          DynamicIndicator.tsx     # Indicateur avec refresh
          IndicatorBadge.tsx       # Badge statique/dynamique
    services/
      dataSourceApi.ts             # API sources
      analysisApi.ts               # API analyse
    store/
      analysisStore.ts             # State analyse
```

---

## 🎯 Ordre d'Implémentation Recommandé

### Phase 1 : Infrastructure Sources de Données
1. Backend : Routes CRUD sources de données
2. Backend : Service DataCollector (REST API d'abord)
3. Frontend : Onglet Sources de Données (UI)
4. Frontend : DataSourceDialog (configuration)
5. Test : Connexion à une API REST externe

### Phase 2 : Mode Dynamique et Manuel pour Indicateurs
1. Backend : Service de refresh automatique en arrière-plan
2. Backend : Mapping données → indicateurs (transparent)
3. Backend : Table `operator_inputs` pour mode manuel
4. Backend : Endpoints pour interface opérateur
5. Frontend : Sélection du mode (static/dynamic/manual)
6. Frontend : Les valeurs se mettent à jour automatiquement
7. Interface Opérateur : Liste des métriques à saisir
8. Interface Opérateur : Formulaire de saisie
9. Test : Indicateur alimenté automatiquement
10. Test : Saisie opérateur remonte au Studio

### Phase 3 : Moteur d'Analyse ✅ COMPLÉTÉ
1. ✅ Backend : AnalysisEngine (utilise les règles configurées)
2. ✅ Backend : Endpoint POST /api/diagrams/:id/recalculate
3. ✅ Backend : Détection des **Goulots d'étranglement** (selon règles activées)
4. ✅ Backend : Détection des **Gaspillages** (7 types LEAN selon règles)
5. ✅ Backend : Détection des **Opportunités d'amélioration** (selon règles)
6. ✅ Moteur : Applique uniquement les règles **activées** dans l'onglet Analyse & Détection
7. ✅ Moteur : Supporte les conditions dynamiques (comparaison au Takt Time, opérateurs flexibles)
8. ✅ Moteur : Calcule la sévérité selon la priorité des règles (1=critique, 2=haute, 3=moyenne)

### Phase 4 : Visualisation ✅ COMPLÉTÉ
1. ✅ Frontend : AnalysisPanel avec filtres (type, sévérité)
2. ✅ Frontend : Affichage du score global et résumé
3. ✅ Frontend : Liste détaillée des goulots d'étranglement
4. ✅ Frontend : Liste détaillée des gaspillages (7 types LEAN)
5. ✅ Frontend : Liste des opportunités d'amélioration
6. ✅ Frontend : Composant IssueBadge pour badges sur canvas
7. ✅ Frontend : Fonction groupIssuesByNode pour organiser les problèmes
8. ✅ Frontend : Couleurs dynamiques selon sévérité (critique=rouge, haute=orange, moyenne=jaune, basse=bleu)
9. ✅ Frontend : Click sur un problème pour naviguer vers le nœud concerné
10. ✅ Frontend : Intégration dans RightSidebar avec icône dédiée

### Phase 5 : Polling & Auto-refresh ✅ COMPLÉTÉ
1. ✅ Frontend : Hook useDynamicDataRefresh avec intervalle configurable
2. ✅ Frontend : Intégré dans ConfigurationDialog (30 secondes par défaut)
3. ✅ Frontend : RefreshSettingsDialog pour configuration utilisateur
4. ✅ Frontend : Support des intervalles de 10s à 10min
5. ✅ Frontend : Affichage du dernier rafraîchissement
6. ✅ Frontend : Activation/désactivation du polling
7. ✅ Frontend : Avertissements pour intervalles courts
8. ✅ Backend : Endpoints de collecte de données (SQL/REST) déjà implémentés
9. ✅ Service : dataCollectionService.ts récupère les données automatiquement
10. ✅ Service : updateDynamicIndicators et updateDynamicInventories fonctionnels

---

## 📝 Notes Techniques

### Sécurité
- ❗ Ne JAMAIS stocker credentials côté client
- ❗ Chiffrer les mots de passe dans la BD
- ❗ Utiliser HTTPS pour les APIs externes
- ❗ Valider toutes les entrées utilisateur

### Performance
- Cache les résultats d'analyse (TTL 5 min)
- Debounce les recalculs (500ms)
- Pagination pour grandes listes de problèmes
- Worker threads pour analyses lourdes

### UX
- Loader pendant fetch de données
- Toast notifications pour erreurs
- Indicateur "Dernière màj: X min"
- Mode hors-ligne gracieux

---

## 📚 Ressources

### Documentation LEAN VSM
- 7 types de gaspillages (Muda)
- Calcul du Takt Time
- Value Stream Mapping standards

### APIs Utiles pour Tests
- JSONPlaceholder (REST API fake)
- Mockaroo (génération données)
- Postman Echo (test endpoints)

### Bibliothèques
- `node-cron` : Scheduling
- `axios` : HTTP client
- `pg` : PostgreSQL (déjà installé)
- `bull` : Queue pour jobs async

---

## ✅ Critères de Succès

### Phase 1 Complète quand :
- [ ] On peut créer une source de données REST
- [ ] On peut tester la connexion
- [ ] On peut voir les données récupérées

### Phase 2 Complète quand :
- [ ] Un indicateur affiche des données depuis une API
- [ ] Le timestamp "Dernière màj" fonctionne
- [ ] Le bouton refresh met à jour les données

### Phase 3 Complète quand :
- [ ] L'endpoint d'analyse retourne des résultats
- [ ] Au moins 3 types de problèmes détectés
- [ ] Les règles d'analyse sont appliquées

### Phase 4 Complète quand :
- [ ] Les problèmes s'affichent dans le panel
- [ ] Les nodes ont des badges colorés
- [ ] Cliquer sur un problème centre le canvas

### Phase 5 Complète quand :
- [x] Le polling automatique fonctionne
- [x] Les données se rafraîchissent sans interaction
- [x] Les notifications temps réel arrivent

---

## Phase 6 : Layout & Disposition du Diagramme ✅ (COMPLÉTÉ - 9 décembre 2025)

### Objectifs
- ✅ Retirer la liste des éléments à gauche du canvas (Acteurs, Production, etc.)
- ✅ Implémenter l'algorithme de layout automatique selon `LAYOUT_ALGORITHM.md`
- ✅ Disposer les éléments en swimlanes (Acteurs, Flux Info, Production, KPIs, Timeline)
- ✅ Afficher rectangles de stocks même si non définis (valeur = 0 dans calcul NVA)
- ✅ Espacements et dimensions conformes aux constantes (PROCESS_STEP_WIDTH, etc.)

### Réalisations Initiales
- ✅ **VsmCanvas.tsx** : Retiré la légende des swimlanes (Acteurs/Production/Données/Timeline)
- ✅ **VSMLayoutEngine.ts** : Ajout automatique de placeholders pour stocks non définis
  - Entre deux ProcessSteps sans inventory défini, crée un placeholder (quantity=0)
  - Le placeholder est comptabilisé comme 0 dans le calcul NVA de la timeline
- ✅ **VSMGraphRenderer.ts** : 
  - Nouveau style `inventoryPlaceholder` (rectangle blanc en pointillés)
  - Différenciation automatique entre inventories réels (triangles jaunes) et placeholders (rectangles vides)
- ✅ **Algorithme de layout** : Conforme à LAYOUT_ALGORITHM.md
  - 5 swimlanes : Acteurs (Y=50), Info (Y=150), Production (Y=250), Data (Y=380), Timeline (Y=500)
  - Espacements respectés : HORIZONTAL_SPACING=80px, VERTICAL_LANE_SPACING=100px
  - Dimensions fixes : PROCESS_STEP (120×80), INVENTORY (60×50), ACTOR (100×60)
  - Timeline avec segments VA (vert) et NVA (rouge) alignés sur les éléments

### Corrections Visuelles & Alignement (Session 2)
- ✅ **Alignement Acteurs** : Supplier, Customer et Control Center sur même ligne (ACTORS_Y=50)
- ✅ **Rectangles NVA vides** : Style `timelineNvaPlaceholder` (blanc, pointillés) pour stocks à 0
- ✅ **Alignement Timeline** : Chaque segment VA/NVA aligné avec ProcessStep/Inventory (même X, même largeur)
- ✅ **Uniformisation largeurs** : DATA_BOX_WIDTH = PROCESS_STEP_WIDTH (120px) pour alignement parfait
- ✅ **Pseudo-étapes Réception/Livraison** : Style `pseudoStep` (gris clair, pointillés) pour différenciation
- ✅ **Suppression bordures arrondies** : Tous rectangles avec `rounded: false` (Actors, Control Center)
- ✅ **Déclenchement sauvegarde** : Toggle checkbox stock entre étapes appelle `onUpdate()` → auto-save

### Composants modifiés
- `src/renderer/components/editor/VsmCanvas.tsx` : Retiré légende swimlanes
- `src/services/layout/VSMLayoutEngine.ts` : 
  - Placeholders + layout complet
  - Alignement Actors sur ACTORS_Y
  - Timeline alignée sur éléments (même X, même width)
  - DATA_BOX_WIDTH = PROCESS_STEP_WIDTH
- `src/services/layout/VSMGraphRenderer.ts` : 
  - Styles inventoryPlaceholder, timelineNvaPlaceholder, pseudoStep
  - Détection automatique pseudo-étapes (isPseudo metadata)
  - `rounded: false` pour Actors et Control Center
- `src/renderer/components/dialogs/configuration/tabs/InventoriesTab.tsx` : 
  - handleToggleStock appelle onUpdate() pour déclencher auto-save

---

## Phase 7 : Intégration Visuelle des Problèmes

### Objectifs
- ⏳ Afficher badges IssueBadge sur les nœuds problématiques du canvas
- ⏳ Couleurs de bordure selon sévérité (rouge=critique, orange=haute, jaune=moyenne)
- ⏳ Navigation : Clic sur problème dans AnalysisPanel → centrer canvas sur nœud
- ⏳ Highlight du nœud sélectionné avec animation

### Composants à modifier
- `VSMGraphRenderer.tsx` : Intégrer IssueBadge dans le rendu des nœuds
- `AnalysisPanel.tsx` : Ajouter handler pour centrer la vue canvas
- `VSMCanvas.tsx` : Méthode pour centrer et highlight un nœud

---

## Phase 8 : Interface Opérateur

### Objectifs
- ⏳ Créer `OperatorInputPanel` pour saisie manuelle des valeurs
- ⏳ Support modification en temps réel des indicateurs en mode manuel
- ⏳ Historique des saisies avec timestamp
- ⏳ Validation des valeurs (min/max, format)
- ⏳ Export CSV des saisies pour analyse externe

### Nouveaux composants
- `components/panels/OperatorInputPanel.tsx`
- `components/forms/ManualInputForm.tsx`
- Backend : `routes/operatorInputs.ts`
- Base de données : Table `operator_inputs` (déjà existante)

---

## Phase 9 : Tests End-to-End

### Objectifs
- ⏳ Scénario 1 : Créer projet → Ajouter sources SQL → Configurer règles → Voir analyse
- ⏳ Scénario 2 : Mode manuel → Saisir valeurs → Recalculer → Vérifier résultats
- ⏳ Scénario 3 : Mode hybride (certains auto, certains manuels)
- ⏳ Tests de performance : 100+ ProcessSteps, 50+ règles d'analyse
- ⏳ Tests WebSocket : Mise à jour temps réel multi-utilisateurs

---

**Ordre d'exécution prioritaire :**

1. ✅ Phases 1-5 : Infrastructure et analyse dynamique (COMPLÉTÉ)
2. 🔄 **Phase 6 : Layout & Disposition** ← **EN COURS**
3. ⏳ Phase 7 : Badges visuels et navigation
4. ⏳ Phase 8 : Interface opérateur
5. ⏳ Phase 9 : Tests end-to-end
