import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Agent } from '../types'
import { apiService } from '../services/api'
import { ChatInterface } from '../components/ChatInterface'

export const PublicAgent: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [agent, setAgent] = useState<Agent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      loadAgent(id)
    }
  }, [id])

  const loadAgent = async (agentId: string) => {
    try {
      const loadedAgent = await apiService.getPublicAgent(agentId)
      setAgent(loadedAgent)
    } catch (error) {
      console.error('Error loading agent:', error)
      setError('Agent not found or is not public')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error || !agent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Agent Not Found</h1>
          <p className="text-gray-600 mb-4">{error || 'This agent does not exist or is not public.'}</p>
          <a href="/" className="text-primary-600 hover:text-primary-700">
            Go back to dashboard
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{agent.name}</h1>
            <p className="text-gray-600 mb-4">{agent.description}</p>
            <div className="flex items-center text-sm text-gray-500">
              <span className="bg-gray-100 px-2 py-1 rounded text-xs mr-2">
                {agent.model?.name || 'Unknown Model'}
              </span>
              <span>{agent.usage_count || 0} uses</span>
            </div>
          </div>
          
          <div className="h-96">
            <ChatInterface 
              agentPrompt={agent.prompt}
              agentModel={agent.model?.name}
              onMessage={async (message) => {
                try {
                  const response = await apiService.chatWithAgent(agent.id, message)
                  return response.response
                } catch (error) {
                  console.error('Error chatting with agent:', error)
                  return `Error: ${error instanceof Error ? error.message : 'Failed to get response'}`
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
