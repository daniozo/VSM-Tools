/**
 * Types pour l'API Electron exposée au processus de rendu via preload
 */

/**
 * Interface pour l'API Electron exposée via le preload
 */
export interface ElectronAPI {
  // Opérations de fichiers
  file: {
    open: () => Promise<{ filePath: string; content: any } | null>;
    save: (filePath: string, content: any) => Promise<{ success: boolean; filePath: string }>;
    saveAs: (content: any) => Promise<{ success: boolean; filePath?: string }>;
  };

  // Authentification et API
  auth: {
    login: (username: string, password: string, serverUrl: string) => Promise<{
      success: boolean;
      token: string;
      user: { id: number; username: string; displayName: string };
    }>;
    logout: () => Promise<{ success: boolean }>;
    checkToken: () => Promise<{ isAuthenticated: boolean; token: string | null }>;
  };

  // Opérations d'export
  export: {
    png: (dataUrl: string) => Promise<{ success: boolean; filePath?: string }>;
    svg: (svgContent: string) => Promise<{ success: boolean; filePath?: string }>;
    csv: (csvContent: string, type: 'data' | 'action') => Promise<{ success: boolean; filePath?: string }>;
  };

  // Gestionnaires d'événements
  on: {
    menuAction: (callback: (action: string) => void) => () => void;
  };
}