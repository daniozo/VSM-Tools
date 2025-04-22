import React from 'react';
import Icon, { IconName } from '../icons/Icon';

interface IconButtonProps {
  icon: IconName;
  label?: string;
  onClick?: () => void;
  title?: string;
  variant?: 'default' | 'primary' | 'subtle';
  size?: 'extrasmall' | 'small' | 'medium' | 'large';
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
  const sizeClasses = {
    small: 'p-1',
    medium: 'p-1.5',
    large: 'p-2',
  };

  const variantClasses = {
    default: 'hover:bg-gray-100 active:bg-gray-200',
    primary: 'bg-accent text-white hover:bg-accent-hover active:bg-gray-900',
    subtle: 'text-text-secondary hover:text-text-primary hover:bg-gray-100 active:bg-gray-200',
  };

  const buttonClasses = `
    inline-flex items-center justify-center border border-transparent rounded-md 
    transition-colors duration-quick cursor-pointer
    ${sizeClasses[size]} 
    ${variantClasses[variant]} 
    ${disabled ? 'opacity-50 cursor-not-allowed hover:bg-transparent' : ''}
    ${className}
  `;

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
      {label && <span className="ml-1.5 text-sm">{label}</span>}
    </button>
  );
};

export default IconButton;