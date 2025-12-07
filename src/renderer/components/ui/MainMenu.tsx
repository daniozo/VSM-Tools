import React from 'react';

interface MenuItemProps {
  label: string;
  shortcut?: string;
  onClick?: () => void;
  disabled?: boolean;
}

interface SubMenuProps {
  label: string;
  items: MenuItemProps[];
}

interface MainMenuProps {
  onMenuItemClick: (menuId: string) => void;
  className?: string;
}

/**
 * Barre de menu principale de l'application VSM-Tools
 */
const MainMenu: React.FC<MainMenuProps> = ({
  onMenuItemClick,
  className = '',
}) => {
  // Définition des menus et sous-menus
  const menuStructure: SubMenuProps[] = [
    {
      label: 'Fichier',
      items: [
        { label: 'Nouveau', shortcut: 'Ctrl+N' },
        { label: 'Ouvrir...', shortcut: 'Ctrl+O' },
        { label: 'Récents' },
        { label: 'Enregistrer', shortcut: 'Ctrl+S' },
        { label: 'Enregistrer sous...', shortcut: 'Ctrl+Shift+S' },
        { label: 'Exporter' },
        { label: 'Imprimer...', shortcut: 'Ctrl+P' },
        { label: 'Quitter', shortcut: 'Alt+F4' }
      ]
    },
    {
      label: 'Édition',
      items: [
        { label: 'Annuler', shortcut: 'Ctrl+Z' },
        { label: 'Rétablir', shortcut: 'Ctrl+Y' },
        { label: 'Couper', shortcut: 'Ctrl+X' },
        { label: 'Copier', shortcut: 'Ctrl+C' },
        { label: 'Coller', shortcut: 'Ctrl+V' },
        { label: 'Supprimer', shortcut: 'Del' },
        { label: 'Sélectionner tout', shortcut: 'Ctrl+A' },
        { label: 'Préférences...' }
      ]
    },
    {
      label: 'Affichage',
      items: [
        { label: 'Zoom+', shortcut: 'Ctrl+' },
        { label: 'Zoom-', shortcut: 'Ctrl-' },
        { label: 'Zoom 100%', shortcut: 'Ctrl+0' },
        { label: 'Plein écran', shortcut: 'F11' },
        { label: 'Afficher/masquer panneau gauche', shortcut: 'F4' },
        { label: 'Afficher/masquer panneau droit', shortcut: 'F5' },
        { label: 'Afficher/masquer grille' },
        { label: 'Afficher/masquer règles' }
      ]
    },
    {
      label: 'Carte',
      items: [
        { label: 'Configuration...', shortcut: 'Ctrl+K' },
        { label: 'Ajouter élément' },
        { label: 'Propriétés de la carte...' },
        { label: 'État actuel/futur' },
        { label: 'Calculer indicateurs' },
        { label: 'Plan d\'action' }
      ]
    },
    {
      label: 'Aide',
      items: [
        { label: 'Documentation' },
        { label: 'Raccourcis clavier' },
        { label: 'À propos' },
        { label: 'Vérifier les mises à jour' }
      ]
    }
  ];

  // État pour gérer le menu ouvert
  const [openMenu, setOpenMenu] = React.useState<number | null>(null);

  // Fonction pour ouvrir/fermer un menu
  const handleMenuClick = (index: number) => {
    if (openMenu === index) {
      setOpenMenu(null);
    } else {
      setOpenMenu(index);
    }
  };

  // Fonction pour gérer le clic sur un élément de menu
  const handleMenuItemClick = (menuLabel: string, itemLabel: string) => {
    // Générer un ID pour l'élément de menu (par exemple "file.new", "edit.undo", etc.)
    const menuId = `${menuLabel.toLowerCase()}.${itemLabel.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    onMenuItemClick(menuId);
    setOpenMenu(null); // Fermer le menu après la sélection
  };

  // Fermer le menu si on clique ailleurs
  React.useEffect(() => {
    const handleClickOutside = () => {
      setOpenMenu(null);
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <div className={`flex bg-background border-b border-border-subtle ${className}`}>
      {menuStructure.map((menu, index) => (
        <div key={index} className="relative">
          <button
            className={`px-3 py-1 text-sm hover:bg-gray-100 ${openMenu === index ? 'bg-gray-100' : ''
              }`}
            onClick={(e) => {
              e.stopPropagation(); // Empêcher que le gestionnaire de document ne ferme le menu
              handleMenuClick(index);
            }}
          >
            {menu.label}
          </button>

          {openMenu === index && (
            <div className="absolute top-full left-0 bg-white border border-border-subtle shadow-md rounded-sm z-50 py-1 min-w-[200px]">
              {menu.items.map((item, itemIndex) => (
                <button
                  key={itemIndex}
                  className="w-full text-left px-4 py-1.5 text-sm hover:bg-gray-100 flex justify-between items-center"
                  onClick={() => handleMenuItemClick(menu.label, item.label)}
                  disabled={item.disabled}
                >
                  <span>{item.label}</span>
                  {item.shortcut && (
                    <span className="text-text-secondary text-xs ml-8">{item.shortcut}</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default MainMenu;