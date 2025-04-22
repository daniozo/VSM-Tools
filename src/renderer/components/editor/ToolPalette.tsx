import React, { useState } from 'react';
import IconButton from '../../../shared/components/ui/IconButton';
import type { IconName } from '../../../shared/components/icons/Icon';

// Définition des catégories d'outils VSM
const toolCategories = [
  {
    id: 'process',
    title: 'Processus',
    tools: [
      { id: 'process', icon: 'Square', title: 'Processus standard' },
      { id: 'process-value', icon: 'Check', title: 'Processus à valeur ajoutée' },
      { id: 'process-operator', icon: 'User', title: 'Opérateur' },
    ]
  },
  {
    id: 'storage',
    title: 'Stockage',
    tools: [
      { id: 'inventory', icon: 'Triangle', title: 'Inventaire' },
      { id: 'buffer', icon: 'Database', title: 'Buffer' },
      { id: 'supermarket', icon: 'Layers', title: 'Supermarché' }
    ]
  },
  {
    id: 'flow',
    title: 'Flux',
    tools: [
      { id: 'flow-push', icon: 'ArrowRight', title: 'Flux poussé' },
      { id: 'flow-pull', icon: 'ArrowLeft', title: 'Flux tiré' },
      { id: 'flow-material', icon: 'Truck', title: 'Flux de matière' },
      { id: 'flow-info', icon: 'FileText', title: 'Flux d\'information' }
    ]
  },
  {
    id: 'external',
    title: 'Entités externes',
    tools: [
      { id: 'supplier', icon: 'Factory', title: 'Fournisseur' },
      { id: 'customer', icon: 'Users', title: 'Client' },
    ]
  },
  {
    id: 'kaizen',
    title: 'Kaizen/Analyse',
    tools: [
      { id: 'kaizen-burst', icon: 'Star', title: 'Opportunité Kaizen' },
      { id: 'data-box', icon: 'Box', title: 'Boîte de données' },
      { id: 'timeline', icon: 'BarChart3', title: 'Timeline' },
    ]
  },
];

interface ToolPaletteProps {
  onToolSelect: (toolId: string) => void;
  className?: string;
}

/**
 * Palette d'outils VSM avec icônes Lucide
 * Utilise notre palette de couleurs noir, blanc et gris
 */
const ToolPalette: React.FC<ToolPaletteProps> = ({
  onToolSelect,
  className = '',
}) => {
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['process']);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  return (
    <div className={`vsm-panel ${className}`}>
      <div className="vsm-panel-header">
        <h2 className="vsm-panel-title">Outils</h2>
      </div>
      <div className="vsm-panel-content">
        {toolCategories.map(category => (
          <div key={category.id} className="vsm-panel-category">
            <div
              className="vsm-panel-category-header"
              onClick={() => toggleCategory(category.id)}
            >
              <IconButton
                icon={expandedCategories.includes(category.id) ? 'ChevronDown' : 'ChevronRight'}
                size="small"
                variant="subtle"
              />
              <span className="vsm-panel-category-title">{category.title}</span>
            </div>

            {expandedCategories.includes(category.id) && (
              <div className="vsm-panel-category-content">
                {category.tools.map(tool => (
                  <IconButton
                    key={tool.id}
                    icon={tool.icon as IconName}
                    title={tool.title}
                    onClick={() => onToolSelect(tool.id)}
                    size="medium"
                    variant="default"
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ToolPalette;