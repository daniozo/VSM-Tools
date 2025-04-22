import React from 'react';
import IconButton from '../../../shared/components/ui/IconButton';
import type { IconName } from '../../../shared/components/icons/Icon';

// Définition des groupes d'outils avec leurs icônes
const toolGroups = [
  // Fichier
  {
    id: 'file',
    tools: [
      { id: 'new', icon: 'FilePlus', title: 'Nouveau' },
      { id: 'open', icon: 'FolderOpen', title: 'Ouvrir' },
      { id: 'save', icon: 'Save', title: 'Enregistrer' },
    ]
  },
  // Édition
  {
    id: 'edit',
    tools: [
      { id: 'undo', icon: 'Undo', title: 'Annuler' },
      { id: 'redo', icon: 'Redo', title: 'Rétablir' },
    ]
  },
  // Zoom
  {
    id: 'zoom',
    tools: [
      { id: 'zoomIn', icon: 'ZoomIn', title: 'Zoom avant' },
      { id: 'zoomOut', icon: 'ZoomOut', title: 'Zoom arrière' },
      { id: 'fitView', icon: 'Maximize', title: 'Ajuster à la vue' },
    ]
  },
  // Affichage
  {
    id: 'view',
    tools: [
      { id: 'panelLeft', icon: 'PanelLeft', title: 'Afficher/masquer panneau gauche' },
      { id: 'panelRight', icon: 'PanelRight', title: 'Afficher/masquer panneau droit' },
    ]
  },
];

interface ToolbarProps {
  onToolClick: (toolId: string) => void;
  className?: string;
}

/**
 * Barre d'outils principale de l'application VSM-Tools
 * Utilise les icônes Lucide avec notre palette de noir, blanc et gris
 */
const Toolbar: React.FC<ToolbarProps> = ({
  onToolClick,
  className = '',
}) => {
  return (
    <div className={`vsm-toolbar ${className}`}>
      {toolGroups.map((group, groupIndex) => (
        <React.Fragment key={group.id}>
          {groupIndex > 0 && <div className="vsm-toolbar-separator" />}
          <div className="vsm-toolbar-group">
            {group.tools.map(tool => (
              <IconButton
                key={tool.id}
                icon={tool.icon as IconName}
                title={tool.title}
                onClick={() => onToolClick(tool.id)}
                size="medium"
                variant="subtle"
              />
            ))}
          </div>
        </React.Fragment>
      ))}
    </div>
  );
};

export default Toolbar;