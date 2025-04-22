/**
 * Service de calcul pour les indicateurs VSM
 * Contient les fonctions pures pour calculer tous les indicateurs VSM
 */
import {
  VsmElementType,
  ProcessData,
  StockData
} from '../../shared/types/vsm-elements';

import {
  VsmMap,
  VsmComparison
} from '../../shared/types/vsm-map';

export class CalculationService {
  /**
   * Calcule le pourcentage de valeur ajoutée
   * %VA = (Temps VA / Lead time total) × 100
   * 
   * @param map - Carte VSM à analyser
   * @returns Pourcentage de valeur ajoutée (0-100)
   */
  public calculateValueAddedPercentage(map: VsmMap): number {
    const totalVA = this.calculateTotalValueAddedTime(map);
    const totalLeadTime = this.calculateTotalLeadTime(map);

    if (totalLeadTime === 0) return 0;

    return (totalVA / totalLeadTime) * 100;
  }

  /**
   * Calcule le temps total à valeur ajoutée (en secondes)
   * 
   * @param map - Carte VSM à analyser
   * @returns Temps total à valeur ajoutée en secondes
   */
  public calculateTotalValueAddedTime(map: VsmMap): number {
    return map.elements
      .filter((element): element is ProcessData =>
        element.type === VsmElementType.PROCESS)
      .reduce((total, process) => total + process.valueAddedTime, 0);
  }

  /**
   * Calcule le temps de traversée total (lead time) en secondes
   * Lead time = Somme des temps de passage par étape + Somme des temps d'attente entre les étapes
   * 
   * @param map - Carte VSM à analyser
   * @returns Lead time total en secondes
   */
  public calculateTotalLeadTime(map: VsmMap): number {
    // Temps de processus (inclut VA et NVA)
    const processingTime = map.elements
      .filter((element): element is ProcessData =>
        element.type === VsmElementType.PROCESS)
      .reduce((total, process) =>
        total + process.valueAddedTime + process.nonValueAddedTime, 0);

    // Temps de stockage (en secondes, leadTime est en jours)
    const waitingTime = map.elements
      .filter((element): element is StockData =>
        element.type === VsmElementType.STOCK)
      .reduce((total, stock) =>
        total + (stock.leadTime * 24 * 60 * 60), 0);

    return processingTime + waitingTime;
  }

  /**
   * Calcule le Takt Time en secondes
   * Takt time = Temps disponible / Demande client
   * 
   * @param availableTime - Temps disponible en secondes
   * @param customerDemand - Demande client en unités
   * @returns Takt time en secondes
   */
  public calculateTaktTime(availableTime: number, customerDemand: number): number {
    if (customerDemand === 0) return 0;
    return availableTime / customerDemand;
  }

  /**
   * Calcule le taux d'utilisation des postes
   * % Taux d'utilisation = (Temps de cycle / Takt time) × 100
   * 
   * @param cycleTime - Temps de cycle du poste en secondes
   * @param taktTime - Takt time en secondes
   * @returns Taux d'utilisation en pourcentage
   */
  public calculateUtilizationRate(cycleTime: number, taktTime: number): number {
    if (taktTime === 0) return 0;
    return (cycleTime / taktTime) * 100;
  }

  /**
   * Calcule le Taux de Rendement Synthétique (TRS)
   * TRS = Disponibilité × Performance × Qualité × 100
   * 
   * @param availability - Disponibilité (0-1)
   * @param performance - Performance (0-1)
   * @param quality - Qualité (0-1)
   * @returns TRS en pourcentage
   */
  public calculateOEE(availability: number, performance: number, quality: number): number {
    return availability * performance * quality * 100;
  }

  /**
   * Identifie les goulots d'étranglement (processus où TC > Takt Time)
   * 
   * @param map - Carte VSM à analyser
   * @param taktTime - Takt time en secondes
   * @returns Liste des IDs de processus identifiés comme goulots
   */
  public identifyBottlenecks(map: VsmMap, taktTime: number): string[] {
    if (taktTime === 0) return [];

    return map.elements
      .filter((element): element is ProcessData =>
        element.type === VsmElementType.PROCESS && element.cycleTime > taktTime)
      .map(process => process.id);
  }

