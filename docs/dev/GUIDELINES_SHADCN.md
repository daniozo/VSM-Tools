# Mise à jour des Guidelines - shadcn/ui

## Introduction

Ce document met à jour les guidelines de développement VSM-Tools suite à la migration vers shadcn/ui. Il complète le document principal `CODING_GUIDELINES.md` avec les spécificités du nouveau système de design.

## Système de Design avec shadcn/ui

### Nouvelles variables CSS

Le projet utilise maintenant les variables CSS de shadcn/ui au lieu du système de couleurs personnalisé :

```css
/* Ancien système (remplacé) */
colors: {
  'gray': { 100: '#f5f5f5', ... },
  background: { DEFAULT: '#ffffff', secondary: '#f5f5f5' },
  text: { primary: '#111111', secondary: '#666666' },
}

/* Nouveau système shadcn/ui */
colors: {
  background: 'hsl(var(--background))',
  foreground: 'hsl(var(--foreground))',
  primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
  secondary: { DEFAULT: 'hsl(var(--secondary))', foreground: 'hsl(var(--secondary-foreground))' },
  muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
  border: 'hsl(var(--border))',
}
```

### Migration des classes CSS

| Ancien | Nouveau |
|--------|---------|
| `bg-background-secondary` | `bg-secondary` |
| `text-text-primary` | `text-foreground` |
| `text-text-secondary` | `text-muted-foreground` |
| `border-border-subtle` | `border-border` |
| `bg-gray-100` | `bg-muted` |

### Nouveaux composants standards

#### Button (shadcn/ui)
```tsx
import { Button } from '@/components/ui/button';

// Variants disponibles
<Button variant="default">Action principale</Button>
<Button variant="outline">Action secondaire</Button>
<Button variant="ghost">Action subtile</Button>
<Button variant="destructive">Action destructive</Button>
<Button variant="secondary">Action alternative</Button>
<Button variant="link">Lien</Button>

// Sizes disponibles
<Button size="sm">Petit</Button>
<Button size="default">Normal</Button>
<Button size="lg">Grand</Button>
<Button size="icon">Icône seule</Button>
```

#### IconButton (migré vers shadcn/ui)
```tsx
import { IconButton } from '@/shared/components/ui/IconButton';

// Nouveau mapping des variants
// Ancien "subtle" → Nouveau "ghost"
// Ancien "primary" → Nouveau "default"
<IconButton icon="Save" variant="ghost" size="sm" />
<IconButton icon="Delete" variant="destructive" size="sm" />
```

#### Card
```tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Titre</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Contenu</p>
  </CardContent>
</Card>
```

#### Input
```tsx
import { Input } from '@/components/ui/input';

<Input placeholder="Entrez votre texte" />
<Input type="email" placeholder="Email" />
<Input type="number" placeholder="Nombre" />
```

## Nouvelles conventions TypeScript

### Extension des props shadcn/ui

```tsx
// ✅ Étendre les composants shadcn/ui
interface CustomButtonProps extends React.ComponentProps<typeof Button> {
  icon?: IconName;
  loading?: boolean;
}

// ✅ Utiliser VariantProps pour les variants
import { VariantProps } from 'class-variance-authority';
import { buttonVariants } from '@/components/ui/button';

interface IconButtonProps extends VariantProps<typeof buttonVariants> {
  icon: IconName;
  iconSize?: IconSize;
}
```

### Imports avec alias

```tsx
// ✅ Utiliser les nouveaux alias
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/shared/components/ui/IconButton';

// ❌ Éviter les chemins relatifs longs
import { cn } from '../../../lib/utils';
```

## Utilisation de la fonction cn()

La fonction `cn()` combine `clsx` et `tailwind-merge` pour une gestion optimale des classes CSS :

```tsx
import { cn } from '@/lib/utils';

// ✅ Bon usage
<div className={cn(
  "flex items-center gap-2",
  isActive && "bg-primary text-primary-foreground",
  size === "large" && "text-lg",
  className
)}>

// ❌ Éviter la concaténation manuelle
<div className={`flex items-center gap-2 ${isActive ? 'bg-primary text-primary-foreground' : ''} ${className}`}>
```

## Mode sombre (préparation)

Le système shadcn/ui est prêt pour le mode sombre :

