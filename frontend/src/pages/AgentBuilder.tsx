import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Save, 
  Play, 
  Bot, 
  Settings, 
  MessageSquare, 
  ArrowLeft,
  Eye,
  EyeOff,
  Sparkles,
  Zap,
  Brain,
  Workflow
} from 'lucide-react'
import { Agent, LLMModel } from '../types'
import { WorkflowBuilder } from '../components/WorkflowBuilder'
import { ChatInterface } from '../components/ChatInterface'
import { apiService } from '../services/api'
import { ErrorDisplay, createErrorDetails, COMMON_ERROR_SUGGESTIONS } from '../components/ErrorDisplay'
import { DarkModeToggle } from '../components/DarkModeToggle'

// Agent templates
const AGENT_TEMPLATES = [
  {
    id: 'customer-support',
    name: 'Customer Support Bot',
    description: 'Helpful assistant for customer inquiries',
    icon: '🎧',
    prompt: 'You are a helpful customer support assistant. Be friendly, professional, and aim to resolve customer issues quickly. Always ask clarifying questions if needed.',
    category: 'Business'
  },
  {
    id: 'research-assistant',
    name: 'Research Assistant',
    description: 'AI-powered research and analysis helper',
    icon: '🔍',
    prompt: 'You are a research assistant. Help users find information, analyze data, and provide well-sourced insights. Always cite your sources when possible.',
    category: 'Productivity'
  },
  {
    id: 'creative-writer',
    name: 'Creative Writer',
    description: 'Creative writing and content generation',
    icon: '✍️',
    prompt: 'You are a creative writing assistant. Help users brainstorm ideas, write engaging content, and improve their writing style. Be imaginative and inspiring.',
    category: 'Creative'
  },
  {
    id: 'coding-tutor',
    name: 'Coding Tutor',
    description: 'Programming mentor and code reviewer',
    icon: '💻',
    prompt: 'You are a coding tutor. Help users learn programming concepts, debug code, and write better software. Explain concepts clearly with examples.',
    category: 'Education'
  }
]

// Available LLM models
const AVAILABLE_MODELS: LLMModel[] = [
  {
    provider: 'openai',
    model: 'gpt-4',
    name: 'GPT-4',
    max_tokens: 4000,
    temperature: 0.7
  },
  {
    provider: 'openai',
    model: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    max_tokens: 4000,
    temperature: 0.7
  },
  {
    provider: 'anthropic',
    model: 'claude-3-sonnet',
    name: 'Claude 3 Sonnet',
    max_tokens: 4000,
    temperature: 0.7
  },
  {
    provider: 'anthropic',
    model: 'claude-3-haiku',
    name: 'Claude 3 Haiku',
    max_tokens: 4000,
    temperature: 0.7
  },
  {
    provider: 'google',
    model: 'gemini-pro',
    name: 'Gemini Pro',
    max_tokens: 4000,
    temperature: 0.7
  }
]

