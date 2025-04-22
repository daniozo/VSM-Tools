import React from 'react';
import * as LucideIcons from 'lucide-react';

export type IconName = keyof typeof LucideIcons;
export type IconSize = 'small' | 'medium' | 'large';

// Définir un type pour les composants d'icônes Lucide
type LucideIconComponent = React.ComponentType<{
  size?: number | string;
  color?: string;
  strokeWidth?: number;
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}>;

interface IconProps {
  name: IconName;
  size?: IconSize;
  color?: string;
  className?: string;
  onClick?: () => void;
}

/**
 * Composant Icon qui utilise les icônes de Lucide
 * @param name - Nom de l'icône Lucide (ex: 'Save', 'FilePlus')
 * @param size - Taille de l'icône: 'small' (16px), 'medium' (20px) par défaut, ou 'large' (24px)
 * @param color - Couleur CSS (utilise les variables CSS du thème par défaut)
 * @param className - Classes CSS supplémentaires
 * @param onClick - Fonction de callback lors du clic
 */
export const Icon: React.FC<IconProps> = ({
  name,
  size = 'medium',
  color = 'currentColor',
  className = '',
  onClick,
}) => {
  // Typer correctement le composant d'icône
  const LucideIcon = LucideIcons[name] as LucideIconComponent;

  if (!LucideIcon) {
    console.error(`L'icône "${name}" n'existe pas dans lucide-react`);
    return null;
  }

  // Détermination de la taille en pixels
  const sizeInPx = {
    small: 16,
    medium: 20,
    large: 24,
  }[size];

  return (
    <LucideIcon
      size={sizeInPx}
      color={color}
      className={`vsm-icon ${className}`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'inherit' }}
    />
  );
};

export default Icon;