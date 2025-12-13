"use strict";
const electron = require("electron");
const path = require("path");
if (typeof electron === "string") {
  throw new TypeError("Not running in an Electron environment!");
}
const { env } = process;
const isEnvSet = "ELECTRON_IS_DEV" in env;
const getFromEnv = Number.parseInt(env.ELECTRON_IS_DEV, 10) === 1;
const isDev = isEnvSet ? getFromEnv : !electron.app.isPackaged;
class AppWindow extends electron.BrowserWindow {
  /**
   * Crée une nouvelle instance de fenêtre principale
   * @param options - Options de configuration de la fenêtre
   */
  constructor(options) {
    const defaultOptions = {
      backgroundColor: "#FFFFFF",
      titleBarStyle: "default",
      minWidth: 800,
      minHeight: 600,
      webPreferences: {
        contextIsolation: true,
        nodeIntegration: false,
        // Autres options de sécurité par défaut
        ...options.webPreferences
      },
      ...options
    };
    super(defaultOptions);
    this.registerWindowEvents();
  }
  /**
   * Enregistre les gestionnaires d'événements pour le cycle de vie de la fenêtre
   */
  registerWindowEvents() {
    this.on("resize", () => {
      const [width, height] = this.getSize();
    });
  }
  /**
   * Réinitialise la fenêtre aux dimensions par défaut
   */
  resetToDefaultSize() {
    this.setSize(1280, 720);
    this.center();
  }
}
let mainWindow = null;
const isHeadless = process.env.ELECTRON_HEADLESS === "1";
async function createWindow() {
  if (isHeadless) {
    console.log("Application démarrée en mode headless. Aucune fenêtre ne sera créée.");
    return;
  }
  mainWindow = new AppWindow({
    width: 1200,
    height: 800,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js")
    }
  });
  if (isDev) {
    await mainWindow.loadURL("http://localhost:3000");
    mainWindow.webContents.openDevTools();
  } else {
    await mainWindow.loadFile(path.resolve(__dirname, "../renderer", "index.html"));
  }
  mainWindow.on("ready-to-show", () => {
    if (mainWindow) {
      mainWindow.show();
    }
  });
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    electron.shell.openExternal(url);
    return { action: "deny" };
  });
  const { Menu } = require("electron");
  Menu.setApplicationMenu(null);
}
electron.app.whenReady().then(() => {
  createWindow();
  electron.app.on("activate", () => {
    if (electron.BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    electron.app.quit();
  }
});
process.on("uncaughtException", (error) => {
  console.error("Erreur non capturée :", error);
  if (mainWindow) {
    electron.dialog.showErrorBox(
      "Une erreur s'est produite",
      `Détails de l'erreur: ${error.message}

${error.stack}`
    );
  }
});
