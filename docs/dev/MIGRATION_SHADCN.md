# Guide de Migration vers shadcn/ui

## Vue d'ensemble

Ce document décrit la migration complète du projet VSM-Tools vers shadcn/ui, remplaçant les composants UI personnalisés par des composants standardisés et maintenus par la communauté.

## Changements effectués

### 1. Installation et configuration

#### Dépendances ajoutées
```bash
npm install class-variance-authority clsx tailwind-merge
```

#### Configuration TypeScript
- Création de `tsconfig.json` avec support des alias `@/*`
- Création de `tsconfig.node.json` pour Vite
- Configuration des paths pour `@/*` pointant vers `./src/*`

#### Configuration shadcn/ui
- Initialisation avec `npx shadcn@latest init`
- Choix de la palette "Slate" pour correspondre au design VSM-Tools
- Génération du fichier `components.json`
- Création du fichier utilitaire `src/lib/utils.ts`

### 2. Configuration Tailwind CSS

#### Ancien système de couleurs
```javascript
colors: {
  'gray': { 100: '#f5f5f5', ... },
  background: { DEFAULT: '#ffffff', secondary: '#f5f5f5' },
  text: { primary: '#111111', secondary: '#666666' },
  border: { DEFAULT: '#e5e5e5', subtle: '#ebebeb' },
  // ...
}
```

#### Nouveau système basé sur les variables CSS
```javascript
colors: {
  background: 'hsl(var(--background))',
  foreground: 'hsl(var(--foreground))',
  primary: {
    DEFAULT: 'hsl(var(--primary))',
    foreground: 'hsl(var(--primary-foreground))',
  },
  // ... système complet shadcn/ui
}
```

### 3. Composants installés

- **Button** : Composant de base avec variants (default, destructive, outline, secondary, ghost, link)
- **Input** : Champs de saisie standardisés
- **Card** : Composants de carte (Card, CardContent, CardDescription, CardHeader, CardTitle)
- **Select** : Sélecteurs déroulants
- **Dialog** : Boîtes de dialogue modales
- **Sonner** : Système de notifications toast

### 4. Migration des composants existants

#### IconButton

**Avant :**
```tsx
interface IconButtonProps {
  variant?: 'default' | 'primary' | 'subtle';
  size?: 'extrasmall' | 'small' | 'medium' | 'large';
  // ...
}
```

**Après :**
```tsx
interface IconButtonProps extends 
  Omit<React.ComponentProps<typeof Button>, 'size' | 'variant'> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  iconSize?: IconSize;
  // ...
}
```

#### Toolbar

**Changements principaux :**
- Import mis à jour : `import { IconButton } from '@/shared/components/ui/IconButton'`
- Variants : `"subtle"` → `"ghost"`
- Sizes : `"small"` → `"sm"`
- Classes CSS : migration vers les variables CSS shadcn/ui

#### ToolPalette

**Changements principaux :**
- Mise à jour des variants et sizes
- Migration des classes de couleur vers le nouveau système
- `bg-background-secondary` → `bg-secondary`
- `text-text-primary` → `text-foreground`

#### PropertiesPanel

**Avant :**
```tsx
const PropertiesPanel: React.FC = () => {
  // Pas de support pour className
}
```

**Après :**
```tsx
interface PropertiesPanelProps {
  className?: string;
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ className }) => {
  // Utilisation des composants Card et Input de shadcn/ui
}
```

### 5. Correspondance des variants et sizes

#### Variants
| Ancien | Nouveau |
|--------|---------|
| `default` | `ghost` (pour IconButton) |
| `primary` | `default` |
| `subtle` | `ghost` |

#### Sizes
| Ancien | Nouveau |
|--------|---------|
| `small` | `sm` |
| `medium` | `default` |
| `large` | `lg` |
| `extrasmall` | `sm` (consolidé) |

### 6. Variables CSS shadcn/ui

Le système utilise maintenant des variables CSS dans `src/renderer/styles/index.css` :

```css
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.129 0.042 264.695);
  --primary: oklch(0.208 0.042 265.755);
  --secondary: oklch(0.968 0.007 247.896);
  --muted: oklch(0.968 0.007 247.896);
  --border: oklch(0.929 0.013 255.508);
  /* ... */
}

.dark {
  /* Variables pour le mode sombre */
}
```

## Avantages de la migration

### 1. Maintenabilité
- Composants standardisés et largement utilisés
- Mise à jour automatique via `npx shadcn@latest add`
- Documentation complète disponible

### 2. Accessibilité
- Composants conformes aux standards ARIA
- Support clavier natif
- Focus management automatique

### 3. Thématisation
- Support natif du mode sombre
- Variables CSS pour customisation facile
- Cohérence visuelle garantie

### 4. Performance
- Tree-shaking optimisé
- Pas de JavaScript runtime supplémentaire
- CSS minimal généré

### 5. Developer Experience
- TypeScript natives
- IntelliSense complet
- Patterns de composition clairs

## Guide d'utilisation

### Ajouter un nouveau composant shadcn/ui

```bash
npx shadcn@latest add [component-name]
```

### Exemple d'utilisation

```tsx
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IconButton } from '@/shared/components/ui/IconButton';

function MyComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Configuration
          <IconButton icon="Settings" variant="ghost" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Button variant="default">Sauvegarder</Button>
        <Button variant="outline">Annuler</Button>
      </CardContent>
    </Card>
  );
}
```

### Customisation des couleurs

Pour modifier les couleurs, éditez les variables CSS dans `src/renderer/styles/index.css` :

```css
:root {
  --primary: oklch(0.208 0.042 265.755); /* Votre couleur primaire */
}
```

## Prochaines étapes

1. **Migration complète** : Migrer tous les composants restants vers shadcn/ui
2. **Mode sombre** : Implémenter la bascule mode sombre/clair
3. **Composants avancés** : Ajouter des composants comme DataTable, Command, etc.
4. **Tests** : Mettre à jour les tests pour les nouveaux composants
5. **Documentation** : Mettre à jour la documentation du système de design

## Fichiers modifiés

### Nouveaux fichiers
- `tsconfig.json`
- `tsconfig.node.json`
- `components.json`
- `src/lib/utils.ts`
- `src/components/ui/button.tsx`
- `src/components/ui/input.tsx`
- `src/components/ui/card.tsx`
- `src/components/ui/select.tsx`
- `src/components/ui/dialog.tsx`
- `src/components/ui/sonner.tsx`
- `src/shared/components/examples/ShadcnExampleCard.tsx`

### Fichiers modifiés
- `package.json` (nouvelles dépendances)
- `tailwind.config.js` (nouveau système de couleurs)
- `src/renderer/styles/index.css` (variables CSS shadcn/ui)
- `src/shared/components/ui/IconButton.tsx` (migration vers Button)
- `src/renderer/components/editor/Toolbar.tsx` (nouveaux variants/sizes)
- `src/renderer/components/editor/ToolPalette.tsx` (nouveau système de couleurs)
- `src/renderer/components/editor/PropertiesPanel.tsx` (support className + Card/Input)
- `src/renderer/App.tsx` (nouvelles classes CSS)

La migration est maintenant complète et le projet est prêt à bénéficier de tous les avantages de shadcn/ui !
