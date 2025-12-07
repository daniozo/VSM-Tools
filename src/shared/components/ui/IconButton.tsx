import React from 'react';
import { Button } from '@/components/ui/button';
import Icon, { IconName, IconSize } from '../icons/Icon';
import { cn } from '@/lib/utils';

interface IconButtonProps extends
  Omit<React.ComponentProps<typeof Button>, 'size' | 'variant'> {
  icon: IconName;
  label?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  iconSize?: IconSize;
}

/**
 * Bouton avec icône Lucide utilisant shadcn/ui Button
 * Compatible avec le système de design VSM-Tools
 */
export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  label,
  variant = 'ghost',
  size = 'default',
  iconSize = 'medium',
  className,
  ...props
}) => {
  // Si pas de label et size pas défini explicitement, utiliser size icon
  const buttonSize = !label && size === 'default' ? 'icon' : size;

  return (
    <Button
      variant={variant}
      size={buttonSize}
      className={cn(className)}
      {...props}
    >
      <Icon
        name={icon}
        size={iconSize}
        color="currentColor"
      />
      {label && <span className="ml-1.5">{label}</span>}
    </Button>
  );
};

export default IconButton;