/**
 * AgentChatAssistant - Assistant conversationnel avec capacités agentiques
 * 
 * Fonctionnalités :
 * - Interface de chat avec historique des messages
 * - Intégration avec le service Agent VSM
 * - Exécution d'outils sur le diagramme
 * - Confirmation des actions modifiantes
 * - Affichage des résultats d'exécution
 */

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/renderer/components/ui/button'
import { Input } from '@/renderer/components/ui/input'
import { ScrollArea } from '@/renderer/components/ui/scroll-area'
import { Badge } from '@/renderer/components/ui/badge'
import { Card, CardContent } from '@/renderer/components/ui/card'
import {
  Send,
  Loader2,
  Bot,
  User,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Play,
  X,
  Sparkles,
  RotateCcw,
  Wrench
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { agentService, PendingAction, ToolResult, AgentUIEvent } from '@/services/agent'
import { useVsmStore } from '@/store/vsmStore'

interface DisplayMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  type?: 'text' | 'action_request' | 'action_result' | 'error' | 'thinking'
  pendingActions?: PendingAction[]
  results?: ToolResult[]
  isProcessed?: boolean
}

interface AgentChatAssistantProps {
  width?: number
  className?: string
  onUIEvent?: (event: AgentUIEvent) => void
}

export const AgentChatAssistant: React.FC<AgentChatAssistantProps> = ({
  width = 320,
  className,
  onUIEvent
}) => {
  const [messages, setMessages] = useState<DisplayMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Bonjour ! Je suis votre assistant VSM intelligent. Je peux analyser votre diagramme, identifier des problèmes et proposer des améliorations.\n\nEssayez par exemple :\n• "Analyse mon diagramme"\n• "Quels sont les goulots d\'étranglement ?"\n• "Ajoute une étape de contrôle qualité"',
      timestamp: new Date(),
      type: 'text'
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isConfigured] = useState(agentService.isConfigured())

  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const diagram = useVsmStore(state => state.diagram)

  // Configurer le callback UI
  useEffect(() => {
    if (onUIEvent) {
      agentService.setUIEventCallback(onUIEvent)
    }
  }, [onUIEvent])

  // Auto-scroll vers le bas
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages])

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    if (!isConfigured) {
      setError('Service non configuré. Veuillez contacter l\'administrateur.')
      return
    }

    const userMessage: DisplayMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
      type: 'text'
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)
    setError(null)

    try {
      const response = await agentService.processMessage(userMessage.content)

      const assistantMessage: DisplayMessage = {
        id: response.id,
        role: 'assistant',
        content: response.content,
        timestamp: response.timestamp,
        type: response.type,
        pendingActions: response.pendingActions,
        results: response.results
      }

      setMessages(prev => [...prev, assistantMessage])

    } catch (err) {
      console.error('Erreur agent:', err)
      setError(err instanceof Error ? err.message : 'Erreur inconnue')

      const errorMessage: DisplayMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Désolé, une erreur s\'est produite. Veuillez réessayer.',
        timestamp: new Date(),
        type: 'error'
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleConfirmAction = async (actionId: string) => {
    setIsLoading(true)
    try {
      const result = await agentService.confirmAction(actionId)

      // Mettre à jour le message avec l'action confirmée
      setMessages(prev => prev.map(msg => {
        if (msg.pendingActions?.some(a => a.id === actionId)) {
          return {
            ...msg,
            pendingActions: msg.pendingActions?.map(a =>
              a.id === actionId ? { ...a, status: result.success ? 'executed' : 'failed' } : a
            ),
            results: [...(msg.results || []), result],
            isProcessed: true
          }
        }
        return msg
      }))

      // Ajouter un message de résultat
      const resultMessage: DisplayMessage = {
        id: `result-${Date.now()}`,
        role: 'system',
        content: result.success
          ? `✅ ${result.message}`
          : `❌ ${result.message}`,
        timestamp: new Date(),
        type: 'action_result'
      }
      setMessages(prev => [...prev, resultMessage])

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la confirmation')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelAction = (actionId: string) => {
    agentService.cancelAction(actionId)

    setMessages(prev => prev.map(msg => {
      if (msg.pendingActions?.some(a => a.id === actionId)) {
        return {
          ...msg,
          pendingActions: msg.pendingActions?.map(a =>
            a.id === actionId ? { ...a, status: 'cancelled' as const } : a
          ),
          isProcessed: true
        }
      }
      return msg
    }))
  }

  const handleResetConversation = () => {
    agentService.resetConversation()
    setMessages([{
      id: '1',
      role: 'assistant',
      content: 'Conversation réinitialisée. Comment puis-je vous aider ?',
      timestamp: new Date(),
      type: 'text'
    }])
    setError(null)
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // Suggestions rapides
  const quickActions = [
    { label: 'Analyser', query: 'Analyse mon diagramme VSM' },
    { label: 'Goulots', query: 'Identifie les goulots d\'étranglement' },
    { label: 'Métriques', query: 'Calcule les métriques VSM' },
  ]

  return (
    <div
      style={{ width }}
      className={cn('flex flex-col bg-background border-l h-full', className)}
    >
      {/* Header */}
      <div className="h-9 px-3 border-b flex items-center justify-between bg-muted/30">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Assistant IA</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={handleResetConversation}
          title="Nouvelle conversation"
        >
          <RotateCcw className="h-3 w-3" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-3">
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id}>
              {/* Message de l'utilisateur */}
              {message.role === 'user' && (
                <div className="flex gap-2 justify-end">
                  <div className="rounded-lg px-3 py-2 max-w-[85%] bg-primary text-primary-foreground">
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-accent flex items-center justify-center">
                    <User className="h-3.5 w-3.5" />
                  </div>
                </div>
              )}

              {/* Message de l'assistant */}
              {message.role === 'assistant' && (
                <div className="flex gap-2 justify-start">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="max-w-[85%] space-y-2">
                    <div className={cn(
                      "rounded-lg px-3 py-2",
                      message.type === 'error' ? 'bg-destructive/10' : 'bg-muted'
                    )}>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>

                    {/* Actions en attente de confirmation */}
                    {message.pendingActions && message.pendingActions.length > 0 && (
                      <div className="space-y-2">
                        {message.pendingActions.map(action => (
                          <Card key={action.id} className="border-primary/30">
                            <CardContent className="p-3">
                              <div className="flex items-start gap-2">
                                <Wrench className="h-4 w-4 text-primary mt-0.5" />
                                <div className="flex-1">
                                  <p className="text-sm font-medium">
                                    {action.toolCall.toolName.replace(/_/g, ' ')}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {action.confirmationMessage}
                                  </p>

                                  {action.status === 'pending' && !message.isProcessed && (
                                    <div className="flex gap-2 mt-2">
                                      <Button
                                        size="sm"
                                        className="h-7 text-xs"
                                        onClick={() => handleConfirmAction(action.id)}
                                        disabled={isLoading}
                                      >
                                        <Play className="h-3 w-3 mr-1" />
                                        Confirmer
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-7 text-xs"
                                        onClick={() => handleCancelAction(action.id)}
                                        disabled={isLoading}
                                      >
                                        <X className="h-3 w-3 mr-1" />
                                        Annuler
                                      </Button>
                                    </div>
                                  )}

                                  {action.status === 'executed' && (
                                    <Badge className="mt-2 bg-green-500/20 text-green-700">
                                      <CheckCircle2 className="h-3 w-3 mr-1" />
                                      Exécuté
                                    </Badge>
                                  )}

                                  {action.status === 'cancelled' && (
                                    <Badge variant="secondary" className="mt-2">
                                      <XCircle className="h-3 w-3 mr-1" />
                                      Annulé
                                    </Badge>
                                  )}

                                  {action.status === 'failed' && (
                                    <Badge variant="destructive" className="mt-2">
                                      <XCircle className="h-3 w-3 mr-1" />
                                      Échoué
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}

                    {/* Résultats d'exécution directe */}
                    {message.results && message.results.length > 0 && !message.pendingActions?.length && (
                      <div className="space-y-1">
                        {message.results.map((result, idx) => (
                          <div
                            key={idx}
                            className={cn(
                              "text-xs px-2 py-1 rounded",
                              result.success ? "bg-green-500/10 text-green-700" : "bg-red-500/10 text-red-700"
                            )}
                          >
                            {result.success ? '✅' : '❌'} {result.message}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Message système */}
              {message.role === 'system' && (
                <div className="flex justify-center">
                  <div className={cn(
                    "text-xs px-3 py-1 rounded-full",
                    message.content.startsWith('✅')
                      ? "bg-green-500/10 text-green-700"
                      : message.content.startsWith('❌')
                        ? "bg-red-500/10 text-red-700"
                        : "bg-muted text-muted-foreground"
                  )}>
                    {message.content}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex gap-2 justify-start">
              <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="h-3.5 w-3.5 text-primary" />
              </div>
              <div className="rounded-lg px-3 py-2 bg-muted">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">Réflexion...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Quick actions */}
      {diagram && messages.length <= 2 && (
        <div className="px-3 py-2 border-t flex gap-2 flex-wrap">
          {quickActions.map((action, idx) => (
            <Button
              key={idx}
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => {
                setInputValue(action.query)
                inputRef.current?.focus()
              }}
            >
              {action.label}
            </Button>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="px-3 py-2 bg-destructive/10 border-t border-destructive/20">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-xs text-destructive">{error}</p>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            placeholder={
              !isConfigured
                ? "Service non disponible"
                : !diagram
                  ? "Ouvrez un diagramme d'abord..."
                  : "Posez votre question..."
            }
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading || !isConfigured}
            className="flex-1 h-9"
          />
          <Button
            size="icon"
            className="h-9 w-9"
            onClick={sendMessage}
            disabled={isLoading || !inputValue.trim() || !isConfigured}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        {!isConfigured && (
          <p className="text-xs text-muted-foreground mt-2">
            L'assistant nécessite une configuration API.
          </p>
        )}
      </div>
    </div>
  )
}

export default AgentChatAssistant
