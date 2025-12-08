/**
 * ChatAssistant - Assistant conversationnel avec API Gemini
 * 
 * Fonctionnalités :
 * - Interface de chat avec historique des messages
 * - Intégration avec l'API Google Gemini
 * - Contexte du projet VSM actif
 * - Suggestions et réponses sur le VSM
 */

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Send, Loader2, Bot, User, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatAssistantProps {
  width?: number;
  projectContext?: string;
  diagramData?: any;
  className?: string;
}

export const ChatAssistant: React.FC<ChatAssistantProps> = ({
  width = 320,
  projectContext,
  diagramData,
  className,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Bonjour ! Je suis votre assistant VSM. Comment puis-je vous aider aujourd\'hui ?',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string>('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Charger la clé API depuis localStorage
  useEffect(() => {
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  // Auto-scroll vers le bas quand un nouveau message arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    // Vérifier la clé API
    if (!apiKey) {
      setError('Clé API Gemini non configurée. Veuillez configurer votre clé API dans les paramètres.');
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);

    try {
      // Construire le contexte
      const contextInfo = [];
      if (projectContext) {
        contextInfo.push(`Projet actif: ${projectContext}`);
      }
      if (diagramData) {
        contextInfo.push(`Données du diagramme: ${JSON.stringify(diagramData)}`);
      }

      const systemContext = contextInfo.length > 0
        ? `Contexte VSM:\n${contextInfo.join('\n')}\n\n`
        : '';

      // Appel à l'API Gemini
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
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
                    text: `${systemContext}Tu es un assistant expert en Value Stream Mapping (VSM) et amélioration continue. Aide l'utilisateur avec ses questions sur le VSM.\n\nQuestion: ${userMessage.content}`,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1024,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const assistantText =
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        'Désolé, je n\'ai pas pu générer une réponse.';

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: assistantText,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Erreur lors de l\'appel à l\'API Gemini:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Désolé, une erreur s\'est produite lors de la génération de la réponse. Veuillez vérifier votre clé API et réessayer.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleConfigureApiKey = () => {
    const key = prompt('Entrez votre clé API Google Gemini:', apiKey);
    if (key !== null) {
      setApiKey(key);
      localStorage.setItem('gemini_api_key', key);
      setError(null);
    }
  };

  return (
    <div
      style={{ width }}
      className={cn('flex flex-col bg-background border-l', className)}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-sm">Assistant VSM</h3>
        </div>
        <Badge variant={apiKey ? 'default' : 'destructive'} className="text-xs">
          {apiKey ? 'Connecté' : 'Non configuré'}
        </Badge>
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex gap-3',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.role === 'assistant' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
              )}

              <div
                className={cn(
                  'rounded-lg px-4 py-2 max-w-[80%]',
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                )}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <p className="text-xs opacity-60 mt-1">
                  {message.timestamp.toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>

              {message.role === 'user' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div className="rounded-lg px-4 py-2 bg-muted">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Error */}
      {error && (
        <div className="px-4 py-2 bg-destructive/10 border-t border-destructive/20">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-xs text-destructive">{error}</p>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t space-y-2">
        {!apiKey && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleConfigureApiKey}
            className="w-full"
          >
            Configurer la clé API
          </Button>
        )}

        <div className="flex gap-2">
          <Input
            ref={inputRef}
            placeholder="Posez votre question..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading || !apiKey}
            className="flex-1"
          />
          <Button
            size="icon"
            onClick={sendMessage}
            disabled={isLoading || !inputValue.trim() || !apiKey}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
