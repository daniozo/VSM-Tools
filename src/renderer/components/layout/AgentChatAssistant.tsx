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
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Button } from '@/renderer/components/ui/button'
import { ScrollArea } from '@/renderer/components/ui/scroll-area'
import { Badge } from '@/renderer/components/ui/badge'
import { Card, CardContent } from '@/renderer/components/ui/card'
import {
  SendHorizontal,
  Loader2,
  Bot,
  User,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Play,
  X,
  RotateCcw,
  Wrench,
  ListTree
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { agentService, AgentUIEvent } from '@/services/agent'
import { useVsmStore } from '@/store/vsmStore'
import { useChatStore, ChatMessage } from '@/store/chatStore'
import { VSM_TOOLS } from '@/services/agent/tools'

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
  // Utiliser le store pour persister l'état
  const { messages, inputValue, error, addMessage, updateMessage, setInputValue, setError, resetConversation } = useChatStore()
  const [isLoading, setIsLoading] = useState(false)
  const [isConfigured] = useState(agentService.isConfigured())
  const [showCommands, setShowCommands] = useState(false)

  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const commandsRef = useRef<HTMLDivElement>(null)

  const diagram = useVsmStore(state => state.diagram)  // Configurer le callback UI
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

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
      type: 'text'
    }

    addMessage(userMessage)
    setInputValue('')
    setIsLoading(true)
    setError(null)

    try {
      const response = await agentService.processMessage(userMessage.content)

      const assistantMessage: ChatMessage = {
        id: response.id,
        role: 'assistant',
        content: response.content,
        timestamp: response.timestamp,
        type: response.type,
        pendingActions: response.pendingActions,
        results: response.results
      }

      addMessage(assistantMessage)

    } catch (err) {
      console.error('Erreur agent:', err)
      setError(err instanceof Error ? err.message : 'Erreur inconnue')

      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Désolé, une erreur s\'est produite. Veuillez réessayer.',
        timestamp: new Date(),
        type: 'error'
      }
      addMessage(errorMessage)
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleConfirmAction = async (actionId: string) => {
    setIsLoading(true)
    try {
      const result = await agentService.confirmAction(actionId)

      // Trouver et mettre à jour le message avec l'action confirmée
      const msgWithAction = messages.find(msg => msg.pendingActions?.some(a => a.id === actionId))
      if (msgWithAction) {
        updateMessage(msgWithAction.id, {
          pendingActions: msgWithAction.pendingActions?.map(a =>
            a.id === actionId ? { ...a, status: result.success ? 'executed' : 'failed' } : a
          ),
          results: [...(msgWithAction.results || []), result],
          isProcessed: true
        })
      }

      // Ajouter un message de résultat
      const resultMessage: ChatMessage = {
        id: `result-${Date.now()}`,
        role: 'system',
        content: result.message,
        timestamp: new Date(),
        type: result.success ? 'action_result' : 'error'
      }
      addMessage(resultMessage)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la confirmation')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelAction = (actionId: string) => {
    agentService.cancelAction(actionId)

    const msgWithAction = messages.find(msg => msg.pendingActions?.some(a => a.id === actionId))
    if (msgWithAction) {
      updateMessage(msgWithAction.id, {
        pendingActions: msgWithAction.pendingActions?.map(a =>
          a.id === actionId ? { ...a, status: 'cancelled' as const } : a
        ),
        isProcessed: true
      })
    }
  }

  const handleResetConversation = () => {
    agentService.resetConversation()
    resetConversation()
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div
      style={{ width }}
      className={cn('flex flex-col bg-background border-l h-full', className)}
    >
      {/* Header - Style Gemini */}
      <div className="h-14 px-4 border-b flex items-center justify-between bg-background">
        <div className="flex items-center gap-3">
          <span className="text-base font-normal">Assistant VSM</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full hover:bg-muted"
          onClick={handleResetConversation}
          title="Nouvelle conversation"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages - Style Gemini avec scrollbar personnalisée */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 px-4 py-6 custom-scrollbar">
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id}>
              {/* Message de l'utilisateur */}
              {message.role === 'user' && (
                <div className="flex gap-2 justify-end">
                  <div className="rounded-lg px-3 py-2 max-w-[85%] bg-primary text-primary-foreground">
                    <p className="text-sm whitespace-pre-wrap">
                      {typeof message.content === 'string' ? message.content : JSON.stringify(message.content)}
                    </p>
                  </div>
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
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
                      <div className="text-sm prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {typeof message.content === 'string' ? message.content : JSON.stringify(message.content)}
                        </ReactMarkdown>
                      </div>
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
                              "text-xs px-2 py-1 rounded flex items-center gap-1.5",
                              result.success
                                ? "bg-green-500/10 text-green-700 dark:text-green-400"
                                : "bg-red-500/10 text-red-700 dark:text-red-400"
                            )}
                          >
                            {result.success ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                            <span>{result.message}</span>
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
                    "text-xs px-2 py-1 rounded flex items-center gap-1.5",
                    message.type === 'action_result'
                      ? "bg-green-500/10 text-green-700 dark:text-green-400"
                      : message.type === 'error'
                        ? "bg-red-500/10 text-red-700 dark:text-red-400"
                        : "bg-muted text-muted-foreground"
                  )}>
                    {message.type === 'action_result' && <CheckCircle2 className="h-3 w-3" />}
                    {message.type === 'error' && <XCircle className="h-3 w-3" />}
                    <span>
                      {typeof message.content === 'string' ? message.content : JSON.stringify(message.content)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Error */}
      {error && (
        <div className="px-3 py-2 bg-destructive/10 border-t border-destructive/20">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-xs text-destructive">{error}</p>
          </div>
        </div>
      )}

      <div className="p-4 border-t bg-background relative">
        {/* Liste des commandes (popup au-dessus) */}
        {showCommands && (
          <div
            ref={commandsRef}
            className="absolute bottom-full left-4 right-4 bg-popover border rounded-xl shadow-xl overflow-hidden z-50"
          >
            <div className="max-h-64 overflow-y-auto">
              <div className="p-2 space-y-1">
                <div className="text-xs font-semibold text-muted-foreground px-3 py-2 sticky top-0 bg-popover">
                  Commandes disponibles
                </div>
                {VSM_TOOLS.map(tool => (
                  <button
                    key={tool.name}
                    onClick={() => {
                      setInputValue(tool.description)
                      setShowCommands(false)
                      inputRef.current?.focus()
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-accent/50 rounded-lg text-sm transition-colors"
                  >
                    <div className="font-medium text-foreground">
                      {tool.name.replace(/_/g, ' ')}
                    </div>
                    <div className="text-muted-foreground text-xs mt-0.5 line-clamp-1">
                      {tool.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="relative">
          {/* Conteneur unique avec textarea et boutons */}
          <div className="relative bg-muted/30 border border-border rounded-3xl shadow-sm hover:border-border/80 focus-within:border-primary/50 focus-within:shadow-md transition-all">
            {/* Textarea */}
            <textarea
              ref={inputRef as any}
              placeholder={
                !isConfigured
                  ? "Service non disponible"
                  : !diagram
                    ? "Ouvrez un diagramme d'abord..."
                    : "Entrez votre demande"
              }
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  sendMessage()
                }
              }}
              disabled={isLoading || !isConfigured}
              rows={1}
              className="w-full bg-transparent border-0 outline-none resize-none px-5 pt-3.5 pb-2 text-sm max-h-32 overflow-y-auto scrollbar-thin"
              style={{
                minHeight: '52px',
                lineHeight: '1.5'
              }}
            />

            {/* Boutons en bas */}
            <div className="flex items-center justify-between gap-2 px-3 pb-2">
              {/* Bouton commandes */}
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-auto flex-shrink-0 px-3 rounded-full text-foreground hover:bg-muted border flex items-center justify-center"
                onClick={() => setShowCommands(!showCommands)}
                title="Commandes disponibles"
                disabled={isLoading || !isConfigured}
              >
                <ListTree className="h-4 w-4" /> <div>Commandes</div>
              </Button>

              {/* Bouton envoyer */}
              <Button
                size="icon"
                className="h-9 w-9 flex-shrink-0 border rounded-full "
                onClick={sendMessage}
                disabled={isLoading || !inputValue.trim() || !isConfigured}
                variant={inputValue.trim() && !isLoading ? "default" : "ghost"}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <SendHorizontal strokeWidth={2.5} className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Message d'info */}
        {!isConfigured && (
          <p className="text-xs text-muted-foreground mt-2 text-center">
            L'assistant nécessite une configuration API.
          </p>
        )}
      </div>
    </div>
  )
}

export default AgentChatAssistant
