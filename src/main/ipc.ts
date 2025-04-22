/**
 * Gestionnaires d'événements IPC pour la communication entre le processus principal et le renderer
 */
import { ipcMain, dialog, BrowserWindow } from 'electron';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Enregistre tous les gestionnaires d'événements IPC
 */
export const registerIpcHandlers = (): void => {
  // Gestionnaires pour les opérations de fichiers
  registerFileHandlers();

  // Gestionnaires pour les exports
  registerExportHandlers();

  // Gestionnaires pour l'authentification et API
  registerApiHandlers();
};

/**
 * Enregistre les gestionnaires pour les opérations de fichiers
 */
const registerFileHandlers = (): void => {
  // Ouvrir un fichier VSM
  ipcMain.handle('file:open', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      title: 'Ouvrir une carte VSM',
      filters: [
        { name: 'Fichiers VSM', extensions: ['vsm', 'json'] },
        { name: 'Tous les fichiers', extensions: ['*'] }
      ],
      properties: ['openFile']
    });

    if (canceled || filePaths.length === 0) {
      return null;
    }

    try {
      const filePath = filePaths[0];
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      return {
        filePath,
        content: JSON.parse(fileContent)
      };
    } catch (error) {
      console.error('Erreur lors de l\'ouverture du fichier :', error);
      throw new Error(`Erreur lors de l'ouverture du fichier : ${error.message}`);
    }
  });

  // Enregistrer un fichier VSM
  ipcMain.handle('file:save', async (event, { filePath, content }) => {
    // Si pas de chemin de fichier, utiliser "Enregistrer sous"
    if (!filePath) {
      return ipcMain.emit('file:save-as', event, { content });
    }

    try {
      fs.writeFileSync(filePath, JSON.stringify(content, null, 2), 'utf-8');
      return { success: true, filePath };
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du fichier :', error);
      throw new Error(`Erreur lors de l'enregistrement du fichier : ${error.message}`);
    }
  });

  // Enregistrer sous un fichier VSM
  ipcMain.handle('file:save-as', async (event, { content }) => {
    const { canceled, filePath } = await dialog.showSaveDialog({
      title: 'Enregistrer la carte VSM',
      filters: [
        { name: 'Fichiers VSM', extensions: ['vsm'] },
        { name: 'Fichiers JSON', extensions: ['json'] }
      ],
      properties: ['createDirectory']
    });

    if (canceled || !filePath) {
      return { success: false };
    }

    try {
      fs.writeFileSync(filePath, JSON.stringify(content, null, 2), 'utf-8');
      return { success: true, filePath };
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du fichier :', error);
      throw new Error(`Erreur lors de l'enregistrement du fichier : ${error.message}`);
    }
  });
};

/**
 * Enregistre les gestionnaires pour les opérations d'export
 */
const registerExportHandlers = (): void => {
  // Export PNG
  ipcMain.handle('export:png', async (event, { dataUrl }) => {
    const { canceled, filePath } = await dialog.showSaveDialog({
      title: 'Exporter en PNG',
      filters: [{ name: 'Images PNG', extensions: ['png'] }],
      properties: ['createDirectory']
    });

    if (canceled || !filePath) {
      return { success: false };
    }

    try {
      // Conversion de dataUrl en buffer
      const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      fs.writeFileSync(filePath, buffer);

      return { success: true, filePath };
    } catch (error) {
      console.error('Erreur lors de l\'export PNG :', error);
      throw new Error(`Erreur lors de l'export PNG : ${error.message}`);
    }
  });

  // Export SVG
  ipcMain.handle('export:svg', async (event, { svgContent }) => {
    const { canceled, filePath } = await dialog.showSaveDialog({
      title: 'Exporter en SVG',
      filters: [{ name: 'Images SVG', extensions: ['svg'] }],
      properties: ['createDirectory']
    });

    if (canceled || !filePath) {
      return { success: false };
    }

    try {
      fs.writeFileSync(filePath, svgContent, 'utf-8');
      return { success: true, filePath };
    } catch (error) {
      console.error('Erreur lors de l\'export SVG :', error);
      throw new Error(`Erreur lors de l'export SVG : ${error.message}`);
    }
  });

  // Export CSV (pour les données et plan d'action)
  ipcMain.handle('export:csv', async (event, { csvContent, type }) => {
    const title = type === 'data' ? 'Exporter les données en CSV' : 'Exporter le plan d\'action en CSV';
    const { canceled, filePath } = await dialog.showSaveDialog({
      title,
      filters: [{ name: 'Fichiers CSV', extensions: ['csv'] }],
      properties: ['createDirectory']
    });

    if (canceled || !filePath) {
      return { success: false };
    }

    try {
      fs.writeFileSync(filePath, csvContent, 'utf-8');
      return { success: true, filePath };
    } catch (error) {
      console.error('Erreur lors de l\'export CSV :', error);
      throw new Error(`Erreur lors de l'export CSV : ${error.message}`);
    }
  });
};

/**
 * Enregistre les gestionnaires pour les opérations d'API et d'authentification
 */
const registerApiHandlers = (): void => {
  // Stockage temporaire du token (dans une application réelle, utiliser electron-store)
  let authToken: string | null = null;

  // Authentification
  ipcMain.handle('auth:login', async (event, { username, password, serverUrl }) => {
    // Dans une implémentation réelle, cela ferait un appel API au serveur
    // Ici, c'est juste un exemple
    try {
      // Simulation d'un appel réseau
      await new Promise(resolve => setTimeout(resolve, 500));

      // Simulation de validation (à remplacer par un vrai appel API)
      if (username === 'admin' && password === 'password') {
        authToken = 'fake-jwt-token-' + Date.now();
        return {
          success: true,
          token: authToken,
          user: { id: 1, username, displayName: 'Admin User' }
        };
      } else {
        throw new Error('Identifiants invalides');
      }
    } catch (error) {
      console.error('Erreur d\'authentification :', error);
      throw new Error(`Erreur d'authentification : ${error.message}`);
    }
  });

  // Déconnexion
  ipcMain.handle('auth:logout', () => {
    authToken = null;
    return { success: true };
  });

  // Vérification du token
  ipcMain.handle('auth:check-token', () => {
    return {
      isAuthenticated: authToken !== null,
      token: authToken
    };
  });
};