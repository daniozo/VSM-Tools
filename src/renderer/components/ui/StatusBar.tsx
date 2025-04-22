import React from 'react';
import Icon from '../../../shared/components/icons/Icon';

interface StatusBarProps {
  zoom?: number;
  cursorPosition?: { x: number; y: number };
  elementCount?: number;
  selectionCount?: number;
  className?: string;
}

/**
 * Barre de statut affichant des informations sur l'état actuel de l'éditeur
 * Intègre les icônes Lucide avec notre palette de couleurs noir/blanc/gris
 */
const StatusBar: React.FC<StatusBarProps> = ({
  zoom = 100,
  cursorPosition = { x: 0, y: 0 },
  elementCount = 0,
  selectionCount = 0,
  className = '',
}) => {
  return (
    <div className={`flex items-center justify-between h-6 bg-background-secondary border-t border-border-subtle text-text-secondary text-xs px-3 ${className}`}>
      <div className="flex items-center">
        <div className="flex items-center mr-4">
          <Icon name="MousePointer" size="small" className="mr-1" />
          <span>{`X: ${cursorPosition.x.toFixed(0)}, Y: ${cursorPosition.y.toFixed(0)}`}</span>
        </div>

        <div className="flex items-center mr-4">
          <Icon name="ZoomIn" size="small" className="mr-1" />
          <span>{`${zoom.toFixed(0)}%`}</span>
        </div>
      </div>

      <div className="flex items-center">
        <div className="flex items-center mr-4">
          <Icon name="Layers" size="small" className="mr-1" />
          <span>{`${elementCount} élément${elementCount !== 1 ? 's' : ''}`}</span>
        </div>

        {selectionCount > 0 && (
          <div className="flex items-center">
            <Icon name="CheckSquare" size="small" className="mr-1" />
            <span>{`${selectionCount} sélectionné${selectionCount !== 1 ? 's' : ''}`}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatusBar;