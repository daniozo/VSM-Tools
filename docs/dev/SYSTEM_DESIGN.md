# Système de Design VSM-Tools

Ce document détaille les principes de design, les composants et les styles utilisés dans l'application VSM-Tools.

## Palette de Couleurs

VSM-Tools utilise une palette monochrome professionnelle basée sur le noir, le blanc et différentes nuances de gris.

### Couleurs Primaires

- **Blanc (#FFFFFF)** - Fond principal de l'application
- **Noir (#000000)** - Texte principal et contours
- **Nuances de gris** - 10 niveaux de gris (100 à 900) pour diverses utilisations d'interface

### Couleurs Fonctionnelles

- **Fond principal** - Blanc pour le mode clair
- **Fond secondaire** - Gris très clair (Gray-100) pour les panneaux et barres d'outils
- **Texte principal** - Gris très foncé (Gray-900) pour une lisibilité optimale
- **Texte secondaire** - Gris moyen (Gray-600) pour les informations moins importantes
- **Bordures** - Gris clair (Gray-300) pour délimiter les sections
- **Accent** - Gris foncé (Gray-800) pour les éléments interactifs principaux

## Typographie

- **Police principale** - Système par défaut pour une performance optimale et une cohérence avec l'environnement
- **Tailles de texte** - Hiérarchie claire avec des tailles spécifiques pour chaque type d'élément

## Iconographie

VSM-Tools utilise la bibliothèque [Lucide](https://lucide.dev/) pour toutes ses icônes. Cette bibliothèque offre un style cohérent, minimal et professionnel qui s'intègre parfaitement à notre palette monochrome.

### Utilisation des icônes

Les icônes sont intégrées via le composant `Icon` qui encapsule les icônes Lucide avec des paramètres standardisés :

```tsx
<Icon name="Save" size="medium" />
```

### Tailles d'icônes standardisées

- **Petite (small)** - 16px - Pour les éléments d'interface compacts
- **Moyenne (medium)** - 20px - Taille par défaut, pour la plupart des boutons et contrôles
- **Grande (large)** - 24px - Pour les icônes qui nécessitent plus de visibilité

## Composants

### Boutons avec Icônes

Le composant `IconButton` permet d'afficher des boutons avec des icônes Lucide. Il gère automatiquement les états (survol, actif, désactivé) et les variantes.

Exemple d'utilisation :
```tsx
<IconButton 
  icon="Save" 
  title="Enregistrer" 
  variant="primary" 
  onClick={handleSave} 
/>
```

### Variantes disponibles :

- **default** - Bouton standard avec fond transparent et effet de survol gris clair
- **primary** - Bouton accentué avec fond gris foncé et texte blanc
- **subtle** - Bouton discret, idéal pour les barres d'outils et les actions secondaires

### Barre d'Outils (Toolbar)

La barre d'outils principale utilise des `IconButton` organisés en groupes logiques séparés par des diviseurs verticaux.

### Palette d'Outils (ToolPalette)

Ce composant affiche les outils disponibles pour créer un diagramme VSM, organisés en catégories pliables.

### Barre de Statut (StatusBar)

La barre de statut affiche des informations contextuelles sur l'état actuel de l'éditeur (position du curseur, zoom, nombre d'éléments).

## Mode Sombre

VSM-Tools prend en charge un mode sombre complet, activable en ajoutant la classe `dark-theme` à l'élément `<html>`. Toutes les couleurs s'adaptent automatiquement.

## Bonnes Pratiques

1. **Cohérence** - Utiliser toujours les composants prédéfinis plutôt que de créer des styles personnalisés
2. **Accessibilité** - Maintenir un contraste suffisant entre le texte et l'arrière-plan
3. **Minimalisme** - Privilégier une interface épurée en limitant les éléments visuels non essentiels
4. **Feedback visuel** - Fournir un retour visuel clair pour toutes les interactions utilisateur