```tsx
// Classes automatiquement adaptées au mode sombre
<div className="bg-background text-foreground border-border">
  <p className="text-muted-foreground">Texte secondaire</p>
</div>

// Variables CSS définies pour light et dark
:root {
  --background: oklch(1 0 0); /* Blanc en mode clair */
}

.dark {
  --background: oklch(0.129 0.042 264.695); /* Sombre en mode sombre */
}
```

## Nouveaux patterns de développement

### Composition de composants

```tsx
// ✅ Composer avec les composants shadcn/ui
export const SettingsCard = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center justify-between">
        Configuration
        <IconButton icon="Settings" variant="ghost" size="sm" />
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Nom du projet</label>
        <Input placeholder="Entrez le nom" />
      </div>
      <div className="flex gap-2">
        <Button>Sauvegarder</Button>
        <Button variant="outline">Annuler</Button>
      </div>
    </CardContent>
  </Card>
);
```

### Gestion des variants conditionnels

```tsx
// ✅ Variants conditionnels avec cn()
<Button 
  variant={isDestructive ? "destructive" : "default"}
  className={cn(
    "transition-all",
    isPending && "opacity-50 pointer-events-none"
  )}
>
  {isPending ? "Traitement..." : "Confirmer"}
</Button>
```

## Ajout de nouveaux composants

### Procédure recommandée

1. **Vérifier la disponibilité** dans shadcn/ui :
```bash
npx shadcn@latest add --help
```

2. **Installer le composant** :
```bash
npx shadcn@latest add dialog
npx shadcn@latest add select
npx shadcn@latest add tabs
```

3. **Créer un wrapper** si nécessaire :
```tsx
// src/shared/components/ui/VsmDialog.tsx
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface VsmDialogProps {
  title: string;
  description?: string;
  trigger: React.ReactNode;
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const VsmDialog: React.FC<VsmDialogProps> = ({
  title,
  description,
  trigger,
  children,
  open,
  onOpenChange
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogTrigger asChild>
      {trigger}
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        {description && <DialogDescription>{description}</DialogDescription>}
      </DialogHeader>
      {children}
    </DialogContent>
  </Dialog>
);
```

4. **Documenter** dans `MIGRATION_SHADCN.md`

## Testing avec shadcn/ui

### Tests de composants migrés

```tsx
import { render, screen } from '@testing-library/react';
import { IconButton } from '../IconButton';

describe('IconButton (shadcn/ui)', () => {
  test('applies correct variant classes', () => {
    const { rerender } = render(
      <IconButton icon="Save" variant="default" data-testid="button" />
    );
    
    expect(screen.getByTestId('button')).toHaveClass('bg-primary');
    
    rerender(<IconButton icon="Save" variant="ghost" data-testid="button" />);
    expect(screen.getByTestId('button')).toHaveClass('hover:bg-accent');
  });

  test('handles size prop correctly', () => {
    render(<IconButton icon="Save" size="sm" data-testid="button" />);
    expect(screen.getByTestId('button')).toHaveClass('h-8');
  });
});
```

### Mock des composants shadcn/ui

```tsx
// __mocks__/@/components/ui/button.tsx
export const Button = ({ children, ...props }: any) => (
  <button {...props}>{children}</button>
);

export const buttonVariants = jest.fn();
```

## Performance et optimisation

### Tree-shaking optimal

```tsx
// ✅ Imports spécifiques pour un meilleur tree-shaking
import { Button } from '@/components/ui/button';
import { DialogContent, DialogHeader } from '@/components/ui/dialog';

// ❌ Éviter les imports globaux
import * as Components from '@/components/ui';
```

### Lazy loading des composants lourds

```tsx
// ✅ Lazy loading pour les dialogs complexes
const SettingsDialog = lazy(() => import('./SettingsDialog'));

// Usage avec Suspense
<Suspense fallback={<div>Chargement...</div>}>
  <SettingsDialog />
</Suspense>
```

## Checklist de migration d'un composant

- [ ] Remplacer les anciens variants par les nouveaux (subtle → ghost, primary → default)
- [ ] Remplacer les anciennes tailles (small → sm, large → lg)
- [ ] Mettre à jour les classes CSS (bg-background-secondary → bg-secondary)
- [ ] Utiliser `cn()` au lieu de concaténation manuelle
- [ ] Tester le rendu et l'accessibilité
- [ ] Mettre à jour les tests
- [ ] Documenter les changements

Cette mise à jour permet de tirer pleinement parti des avantages de shadcn/ui tout en conservant la cohérence du système de design VSM-Tools.
