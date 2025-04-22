import React from 'react';
import IconButton from '../../../shared/components/ui/IconButton';
import type { IconName } from '../../../shared/components/icons/Icon';

// Définition des groupes d'outils avec leurs icônes (sans les boutons de panneaux)
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
    <div className={`flex items-center justify-between bg-background-secondary border-b border-border-subtle px-2 py-1 ${className}`}>
      {/* Bouton panneau gauche à l'extrémité gauche */}
      <div className="flex-none">
        <IconButton
          icon="PanelLeft"
          title="Afficher/masquer panneau gauche"
          onClick={() => onToolClick('panelLeft')}
          size="small"
          variant="subtle"
        />
      </div>

      {/* Groupes d'outils au centre */}
      <div className="flex items-center flex-1 justify-center">
        {toolGroups.map((group, groupIndex) => (
          <React.Fragment key={group.id}>
            {groupIndex > 0 && <div className="w-px h-6 bg-border-subtle mx-2" />}
            <div className="flex items-center">
              {group.tools.map(tool => (
                <IconButton
                  key={tool.id}
                  icon={tool.icon as IconName}
                  title={tool.title}
                  onClick={() => onToolClick(tool.id)}
                  size="small"
                  variant="subtle"
                />
              ))}
            </div>
          </React.Fragment>
        ))}
      </div>

      {/* Boutons panneau droit et plein écran à l'extrémité droite */}
      <div className="flex-none flex items-center">
        <IconButton
          icon="Maximize"
          title="Mode plein écran"
          onClick={() => onToolClick('fullscreen')}
          size="small"
          variant="subtle"
        />
        <IconButton
          icon="PanelRight"
          title="Afficher/masquer panneau droit"
          onClick={() => onToolClick('panelRight')}
          size="small"
          variant="subtle"
        />
      </div>
    </div>
  );
};

export default Toolbar;