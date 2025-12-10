/**
 * Store pour l'état du chat de l'assistant IA
 * Persiste les messages entre les changements d'onglets/panneaux
 */

import { create } from 'zustand'
import { PendingAction, ToolResult } from '@/services/agent'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  type?: 'text' | 'action_request' | 'action_result' | 'error' | 'thinking'
  pendingActions?: PendingAction[]
  results?: ToolResult[]
  isProcessed?: boolean
}

interface ChatState {
  messages: ChatMessage[]
  inputValue: string
  error: string | null

  // Actions
  addMessage: (message: ChatMessage) => void
  updateMessage: (id: string, updates: Partial<ChatMessage>) => void
  setInputValue: (value: string) => void
  setError: (error: string | null) => void
  resetConversation: () => void
}

const initialMessage: ChatMessage = {
  id: '1',
  role: 'assistant',
  content: `Bonjour ! Je suis votre assistant VSM intelligent. Je peux analyser votre diagramme, identifier des problèmes et proposer des améliorations.

**Essayez par exemple :**
- "Analyse mon diagramme"
- "Quels sont les goulots d'étranglement ?"
- "Ajoute une étape de contrôle qualité"`,
  timestamp: new Date(),
  type: 'text'
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [initialMessage],
  inputValue: '',
  error: null,

  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message]
  })),

  updateMessage: (id, updates) => set((state) => ({
    messages: state.messages.map(msg =>
      msg.id === id ? { ...msg, ...updates } : msg
    )
  })),

  setInputValue: (value) => set({ inputValue: value }),

  setError: (error) => set({ error }),

  resetConversation: () => set({
    messages: [{
      id: Date.now().toString(),
      role: 'assistant',
      content: 'Conversation réinitialisée. Comment puis-je vous aider ?',
      timestamp: new Date(),
      type: 'text'
    }],
    error: null
  })
}))
