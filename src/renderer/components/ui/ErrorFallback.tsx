import React from 'react';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetErrorBoundary }) => {
  return (
    <div className="error-container">
      <h2>Une erreur s'est produite</h2>
      <p>Message d'erreur: {error.message}</p>
      <button className="btn" onClick={resetErrorBoundary}>
        Réessayer
      </button>
    </div>
  );
};

export default ErrorFallback;