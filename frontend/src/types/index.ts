export interface User {
  id: string
  email: string
  name?: string
  avatar_url?: string
  created_at: string
}

export interface Agent {
  id: string
  name: string
  description?: string
  prompt: string
  model: LLMModel
  is_public: boolean
  user_id: string
  created_at: string
  updated_at: string
  usage_count: number
  last_run?: string
}

export interface LLMModel {
  provider: 'openai' | 'anthropic' | 'google' | 'openrouter'
  model: string
  name: string
  max_tokens?: number
  temperature?: number
}

export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
  agent_id?: string
}

export interface ChatSession {
  id: string
  agent_id: string
  messages: Message[]
  created_at: string
  updated_at: string
}

export interface AgentTemplate {
  id: string
  name: string
  description: string
  prompt: string
  category: string
  icon: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}
