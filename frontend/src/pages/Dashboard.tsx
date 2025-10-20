import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Agent } from '../types'
import { motion } from 'framer-motion'
import { Plus, Bot, Settings, LogOut, Eye, Edit, Trash2, TestTube } from 'lucide-react'
import { apiService } from '../services/api'
import { FeatureTester } from '../components/FeatureTester'
import { DarkModeToggle } from '../components/DarkModeToggle'

export const Dashboard: React.FC = () => {
  const { user, signOut } = useAuth()
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [showTester, setShowTester] = useState(false)

  useEffect(() => {
    loadAgents()
  }, [user])

  const loadAgents = async () => {
    try {
      const userAgents = await apiService.getAgents()
      setAgents(userAgents)
    } catch (error) {
      console.error('Error loading agents:', error)
      // Fallback to empty array if API fails
      setAgents([])
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAgent = async (agentId: string) => {
    try {
      await apiService.deleteAgent(agentId)
      setAgents(agents.filter(agent => agent.id !== agentId))
    } catch (error) {
      console.error('Error deleting agent:', error)
      alert('Failed to delete agent. Please try again.')
    }
  }

  const handleTogglePublic = async (agentId: string) => {
    try {
      const agent = agents.find(a => a.id === agentId)
      if (agent) {
        const updatedAgent = await apiService.updateAgent(agentId, { 
          is_public: !agent.is_public 
        })
        setAgents(agents.map(a => a.id === agentId ? updatedAgent : a))
      }
    } catch (error) {
      console.error('Error updating agent:', error)
      alert('Failed to update agent. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Bot className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              <h1 className="ml-2 text-2xl font-bold text-gray-900 dark:text-white">AI Agent Builder</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Welcome, {user?.user_metadata?.name || user?.email}
              </span>
              <button
                onClick={() => setShowTester(!showTester)}
                className="flex items-center text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                <TestTube className="h-4 w-4 mr-1" />
                {showTester ? 'Hide Tests' : 'Test Features'}
              </button>
              <DarkModeToggle />
              <button
                onClick={signOut}
                className="flex items-center text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showTester && <FeatureTester />}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Your Agents</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Build, customize, and deploy AI agents without coding
            </p>
          </div>
          <Link
            to="/builder"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-800"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Agent
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow dark:shadow-lg">
            <div className="flex items-center">
              <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
                <Bot className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Agents</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{agents.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow dark:shadow-lg">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Eye className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Public Agents</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {agents.filter(agent => agent.is_public).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow dark:shadow-lg">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Settings className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Usage</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {agents.reduce((sum, agent) => sum + agent.usage_count, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Agents Grid */}
        {agents.length === 0 ? (
          <div className="text-center py-12">
            <Bot className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No agents yet</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Get started by creating your first AI agent.
            </p>
            <div className="mt-6">
              <Link
                to="/builder"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-800"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create your first agent
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map((agent, index) => (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md dark:shadow-lg dark:hover:shadow-xl transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">{agent.name}</h3>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{agent.description}</p>
                      <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">
                          {agent.model.name}
                        </span>
                        <span className="ml-2">
                          {agent.usage_count} uses
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleTogglePublic(agent.id)}
                        className={`p-1 rounded ${
                          agent.is_public 
                            ? 'text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300' 
                            : 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300'
                        }`}
                        title={agent.is_public ? 'Make private' : 'Make public'}
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <Link
                        to={`/builder/${agent.id}`}
                        className="p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                        title="Edit agent"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDeleteAgent(agent.id)}
                        className="p-1 text-gray-400 hover:text-red-600 dark:text-gray-500 dark:hover:text-red-400"
                        title="Delete agent"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 flex space-x-2">
                    <Link
                      to={`/agent/${agent.id}`}
                      className="flex-1 text-center px-3 py-2 text-sm font-medium text-primary-600 bg-primary-50 dark:text-primary-400 dark:bg-primary-900 rounded-md hover:bg-primary-100 dark:hover:bg-primary-800"
                    >
                      Test Agent
                    </Link>
                    {agent.is_public && (
                      <button
                        onClick={() => navigator.clipboard.writeText(`${window.location.origin}/agent/${agent.id}`)}
                        className="px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 dark:text-gray-300 dark:bg-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600"
                      >
                        Copy Link
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
