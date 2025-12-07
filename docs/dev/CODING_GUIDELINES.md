# Guidelines de Développement VSM-Tools

## Table des matières

## 1. Introduction

Ce document définit les guidelines de développement pour le projet VSM-Tools. Il vise à standardiser les pratiques de codage afin d'assurer la maintenabilité, la lisibilité et l'évolutivité du code. Suivre ces guidelines est essentiel pour faciliter la collaboration entre développeurs et garantir la qualité du logiciel dans le temps.

## 2. Structure du Code

### 2.1 Organisation des Répertoires

L'organisation des répertoires doit suivre une structure logique adaptée à une application Electron avec React/TypeScript :

```
VSM-Tools/
├── src/                     # Code source principal
│   ├── main/                # Code du processus principal Electron
│   │   ├── main.ts          # Point d'entrée principal
│   │   ├── menu.ts          # Configuration des menus
│   │   └── ipc/             # Handlers IPC du processus principal
│   ├── renderer/            # Code du processus de rendu (UI)
│   │   ├── components/      # Composants React réutilisables
│   │   ├── pages/           # Pages/Routes de l'application
│   │   ├── hooks/           # Hooks React personnalisés
│   │   ├── store/           # Gestion d'état (Redux/MobX/Context)
│   │   └── App.tsx          # Composant racine
│   ├── shared/              # Code partagé entre main et renderer
│   │   ├── types/           # Définitions de types TypeScript
│   │   ├── constants/       # Constantes partagées
│   │   └── utils/           # Utilitaires généraux
│   ├── services/            # Logique métier et services
│   │   ├── api/             # Communication avec backend
│   │   ├── calculation/     # Logique de calcul VSM
│   │   └── storage/         # Gestion stockage local
│   └── assets/              # Ressources statiques (images, styles)
├── electron/                # Configuration spécifique Electron
│   ├── build/               # Scripts de build
│   └── config/              # Configurations
├── tests/                   # Tests automatisés
│   ├── unit/                # Tests unitaires
│   ├── integration/         # Tests d'intégration
│   └── e2e/                 # Tests end-to-end
├── docs/                    # Documentation
└── node_modules/            # Dépendances (géré par npm)
```

### 2.2 Architecture des Modules

- Structurer le code selon le principe de séparation des préoccupations
- Suivre une architecture en couches :
  - **Couche UI** : Composants React (presentational et container)
  - **Couche État** : Store Redux/MobX/Context pour l'état global
  - **Couche Services** : Logique métier et communication externe
  - **Couche Données** : Modèles de données, types TypeScript
- Privilégier les modules avec une responsabilité unique et clairement définie
- Utiliser l'injection de dépendances via props ou contextes React

### 2.3 Séparation des Responsabilités

Adopter l'architecture recommandée pour les applications React :

- **Composants de Présentation** : Se concentrent uniquement sur le rendu UI, sans logique métier (dumb components)
- **Composants Conteneurs** : Gèrent l'état et la logique, passent les données aux composants de présentation
- **Hooks** : Extraire la logique réutilisable dans des hooks personnalisés
- **Services** : Encapsuler la logique métier et les appels API
- **Store** : Gérer l'état global de manière centralisée

Pour Electron, séparer clairement :
- **Processus Principal** : Gestion fenêtres, menus, accès système, IPC
- **Processus de Rendu** : Interface utilisateur (React) et logique associée

## 3. Conventions de Nommage

### 3.1 Nommage Général

- Utiliser des noms descriptifs qui révèlent l'intention
- Variables et fonctions : camelCase (`calculateLeadTime`, `currentProcess`)
- Classes et interfaces TypeScript : PascalCase (`ProcessData`, `VsmMapState`)
- Constantes : UPPER_SNAKE_CASE (`MAX_PROCESS_COUNT`, `DEFAULT_TAKT_TIME`)
- Types génériques : PascalCase avec préfixe T (`TProps`, `TState`)
- Interfaces : PascalCase avec préfixe I optionnel (`IProcessProps` ou `ProcessProps`)
- Éviter les abréviations non standards et les noms à une lettre
- Préférer les verbes pour les fonctions, les noms pour les variables

