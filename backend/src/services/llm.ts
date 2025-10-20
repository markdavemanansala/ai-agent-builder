import OpenAI from 'openai'

interface LLMModel {
  provider: 'openai' | 'anthropic' | 'google' | 'openrouter'
  model: string
  name: string
  max_tokens?: number
  temperature?: number
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface GenerateResponseParams {
  prompt: string
  message: string
  model: LLMModel
  sessionId?: string
}

interface GenerateResponseResult {
  content: string
  sessionId: string
}

class LLMService {
  private openai: OpenAI
  private sessionMemory: Map<string, ChatMessage[]> = new Map()

  constructor() {
    const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY
    const baseURL = process.env.OPENROUTER_API_KEY 
      ? 'https://openrouter.ai/api/v1'
      : undefined

    if (!apiKey) {
      console.warn('No OpenAI/OpenRouter API key found. LLM features will be disabled.')
      // Create a mock client for development
      this.openai = {} as OpenAI
    } else {
      this.openai = new OpenAI({
        apiKey,
        baseURL,
      })
    }
  }

  async generateResponse(params: GenerateResponseParams): Promise<GenerateResponseResult> {
    const { prompt, message, model, sessionId } = params
    
    // Generate or use existing session ID
    const currentSessionId = sessionId || this.generateSessionId()
    
    // Get or create session memory
    if (!this.sessionMemory.has(currentSessionId)) {
      this.sessionMemory.set(currentSessionId, [
        { role: 'system', content: prompt }
      ])
    }
    
    const messages = this.sessionMemory.get(currentSessionId)!
    
    // Add user message
    messages.push({ role: 'user', content: message })
    
    // Check if API key is available
    if (!process.env.OPENROUTER_API_KEY && !process.env.OPENAI_API_KEY) {
      const mockResponse = `I'm a mock AI agent. You said: "${message}". This is a placeholder response since no API key is configured. Please add your OpenRouter or OpenAI API key to enable real AI responses.`
      
      messages.push({ role: 'assistant', content: mockResponse })
      
      return {
        content: mockResponse,
        sessionId: currentSessionId,
      }
    }
    
    try {
      const response = await this.openai.chat.completions.create({
        model: this.getModelName(model),
        messages: messages as any,
        max_tokens: model.max_tokens || 1000,
        temperature: model.temperature || 0.7,
      })
      
      const assistantMessage = response.choices[0]?.message?.content || 'Sorry, I could not generate a response.'
      
      // Add assistant response to memory
      messages.push({ role: 'assistant', content: assistantMessage })
      
      // Keep only last 10 messages to prevent context overflow
      if (messages.length > 10) {
        const systemMessage = messages[0]
        const recentMessages = messages.slice(-9)
        this.sessionMemory.set(currentSessionId, [systemMessage, ...recentMessages])
      }
      
      return {
        content: assistantMessage,
        sessionId: currentSessionId,
      }
    } catch (error) {
      console.error('LLM API Error:', error)
      throw new Error('Failed to generate response')
    }
  }

  private getModelName(model: LLMModel): string {
    // Map our model names to OpenRouter/OpenAI model names
    const modelMap: Record<string, string> = {
      'gpt-4': 'openai/gpt-4',
      'gpt-3.5-turbo': 'openai/gpt-3.5-turbo',
      'claude-3-opus': 'anthropic/claude-3-opus',
      'claude-3-sonnet': 'anthropic/claude-3-sonnet',
      'claude-3-haiku': 'anthropic/claude-3-haiku',
      'gemini-pro': 'google/gemini-pro',
    }
    
    return modelMap[model.model] || model.model
  }

  private generateSessionId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36)
  }

  // Clear session memory (useful for cleanup)
  clearSession(sessionId: string): void {
    this.sessionMemory.delete(sessionId)
  }
}

export const llmService = new LLMService()
