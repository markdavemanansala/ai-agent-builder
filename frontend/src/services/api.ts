import { Agent, ApiResponse } from '../types'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`
    
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    // Add auth token if available
    const token = localStorage.getItem('supabase.auth.token')
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`
    }

    console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`)
    console.log('📋 Headers:', defaultHeaders)
    console.log('📦 Body:', options.body)

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
      })

      console.log(`📊 Response Status: ${response.status} ${response.statusText}`)

      let data
      try {
        data = await response.json()
        console.log('📄 Response Data:', data)
      } catch (jsonError) {
        console.error('❌ Failed to parse JSON response:', jsonError)
        throw new Error(`Invalid JSON response from server (${response.status})`)
      }

      if (!response.ok) {
        const errorMessage = data?.error || data?.message || `HTTP ${response.status}: ${response.statusText}`
        console.error('❌ API Error:', errorMessage)
        throw new Error(errorMessage)
      }

      return data
    } catch (error) {
      console.error('❌ API request failed:', error)
      
      // Provide more specific error messages
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error(`Cannot connect to backend server. Please check:
1. Backend is running at: ${API_BASE_URL}
2. CORS is properly configured
3. Network connection is working`)
      }
      
      if (error instanceof Error) {
        throw error
      }
      
      throw new Error('Unknown error occurred')
    }
  }

  // Agent endpoints
  async getAgents(): Promise<Agent[]> {
    const response = await this.request<{ agents: Agent[] }>('/agents')
    return response.data?.agents || []
  }

  async createAgent(agent: Partial<Agent>): Promise<Agent> {
    const response = await this.request<{ agent: Agent }>('/agents', {
      method: 'POST',
      body: JSON.stringify(agent),
    })
    return response.data?.agent!
  }

  async updateAgent(id: string, updates: Partial<Agent>): Promise<Agent> {
    const response = await this.request<{ agent: Agent }>(`/agents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    })
    return response.data?.agent!
  }

  async deleteAgent(id: string): Promise<void> {
    await this.request(`/agents/${id}`, {
      method: 'DELETE',
    })
  }

  async getPublicAgent(id: string): Promise<Agent> {
    const response = await this.request<{ agent: Agent }>(`/public/agents/${id}`)
    return response.data?.agent!
  }

  async chatWithAgent(id: string, message: string, sessionId?: string): Promise<{ response: string; session_id: string }> {
    const response = await this.request<{ response: string; session_id: string }>(`/public/agents/${id}/chat`, {
      method: 'POST',
      body: JSON.stringify({ message, session_id: sessionId }),
    })
    return response.data!
  }

  // Auth endpoints
  async signUp(email: string, password: string, name?: string): Promise<any> {
    const response = await this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    })
    return response.data
  }

  async signIn(email: string, password: string): Promise<any> {
    const response = await this.request('/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    return response.data
  }

  async signOut(): Promise<void> {
    await this.request('/auth/signout', {
      method: 'POST',
    })
  }
}

export const apiService = new ApiService()