### 3.2 Conventions React/TypeScript

- **Composants React** : PascalCase (`ProcessItem`, `PropertyPanel`)
- **Props** : camelCase dans les interfaces, extension recommandée :
  ```typescript
  interface ButtonProps {
    onClick: () => void;
    isDisabled?: boolean;
  }
  ```
- **Hooks** : préfixe "use" (`useState`, `useProcessData`)
- **Context** : suffixe "Context" (`VsmContext`, `AuthContext`)
- **Reducers** : suffixe "Reducer" (`mapReducer`, `uiReducer`)
- **Actions** : format descriptif (`addProcess`, `updateFlowData`)
- **Slices** (Redux Toolkit) : suffixe "Slice" (`mapSlice`, `authSlice`)
- **Selectors** : préfixe "select" (`selectActiveProcess`, `selectTotalLeadTime`)

### 3.3 Fichiers

- Un composant React par fichier
- Nom de fichier identique au nom du composant/classe qu'il contient
- Extensions :
  - `.ts` pour TypeScript standard
  - `.tsx` pour TypeScript avec JSX (composants React)
  - `.js` uniquement pour configuration ou scripts
  - `.module.css/.scss` pour CSS modulaire
- Organisation par feature plutôt que par type (préférer `/features/process/` à `/components/` + `/services/process/`)
- Fichiers d'index pour exporter des modules (`index.ts`)

## 4. Style de Codage

### 4.1 Formatage

- Utiliser ESLint et Prettier pour le formatage automatique
- Configuration cohérente partagée dans le projet (`.eslintrc`, `.prettierrc`)
- Indentation : 2 espaces
- Limite de largeur de ligne : 100 caractères
- Utiliser les points-virgules à la fin des instructions
- Placer les accolades ouvrantes sur la même ligne (style K&R)
- Toujours utiliser des accolades pour les blocs, même pour les instructions à une ligne
- Un espace autour des opérateurs (`a + b`, pas `a+b`)

Configuration Prettier recommandée :
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "printWidth": 100,
  "trailingComma": "es5",
  "bracketSpacing": true
}
```

### 4.2 Taille et Complexité

- Limiter les fonctions à 50 lignes maximum
- Composants React de 250 lignes maximum (extraire en sous-composants si plus grand)
- Complexité cyclomatique maximale de 10 par fonction/méthode
- Niveau maximum d'imbrication : 3 niveaux
- Maximum de 3 opérateurs ternaires par fichier (préférer les conditions explicites)
- Éviter les fonctions avec plus de 3 paramètres

### 4.3 Conventions de Syntaxe

- Préférer les fonctions fléchées pour les fonctions anonymes :
  ```typescript
  // Bien
  const handleClick = () => {
    console.log('Clicked');
  };
  
  // À éviter
  function handleClick() {
    console.log('Clicked');
  }
  ```

- Utiliser la déstructuration pour les props et state :
  ```typescript
  // Bien
  const { name, age } = person;
  
  // À éviter
  const name = person.name;
  const age = person.age;
  ```

- Préférer la syntaxe de spread pour la copie d'objets/tableaux :
  ```typescript
  // Bien
  const newState = { ...oldState, count: oldState.count + 1 };
  
  // À éviter
  const newState = Object.assign({}, oldState);
  newState.count = oldState.count + 1;
  ```

- Préférer les fonctions pures et les structures de données immutables
- Utiliser les fonctions d'array moderne (map, filter, reduce) plutôt que les boucles for/while
- Utiliser les template literals pour la concaténation de chaînes
- Utiliser les valeurs par défaut des paramètres plutôt que les conditions

## 5. Documentation du Code

### 5.1 Commentaires

- Commenter le "pourquoi", pas le "quoi" (le code doit être auto-documenté)
- Utiliser JSDoc pour documenter les fonctions/méthodes :
  ```typescript
  /**
   * Calcule le lead time total pour la VSM
   * @param includeNVA - Si true, inclut les temps à non-valeur ajoutée
   * @returns Le lead time total en secondes
   * @throws {CalculationError} Si des données requises manquent
   */
  const calculateTotalLeadTime = (includeNVA = true): number => {
    // Implementation
  };
  ```
- Documenter les interfaces et types TypeScript complexes
- Limiter les commentaires de ligne (`//`) aux explications essentielles
- Maintenir les commentaires à jour avec le code
- Utiliser `// TODO:` et `// FIXME:` pour marquer les tâches en attente

