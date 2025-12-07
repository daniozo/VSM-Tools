import React, { useEffect, useState, ErrorInfo } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import './styles/App.css';

// Composants de l'éditeur VSM
import ToolPalette from './components/editor/ToolPalette';
// import PropertiesPanel from './components/editor/PropertiesPanel';
import Toolbar from './components/editor/Toolbar';
import VsmCanvas from './components/editor/VsmCanvas';
import StatusBar from './components/ui/StatusBar';
import ErrorFallback from './components/ui/ErrorFallback';
import MainMenu from './components/ui/MainMenu';
import { ConfigurationDialog } from './components/dialogs/configuration/ConfigurationDialog';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState<boolean>(false);
  const [showLeftPanel, setShowLeftPanel] = useState<boolean>(true);
  const [showRightPanel, setShowRightPanel] = useState<boolean>(false);

  useEffect(() => {
    // Simulation de chargement initial
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Raccourcis clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K : Ouvrir la configuration
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        setIsConfigDialogOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fonction de gestion des erreurs pour ErrorBoundary
  const handleError = (error: Error, info: ErrorInfo) => {
    console.error('Erreur capturée par ErrorBoundary:', error, info);
    // Ici, vous pourriez ajouter une logique pour envoyer les erreurs à un service de monitoring
  };

  // Gestionnaire pour les clics sur les outils de la barre d'outils
  const handleToolClick = (toolId: string) => {
    console.log(`Outil de la barre d'outils cliqué: ${toolId}`);
    
    switch (toolId) {
      case 'configure':
        setIsConfigDialogOpen(true);
        break;
      case 'panelLeft':
        setShowLeftPanel(!showLeftPanel);
        break;
      case 'panelRight':
        setShowRightPanel(!showRightPanel);
        break;
      default:
        // Implémentez ici la logique spécifique à chaque outil
        break;
    }
  };

  // Gestionnaire pour la sélection d'outils dans la palette
  const handleToolSelect = (toolId: string) => {
    console.log(`Outil de la palette sélectionné: ${toolId}`);
    // Implémentez ici la logique pour activer l'outil sélectionné
  };

  // Gestionnaire pour les clics sur les éléments du menu principal
  const handleMenuItemClick = (menuId: string) => {
    console.log(`Élément de menu cliqué: ${menuId}`);
    
    switch (menuId) {
      case 'carte.configuration':
        setIsConfigDialogOpen(true);
        break;
      case 'affichage.afficher_masquer_panneau_gauche':
        setShowLeftPanel(!showLeftPanel);
        break;
      case 'affichage.afficher_masquer_panneau_droit':
        setShowRightPanel(!showRightPanel);
        break;
      default:
        // Implémentez ici la logique pour chaque élément de menu
        break;
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background">
        <h1 className="text-3xl font-bold mb-4 text-text-primary">VSM-Tools</h1>
        <p className="mb-6 text-text-secondary">Chargement en cours...</p>
        <div className="w-12 h-12 border-4 border-t-accent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} onError={handleError}>
      <div className="flex flex-col h-screen bg-background select-none">
        <MainMenu onMenuItemClick={handleMenuItemClick} className="flex-shrink-0" />
        <Toolbar onToolClick={handleToolClick} className="flex-shrink-0" />
        <div className="flex flex-1 overflow-hidden min-h-0">
          {showLeftPanel && (
            <ToolPalette onToolSelect={handleToolSelect} className="w-64 flex-shrink-0 border-r border-border" />
          )}
          <VsmCanvas />
          {/* {showRightPanel && (
            <PropertiesPanel className="w-64 flex-shrink-0 border-l border-border" />
          )} */}
        </div>
        <StatusBar className="flex-shrink-0" />
        
        {/* Dialogue de configuration */}
        <ConfigurationDialog
          open={isConfigDialogOpen}
          onOpenChange={setIsConfigDialogOpen}
        />
      </div>
    </ErrorBoundary>
  );
};

export default App;