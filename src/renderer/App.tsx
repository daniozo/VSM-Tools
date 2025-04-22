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

  if (isLoading) {
    return (
      <div className="loading-screen">
        <h1>VSM-Tools</h1>
        <p>Chargement en cours...</p>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} onError={handleError}>
      <div className="app-container">
        <Toolbar onToolClick={handleToolClick} />
        <div className="main-content">
          <ToolPalette onToolSelect={handleToolSelect} />
          <EditorCanvas />
          <PropertiesPanel />
        </div>
        <StatusBar />
      </div>
    </ErrorBoundary>
  );
};

export default App;