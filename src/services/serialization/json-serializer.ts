/**
 * Service de sérialisation JSON pour les diagrammes VSM
 * 
 * Convertit les diagrammes VSM au format JSON pour :
 * - Communication avec le VSM Engine (Spring Boot)
 * - Stockage alternatif
 * - Échanges API
 * 
 * @date 6 décembre 2025
 * @version 1.0
 */

import { VSMDiagram } from '../types/vsm-model'
import { validateVSMDiagram } from '../types/vsm-validation'

/**
 * Sérialise un diagramme VSM en JSON
 */
export class JSONSerializer {
  /**
   * Convertit un VSMDiagram en chaîne JSON
   * @param diagram Diagramme à sérialiser
   * @param pretty Si true, format indenté (pour debug/lisibilité)
   * @returns Chaîne JSON
   */
  public serializeToJSON(diagram: VSMDiagram, pretty: boolean = false): string {
    // Validation avant sérialisation
    const validation = validateVSMDiagram(diagram)
    if (!validation.success) {
      throw new Error(`Validation échouée : ${JSON.stringify(validation.error.issues)}`)
    }

    return pretty
      ? JSON.stringify(diagram, null, 2)
      : JSON.stringify(diagram)
  }

  /**
   * Désérialise un JSON en VSMDiagram
   * @param json Chaîne JSON à parser
   * @returns Diagramme VSM
   * @throws Error si le JSON est invalide ou ne passe pas la validation
   */
  public deserializeFromJSON(json: string): VSMDiagram {
    let parsed: unknown

    try {
      parsed = JSON.parse(json)
    } catch (error) {
      throw new Error(`Erreur de parsing JSON : ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
    }

    // Validation du diagramme
    const validation = validateVSMDiagram(parsed)

    if (!validation.success) {
      throw new Error(`Validation échouée : ${JSON.stringify(validation.error.issues)}`)
    }

    return validation.data
  }

  /**
   * Convertit un VSMDiagram en objet JavaScript (non stringifié)
     * Utile pour les API ou transformations intermédiaires
     * @param diagram Diagramme à convertir
     * @returns Objet JavaScript
     */
  public toObject(diagram: VSMDiagram): object {
    // Validation avant conversion
    const validation = validateVSMDiagram(diagram)
    if (!validation.success) {
      throw new Error(`Validation échouée : ${JSON.stringify(validation.error.issues)}`)
    }

    // Simple conversion en objet (déjà un objet, mais on valide)
    return { ...diagram }
  }

  /**
   * Convertit un objet JavaScript en VSMDiagram
   * @param obj Objet à convertir
   * @returns Diagramme VSM validé
   */
  public fromObject(obj: unknown): VSMDiagram {
    const validation = validateVSMDiagram(obj)

    if (!validation.success) {
      throw new Error(`Validation échouée : ${JSON.stringify(validation.error.issues)}`)
    }

    return validation.data
  }
}

/**
 * Instance singleton du serializer JSON
 */
export const jsonSerializer = new JSONSerializer()
