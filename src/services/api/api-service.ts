/**
 * Service API pour communiquer avec le backend
 * Utilise Axios pour les requêtes HTTP et gère l'authentification
 */
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { VsmMap } from '../../shared/types/vsm-map';
import { ElectronAPI } from '../../shared/types/electron-api';

// Récupération de l'API Electron depuis window
declare global {
  interface Window {
    electron: ElectronAPI;
  }
}

/**
 * Options de configuration de l'API
 */
export interface ApiConfig {
  baseUrl: string;
  timeout?: number;
}

/**
 * Structure de réponse API standard
 */
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Information utilisateur après authentification
 */
export interface UserInfo {
  id: number;
  username: string;
  displayName: string;
}

export class ApiService {
  private httpClient: AxiosInstance;
  private baseUrl: string;
  private authToken: string | null = null;
  private currentUser: UserInfo | null = null;

  /**
   * Crée une nouvelle instance du service API
   * 
   * @param config - Configuration de l'API
   */
  constructor(config: ApiConfig) {
    this.baseUrl = config.baseUrl;

    // Création du client HTTP avec Axios
    this.httpClient = axios.create({
      baseURL: this.baseUrl,
      timeout: config.timeout || 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Configuration des intercepteurs
    this.setupInterceptors();
  }

  /**
   * Configure les intercepteurs Axios pour la gestion des erreurs et tokens
   */
  private setupInterceptors(): void {
    // Intercepteur de requête pour ajouter le token d'authentification
    this.httpClient.interceptors.request.use(
      (config) => {
        if (this.authToken) {
          config.headers['Authorization'] = `Bearer ${this.authToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Intercepteur de réponse pour gérer les erreurs
    this.httpClient.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // Gestion de l'expiration du token (401 Unauthorized)
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            // Tentative de rafraîchissement du token
            await this.refreshToken();

            // Mise à jour du token dans la requête originale
            originalRequest.headers['Authorization'] = `Bearer ${this.authToken}`;

            // Réessai de la requête originale
            return this.httpClient(originalRequest);
          } catch (refreshError) {
            // Échec du rafraîchissement, déconnexion
            this.logout();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Authentifie l'utilisateur auprès du backend
   * 
   * @param username - Nom d'utilisateur
   * @param password - Mot de passe
   * @returns Informations utilisateur
   */
  public async login(username: string, password: string): Promise<UserInfo> {
    try {
      const response = await window.electron.auth.login(username, password, this.baseUrl);

      if (response.success) {
        this.authToken = response.token;
        this.currentUser = response.user;
        return response.user;
      } else {
        throw new Error('Échec de l\'authentification');
      }
    } catch (error) {
      console.error('Erreur lors de l\'authentification :', error);
      throw error;
    }
  }

  /**
   * Déconnecte l'utilisateur
   */
  public async logout(): Promise<void> {
    try {
      await window.electron.auth.logout();
      this.authToken = null;
      this.currentUser = null;
    } catch (error) {
      console.error('Erreur lors de la déconnexion :', error);
      throw error;
    }
  }

  /**
   * Vérifie si l'utilisateur est authentifié
   * 
   * @returns Statut d'authentification
   */
  public async checkAuthentication(): Promise<boolean> {
    try {
      const result = await window.electron.auth.checkToken();

      if (result.isAuthenticated && result.token) {
        this.authToken = result.token;
        return true;
      }

      return false;
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'authentification :', error);
      return false;
    }
  }

  /**
   * Tente de rafraîchir le token d'authentification
   * À implémenter en fonction du système d'authentification du backend
   */
  private async refreshToken(): Promise<void> {
    // Dans une implémentation réelle, cela ferait un appel au backend
    throw new Error('Méthode non implémentée');
  }

  /**
   * Récupère la liste des cartes VSM depuis le backend
   * 
   * @returns Liste des cartes VSM
   */
  public async getMaps(): Promise<VsmMap[]> {
    try {
      const response = await this.httpClient.get<ApiResponse<VsmMap[]>>('/api/maps');

      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Erreur lors de la récupération des cartes');
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des cartes :', error);
      throw error;
    }
  }

  /**
   * Récupère une carte VSM spécifique depuis le backend
   * 
   * @param mapId - ID de la carte à récupérer
   * @returns Carte VSMVsmMap[]> {
   */
  public async getMap(mapId: string): Promise<VsmMap> {
    try {
      const response = await this.httpClient.get<ApiResponse<VsmMap>>(`/api/maps/${mapId}`);

      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Erreur lors de la récupération de la carte');
      }
    } catch (error) {
      console.error(`Erreur lors de la récupération de la carte ${mapId} :`, error);
      throw error;
    }
  }

  /**
   * Sauvegarde une carte VSM sur le backend
   * 
   * @param map - Carte VSM à sauvegarder
   * @returns Carte VSM mise à jour
   */
  public async saveMap(map: VsmMap): Promise<VsmMap> {
    try {
      let response: AxiosResponse<ApiResponse<VsmMap>>;

      // Si la carte a un ID, mise à jour, sinon création
      if (map.id) {
        response = await this.httpClient.put<ApiResponse<VsmMap>>(
          `/api/maps/${map.id}`,
          map
        );
      } else {
        response = await this.httpClient.post<ApiResponse<VsmMap>>(
          '/api/maps',
          map
        );
      }

      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Erreur lors de la sauvegarde de la carte');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la carte :', error);
      throw error;
    }
  }

  /**
   * Supprime une carte VSM sur le backend
   * 
   * @param mapId - ID de la carte à supprimer
   * @returns Succès de l'opération
   */
  public async deleteMap(mapId: string): Promise<boolean> {
    try {
      const response = await this.httpClient.delete<ApiResponse<boolean>>(`/api/maps/${mapId}`);

      return response.data.success;
    } catch (error) {
      console.error(`Erreur lors de la suppression de la carte ${mapId} :`, error);
      throw error;
    }
  }

  /**
   * Demande le calcul des indicateurs au backend
   * 
   * @param map - Carte VSM pour laquelle calculer les indicateurs
   * @returns Carte VSM avec indicateurs calculés
   */
  public async calculateIndicators(map: VsmMap): Promise<VsmMap> {
    try {
      const response = await this.httpClient.post<ApiResponse<VsmMap>>(
        `/api/maps/${map.id}/calculate`,
        map
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Erreur lors du calcul des indicateurs');
      }
    } catch (error) {
      console.error('Erreur lors du calcul des indicateurs :', error);
      throw error;
    }
  }
}