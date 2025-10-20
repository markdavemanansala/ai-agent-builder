import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Play, RefreshCw } from 'lucide-react'
import { apiService } from '../services/api'
import { ErrorDisplay, createErrorDetails } from './ErrorDisplay'

interface TestResult {
  name: string
  status: 'pending' | 'running' | 'passed' | 'failed'
  error?: string
  details?: string
}

export const FeatureTester: React.FC = () => {
  const [tests, setTests] = useState<TestResult[]>([
    { name: 'Backend Connection', status: 'pending' },
    { name: 'Authentication System', status: 'pending' },
    { name: 'Agent Creation', status: 'pending' },
    { name: 'Agent Saving', status: 'pending' },
    { name: 'Agent Retrieval', status: 'pending' },
    { name: 'Public Agent Access', status: 'pending' },
    { name: 'Agent Chat', status: 'pending' },
    { name: 'Agent Deletion', status: 'pending' },
  ])
  const [isRunning, setIsRunning] = useState(false)
  const [error, setError] = useState<any>(null)

  const updateTest = (name: string, updates: Partial<TestResult>) => {
    setTests(prev => prev.map(test => 
      test.name === name ? { ...test, ...updates } : test
    ))
  }

  const runAllTests = async () => {
    setIsRunning(true)
    setError(null)
    
    // Reset all tests
    setTests(prev => prev.map(test => ({ ...test, status: 'pending', error: undefined, details: undefined })))

    try {
      // Test 1: Backend Connection
      updateTest('Backend Connection', { status: 'running' })
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/health`)
        if (response.ok) {
          updateTest('Backend Connection', { 
            status: 'passed', 
            details: `Backend responding at ${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}` 
          })
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
      } catch (error) {
        updateTest('Backend Connection', { 
          status: 'failed', 
          error: error instanceof Error ? error.message : 'Unknown error',
          details: 'Cannot connect to backend server'
        })
        throw error
      }

      // Test 2: Authentication System
      updateTest('Authentication System', { status: 'running' })
      try {
        // Try to get agents (this will test auth)
        await apiService.getAgents()
        updateTest('Authentication System', { 
          status: 'passed', 
          details: 'Authentication system working' 
        })
      } catch (error) {
        updateTest('Authentication System', { 
          status: 'failed', 
          error: error instanceof Error ? error.message : 'Unknown error',
          details: 'Authentication may not be configured or user not logged in'
        })
      }

      // Test 3: Agent Creation
      updateTest('Agent Creation', { status: 'running' })
      let testAgent: any = null
      try {
        testAgent = await apiService.createAgent({
          name: 'Test Agent',
          description: 'Test agent for feature testing',
          prompt: 'You are a test agent.',
          model: {
            provider: 'openai',
            model: 'gpt-3.5-turbo',
            name: 'GPT-3.5 Turbo'
          },
          is_public: false
        })
        updateTest('Agent Creation', { 
          status: 'passed', 
          details: `Agent created with ID: ${testAgent.id}` 
        })
      } catch (error) {
        updateTest('Agent Creation', { 
          status: 'failed', 
          error: error instanceof Error ? error.message : 'Unknown error',
          details: 'Failed to create test agent'
        })
      }

      // Test 4: Agent Saving
      updateTest('Agent Saving', { status: 'running' })
      try {
        if (testAgent) {
          await apiService.updateAgent(testAgent.id, {
            name: 'Updated Test Agent',
            description: 'Updated test agent description'
          })
          updateTest('Agent Saving', { 
            status: 'passed', 
            details: `Agent updated successfully` 
          })
        } else {
          throw new Error('No test agent to update')
        }
      } catch (error) {
        updateTest('Agent Saving', { 
          status: 'failed', 
          error: error instanceof Error ? error.message : 'Unknown error',
          details: 'Failed to update test agent'
        })
      }

      // Test 5: Agent Retrieval
      updateTest('Agent Retrieval', { status: 'running' })
      try {
        const agents = await apiService.getAgents()
        const foundAgent = agents.find(a => a.id === testAgent?.id)
        if (foundAgent) {
          updateTest('Agent Retrieval', { 
            status: 'passed', 
            details: `Found ${agents.length} agents, including test agent` 
          })
        } else {
          throw new Error('Test agent not found in retrieved agents')
        }
      } catch (error) {
        updateTest('Agent Retrieval', { 
          status: 'failed', 
          error: error instanceof Error ? error.message : 'Unknown error',
          details: 'Failed to retrieve agents'
        })
      }

      // Test 6: Public Agent Access
      updateTest('Public Agent Access', { status: 'running' })
      try {
        if (testAgent) {
          // Make agent public first
          await apiService.updateAgent(testAgent.id, { is_public: true })
          
          // Try to access it as public agent
          await apiService.getPublicAgent(testAgent.id)
          updateTest('Public Agent Access', { 
            status: 'passed', 
            details: `Public agent accessible at /agent/${testAgent.id}` 
          })
        } else {
          throw new Error('No test agent to make public')
        }
      } catch (error) {
        updateTest('Public Agent Access', { 
          status: 'failed', 
          error: error instanceof Error ? error.message : 'Unknown error',
          details: 'Failed to access public agent'
        })
      }

      // Test 7: Agent Chat
      updateTest('Agent Chat', { status: 'running' })
      try {
        if (testAgent) {
          const response = await apiService.chatWithAgent(testAgent.id, 'Hello, test agent!')
          updateTest('Agent Chat', { 
            status: 'passed', 
            details: `Chat response: ${response.response.substring(0, 50)}...` 
          })
        } else {
          throw new Error('No test agent to chat with')
        }
      } catch (error) {
        updateTest('Agent Chat', { 
          status: 'failed', 
          error: error instanceof Error ? error.message : 'Unknown error',
          details: 'Failed to chat with agent'
        })
      }

      // Test 8: Agent Deletion
      updateTest('Agent Deletion', { status: 'running' })
      try {
        if (testAgent) {
          await apiService.deleteAgent(testAgent.id)
          updateTest('Agent Deletion', { 
            status: 'passed', 
            details: 'Test agent deleted successfully' 
          })
        } else {
          throw new Error('No test agent to delete')
        }
      } catch (error) {
        updateTest('Agent Deletion', { 
          status: 'failed', 
          error: error instanceof Error ? error.message : 'Unknown error',
          details: 'Failed to delete test agent'
        })
      }

    } catch (error) {
      setError(createErrorDetails(
        'Feature Testing Failed',
        error instanceof Error ? error.message : 'Unknown error occurred during testing',
        [
          'Check that the backend server is running',
          'Verify environment variables are set correctly',
          'Ensure you are logged in',
          'Check the browser console for more details'
        ]
      ))
    } finally {
      setIsRunning(false)
    }
  }

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pending':
        return <div className="w-4 h-4 rounded-full bg-gray-300" />
      case 'running':
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
      case 'passed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />
    }
  }

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'pending':
        return 'text-gray-500'
      case 'running':
        return 'text-blue-500'
      case 'passed':
        return 'text-green-500'
      case 'failed':
        return 'text-red-500'
    }
  }

  const passedTests = tests.filter(t => t.status === 'passed').length
  const totalTests = tests.length

  return (
    <div className="max-w-4xl mx-auto p-6">
      <ErrorDisplay error={error} onClose={() => setError(null)} />
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Feature Testing</h2>
            <p className="text-gray-600 mt-1">
              Test all features of your AI Agent Builder
            </p>
          </div>
          <button
            onClick={runAllTests}
            disabled={isRunning}
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
          >
            <Play className="h-4 w-4 mr-2" />
            {isRunning ? 'Running Tests...' : 'Run All Tests'}
          </button>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Test Results</span>
            <span>{passedTests}/{totalTests} passed</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(passedTests / totalTests) * 100}%` }}
            />
          </div>
        </div>

        <div className="space-y-3">
          {tests.map((test, index) => (
            <motion.div
              key={test.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
            >
              <div className="flex items-center">
                {getStatusIcon(test.status)}
                <div className="ml-3">
                  <h3 className={`font-medium ${getStatusColor(test.status)}`}>
                    {test.name}
                  </h3>
                  {test.details && (
                    <p className="text-sm text-gray-500 mt-1">{test.details}</p>
                  )}
                  {test.error && (
                    <p className="text-sm text-red-500 mt-1">{test.error}</p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">Environment Info</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>API URL:</strong> {import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}</p>
            <p><strong>Supabase URL:</strong> {import.meta.env.VITE_SUPABASE_URL || 'Not set'}</p>
            <p><strong>Current URL:</strong> {window.location.href}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
