/**
 * Script de préchargement pour sécuriser la communication entre le renderer et le main process
 * Utilise contextBridge pour exposer uniquement les API explicitement autorisées
 */
import { contextBridge, ipcRenderer } from 'electron';

/**
 * API exposée au renderer process de manière sécurisée
 * Utilise contextBridge pour éviter l'accès direct à nodeIntegration
 */
contextBridge.exposeInMainWorld('electron', {
  // Opérations de fichiers
  file: {
    open: () => ipcRenderer.invoke('file:open'),
    save: (filePath: string, content: any) =>
      ipcRenderer.invoke('file:save', { filePath, content }),
    saveAs: (content: any) =>
      ipcRenderer.invoke('file:save-as', { content }),
  },

  // Opérations d'export
  export: {
    png: (dataUrl: string) =>
      ipcRenderer.invoke('export:png', { dataUrl }),
    svg: (svgContent: string) =>
      ipcRenderer.invoke('export:svg', { svgContent }),
    csv: (csvContent: string, type: 'data' | 'action') =>
      ipcRenderer.invoke('export:csv', { csvContent, type }),
  },

  // Authentification et API
  auth: {
    login: (username: string, password: string, serverUrl: string) =>
      ipcRenderer.invoke('auth:login', { username, password, serverUrl }),
    logout: () =>
      ipcRenderer.invoke('auth:logout'),
    checkToken: () =>
      ipcRenderer.invoke('auth:check-token'),
  },

  // Gestionnaires d'événements
  on: {
    // Événements du menu
    menuAction: (callback: (action: string) => void) => {
      const validChannels = [
        'menu:new-map',
        'menu:open-map',
        'menu:save-map',
        'menu:save-as-map',
        'menu:export-png',
        'menu:export-svg',
        'menu:export-pdf',
        'menu:delete-selection',
        'menu:zoom-in',
        'menu:zoom-out',
        'menu:zoom-reset',
        'menu:toggle-palette',
        'menu:toggle-properties',
      ];

      // Enregistre un gestionnaire pour chaque événement du menu
      validChannels.forEach(channel => {
        ipcRenderer.on(channel, () => callback(channel.replace('menu:', '')));
      });

      // Retourne une fonction pour supprimer les écouteurs
      return () => {
        validChannels.forEach(channel => {
          ipcRenderer.removeAllListeners(channel);
        });
      };
    },
  },
});