  /**
   * Calcule tous les indicateurs pour une carte VSM
   * 
   * @param map - Carte VSM à analyser
   * @returns Carte VSM avec indicateurs calculés
   */
  public calculateAllIndicators(map: VsmMap): VsmMap {
    // Copie de la carte pour ne pas modifier l'original
    const updatedMap = { ...map };

    // Calcul du takt time si les paramètres sont disponibles
    const taktTime = updatedMap.settings.availableTime && updatedMap.settings.customerDemand
      ? this.calculateTaktTime(updatedMap.settings.availableTime, updatedMap.settings.customerDemand)
      : 0;

    // Calcul des indicateurs
    const totalLeadTime = this.calculateTotalLeadTime(updatedMap);
    const totalValueAddedTime = this.calculateTotalValueAddedTime(updatedMap);
    const valueAddedPercentage = this.calculateValueAddedPercentage(updatedMap);
    const bottleneckProcessIds = this.identifyBottlenecks(updatedMap, taktTime);

    // Mise à jour des indicateurs
    updatedMap.indicators = {
      totalLeadTime,
      totalValueAddedTime,
      valueAddedPercentage,
      taktTime,
      bottleneckProcessIds,
    };

    return updatedMap;
  }

  /**
   * Calcule les statistiques comparatives entre l'état actuel et futur
   * 
   * @param currentMap - Carte VSM d'état actuel
   * @param futureMap - Carte VSM d'état futur
   * @returns Statistiques comparatives
   */
  public compareCurrentAndFutureMaps(currentMap: VsmMap, futureMap: VsmMap): VsmComparison {
    // S'assurer que les indicateurs sont calculés
    const current = this.calculateAllIndicators(currentMap);
    const future = this.calculateAllIndicators(futureMap);

    // Calcul des améliorations
    const leadTimeReduction = this.calculatePercentageChange(
      current.indicators?.totalLeadTime || 0,
      future.indicators?.totalLeadTime || 0
    );

    const valueAddedImprovement =
      (future.indicators?.valueAddedPercentage || 0) -
      (current.indicators?.valueAddedPercentage || 0);

    // Calcul de la réduction des stocks
    const currentInventory = this.calculateTotalInventory(currentMap);
    const futureInventory = this.calculateTotalInventory(futureMap);
    const inventoryReduction = this.calculatePercentageChange(
      currentInventory,
      futureInventory
    );

    // Calcul de l'amélioration de la capacité
    const currentCapacity = this.calculateAverageProcessCapacity(currentMap);
    const futureCapacity = this.calculateAverageProcessCapacity(futureMap);
    const capacityImprovement = this.calculatePercentageChange(
      currentCapacity,
      futureCapacity,
      true // Inversion car une augmentation est positive pour la capacité
    );

    return {
      currentMapId: currentMap.id,
      futureMapId: futureMap.id,
      indicators: {
        leadTimeReduction,
        valueAddedImprovement,
        inventoryReduction,
        capacityImprovement,
      },
    };
  }

  /**
   * Calcule le stock total
   * 
   * @param map - Carte VSM à analyser
   * @returns Quantité totale en stock
   */
  private calculateTotalInventory(map: VsmMap): number {
    return map.elements
      .filter((element): element is StockData => element.type === VsmElementType.STOCK)
      .reduce((total, stock) => total + stock.quantity, 0);
  }

  /**
   * Calcule la capacité moyenne des processus
   * (inverse du temps de cycle moyen)
   * 
   * @param map - Carte VSM à analyser
   * @returns Capacité moyenne (unités/seconde)
   */
  private calculateAverageProcessCapacity(map: VsmMap): number {
    const processes = map.elements
      .filter((element): element is ProcessData => element.type === VsmElementType.PROCESS);

    if (processes.length === 0) return 0;

    const avgCycleTime = processes.reduce(
      (sum, process) => sum + process.cycleTime, 0
    ) / processes.length;

    return avgCycleTime === 0 ? 0 : 1 / avgCycleTime;
  }

  /**
   * Calcule le pourcentage de changement entre deux valeurs
   * 
   * @param oldValue - Valeur initiale
   * @param newValue - Nouvelle valeur
   * @param invert - Inverser le signe (true si une diminution est négative)
   * @returns Pourcentage de changement
   */
  private calculatePercentageChange(
    oldValue: number,
    newValue: number,
    invert: boolean = false
  ): number {
    if (oldValue === 0) return 0;

    const change = ((newValue - oldValue) / oldValue) * 100;
    return invert ? change : -change; // Inversion si nécessaire
  }
}