import React from 'react';
import Icon, { IconName } from '../icons/Icon';

interface IconButtonProps {
  icon: IconName;
  label?: string;
  onClick?: () => void;
  title?: string;
  variant?: 'default' | 'primary' | 'subtle';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  className?: string;
}

/**
 * Bouton avec icône Lucide
 * Respecte le système de design VSM-Tools avec la palette noir/blanc/gris
 */
export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  label,
  onClick,
  title,
  variant = 'default',
  size = 'medium',
  disabled = false,
  className = '',
}) => {
  const baseClass = 'vsm-icon-button';
  const variantClass = `${baseClass}--${variant}`;
  const sizeClass = `${baseClass}--${size}`;
  const disabledClass = disabled ? `${baseClass}--disabled` : '';

  const buttonClasses = [
    baseClass,
    variantClass,
    sizeClass,
    disabledClass,
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      className={buttonClasses}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      title={title}
      type="button"
    >
      <Icon
        name={icon}
        size={size}
        color="currentColor"
      />
      {label && <span className={`${baseClass}__label`}>{label}</span>}
    </button>
  );
};

export default IconButton;