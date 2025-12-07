import React, { useEffect, useState, ErrorInfo } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import './styles/App.css';

// Nouveau layout Model-First
import { MainLayout, Toolbar, StatusBar } from './components/layout';

// Composants de l'éditeur VSM
import VsmCanvas from './components/editor/VsmCanvas';
import ErrorFallback from './components/ui/ErrorFallback';
import { ConfigurationDialog } from './components/dialogs/configuration/ConfigurationDialog';

// Store et données
import { useVsmStore } from '@/store/vsmStore';
import { useProjectsStore } from '@/store/projectsStore';
import { demoDiagram } from '@/shared/data/demo-diagram';

// Hook de connexion backend
import { useBackendConnection } from './hooks/useBackendConnection';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState<boolean>(false);
  const [leftPanelVisible, setLeftPanelVisible] = useState<boolean>(true);
  const [rightPanelVisible, setRightPanelVisible] = useState<boolean>(true);

  // Store VSM
  const { loadDiagram, createNewDiagram } = useVsmStore();
  
  // Connexion backend (auto-connect)
  useBackendConnection();
  const { connectionStatus } = useProjectsStore();

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

  // Écoute des événements du menu natif Electron
  useEffect(() => {
    // @ts-expect-error - electron preload
    const ipcRenderer = window.electron?.ipcRenderer;
    if (!ipcRenderer) return;

    const handlers: Record<string, () => void> = {
      'menu:new-map': handleNewProject,
      'menu:open-map': handleOpenProject,
      'menu:open-configuration': () => setIsConfigDialogOpen(true),
      'menu:toggle-palette': () => setLeftPanelVisible(prev => !prev),
      'menu:toggle-properties': () => setRightPanelVisible(prev => !prev),
    };

    // Enregistrer tous les listeners
    Object.entries(handlers).forEach(([channel, handler]) => {
      ipcRenderer.on(channel, handler);
    });

    // Cleanup
    return () => {
      Object.entries(handlers).forEach(([channel, handler]) => {
        ipcRenderer.removeListener(channel, handler);
      });
    };
  }, []);

  // Fonction de gestion des erreurs pour ErrorBoundary
  const handleError = (error: Error, info: ErrorInfo) => {
    console.error('Erreur capturée par ErrorBoundary:', error, info);
  };

  // Gestionnaire pour les actions de la toolbar
  const handleToolbarAction = (action: string) => {
    console.log(`Action toolbar: ${action}`);
    
    switch (action) {
      case 'newProject':
        handleNewProject();
        break;
      case 'openProject':
        handleOpenProject();
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
      case 'zoomIn':
        console.log('Zoom +');
        break;
      case 'zoomOut':
        console.log('Zoom -');
        break;
      case 'zoomReset':
        console.log('Zoom reset');
        break;
      case 'configure':
        setIsConfigDialogOpen(true);
        break;
      case 'loadDemo':
        handleLoadDemo();
        break;
      case 'toggleLeftPanel':
        setLeftPanelVisible(!leftPanelVisible);
        break;
      case 'toggleRightPanel':
        setRightPanelVisible(!rightPanelVisible);
        break;
      default:
        break;
    }
  };

  // Actions projet
  const handleNewProject = () => {
    console.log('Nouveau projet');
    createNewDiagram('Nouveau Diagramme', 'Utilisateur');
  };

  const handleOpenProject = () => {
    console.log('Ouvrir projet - TODO: ouvrir dialogue fichier');
  };

  const handleLoadDemo = () => {
    console.log('Chargement du diagramme de démonstration');
    loadDiagram(demoDiagram);
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
        <Toolbar 
          onAction={handleToolbarAction}
          leftPanelVisible={leftPanelVisible}
          rightPanelVisible={rightPanelVisible}
        />
        <MainLayout
          leftPanelVisible={leftPanelVisible}
          rightPanelVisible={rightPanelVisible}
          onNewProject={handleNewProject}
          onOpenProject={handleOpenProject}
        >
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