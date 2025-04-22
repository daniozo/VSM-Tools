/**
 * Service de stockage local pour sauvegarder et charger les cartes VSM
 * Utilise l'API fs d'Electron pour gérer les fichiers
 */
import { ipcRenderer } from 'electron';
import { VsmMap, VsmMapState } from '../../shared/types/vsm-map';
import { ElectronAPI } from '../../shared/types/electron-api';
import { v4 as uuidv4 } from 'uuid';

// Récupération de l'API Electron depuis window
declare global {
  interface Window {
    electron: ElectronAPI;
  }
}

export class StorageService {
  /**
   * Sauvegarde une carte VSM dans un fichier
   * 
   * @param map - Carte VSM à sauvegarder
   * @param filePath - Chemin du fichier où enregistrer la carte (facultatif)
   * @returns Promise avec le résultat de la sauvegarde et le chemin du fichier
   */
  public async saveMap(map: VsmMap, filePath?: string): Promise<{ success: boolean; filePath?: string }> {
    try {
      // Mise à jour de la date de modification
      const updatedMap: VsmMap = {
        ...map,
        metaData: {
          ...map.metaData,
          modifiedDate: new Date().toISOString(),
        },
      };

      // Si un chemin est fourni, utiliser save, sinon saveAs
      if (filePath) {
        return await window.electron.file.save(filePath, updatedMap);
      } else {
        return await window.electron.file.saveAs(updatedMap);
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la carte :', error);
      return { success: false };
    }
  }

  /**
   * Charge une carte VSM depuis un fichier
   * 
   * @returns Promise avec la carte chargée et le chemin du fichier, ou null si l'opération est annulée
   */
  public async loadMap(): Promise<{ map: VsmMap; filePath: string } | null> {
    try {
      const result = await window.electron.file.open();

      if (!result) {
        return null; // Utilisateur a annulé
      }

      const { content, filePath } = result;

      // Validation basique du contenu
      if (!this.isValidVsmMap(content)) {
        throw new Error('Le fichier ne contient pas une carte VSM valide');
      }

      return { map: content as VsmMap, filePath };
    } catch (error) {
      console.error('Erreur lors du chargement de la carte :', error);
      throw error;
    }
  }

  /**
   * Crée une nouvelle carte VSM vierge
   * 
   * @param name - Nom de la carte
   * @param author - Auteur de la carte
   * @returns Nouvelle carte VSM
   */
  public createNewMap(name: string, author: string): VsmMap {
    const now = new Date().toISOString();

    return {
      id: uuidv4(),
      metaData: {
        name,
        author,
        createdDate: now,
        modifiedDate: now,
        appVersion: '1.0.0', // Devrait être récupéré dynamiquement
        description: '',
      },
      state: VsmMapState.CURRENT,
      settings: {
        availableTime: 8 * 60 * 60, // 8 heures par défaut (en secondes)
        customerDemand: 100, // Demande par défaut
        timeUnit: 'secondes',
        quantityUnit: 'unités',
        dateFormat: 'DD/MM/YYYY',
        decimalPlaces: 2,
        defaultColors: {
          process: '#FFFFFF',
          stock: '#FFFF99',
          supplier: '#99CCFF',
          customer: '#99CCFF',
          kaizenBurst: '#FF9966',
          dataBox: '#CCFFCC',
        },
      },
      elements: [],
      actions: [],
      indicators: {
        totalLeadTime: 0,
        totalValueAddedTime: 0,
        valueAddedPercentage: 0,
        taktTime: 0,
        bottleneckProcessIds: [],
      },
    };
  }

  /**
   * Crée une carte d'état futur basée sur une carte d'état actuel
   * 
   * @param currentMap - Carte d'état actuel
   * @returns Nouvelle carte d'état futur
   */
  public createFutureStateMap(currentMap: VsmMap): VsmMap {
    const now = new Date().toISOString();
    const futureMapId = uuidv4();

    // Création d'une copie profonde de la carte actuelle
    const futureMap: VsmMap = JSON.parse(JSON.stringify(currentMap));

    // Mise à jour des métadonnées
    futureMap.id = futureMapId;
    futureMap.state = VsmMapState.FUTURE;
    futureMap.relatedMapId = currentMap.id;
    futureMap.metaData = {
      ...futureMap.metaData,
      name: `${futureMap.metaData.name} (État Futur)`,
      createdDate: now,
      modifiedDate: now,
    };

    // Mise à jour de la carte actuelle pour référencer la carte future
    const updatedCurrentMap: VsmMap = {
      ...currentMap,
      relatedMapId: futureMapId,
    };

    return futureMap;
  }

  /**
   * Vérifie si l'objet fourni est une carte VSM valide
   * Validation basique, à enrichir selon les besoins
   * 
   * @param obj - Objet à valider
   * @returns true si l'objet est une carte VSM valide
   */
  private isValidVsmMap(obj: any): boolean {
    return (
      obj &&
      typeof obj === 'object' &&
      obj.metaData &&
      obj.elements &&
      Array.isArray(obj.elements)
    );
  }
}