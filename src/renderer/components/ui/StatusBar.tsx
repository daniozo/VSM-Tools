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
    <div className={`vsm-status-bar ${className}`}>
      <div className="vsm-status-section">
        <div className="vsm-status-item">
          <Icon name="MousePointer" size="small" />
          <span>{`X: ${cursorPosition.x.toFixed(0)}, Y: ${cursorPosition.y.toFixed(0)}`}</span>
        </div>

        <div className="vsm-status-item">
          <Icon name="ZoomIn" size="small" />
          <span>{`${zoom.toFixed(0)}%`}</span>
        </div>
      </div>

      <div className="vsm-status-section">
        <div className="vsm-status-item">
          <Icon name="Layers" size="small" />
          <span>{`${elementCount} élément${elementCount !== 1 ? 's' : ''}`}</span>
        </div>

        {selectionCount > 0 && (
          <div className="vsm-status-item">
            <Icon name="CheckSquare" size="small" />
            <span>{`${selectionCount} sélectionné${selectionCount !== 1 ? 's' : ''}`}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatusBar;