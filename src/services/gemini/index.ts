/**
 * Service pour interagir avec l'API Google Gemini
 */

import { GEMINI_CONFIG } from './config';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
}

/**
 * Service Gemini pour le chatbot
 */
export class GeminiService {
  private apiKey: string;
  private endpoint: string;

  constructor() {
    this.apiKey = GEMINI_CONFIG.apiKey;
    this.endpoint = GEMINI_CONFIG.endpoint;
  }

  /**
   * Vérifie si la clé API est configurée
   */
  isConfigured(): boolean {
    return this.apiKey !== 'AIzaSyDEFAULT_KEY_CHANGE_ME' && this.apiKey.length > 0;
  }

  /**
   * Génère une réponse du chatbot
   */
  async generateResponse(
    userMessage: string,
    context?: string
  ): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('Clé API Gemini non configurée');
    }

    try {
      const systemContext = context
        ? `Contexte VSM:\n${context}\n\nTu es un assistant expert en Value Stream Mapping (VSM) et amélioration continue. Aide l'utilisateur avec ses questions sur le VSM.\n\n`
        : 'Tu es un assistant expert en Value Stream Mapping (VSM) et amélioration continue. Aide l\'utilisateur avec ses questions sur le VSM.\n\n';

      const response = await fetch(
        `${this.endpoint}/${GEMINI_CONFIG.model}:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `${systemContext}Question: ${userMessage}`,
                  },
                ],
              },
            ],
            generationConfig: GEMINI_CONFIG.generationConfig,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Erreur API Gemini: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`
        );
      }

      const data: GeminiResponse = await response.json();
      const text =
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        'Désolé, je n\'ai pas pu générer une réponse.';

      return text;
    } catch (error) {
      console.error('Erreur lors de l\'appel à Gemini:', error);
      throw error;
    }
  }
}

// Instance singleton
export const geminiService = new GeminiService();
