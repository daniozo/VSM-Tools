# Guidelines de Développement VSM-Tools

## Table des matières

<!-- TOC -->
* [Guidelines de Développement VSM-Tools](#guidelines-de-développement-vsm-tools)
  * [Table des matières](#table-des-matières)
  * [1. Introduction](#1-introduction)
  * [2. Structure du Code](#2-structure-du-code)
    * [2.1 Organisation des Répertoires](#21-organisation-des-répertoires)
    * [2.2 Architecture des Modules](#22-architecture-des-modules)
    * [2.3 Séparation des Responsabilités](#23-séparation-des-responsabilités)
  * [3. Conventions de Nommage](#3-conventions-de-nommage)
    * [3.1 Nommage Général](#31-nommage-général)
    * [3.2 Conventions Qt Spécifiques](#32-conventions-qt-spécifiques)
    * [3.3 Fichiers](#33-fichiers)
  * [4. Style de Codage](#4-style-de-codage)
    * [4.1 Formatage](#41-formatage)
    * [4.2 Taille et Complexité](#42-taille-et-complexité)
    * [4.3 Conventions d'Accolades](#43-conventions-daccolades)
  * [5. Documentation du Code](#5-documentation-du-code)
    * [5.1 Commentaires](#51-commentaires)
    * [5.2 Documentation API](#52-documentation-api)
    * [5.3 Exemples et Cas d'Utilisation](#53-exemples-et-cas-dutilisation)
  * [6. Gestion des Erreurs](#6-gestion-des-erreurs)
    * [6.1 Exceptions vs Codes d'Erreur](#61-exceptions-vs-codes-derreur)
    * [6.2 Validation des Entrées](#62-validation-des-entrées)
    * [6.3 Journalisation](#63-journalisation)
  * [7. Tests](#7-tests)
    * [7.1 Tests Unitaires](#71-tests-unitaires)
    * [7.2 Tests d'Intégration](#72-tests-dintégration)
    * [7.3 Tests UI](#73-tests-ui)
  * [8. Contrôle de Version](#8-contrôle-de-version)
    * [8.1 Structure des Commits](#81-structure-des-commits)
    * [8.2 Branches et Workflow](#82-branches-et-workflow)
    * [8.3 Revue de Code](#83-revue-de-code)
  * [9. Patterns et Meilleures Pratiques](#9-patterns-et-meilleures-pratiques)
    * [9.1 Patterns Qt Recommandés](#91-patterns-qt-recommandés)
    * [9.2 Antipatterns à Éviter](#92-antipatterns-à-éviter)
    * [9.3 Performance et Optimisation](#93-performance-et-optimisation)
  * [10. Évolutivité et Maintenabilité](#10-évolutivité-et-maintenabilité)
    * [10.1 Conception Modulaire](#101-conception-modulaire)
    * [10.2 Gestion des Dépendances](#102-gestion-des-dépendances)
    * [10.3 Versionnement et Compatibilité](#103-versionnement-et-compatibilité)
<!-- TOC -->

## 1. Introduction

Ce document définit les guidelines de développement pour le projet VSM-Tools. Il vise à standardiser les pratiques de codage afin d'assurer la maintenabilité, la lisibilité et l'évolutivité du code. Suivre ces guidelines est essentiel pour faciliter la collaboration entre développeurs et garantir la qualité du logiciel dans le temps.

## 2. Structure du Code

### 2.1 Organisation des Répertoires

L'organisation des répertoires doit suivre une structure logique et intuitive :

```
VSM-Tools/
├── src/                    # Code source principal
│   ├── core/               # Fonctionnalités de base et modèles
│   ├── ui/                 # Interface utilisateur
│   ├── network/            # Communication réseau
│   ├── calculation/        # Logique de calcul spécifique VSM
│   └── utils/              # Utilitaires généraux
├── include/                # Headers publics (API exportée)
├── tests/                  # Tests automatisés
│   ├── unit/               # Tests unitaires
│   ├── integration/        # Tests d'intégration
│   └── ui/                 # Tests d'interface
├── docs/                   # Documentation
├── resources/              # Ressources (images, icônes, etc.)
└── third_party/            # Bibliothèques tierces (si nécessaires)
```

### 2.2 Architecture des Modules

- Chaque module doit avoir une responsabilité unique et clairement définie
- Les dépendances entre modules doivent être explicites et documentées
- Préférer l'injection de dépendances plutôt que des dépendances codées en dur
- Utiliser des interfaces abstraites pour découpler les implémentations

### 2.3 Séparation des Responsabilités

Respecter le principe MVC (Modèle-Vue-Contrôleur) ou MVVM (Modèle-Vue-VueModèle) :

- **Modèle** : Classes représentant les données et la logique métier (ex: `VsmMap`, `ProcessData`)
- **Vue** : Composants d'interface utilisateur (ex: `VsmGraphicsView`)
- **Contrôleur/VueModèle** : Liaison entre modèle et vue (ex: adaptateurs, gestionnaires)

## 3. Conventions de Nommage

### 3.1 Nommage Général

- Utiliser des noms descriptifs qui révèlent l'intention
- Classes, méthodes, fonctions : CamelCase (`ProcessItem`, `calculateTotalTime()`)
- Variables : camelCase avec première lettre minuscule (`cycleTime`, `leadTimeValue`)
- Constantes : SNAKE_CASE_MAJUSCULE (`MAX_PROCESS_COUNT`, `DEFAULT_TAKT_TIME`)
- Éviter les abréviations non standard (`calculateTotalTime` et non `calcTotTime`)
- Préfixer les membres privés de classe avec `m_` (`m_processData`, `m_networkManager`)

### 3.2 Conventions Qt Spécifiques

- Signaux : verbes à l'infinitif (`void dataChanged()`, `void processAdded(ProcessItem* item)`)
- Slots : verbes d'action (`void handleDataChange()`, `void updateTimeline()`)
- Widgets personnalisés : suffixe "Widget" (`TimelineWidget`, `PropertyEditorWidget`)
- Classes de modèle : suffixe "Model" (`VsmDataModel`, `ActionPlanModel`)

### 3.3 Fichiers

- Un fichier par classe (sauf exceptions justifiées comme les petites classes auxiliaires)
- Noms de fichiers identiques au nom de la classe qu'ils contiennent
- Extensions : `.h` pour les headers, `.cpp` pour l'implémentation
- Fichiers de ressources : `.qrc` pour les ressources Qt

## 4. Style de Codage

### 4.1 Formatage

- Indentation : 4 espaces (pas de tabulations)
- Limite de largeur de ligne : 100 caractères maximum
- Espacement cohérent autour des opérateurs (`a + b`, pas `a+b`)
- Une ligne vide entre les définitions de méthodes et blocs logiques importants
- Utiliser un outil de formatage automatique (clang-format avec config Qt)

### 4.2 Taille et Complexité

- Limiter les méthodes à 50 lignes maximum (idéalement 20-30)
- Limiter les fichiers à 500 lignes maximum
- Complexité cyclomatique maximale de 10 par méthode
- Extraire les blocs complexes dans des méthodes auxiliaires nommées de façon descriptive

### 4.3 Conventions d'Accolades

Utiliser le style Allman (accolades sur leur propre ligne) pour les fonctions et classes :

```cpp
void MyClass::myMethod()
{
    if (condition) 
    {
        // Code
    } 
    else 
    {
        // Code
    }
}
```

## 5. Documentation du Code

### 5.1 Commentaires

- Commenter le "pourquoi", pas le "quoi" (le code montre déjà le "quoi")
- Commentaires de fonction/méthode : expliquer le but, les paramètres, les valeurs de retour et les effets secondaires
- Maintenir les commentaires à jour avec le code (un commentaire obsolète est pire qu'aucun commentaire)
- Utiliser `//` pour les commentaires de ligne et `/* */` pour les commentaires de bloc documentaire
- Documenter les limitations connues, les cas particuliers et les comportements non évidents

### 5.2 Documentation API

Utiliser Doxygen pour documenter l'API :

```cpp
/**
 * @brief Calcule le lead time total pour la VSM
 *
 * @param includeNVA Si true, inclut les temps à non-valeur ajoutée
 * @return Le lead time total en secondes
 * @throws LeadTimeCalculationException si des données manquent
 *
 * Cette méthode parcourt tous les processus et stocks pour calculer
 * le lead time cumulé selon la méthode standard VSM.
 */
double calculateTotalLeadTime(bool includeNVA = true);
```

### 5.3 Exemples et Cas d'Utilisation

- Fournir des exemples d'utilisation pour les API publiques complexes
- Documenter les cas d'utilisation typiques dans le code de test
- Inclure des diagrammes explicatifs pour les interactions complexes (UML, séquence)

## 6. Gestion des Erreurs

### 6.1 Exceptions vs Codes d'Erreur

- Utiliser les exceptions pour les erreurs exceptionnelles et irrécupérables
- Créer une hiérarchie d'exceptions spécifique au projet (`VsmException` comme classe de base)
- Utiliser les valeurs optionnelles (`std::optional`, `QOptional`) ou des codes d'erreur pour les cas d'échec attendus
- Documenter clairement les exceptions potentiellement lancées par chaque méthode

### 6.2 Validation des Entrées

- Valider toutes les entrées externes (UI, réseau, fichiers) au point d'entrée
- Utiliser des assertions (`Q_ASSERT`) pour les invariants internes
- Appliquer le principe de fail-fast (échouer rapidement et visiblement)
- Fournir des messages d'erreur clairs et exploitables

### 6.3 Journalisation

- Utiliser `QLoggingCategory` pour catégoriser les messages de log
- Définir des niveaux de journalisation appropriés (debug, info, warning, critical)
- Inclure des informations contextuelles utiles dans les messages de log
- Éviter la journalisation excessive qui pourrait affecter les performances

```cpp
// Définition des catégories
Q_LOGGING_CATEGORY(networkLog, "vsm.network")
Q_LOGGING_CATEGORY(uiLog, "vsm.ui")

// Utilisation
qCDebug(networkLog) << "Connexion établie avec le serveur" << serverUrl;
qCWarning(uiLog) << "Widget non initialisé correctement:" << widgetName;
```

## 7. Tests

### 7.1 Tests Unitaires

- Utiliser Qt Test ou Google Test pour les tests unitaires
- Viser une couverture de code d'au moins 80% pour le code de base
- Suivre le pattern AAA (Arrange-Act-Assert)
- Tester les cas nominaux et les cas d'erreur
- Maintenir les tests en parallèle avec le développement (TDD recommandé)

```cpp
void TestVsmCalculation::testLeadTimeCalculation()
{
    // Arrange
    VsmMap map;
    map.addProcess(createTestProcess(10));  // 10s de cycle time
    map.addStock(createTestStock(100));     // 100 pièces en stock
    
    // Act
    double leadTime = map.calculateTotalLeadTime();
    
    // Assert
    QCOMPARE(leadTime, 110.0);
}
```

### 7.2 Tests d'Intégration

- Créer des tests d'intégration pour valider l'interaction entre composants
- Simuler les API externes (mocks) pour les tests d'intégration
- Exécuter les tests d'intégration dans le pipeline CI/CD

### 7.3 Tests UI

- Utiliser Qt Test pour l'automatisation des tests UI
- Tester les workflows utilisateur critiques
- Vérifier le comportement réactif de l'interface (redimensionnement, changements d'état)
- Implémenter des tests de non-régression pour les bugs UI corrigés

## 8. Contrôle de Version

### 8.1 Structure des Commits

- Un commit = une modification logique unique
- Messages de commit clairs avec un format standardisé :
  ```
  [Type]: Résumé concis de la modification (max 50 chars)
  
  Description détaillée expliquant pourquoi (pas comment) 
  cette modification a été faite. Justifier les choix 
  techniques si nécessaire. Wrap à 72 caractères.
  
  Références: #123, #456
  ```
  où Type est l'un des suivants : Feature, Fix, Refactor, Docs, Test, Chore

### 8.2 Branches et Workflow

- Maintenir une branche `main` toujours stable
- Créer des branches de fonctionnalités à partir de `main` (`feature/nom-fonctionnalite`)
- Utiliser des branches de correctif pour les bugs (`fix/description-bug`)
- Merger via Pull/Merge Requests après revue de code
- Considérer le workflow GitFlow pour les projets plus complexes

### 8.3 Revue de Code

- Toutes les modifications doivent être revues avant d'être mergées
- Utiliser une checklist de revue standardisée
- Se concentrer sur la conception, la lisibilité, la maintenabilité et non uniquement sur le style
- Automatiser les vérifications de style et de qualité (linters, analyseurs statiques)

## 9. Patterns et Meilleures Pratiques

### 9.1 Patterns Qt Recommandés

- Utiliser le système de signaux et slots pour la communication entre objets
- Appliquer le pattern Model/View pour les données et leur présentation
- Utiliser `QPointer` pour les pointeurs faibles vers des objets QObject
- Implémenter `QObject::tr()` pour toutes les chaînes visibles par l'utilisateur (internationalisation)

```cpp
// Bon exemple
connect(processItem, &ProcessItem::dataChanged,
        this, &VsmGraphicsScene::updateCalculations);

// À éviter
connect(processItem, SIGNAL(dataChanged()),
        this, SLOT(updateCalculations()));  // Pas de vérification à la compilation
```

### 9.2 Antipatterns à Éviter

- Éviter les singletons globaux (préférer l'injection de dépendances)
- Ne pas utiliser de macros complexes (préférer les templates et fonctions inline)
- Éviter les threads bloquants dans l'UI (utiliser des opérations asynchrones)
- Limiter l'usage de `QObject::connect` avec la syntaxe SIGNAL/SLOT (utiliser la syntaxe basée sur les pointeurs de fonction)

### 9.3 Performance et Optimisation

- Optimiser uniquement après avoir identifié les goulots d'étranglement (profiling)
- Minimiser les allocations mémoire dans les boucles critiques
- Utiliser des structures de données appropriées pour les opérations fréquentes
- Préférer les références à const (`const Type&`) pour les paramètres complexes

```cpp
// Bon (passage par référence constante)
void processVsmData(const VsmMap& map);

// À éviter (copie inutile)
void processVsmData(VsmMap map);
```

## 10. Évolutivité et Maintenabilité

### 10.1 Conception Modulaire

- Favoriser la composition plutôt que l'héritage quand possible
- Définir des interfaces claires entre les modules
- Éviter les dépendances circulaires entre modules
- Limiter l'exposition des détails d'implémentation (principe d'encapsulation)

### 10.2 Gestion des Dépendances

- Minimiser les dépendances externes
- Documenter toutes les dépendances tierces (version, licence, but)
- Utiliser des wrappers/adaptateurs pour isoler le code des bibliothèques externes
- Considérer l'utilisation de gestionnaires de paquets (Conan, vcpkg) pour les dépendances C++

### 10.3 Versionnement et Compatibilité

- Suivre le versionnement sémantique (SemVer) pour les releases
- Documenter les changements d'API entre les versions
- Maintenir la compatibilité descendante quand possible
- Déprécier les fonctionnalités obsolètes avant de les supprimer
- Utiliser `[[deprecated]]` pour marquer les API déconseillées

```cpp
[[deprecated("Utiliser newCalculationMethod() à la place")]]
double oldCalculationMethod();
```

---

Ces guidelines sont un document vivant qui évoluera avec le projet. Elles doivent être suivies par tous les contributeurs pour maintenir une base de code cohérente et de haute qualité. Des exceptions peuvent être faites dans des cas spécifiques, mais doivent toujours être documentées et justifiées.
