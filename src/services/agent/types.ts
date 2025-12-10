/**
 * Types pour le système d'agent VSM
 * 
 * Définit les interfaces pour les outils, actions et résultats
 */

// ============================================
// TYPES DE BASE
// ============================================

export type ToolCategory = 
  | 'diagram'      // Manipulation du diagramme
  | 'node'         // Gestion des nœuds/étapes
  | 'inventory'    // Gestion des stocks
  | 'flow'         // Flux d'information
  | 'analysis'     // Analyse et métriques
  | 'improvement'  // Points d'amélioration
  | 'navigation'   // Navigation dans le canvas

export type ActionStatus = 'pending' | 'confirmed' | 'executed' | 'cancelled' | 'failed'

// ============================================
// DÉFINITION DES OUTILS
// ============================================

export interface ToolParameter {
  name: string
  type: 'string' | 'number' | 'boolean' | 'object' | 'array'
  description: string
  required: boolean
  enum?: string[]
  default?: any
}

export interface ToolDefinition {
  name: string
  description: string
  category: ToolCategory
  parameters: ToolParameter[]
  requiresConfirmation: boolean
  confirmationMessage?: (args: Record<string, any>) => string
}

// ============================================
// APPELS D'OUTILS
// ============================================

export interface ToolCall {
  id: string
  toolName: string
  arguments: Record<string, any>
  timestamp: Date
}

export interface ToolResult {
  toolCallId: string
  success: boolean
  result?: any
  error?: string
  message: string
}

// ============================================
// ACTIONS PENDANTES
// ============================================

export interface PendingAction {
  id: string
  toolCall: ToolCall
  status: ActionStatus
  confirmationMessage: string
  createdAt: Date
  expiresAt: Date
}

// ============================================
// MESSAGES AGENT
// ============================================

export type AgentMessageType = 
  | 'text'              // Texte simple
  | 'action_request'    // Demande de confirmation
  | 'action_result'     // Résultat d'action
  | 'thinking'          // Réflexion de l'agent
  | 'error'             // Erreur

export interface AgentMessage {
  id: string
  type: AgentMessageType
  content: string
  toolCalls?: ToolCall[]
  pendingActions?: PendingAction[]
  results?: ToolResult[]
  timestamp: Date
}

// ============================================
// RÉPONSE LLM AVEC TOOLS
// ============================================

export interface LLMToolCall {
  id: string
  type: 'function'
  function: {
    name: string
    arguments: string // JSON string
  }
}

export interface LLMResponse {
  content: string | null
  toolCalls: LLMToolCall[] | null
  finishReason: 'stop' | 'tool_calls' | 'length' | 'content_filter'
}

// ============================================
// CONTEXTE DE L'AGENT
// ============================================

export interface AgentContext {
  projectId?: string
  projectName?: string
  diagramSummary?: DiagramSummary
  selectedElement?: {
    type: string
    id: string
    name?: string
  }
  conversationHistory: Array<{
    role: 'user' | 'assistant' | 'tool'
    content: string
  }>
}

export interface DiagramSummary {
  name: string
  nodesCount: number
  nodes: Array<{
    id: string
    name: string
    type: string
    cycleTime?: number
    uptime?: number
  }>
  inventoriesCount: number
  flowSequencesCount: number
  totalCycleTime?: number
  totalLeadTime?: number
  efficiency?: number
}

// ============================================
// ÉVÉNEMENTS UI
// ============================================

export interface AgentUIEvent {
  type: 'select_node' | 'zoom_to' | 'highlight' | 'open_config' | 'refresh'
  payload?: any
}
