import React, { useEffect, useState, ErrorInfo } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import './styles/App.css';

// Nouveau layout Model-First
import { MainLayout, Toolbar, StatusBar } from './components/layout';

// Composants de l'éditeur VSM
import VsmCanvas from './components/editor/VsmCanvas';
import ErrorFallback from './components/ui/ErrorFallback';
import MainMenu from './components/ui/MainMenu';
import { ConfigurationDialog } from './components/dialogs/configuration/ConfigurationDialog';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState<boolean>(false);

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
  };

  // Gestionnaire pour les actions de la toolbar
  const handleToolbarAction = (action: string) => {
    console.log(`Action toolbar: ${action}`);
    
    switch (action) {
      case 'new-project':
        console.log('Nouveau projet');
        break;
      case 'open-project':
        console.log('Ouvrir projet');
        break;
      case 'save':
        console.log('Sauvegarder');
        break;
      case 'undo':
        console.log('Annuler');
        break;
      case 'redo':
        console.log('Refaire');
        break;
      case 'zoom-in':
        console.log('Zoom +');
        break;
      case 'zoom-out':
        console.log('Zoom -');
        break;
      case 'zoom-fit':
        console.log('Ajuster');
        break;
      case 'configure':
        setIsConfigDialogOpen(true);
        break;
      default:
        break;
    }
  };

  // Gestionnaire pour les clics sur les éléments du menu principal
  const handleMenuItemClick = (menuId: string) => {
    console.log(`Élément de menu cliqué: ${menuId}`);
    
    switch (menuId) {
      case 'carte.configuration':
        setIsConfigDialogOpen(true);
        break;
      default:
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
        <Toolbar onAction={handleToolbarAction} />
        <MainLayout>
          <VsmCanvas />
        </MainLayout>
        <StatusBar />
        
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