### 5.2 Documentation API

- Documenter toutes les API publiques avec JSDoc
- Pour les hooks personnalisés, documenter :
  - Objectif du hook
  - Paramètres d'entrée
  - Valeurs de retour
  - Exemples d'utilisation

- Pour les composants React réutilisables :
  - Documenter chaque prop (type, description, valeurs par défaut)
  - Fournir des exemples d'utilisation
  - Documenter les comportements conditionnels

- Utiliser Storybook pour la documentation interactive des composants UI :
  ```typescript
  // Button.stories.tsx
  export default {
    title: 'Components/Button',
    component: Button,
    argTypes: {
      variant: { control: 'select', options: ['primary', 'secondary'] },
    },
  };
  
  export const Primary = () => <Button variant="primary">Primary Button</Button>;
  ```

### 5.3 Exemples et Cas d'Utilisation

- Inclure des exemples d'utilisation pour les APIs complexes
- Créer des histoires Storybook pour montrer différentes configurations des composants
- Documenter les cas d'utilisation typiques dans les tests
- Fournir des diagrammes/schémas pour les interactions complexes ou les flux de données

## 6. Gestion des Erreurs

### 6.1 Approches de Gestion d'Erreurs

- Utiliser une hiérarchie d'erreurs typée pour les erreurs applicatives :
  ```typescript
  class AppError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'AppError';
    }
  }
  
  class ApiError extends AppError {
    constructor(message: string, public statusCode: number) {
      super(message);
      this.name = 'ApiError';
    }
  }
  ```

- Dans les services et fonctions utilitaires :
  - Documenter clairement les erreurs potentielles
  - Lancer des erreurs spécifiques plutôt que génériques
  - Utiliser try/catch pour des limites claires

- Dans les composants React :
  - Utiliser les Error Boundaries pour capturer les erreurs de rendu
  - Créer un ErrorBoundary générique pour l'application :
    ```tsx
    class ErrorBoundary extends React.Component<{ fallback: React.ReactNode }> {
      state = { hasError: false };
      
      static getDerivedStateFromError() {
        return { hasError: true };
      }
      
      componentDidCatch(error, info) {
        logError(error, info);
      }
      
      render() {
        if (this.state.hasError) {
          return this.props.fallback;
        }
        return this.props.children;
      }
    }
    ```

- Pour la communication API :
  - Utiliser les intercepteurs Axios pour la gestion centralisée
  - Implémenter des stratégies de retry pour les erreurs temporaires
  - Transformer les erreurs HTTP en erreurs métier compréhensibles

### 6.2 Validation des Entrées

- Valider toutes les entrées utilisateur et les réponses API
- Utiliser des bibliothèques de validation comme Zod, Yup ou Joi :
  ```typescript
  const processSchema = z.object({
    name: z.string().min(3),
    cycleTime: z.number().positive(),
    operators: z.number().int().min(0),
  });
  
  // Validation
  try {
    const validated = processSchema.parse(inputData);
    // Utiliser validated (typé correctement)
  } catch (error) {
    // Gérer l'erreur de validation
  }
  ```

- Validation de props React avec PropTypes ou TypeScript
- Assurer la robustesse aux entrées invalides ou incomplètes
- Fournir des messages d'erreur clairs et spécifiques

### 6.3 Journalisation

- Utiliser une bibliothèque de logging structuré comme winston ou pino
- Configurer différents niveaux de log selon l'environnement (dev, test, prod)
- Catégoriser les logs :
  ```typescript
  const logger = {
    api: createLogger('api'),
    ui: createLogger('ui'),
    calculation: createLogger('calculation'),
  };
  
  // Utilisation
  logger.api.error('Échec de connexion au serveur', { statusCode, endpoint });
  ```

- Inclure des informations contextuelles pertinentes dans les logs
- Implémenter la capture des erreurs non gérées dans main et renderer
- Pour les erreurs en production, implémenter un système de reporting centralisé

