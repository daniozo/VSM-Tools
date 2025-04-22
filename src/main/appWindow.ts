/**
 * Classe gérant la fenêtre principale de l'application
 * Étend BrowserWindow avec des fonctionnalités supplémentaires
 */
import { BrowserWindow, BrowserWindowConstructorOptions } from 'electron';
import { EventEmitter } from 'events';

export class AppWindow extends BrowserWindow {
  /**
   * Crée une nouvelle instance de fenêtre principale
   * @param options - Options de configuration de la fenêtre
   */
  constructor(options: BrowserWindowConstructorOptions) {
    // Applique les options par défaut si non spécifiées
    const defaultOptions: BrowserWindowConstructorOptions = {
      backgroundColor: '#FFFFFF',
      titleBarStyle: 'default',
      minWidth: 800,
      minHeight: 600,
      webPreferences: {
        contextIsolation: true,
        nodeIntegration: false,
        // Autres options de sécurité par défaut
        ...options.webPreferences,
      },
      ...options,
    };

    super(defaultOptions);

    // Gestion du cycle de vie de la fenêtre
    this.registerWindowEvents();
  }

  /**
   * Enregistre les gestionnaires d'événements pour le cycle de vie de la fenêtre
   */
  private registerWindowEvents(): void {
    // Gestion du redimensionnement de la fenêtre
    this.on('resize', () => {
      // Sauvegarde des dimensions pour restauration au prochain démarrage
      const [width, height] = this.getSize();
      // Vous pouvez utiliser electron-store ici pour persister les dimensions
    });

    // Autres événements de cycle de vie au besoin
  }

  /**
   * Réinitialise la fenêtre aux dimensions par défaut
   */
  public resetToDefaultSize(): void {
    this.setSize(1280, 720);
    this.center();
  }
}