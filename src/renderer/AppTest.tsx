import React, { ErrorInfo } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import VsmWorkspace from './components/VsmWorkspace';
import ErrorFallback from './components/ui/ErrorFallback';

/**
 * Version test de l'application pour tester l'intégration maxGraph + Zustand
 * Remplace temporairement l'interface complète par le workspace VSM
 */
const AppTest: React.FC = () => {
  const handleError = (error: Error, errorInfo: ErrorInfo) => {
    console.error('Erreur dans l\'application VSM:', error, errorInfo);
  };

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} onError={handleError}>
      <div className="h-screen bg-background">
        <VsmWorkspace />
      </div>
    </ErrorBoundary>
  );
};

export default AppTest;
