/**
 * Point d'entrée principal pour l'application Electron
 */
import { app, BrowserWindow, shell, dialog } from 'electron';
import path from 'path';
import isDev from 'electron-is-dev';
import { AppWindow } from './appWindow';
import { MenuBuilder } from './menu';

// Variable pour stocker la référence à la fenêtre principale
let mainWindow: AppWindow | null = null;

/**
 * Vérifie si l'application fonctionne en mode headless
 * Utile pour l'environnement de développement sans serveur X
 */
const isHeadless = process.env.ELECTRON_HEADLESS === '1';

/**
 * Crée la fenêtre principale de l'application
 */
async function createWindow() {
  // Si en mode headless, ne pas créer de fenêtre graphique
  if (isHeadless) {
    console.log('Application démarrée en mode headless. Aucune fenêtre ne sera créée.');
    return;
  }

  // Création de la fenêtre principale
  mainWindow = new AppWindow({
    width: 1200,
    height: 800,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // Chargement de l'URL de l'application
  if (isDev) {
    await mainWindow.loadURL('http://localhost:3000');
    // Ouvre les DevTools en mode développement
    mainWindow.webContents.openDevTools();
  } else {
    await mainWindow.loadFile(path.resolve(__dirname, '../renderer', 'index.html'));
  }

  // Afficher la fenêtre une fois prête pour éviter les flashs blancs
  mainWindow.on('ready-to-show', () => {
    if (mainWindow) {
      mainWindow.show();
    }
  });

  // Gestion des liens externes (ouverture dans le navigateur par défaut)
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Construction des menus de l'application
  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();
}

/**
 * Initialisation de l'application
 */
app.whenReady().then(() => {
  createWindow();

  // Sur macOS, recréer la fenêtre lors du clic sur l'icône du dock
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

/**
 * Gestion de la fermeture de l'application
 */
app.on('window-all-closed', () => {
  // Sur macOS, l'application reste en mémoire à moins que l'utilisateur ne la quitte explicitement
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Gestion des erreurs non capturées
process.on('uncaughtException', (error) => {
  console.error('Erreur non capturée :', error);

  if (mainWindow) {
    dialog.showErrorBox(
      'Une erreur s\'est produite',
      `Détails de l'erreur: ${error.message}\n\n${error.stack}`
    );
  }
});