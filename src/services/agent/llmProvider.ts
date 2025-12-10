/**
 * LLM Provider - Abstraction pour les différents providers LLM
 * 
 * Supporte : Gemini (Google) et Mistral
 */

import { getLLMConfig, LLMConfig, LLMProvider } from '../gemini/config'

// ============================================
// TYPES
// ============================================

export interface LLMToolDefinition {
  name: string
  description: string
  parameters: {
    type: string
    properties: Record<string, any>
    required: string[]
  }
}

export interface LLMFunctionCall {
  name: string
  args: Record<string, any>
}

export interface LLMResponse {
  text: string
  functionCalls: LLMFunctionCall[]
}

export interface LLMFunctionResponse {
  name: string
  response: any
}

// ============================================
// GEMINI PROVIDER
// ============================================

async function callGeminiAPI(
  config: LLMConfig,
  systemPrompt: string,
  contents: any[],
  tools?: LLMToolDefinition[]
): Promise<LLMResponse> {
  const body: any = {
    system_instruction: {
      parts: [{ text: systemPrompt }]
    },
    contents,
    generationConfig: config.generationConfig
  }

  if (tools && tools.length > 0) {
    body.tools = [{
      function_declarations: tools
    }]
  }

  console.log('[Gemini] Envoi de la requête:', {
    model: config.model,
    contentsCount: contents.length,
    toolsCount: body.tools?.[0]?.function_declarations?.length || 0
  })

  const response = await fetch(
    `${config.endpoint}/${config.model}:generateContent?key=${config.apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }
  )

  console.log('[Gemini] Réponse HTTP:', response.status, response.statusText)

  if (!response.ok) {
    const errorText = await response.text()
    console.error('[Gemini] Erreur API:', errorText)
    throw new Error(`Erreur API Gemini: ${response.status}`)
  }

  const data = await response.json()
  console.log('[Gemini] Données brutes:', JSON.stringify(data, null, 2))

  const candidate = data.candidates?.[0]
  const parts = candidate?.content?.parts || []

  console.log('[Gemini] Parts extraits:', {
    partsCount: parts.length,
    hasText: parts.some((p: any) => p.text),
    hasFunctionCall: parts.some((p: any) => p.functionCall)
  })

  let text = ''
  const functionCalls: LLMFunctionCall[] = []

  for (const part of parts) {
    if (part.text) {
      text += part.text
    }
    if (part.functionCall) {
      functionCalls.push({
        name: part.functionCall.name,
        args: part.functionCall.args || {}
      })
    }
  }

  console.log('[Gemini] Résultat final:', {
    textLength: text.length,
    functionCallsCount: functionCalls.length,
    functionNames: functionCalls.map(fc => fc.name)
  })

  return { text, functionCalls }
}

function buildGeminiContents(
  userMessage: string,
  previousFunctionCalls?: LLMFunctionCall[],
  functionResponses?: LLMFunctionResponse[]
): any[] {
  const contents: any[] = [
    {
      role: 'user',
      parts: [{ text: userMessage }]
    }
  ]

  if (previousFunctionCalls && functionResponses) {
    contents.push({
      role: 'model',
      parts: previousFunctionCalls.map(fc => ({ functionCall: fc }))
    })
    contents.push({
      role: 'function',
      parts: functionResponses.map(fr => ({
        functionResponse: {
          name: fr.name,
          response: fr.response
        }
      }))
    })
  }

  return contents
}

// ============================================
// MISTRAL PROVIDER
// ============================================

async function callMistralAPI(
  config: LLMConfig,
  systemPrompt: string,
  messages: any[],
  tools?: LLMToolDefinition[]
): Promise<LLMResponse> {
  const body: any = {
    model: config.model,
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages
    ],
    temperature: config.generationConfig.temperature,
    max_tokens: config.generationConfig.maxOutputTokens
  }

  if (tools && tools.length > 0) {
    body.tools = tools.map(t => ({
      type: 'function',
      function: {
        name: t.name,
        description: t.description,
        parameters: t.parameters
      }
    }))
    body.tool_choice = 'auto'
  }

  console.log('[Mistral] Envoi de la requête:', {
    model: body.model,
    messagesCount: body.messages.length,
    toolsCount: body.tools?.length || 0
  })

  const response = await fetch(
    `${config.endpoint}/chat/completions`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify(body)
    }
  )

  console.log('[Mistral] Réponse HTTP:', response.status, response.statusText)

  if (!response.ok) {
    const errorText = await response.text()
    console.error('[Mistral] Erreur API:', errorText)
    throw new Error(`Erreur API Mistral: ${response.status}`)
  }

  const data = await response.json()
  console.log('[Mistral] Données brutes:', JSON.stringify(data, null, 2))

  const choice = data.choices?.[0]
  const message = choice?.message

  console.log('[Mistral] Message extrait:', {
    hasContent: !!message?.content,
    contentType: typeof message?.content,
    hasToolCalls: !!message?.tool_calls,
    toolCallsCount: message?.tool_calls?.length || 0
  })

  // Mistral peut retourner content comme string, array, ou null
  let text = ''
  if (message?.content) {
    if (typeof message.content === 'string') {
      text = message.content
    } else if (Array.isArray(message.content)) {
      // Si c'est un array, extraire le texte de chaque élément
      text = message.content
        .map((item: any) => {
          if (typeof item === 'string') return item
          if (item.type === 'text' && item.text) return item.text
          return ''
        })
        .filter(Boolean)
        .join('\n')
    } else {
      text = String(message.content)
    }
  }

  const functionCalls: LLMFunctionCall[] = []

  // Mistral utilise tool_calls
  if (message?.tool_calls) {
    for (const toolCall of message.tool_calls) {
      if (toolCall.type === 'function') {
        functionCalls.push({
          name: toolCall.function.name,
          args: JSON.parse(toolCall.function.arguments || '{}')
        })
      }
    }
  }

  console.log('[Mistral] Résultat final:', {
    textLength: text.length,
    textPreview: text.substring(0, 100),
    functionCallsCount: functionCalls.length,
    functionNames: functionCalls.map(fc => fc.name)
  })

  return { text, functionCalls }
}

function buildMistralMessages(
  userMessage: string,
  previousFunctionCalls?: LLMFunctionCall[],
  functionResponses?: LLMFunctionResponse[]
): any[] {
  const messages: any[] = [
    { role: 'user', content: userMessage }
  ]

  if (previousFunctionCalls && functionResponses) {
    // Ajouter la réponse de l'assistant avec les tool_calls
    messages.push({
      role: 'assistant',
      content: '',
      tool_calls: previousFunctionCalls.map((fc, i) => ({
        id: `call_${i}`,
        type: 'function',
        function: {
          name: fc.name,
          arguments: JSON.stringify(fc.args)
        }
      }))
    })

    // Ajouter les résultats des tools
    functionResponses.forEach((fr, i) => {
      messages.push({
        role: 'tool',
        tool_call_id: `call_${i}`,
        content: JSON.stringify(fr.response)
      })
    })
  }

  return messages
}

// ============================================
// UNIFIED LLM PROVIDER
// ============================================

export class UnifiedLLMProvider {
  private config: LLMConfig

  constructor() {
    this.config = getLLMConfig()
  }

  getProvider(): LLMProvider {
    return this.config.provider
  }

  isConfigured(): boolean {
    return this.config.apiKey.length > 0 &&
      this.config.apiKey !== 'AIzaSyDEFAULT_KEY_CHANGE_ME'
  }

  async chat(
    systemPrompt: string,
    userMessage: string,
    tools?: LLMToolDefinition[]
  ): Promise<LLMResponse> {
    if (this.config.provider === 'mistral') {
      const messages = buildMistralMessages(userMessage)
      return callMistralAPI(this.config, systemPrompt, messages, tools)
    } else {
      const contents = buildGeminiContents(userMessage)
      return callGeminiAPI(this.config, systemPrompt, contents, tools)
    }
  }

  async chatWithFunctionResults(
    systemPrompt: string,
    userMessage: string,
    functionCalls: LLMFunctionCall[],
    functionResponses: LLMFunctionResponse[]
  ): Promise<LLMResponse> {
    if (this.config.provider === 'mistral') {
      const messages = buildMistralMessages(userMessage, functionCalls, functionResponses)
      return callMistralAPI(this.config, systemPrompt, messages)
    } else {
      const contents = buildGeminiContents(userMessage, functionCalls, functionResponses)
      return callGeminiAPI(this.config, systemPrompt, contents)
    }
  }
}

// Singleton
export const llmProvider = new UnifiedLLMProvider()