## 7. Tests

### 7.1 Tests Unitaires

- Utiliser Jest comme framework de test principal
- Tests dans un répertoire __tests__ à côté du code testé ou dans /tests/unit
- Nommer les fichiers de test avec suffixe .test.ts ou .spec.ts
- Suivre le pattern AAA (Arrange-Act-Assert)
- Pour les fonctions d'utilitaires :
  ```typescript
  describe('calculateLeadTime', () => {
    it('should sum up all process times', () => {
      // Arrange
      const processes = [
        { name: 'P1', cycleTime: 10 },
        { name: 'P2', cycleTime: 20 },
      ];
      
      // Act
      const result = calculateLeadTime(processes);
      
      // Assert
      expect(result).toBe(30);
    });
    
    it('should handle empty process list', () => {
      expect(calculateLeadTime([])).toBe(0);
    });
  });
  ```

- Pour les composants React, utiliser React Testing Library :
  ```typescript
  import { render, screen, fireEvent } from '@testing-library/react';
  
  test('button click should increment counter', () => {
    // Arrange
    render(<Counter initialCount={0} />);
    
    // Act
    fireEvent.click(screen.getByRole('button', { name: /increment/i }));
    
    // Assert
    expect(screen.getByText('Count: 1')).toBeInTheDocument();
  });
  ```

- Viser une couverture de code de 80% minimum pour la logique métier
- Utiliser les mocks pour isoler les dépendances externes
- Tester les cas nominaux et les cas d'erreur

### 7.2 Tests d'Intégration

