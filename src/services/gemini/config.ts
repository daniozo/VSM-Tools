/**
 * Configuration Multi-Modèles pour l'Agent VSM
 * 
 * Supporte : Gemini (Google) et Mistral
 * Configuration via variables d'environnement (.env)
 */

// ============================================
// TYPES
// ============================================

export type LLMProvider = 'gemini' | 'mistral'

export interface LLMConfig {
  provider: LLMProvider
  apiKey: string
  model: string
  endpoint: string
  generationConfig: {
    temperature: number
    maxOutputTokens: number
  }
}

// ============================================
// VARIABLES D'ENVIRONNEMENT
// ============================================

// Provider sélectionné (gemini ou mistral)
const LLM_PROVIDER = (import.meta.env.VITE_LLM_PROVIDER || 'gemini') as LLMProvider

// Gemini
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || ''
const GEMINI_MODEL = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.0-flash'

// Mistral
const MISTRAL_API_KEY = import.meta.env.VITE_MISTRAL_API_KEY || ''
const MISTRAL_MODEL = import.meta.env.VITE_MISTRAL_MODEL || 'mistral-small-latest'

// Paramètres généraux
const LLM_TEMPERATURE = parseFloat(import.meta.env.VITE_LLM_TEMPERATURE || '0.7')
const LLM_MAX_TOKENS = parseInt(import.meta.env.VITE_LLM_MAX_TOKENS || '2048', 10)

// ============================================
// CONFIGURATIONS PAR PROVIDER
// ============================================

const GEMINI_CONFIG_FULL: LLMConfig = {
  provider: 'gemini',
  apiKey: GEMINI_API_KEY,
  model: GEMINI_MODEL,
  endpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
  generationConfig: {
    temperature: LLM_TEMPERATURE,
    maxOutputTokens: LLM_MAX_TOKENS,
  },
}

const MISTRAL_CONFIG_FULL: LLMConfig = {
  provider: 'mistral',
  apiKey: MISTRAL_API_KEY,
  model: MISTRAL_MODEL,
  endpoint: 'https://api.mistral.ai/v1',
  generationConfig: {
    temperature: LLM_TEMPERATURE,
    maxOutputTokens: LLM_MAX_TOKENS,
  },
}

// ============================================
// EXPORT CONFIGURATION ACTIVE
// ============================================

/**
 * Retourne la configuration du provider actif
 */
export function getLLMConfig(): LLMConfig {
  switch (LLM_PROVIDER) {
    case 'mistral':
      return MISTRAL_CONFIG_FULL
    case 'gemini':
    default:
      return GEMINI_CONFIG_FULL
  }
}

/**
 * Configuration active (pour rétro-compatibilité)
 */
export const GEMINI_CONFIG = getLLMConfig()
export const GEMINI_API_KEY_EXPORT = GEMINI_API_KEY

/**
 * Vérifie si le provider est correctement configuré
 */
export function isLLMConfigured(): boolean {
  const config = getLLMConfig()
  return config.apiKey.length > 0 && config.apiKey !== 'AIzaSyDEFAULT_KEY_CHANGE_ME'
}

/**
 * Retourne le provider actif
 */
export function getActiveProvider(): LLMProvider {
  return LLM_PROVIDER
}
