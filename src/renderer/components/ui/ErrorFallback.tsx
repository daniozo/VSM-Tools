import React from 'react';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetErrorBoundary }) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background-secondary p-6">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full border border-border">
        <h2 className="text-2xl font-bold mb-4 text-text-primary">Une erreur s'est produite</h2>
        <p className="mb-6 text-text-secondary">
          Message d'erreur: <span className="font-mono bg-gray-100 p-1 rounded">{error.message}</span>
        </p>
        <button
          className="bg-accent text-white hover:bg-accent-hover active:bg-gray-900 py-2 px-4 rounded-md font-medium transition-colors duration-quick"
          onClick={resetErrorBoundary}>
          Réessayer
        </button>
      </div>
    </div>
  );
};

export default ErrorFallback;