export const AgentBuilder: React.FC = () => {
  const { id } = useParams<{ id?: string }>()
  const navigate = useNavigate()
  const isEditing = Boolean(id)

  // Agent state
  const [agent, setAgent] = useState<Partial<Agent>>({
    name: '',
    description: '',
    prompt: '',
    model: AVAILABLE_MODELS[0],
    is_public: false
  })

  // UI state
  const [activeTab, setActiveTab] = useState<'build' | 'workflow' | 'test' | 'settings'>('build')
  const [isSaving, setIsSaving] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [, setWorkflow] = useState<any[]>([])
  const [error, setError] = useState<any>(null)

  // Load agent if editing
  useEffect(() => {
    if (isEditing && id) {
      loadAgent(id)
    }
  }, [id, isEditing])

  const loadAgent = async (agentId: string) => {
    try {
      const loadedAgent = await apiService.getPublicAgent(agentId)
      setAgent(loadedAgent)
    } catch (error) {
      console.error('Error loading agent:', error)
      // If it's a private agent, try to load from user's agents
      try {
        const userAgents = await apiService.getAgents()
        const userAgent = userAgents.find(a => a.id === agentId)
        if (userAgent) {
          setAgent(userAgent)
        }
      } catch (userError) {
        console.error('Error loading user agent:', userError)
        setError(createErrorDetails(
          'Failed to load agent',
          `Could not load agent with ID: ${agentId}`,
          [
            'Check if the agent ID is correct',
            'Verify you have permission to access this agent',
            'Ensure the backend server is running',
            'Check your internet connection'
          ]
        ))
      }
    }
  }

  const handleTemplateSelect = (template: typeof AGENT_TEMPLATES[0]) => {
    setAgent(prev => ({
      ...prev,
      name: template.name,
      description: template.description,
      prompt: template.prompt
    }))
    setShowTemplates(false)
  }

  const handleSave = async () => {
    if (!agent.name || !agent.prompt) {
      setError(createErrorDetails(
        'Missing Required Fields',
        'Agent name and prompt are required to save',
        [
          'Enter a name for your agent',
          'Write a prompt that defines the agent\'s behavior',
          'Make sure both fields are not empty'
        ]
      ))
      return
    }

    setIsSaving(true)
    try {
      let savedAgent: Agent
      
      if (isEditing && id) {
        // Update existing agent
        savedAgent = await apiService.updateAgent(id, agent)
      } else {
        // Create new agent
        savedAgent = await apiService.createAgent(agent)
      }
      
      console.log('Agent saved successfully:', savedAgent)
      navigate('/')
    } catch (error) {
      console.error('Error saving agent:', error)
      
      let suggestions = COMMON_ERROR_SUGGESTIONS.NETWORK_ERROR
      if (error instanceof Error) {
        if (error.message.includes('Cannot connect to backend')) {
          suggestions = COMMON_ERROR_SUGGESTIONS.NETWORK_ERROR
        } else if (error.message.includes('auth') || error.message.includes('token')) {
          suggestions = COMMON_ERROR_SUGGESTIONS.AUTH_ERROR
        } else if (error.message.includes('validation') || error.message.includes('required')) {
          suggestions = COMMON_ERROR_SUGGESTIONS.VALIDATION_ERROR
        }
      }
      
      setError(createErrorDetails(
        'Failed to Save Agent',
        error instanceof Error ? error.message : 'Unknown error occurred',
        suggestions
      ))
    } finally {
      setIsSaving(false)
    }
  }


  const handlePublish = async () => {
    if (!agent.name || !agent.prompt) {
      alert('Please fill in agent name and prompt')
      return
    }

    try {
      // First save the agent, then make it public
      let savedAgent: Agent
      
      if (isEditing && id) {
        savedAgent = await apiService.updateAgent(id, { ...agent, is_public: true })
      } else {
        savedAgent = await apiService.createAgent({ ...agent, is_public: true })
      }
      
      const publicUrl = `${window.location.origin}/agent/${savedAgent.id}`
      alert(`Agent published! Share this link: ${publicUrl}`)
      
      // Copy to clipboard if possible
      if (navigator.clipboard) {
        navigator.clipboard.writeText(publicUrl)
      }
    } catch (error) {
      console.error('Error publishing agent:', error)
      alert('Failed to publish agent. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Error Display */}
      <ErrorDisplay error={error} onClose={() => setError(null)} />
      
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/')}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <Bot className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              <h1 className="ml-2 text-2xl font-bold text-gray-900 dark:text-white">
                {isEditing ? 'Edit Agent' : 'Create New Agent'}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setAgent(prev => ({ ...prev, is_public: !prev.is_public }))}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                  agent.is_public
                    ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                {agent.is_public ? <Eye className="h-4 w-4 mr-1" /> : <EyeOff className="h-4 w-4 mr-1" />}
                {agent.is_public ? 'Public' : 'Private'}
              </button>
              <DarkModeToggle />
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 dark:focus:ring-offset-gray-800"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel - Agent Configuration */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {[
                  { id: 'build', name: 'Build', icon: Bot },
                  { id: 'workflow', name: 'Workflow', icon: Workflow },
                  { id: 'test', name: 'Test', icon: MessageSquare },
                  { id: 'settings', name: 'Settings', icon: Settings }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <tab.icon className="h-4 w-4 mr-2" />
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>

            {/* Build Tab */}
            {activeTab === 'build' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Agent Basic Info */}
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Agent Name
                      </label>
                      <input
                        type="text"
                        value={agent.name || ''}
                        onChange={(e) => setAgent(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Enter agent name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={agent.description || ''}
                        onChange={(e) => setAgent(prev => ({ ...prev, description: e.target.value }))}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Describe what your agent does"
                      />
                    </div>
                  </div>
                </div>

                {/* Templates */}
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Templates</h3>
                    <button
                      onClick={() => setShowTemplates(!showTemplates)}
                      className="text-sm text-primary-600 hover:text-primary-700"
                    >
                      {showTemplates ? 'Hide' : 'Show'} Templates
                    </button>
                  </div>
                  
                  {showTemplates && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {AGENT_TEMPLATES.map((template) => (
                        <button
                          key={template.id}
                          onClick={() => handleTemplateSelect(template)}
                          className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 text-left transition-colors"
                        >
                          <div className="flex items-center mb-2">
                            <span className="text-2xl mr-3">{template.icon}</span>
                            <div>
                              <h4 className="font-medium text-gray-900">{template.name}</h4>
                              <p className="text-sm text-gray-500">{template.category}</p>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600">{template.description}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Prompt Editor */}
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Agent Prompt</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        System Instructions
                      </label>
                      <textarea
                        value={agent.prompt || ''}
                        onChange={(e) => setAgent(prev => ({ ...prev, prompt: e.target.value }))}
                        rows={8}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 font-mono text-sm"
                        placeholder="Enter the system prompt that defines your agent's behavior..."
                      />
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Sparkles className="h-4 w-4 mr-1" />
                      Tip: Be specific about your agent's role, tone, and capabilities
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Workflow Tab */}
            {activeTab === 'workflow' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="bg-white rounded-lg shadow h-96">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Visual Workflow Builder</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Drag and drop nodes to create your agent's conversation flow
                    </p>
                  </div>
                  <div className="h-80">
                    <WorkflowBuilder onWorkflowChange={setWorkflow} />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Test Tab */}
            {activeTab === 'test' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="h-96">
                  <ChatInterface 
                    agentPrompt={agent.prompt}
                    agentModel={agent.model?.name}
                    onMessage={async (message) => {
                      if (!agent.id) {
                        return `Mock response to: "${message}". Save the agent first to test with real AI.`
                      }
                      
                      try {
                        const response = await apiService.chatWithAgent(agent.id, message)
                        return response.response
                      } catch (error) {
                        console.error('Error testing agent:', error)
                        return `Error: ${error instanceof Error ? error.message : 'Failed to get response'}`
                      }
                    }}
                  />
                </div>
              </motion.div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Model Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        AI Model
                      </label>
                      <select
                        value={agent.model?.model || ''}
                        onChange={(e) => {
                          const selectedModel = AVAILABLE_MODELS.find(m => m.model === e.target.value)
                          if (selectedModel) {
                            setAgent(prev => ({ ...prev, model: selectedModel }))
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      >
                        {AVAILABLE_MODELS.map((model) => (
                          <option key={model.model} value={model.model}>
                            {model.name} ({model.provider})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Max Tokens
                        </label>
                        <input
                          type="number"
                          value={agent.model?.max_tokens || 1000}
                          onChange={(e) => setAgent(prev => ({
                            ...prev,
                            model: { ...prev.model!, max_tokens: parseInt(e.target.value) }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Temperature
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="2"
                          value={agent.model?.temperature || 0.7}
                          onChange={(e) => setAgent(prev => ({
                            ...prev,
                            model: { ...prev.model!, temperature: parseFloat(e.target.value) }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Publishing</h3>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="is_public"
                        checked={agent.is_public || false}
                        onChange={(e) => setAgent(prev => ({ ...prev, is_public: e.target.checked }))}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label htmlFor="is_public" className="ml-2 block text-sm text-gray-900">
                        Make this agent public (others can chat with it)
                      </label>
                    </div>
                    <button
                      onClick={handlePublish}
                      className="flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      Publish Agent
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Panel - Preview */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Preview</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Bot className="h-8 w-8 text-primary-600" />
                  <div className="ml-3">
                    <h4 className="font-medium text-gray-900">
                      {agent.name || 'Untitled Agent'}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {agent.model?.name || 'No model selected'}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  {agent.description || 'No description provided'}
                </p>
                <div className="flex items-center text-sm text-gray-500">
                  <Brain className="h-4 w-4 mr-1" />
                  {agent.prompt ? `${agent.prompt.length} characters` : 'No prompt set'}
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => setActiveTab('test')}
                  className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Test Agent
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save Agent'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}