/**
 * Configuration de l'API Gemini
 * IMPORTANT: En production, cette clé devrait être stockée côté serveur
 */

export const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyDEFAULT_KEY_CHANGE_ME';

export const GEMINI_CONFIG = {
  apiKey: GEMINI_API_KEY,
  model: 'gemini-2.5-flash-preview-09-2025',
  endpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
  generationConfig: {
    temperature: 0.7,
    maxOutputTokens: 1024,
  },
};
