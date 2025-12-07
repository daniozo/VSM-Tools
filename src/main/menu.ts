/**
 * Construction des menus natifs de l'application
 */
import { Menu, MenuItem, BrowserWindow, app, dialog, shell } from 'electron';
import { AppWindow } from './appWindow';

export class MenuBuilder {
  private mainWindow: AppWindow;

  /**
   * @param mainWindow La fenêtre principale de l'application
   */
  constructor(mainWindow: AppWindow) {
    this.mainWindow = mainWindow;
  }

  /**
   * Construit et applique le menu à la fenêtre principale
   */
  public buildMenu(): Menu {
    // En mode développement, on ajoute le rechargement
    const isDev = process.env.NODE_ENV === 'development';

    if (isDev) {
      this.setupDevelopmentEnvironment();
    }

    // Construit le modèle de menu approprié selon la plateforme
    const template = this.buildTemplate();
    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);

    return menu;
  }

  /**
   * Configure l'environnement de développement avec les raccourcis
   */
  private setupDevelopmentEnvironment(): void {
    // Ajoute un raccourci pour ouvrir les outils de développement
    this.mainWindow.webContents.on('context-menu', (_, props) => {
      const { x, y } = props;

      Menu.buildFromTemplate([
        {
          label: 'Inspecter l\'élément',
          click: () => {
            this.mainWindow.webContents.inspectElement(x, y);
          },
        },
      ]).popup({ window: this.mainWindow });
    });
  }

  /**
   * Construit le modèle de menu selon la plateforme
   */
  private buildTemplate(): Electron.MenuItemConstructorOptions[] {
    const templateDefault: Electron.MenuItemConstructorOptions[] = [
      {
        label: '&Fichier',
        submenu: [
          {
            label: '&Nouveau',
            accelerator: 'CmdOrCtrl+N',
            click: () => {
              this.mainWindow.webContents.send('menu:new-map');
            },
          },
          {
            label: '&Ouvrir',
            accelerator: 'CmdOrCtrl+O',
            click: () => {
              this.mainWindow.webContents.send('menu:open-map');
            },
          },
          {
            label: '&Enregistrer',
            accelerator: 'CmdOrCtrl+S',
            click: () => {
              this.mainWindow.webContents.send('menu:save-map');
            },
          },
          {
            label: 'Enregistrer &sous...',
            accelerator: 'CmdOrCtrl+Shift+S',
            click: () => {
              this.mainWindow.webContents.send('menu:save-as-map');
            },
          },
          { type: 'separator' },
          {
            label: '&Exporter',
            submenu: [
              {
                label: 'Exporter en PNG',
                click: () => {
                  this.mainWindow.webContents.send('menu:export-png');
                },
              },
              {
                label: 'Exporter en SVG',
                click: () => {
                  this.mainWindow.webContents.send('menu:export-svg');
                },
              },
              {
                label: 'Exporter en PDF',
                click: () => {
                  this.mainWindow.webContents.send('menu:export-pdf');
                },
              },
            ],
          },
          { type: 'separator' },
          {
            label: '&Quitter',
            accelerator: 'CmdOrCtrl+Q',
            click: () => {
              app.quit();
            },
          },
        ],
      },
      {
        label: '&Édition',
        submenu: [
          {
            label: '&Annuler',
            accelerator: 'CmdOrCtrl+Z',
            role: 'undo',
          },
          {
            label: '&Rétablir',
            accelerator: 'CmdOrCtrl+Y',
            role: 'redo',
          },
          { type: 'separator' },
          {
            label: '&Couper',
            accelerator: 'CmdOrCtrl+X',
            role: 'cut',
          },
          {
            label: 'C&opier',
            accelerator: 'CmdOrCtrl+C',
            role: 'copy',
          },
          {
            label: 'Co&ller',
            accelerator: 'CmdOrCtrl+V',
            role: 'paste',
          },
          {
            label: '&Supprimer',
            accelerator: 'Delete',
            click: () => {
              this.mainWindow.webContents.send('menu:delete-selection');
            },
          },
          { type: 'separator' },
          {
            label: '&Sélectionner tout',
            accelerator: 'CmdOrCtrl+A',
            role: 'selectAll',
          },
        ],
      },
      {
        label: '&Affichage',
        submenu: [
          {
            label: '&Zoomer',
            accelerator: 'CmdOrCtrl+=',
            click: () => {
              this.mainWindow.webContents.send('menu:zoom-in');
            },
          },
          {
            label: '&Dézoomer',
            accelerator: 'CmdOrCtrl+-',
            click: () => {
              this.mainWindow.webContents.send('menu:zoom-out');
            },
          },
          {
            label: 'Réinitialiser le zoom',
            accelerator: 'CmdOrCtrl+0',
            click: () => {
              this.mainWindow.webContents.send('menu:zoom-reset');
            },
          },
          { type: 'separator' },
          {
            label: 'Afficher/Masquer la palette d\'outils',
            accelerator: 'CmdOrCtrl+P',
            click: () => {
              this.mainWindow.webContents.send('menu:toggle-palette');
            },
          },
          {
            label: 'Afficher/Masquer les propriétés',
            accelerator: 'CmdOrCtrl+R',
            click: () => {
              this.mainWindow.webContents.send('menu:toggle-properties');
            },
          },
          { type: 'separator' },
          {
            label: 'Plein écran',
            accelerator: 'F11',
            click: () => {
              const isFullScreen = this.mainWindow.isFullScreen();
              this.mainWindow.setFullScreen(!isFullScreen);
            },
          },
        ],
      },
      {
        label: '&Carte',
        submenu: [
          {
            label: '&Configuration du diagramme...',
            accelerator: 'CmdOrCtrl+K',
            click: () => {
              this.mainWindow.webContents.send('menu:open-configuration');
            },
          },
          { type: 'separator' },
          {
            label: '&Régénérer le layout',
            click: () => {
              this.mainWindow.webContents.send('menu:regenerate-layout');
            },
          },
          {
            label: '&Valider le diagramme',
            click: () => {
              this.mainWindow.webContents.send('menu:validate-diagram');
            },
          },
        ],
      },
    ];

    // Ajoute le menu Aide à la fin
    templateDefault.push({
      label: '&Aide',
      submenu: [
        {
          label: 'Documentation',
          accelerator: 'F1',
          click: () => {
            shell.openExternal('https://github.com/daniozo/vsm-tools');
          },
        },
        { type: 'separator' },
        {
          label: 'À propos',
          accelerator: 'CmdOrCtrl+F1',
          click: () => {
            dialog.showMessageBox(this.mainWindow, {
              title: 'À propos de VSM-Tools',
              message: 'VSM-Tools v1.0.0',
              detail: 'Application de cartographie des flux de valeur (Value Stream Mapping) destinée aux professionnels de l\'amélioration continue et du lean management.',
              buttons: ['Fermer'],
              type: 'info',
              icon: undefined, // Ajouter une icône ici plus tard
            });
          },
        },
      ],
    });

    return templateDefault;
  }
}