- Tester l'interaction entre plusieurs modules
- Setup de tests avec des mocks d'API pour les services externes
- Tester les flux complets (ex: création d'une carte VSM, calcul, sauvegarde)
- Utiliser MSW (Mock Service Worker) pour simuler les appels API :
  ```typescript
  // Setup MSW
  const server = setupServer(
    rest.get('/api/maps', (req, res, ctx) => {
      return res(ctx.json([{ id: 1, name: 'Test Map' }]));
    })
  );
  
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());
  ```

- Tester les intégrations entre :
  - Store Redux et composants
  - Services API et store
  - Electron IPC entre main et renderer

### 7.3 Tests UI

- Utiliser Playwright ou Cypress pour les tests e2e
- Créer des tests pour les flux utilisateur critiques
- Tests qui simulent les interactions réelles utilisateur :
  ```typescript
  test('should create new process and connect it', async ({ page }) => {
    // Navigate to app
    await page.goto('http://localhost:3000');
    
    // Add process from palette
    await page.click('[data-testid="palette-process"]');
    await page.click('[data-testid="editor-canvas"]');
    
    // Verify process exists
    expect(await page.locator('[data-testid="process-item"]')).toHaveCount(1);
    
    // Modify properties
    await page.click('[data-testid="process-item"]');
    await page.fill('[data-testid="property-name"]', 'Test Process');
    await page.fill('[data-testid="property-cycle-time"]', '10');
    
    // Verify property update
    expect(await page.locator('[data-testid="process-item-name"]')).toHaveText('Test Process');
  });
  ```

- Tester le responsive design et comportements de redimensionnement
- Créer des tests de non-régression visuelle avec des snapshots
- Séparer les tests en suites par fonctionnalité

## 8. Contrôle de Version

### 8.1 Structure des Commits

- Utiliser des messages de commit clairs et structurés (format Conventional Commits) :
  ```
  <type>(<scope>): <description>
  
  [corps du message]
  
  [footer]
  ```

- Types principaux :
  - `feat`: Nouvelle fonctionnalité
  - `fix`: Correction de bug
  - `docs`: Documentation uniquement
  - `style`: Modifications de style (formatage, pas de changement de code)
  - `refactor`: Refactoring du code
  - `test`: Tests seulement
  - `chore`: Maintenance, build, dependencies

- Exemples :
  ```
  feat(editor): ajouter drag-and-drop pour les processus
  
  fix(api): corriger timing de rafraîchissement du token

  refactor(calculation): simplifier la logique de calcul du lead time
  ```

- Limiter chaque commit à un changement logique unique
- Inclure un ID de ticket/issue si applicable

### 8.2 Branches et Workflow

- Utiliser le workflow GitFlow ou GitHub Flow :
  - `main`/`master` : code en production, toujours stable
  - `develop` : branche d'intégration (si GitFlow)
  - `feature/xxx` : nouvelles fonctionnalités
  - `fix/xxx` : corrections de bugs
  - `release/x.y.z` : préparation des releases (si GitFlow)

- Règles pour les noms de branches :
  - Préfixe descriptif (`feature/`, `fix/`, etc.)
  - Description courte en kebab-case (`feature/process-editor`)
  - Inclure l'ID de ticket si applicable (`feature/VSMT-123-process-editor`)

- Toujours créer des Pull Requests pour l'intégration
- Squash des commits non significatifs avant merge

### 8.3 Revue de Code

- Utiliser les Pull Requests pour toutes les modifications
- Définir une checklist de revue standard :
  - Respect des guidelines de codage
  - Tests appropriés
  - Documentation à jour
  - Absence de régressions
  - Performance acceptable

- Focus sur :
  - Design de l'API
  - Lisibilité et maintenabilité
  - Robustesse (gestion d'erreurs, cas limites)
  - Performances critiques

- Outils automatisés :
  - Husky pour les hooks pre-commit/pre-push
  - GitHub Actions/Workflows pour CI/CD
  - SonarQube/CodeClimate pour analyse statique
  
- Modèle à utiliser :
  ```
  # Revue de code
  
  ## ✅ Checklist
  - [ ] Les tests automatisés passent
  - [ ] La couverture de code reste >= XX%
  - [ ] La documentation est à jour
  - [ ] Le code respecte les guidelines
  
  ## 📝 Commentaires
  ...
  ```

## 9. Patterns et Meilleures Pratiques

### 9.1 Patterns React/Electron Recommandés

- **Composants :**
  - Préférer les composants fonctionnels et les hooks
  - Composants de présentation vs conteneurs
  - Composition plutôt qu'héritage

- **Gestion d'état :**
  - État local avec `useState` pour état simple par composant
  - Context API pour état partagé limité à des sous-arbres
  - Redux/MobX pour état global complexe, avec sélecteurs

- **Modèles de composition :**
  - Higher-Order Components (quand nécessaire)
  - Render Props (pour logique réutilisable)
  - Hooks personnalisés (approche préférée)

- **Electron :**
  - Communication IPC via canaux nommés
  - Eviter le partage de références directes entre main et renderer
  - Utiliser preload scripts de manière sécurisée :
    ```typescript
    // preload.ts
    contextBridge.exposeInMainWorld('electron', {
      sendMessage: (channel, data) => {
        ipcRenderer.send(channel, data);
      },
      on: (channel, func) => {
        const validChannels = ['response-channel'];
        if (validChannels.includes(channel)) {
          ipcRenderer.on(channel, (event, ...args) => func(...args));
        }
      }
    });
    ```

- **Structure des services :**
  ```typescript
  // ApiService.ts
  class ApiService {
    private baseUrl: string;
    private httpClient: AxiosInstance;
    
    constructor(baseUrl: string) {
      this.baseUrl = baseUrl;
      this.httpClient = axios.create({
        baseURL: this.baseUrl,
        timeout: 10000,
      });
      
      // Setup interceptors
      this.setupInterceptors();
    }
    
    private setupInterceptors() {
      // Configure request/response interceptors
    }
    
    async getMaps(): Promise<Map[]> {
      try {
        const response = await this.httpClient.get('/maps');
        return response.data;
      } catch (error) {
        throw new ApiError('Failed to fetch maps', error);
      }
    }
  }
  ```

### 9.2 Antipatterns à Éviter

- **React :**
  - Mutations directes du state
  - Dépendances manquantes dans useEffect
  - Fonctions de rendu imbriquées (recréation à chaque render)
  - Trop de props drilling (utiliser Context ou Redux)
  - Logique métier dans les composants UI

- **TypeScript :**
  - Usage excessif de `any`
  - Conversions de type non-sécurisées (`as` sans vérification)
  - Types trop complexes et non-lisibles
  - Manque de réutilisation des types

- **Electron :**
  - Accès non-sécurisé au Node depuis le renderer
  - Utilisation non-sélective de nodeIntegration: true
  - Communication synchrone IPC
  - Bloquage du thread principal

- **Performance :**
  - Rendus inutiles (memoization manquante)
  - Calculs lourds dans le thread UI
  - Lectures/écritures excessives dans le Store

### 9.3 Performance et Optimisation

- **React :**
  - Utiliser React.memo pour les composants coûteux à rendre
  - Utiliser useCallback/useMemo pour les calculs et références stables
  - Éviter les rendus inutiles avec des hooks personnalisés
  - Implémentation de virtualized lists pour les longues listes

- **Electron :**
  - Démarrage en deux temps (splash screen + chargement asynchrone)
  - Limiter l'utilisation mémoire avec la gestion du cycle de vie des fenêtres
  - Utiliser les Web Workers pour les calculs lourds dans le renderer
  - Comprendre et utiliser l'IPC de manière optimale

- **Patterns :**
  - Debounce/throttle pour événements fréquents
  - Lazy loading pour composants lourds
  - Pagination/infinite scroll pour données volumineuses
  - Memoization des résultats de calculs (ex. ReSelect pour Redux)

- **Build :**
  - Tree-shaking correct avec ES Modules
  - Bundle splitting pour chargement à la demande
  - Minification et compression optimisées
  - Stratégies de caching appropriées

## 10. Évolutivité et Maintenabilité

### 10.1 Conception Modulaire

- Structure de projet orientée feature (feature folders)
- Composants hautement cohésifs et faiblement couplés
- Extraction des logiques réutilisables dans des hooks/services
- APIs internes bien définies entre modules
- Abstractions claires qui masquent les détails d'implémentation

Exemple d'architecture de dossier orientée feature :
```
src/
└── features/
    ├── auth/
    │   ├── components/
    │   ├── hooks/
    │   ├── services/
    │   ├── store/ 
    │   └── index.ts
    ├── vsm-editor/
    │   ├── components/
    │   ├── hooks/
    │   ├── services/ 
    │   ├── store/
    │   └── index.ts
    └── calculations/
        ├── hooks/
        ├── services/ 
        ├── utils/
        └── index.ts
```

### 10.2 Gestion des Dépendances

- Équilibre entre dépendances externes et implémentations internes
- Exigences pour les dépendances externes :
  - Activement maintenues
  - Bien typées pour TypeScript
  - Licences compatibles
  - Taille raisonnable
  - Tests suffisants

- Utiliser les outils d'analyse de vulnérabilités et de dépendances :
  - npm audit / yarn audit
  - Dependabot
  - Bundle analyzer

- Stratégies de verrouillage des versions (package-lock.json, yarn.lock)
- Isolation des dépendances via design patterns d'adaptation :
  ```typescript
  // Au lieu d'utiliser directement lodash partout
  // Créer un service adapté au projet
  export const ArrayUtils = {
    groupBy: <T>(array: T[], key: keyof T): Record<string, T[]> => {
      return _.groupBy(array, key);
    },
    // Autres méthodes adaptées
  };
  ```

### 10.3 Versionnement et Compatibilité

- Adopter Semantic Versioning (SemVer) pour le versionnement
  - MAJOR : changements incompatibles
  - MINOR : fonctionnalités compatibles
  - PATCH : corrections de bugs compatibles

- Documentation claire des changements d'API entre versions
- Stratégie de dépréciation pour les APIs obsolètes :
  ```typescript
  /**
   * @deprecated Utiliser `newFunction()` à la place.
   * Sera supprimé dans la version 3.0.0.
   */
  export function oldFunction() {
    console.warn('oldFunction est dépréciée. Utiliser newFunction() à la place.');
    return newFunction();
  }
  ```

- Tester la compatibilité cross-platform systématiquement
- Définir une politique de support des versions Node.js et Electron
- Planifier les migrations majeures à l'avance avec documentation

---

Ces guidelines sont un document vivant qui évoluera avec le projet. Elles doivent être suivies par tous les contributeurs pour maintenir une base de code cohérente et de haute qualité. Des exceptions peuvent être faites dans des cas spécifiques, mais doivent toujours être documentées et justifiées.