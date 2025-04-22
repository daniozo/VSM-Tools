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
class MenuBuilder {
  /**
   * @param mainWindow La fenêtre principale de l'application
   */
  constructor(mainWindow2) {
    this.mainWindow = mainWindow2;
  }
  /**
   * Construit et applique le menu à la fenêtre principale
   */
  buildMenu() {
    const isDev2 = process.env.NODE_ENV === "development";
    if (isDev2) {
      this.setupDevelopmentEnvironment();
    }
    const template = this.buildTemplate();
    const menu = electron.Menu.buildFromTemplate(template);
    electron.Menu.setApplicationMenu(menu);
    return menu;
  }
  /**
   * Configure l'environnement de développement avec les raccourcis
   */
  setupDevelopmentEnvironment() {
    this.mainWindow.webContents.on("context-menu", (_, props) => {
      const { x, y } = props;
      electron.Menu.buildFromTemplate([
        {
          label: "Inspecter l'élément",
          click: () => {
            this.mainWindow.webContents.inspectElement(x, y);
          }
        }
      ]).popup({ window: this.mainWindow });
    });
  }
  /**
   * Construit le modèle de menu selon la plateforme
   */
  buildTemplate() {
    const templateDefault = [
      {
        label: "&Fichier",
        submenu: [
          {
            label: "&Nouveau",
            accelerator: "CmdOrCtrl+N",
            click: () => {
              this.mainWindow.webContents.send("menu:new-map");
            }
          },
          {
            label: "&Ouvrir",
            accelerator: "CmdOrCtrl+O",
            click: () => {
              this.mainWindow.webContents.send("menu:open-map");
            }
          },
          {
            label: "&Enregistrer",
            accelerator: "CmdOrCtrl+S",
            click: () => {
              this.mainWindow.webContents.send("menu:save-map");
            }
          },
          {
            label: "Enregistrer &sous...",
            accelerator: "CmdOrCtrl+Shift+S",
            click: () => {
              this.mainWindow.webContents.send("menu:save-as-map");
            }
          },
          { type: "separator" },
          {
            label: "&Exporter",
            submenu: [
              {
                label: "Exporter en PNG",
                click: () => {
                  this.mainWindow.webContents.send("menu:export-png");
                }
              },
              {
                label: "Exporter en SVG",
                click: () => {
                  this.mainWindow.webContents.send("menu:export-svg");
                }
              },
              {
                label: "Exporter en PDF",
                click: () => {
                  this.mainWindow.webContents.send("menu:export-pdf");
                }
              }
            ]
          },
          { type: "separator" },
          {
            label: "&Quitter",
            accelerator: "CmdOrCtrl+Q",
            click: () => {
              electron.app.quit();
            }
          }
        ]
      },
      {
        label: "&Édition",
        submenu: [
          {
            label: "&Annuler",
            accelerator: "CmdOrCtrl+Z",
            role: "undo"
          },
          {
            label: "&Rétablir",
            accelerator: "CmdOrCtrl+Y",
            role: "redo"
          },
          { type: "separator" },
          {
            label: "&Couper",
            accelerator: "CmdOrCtrl+X",
            role: "cut"
          },
          {
            label: "C&opier",
            accelerator: "CmdOrCtrl+C",
            role: "copy"
          },
          {
            label: "Co&ller",
            accelerator: "CmdOrCtrl+V",
            role: "paste"
          },
          {
            label: "&Supprimer",
            accelerator: "Delete",
            click: () => {
              this.mainWindow.webContents.send("menu:delete-selection");
            }
          },
          { type: "separator" },
          {
            label: "&Sélectionner tout",
            accelerator: "CmdOrCtrl+A",
            role: "selectAll"
          }
        ]
      },
      {
        label: "&Affichage",
        submenu: [
          {
            label: "&Zoomer",
            accelerator: "CmdOrCtrl+=",
            click: () => {
              this.mainWindow.webContents.send("menu:zoom-in");
            }
          },
          {
            label: "&Dézoomer",
            accelerator: "CmdOrCtrl+-",
            click: () => {
              this.mainWindow.webContents.send("menu:zoom-out");
            }
          },
          {
            label: "Réinitialiser le zoom",
            accelerator: "CmdOrCtrl+0",
            click: () => {
              this.mainWindow.webContents.send("menu:zoom-reset");
            }
          },
          { type: "separator" },
          {
            label: "Afficher/Masquer la palette d'outils",
            accelerator: "CmdOrCtrl+P",
            click: () => {
              this.mainWindow.webContents.send("menu:toggle-palette");
            }
          },
          {
            label: "Afficher/Masquer les propriétés",
            accelerator: "CmdOrCtrl+R",
            click: () => {
              this.mainWindow.webContents.send("menu:toggle-properties");
            }
          },
          { type: "separator" },
          {
            label: "Plein écran",
            accelerator: "F11",
            click: () => {
              const isFullScreen = this.mainWindow.isFullScreen();
              this.mainWindow.setFullScreen(!isFullScreen);
            }
          }
        ]
      }
    ];
    templateDefault.push({
      label: "&Aide",
      submenu: [
        {
          label: "Documentation",
          accelerator: "F1",
          click: () => {
            electron.shell.openExternal("https://github.com/daniozo/vsm-tools");
          }
        },
        { type: "separator" },
        {
          label: "À propos",
          accelerator: "CmdOrCtrl+F1",
          click: () => {
            electron.dialog.showMessageBox(this.mainWindow, {
              title: "À propos de VSM-Tools",
              message: "VSM-Tools v1.0.0",
              detail: "Application de cartographie des flux de valeur (Value Stream Mapping) destinée aux professionnels de l'amélioration continue et du lean management.",
              buttons: ["Fermer"],
              type: "info",
              icon: void 0
              // Ajouter une icône ici plus tard
            });
          }
        }
      ]
    });
    return templateDefault;
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
  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();
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
