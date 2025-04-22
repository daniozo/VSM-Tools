import React, { useEffect, useState, ErrorInfo } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import './styles/App.css';

// Composants qui seront implémentés plus tard
import EditorCanvas from './components/editor/EditorCanvas';
import ToolPalette from './components/editor/ToolPalette';
import PropertiesPanel from './components/editor/PropertiesPanel';
import Toolbar from './components/editor/Toolbar';
import StatusBar from './components/ui/StatusBar';
import ErrorFallback from './components/ui/ErrorFallback';
import MainMenu from './components/ui/MainMenu';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Simulation de chargement initial
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Fonction de gestion des erreurs pour ErrorBoundary
  const handleError = (error: Error, info: ErrorInfo) => {
    console.error('Erreur capturée par ErrorBoundary:', error, info);
    // Ici, vous pourriez ajouter une logique pour envoyer les erreurs à un service de monitoring
  };

  // Gestionnaire pour les clics sur les outils de la barre d'outils
  const handleToolClick = (toolId: string) => {
    console.log(`Outil de la barre d'outils cliqué: ${toolId}`);
    // Implémentez ici la logique spécifique à chaque outil
  };

  // Gestionnaire pour la sélection d'outils dans la palette
  const handleToolSelect = (toolId: string) => {
    console.log(`Outil de la palette sélectionné: ${toolId}`);
    // Implémentez ici la logique pour activer l'outil sélectionné
  };

  // Gestionnaire pour les clics sur les éléments du menu principal
  const handleMenuItemClick = (menuId: string) => {
    console.log(`Élément de menu cliqué: ${menuId}`);
    // Implémentez ici la logique pour chaque élément de menu
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
        <div className="flex flex-1 overflow-hidden">
          <ToolPalette onToolSelect={handleToolSelect} className="w-64 flex-shrink-0 border-r border-border-subtle" />
          <EditorCanvas />
          <PropertiesPanel className="w-64 flex-shrink-0 border-l border-border-subtle" />
        </div>
        <StatusBar className="flex-shrink-0" />
      </div>
    </ErrorBoundary>
  );
};

export default App;