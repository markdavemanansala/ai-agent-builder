import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  MessageSquare, 
  Brain, 
  Settings,
  ArrowRight,
  Zap
} from 'lucide-react'

interface WorkflowNode {
  id: string
  type: 'trigger' | 'llm' | 'condition' | 'action'
  title: string
  description: string
  icon: React.ComponentType<any>
  config: any
}

interface WorkflowBuilderProps {
  onWorkflowChange: (workflow: WorkflowNode[]) => void
}

const NODE_TYPES = [
  {
    type: 'trigger',
    title: 'User Message',
    description: 'Starts when user sends a message',
    icon: MessageSquare,
    color: 'bg-blue-500'
  },
  {
    type: 'llm',
    title: 'AI Response',
    description: 'Generate response using LLM',
    icon: Brain,
    color: 'bg-purple-500'
  },
  {
    type: 'condition',
    title: 'Condition',
    description: 'Check conditions and branch',
    icon: Settings,
    color: 'bg-yellow-500'
  },
  {
    type: 'action',
    title: 'Action',
    description: 'Perform specific actions',
    icon: Zap,
    color: 'bg-green-500'
  }
]

export const WorkflowBuilder: React.FC<WorkflowBuilderProps> = ({ onWorkflowChange }) => {
  const [workflow, setWorkflow] = useState<WorkflowNode[]>([])
  const [draggedNode, setDraggedNode] = useState<typeof NODE_TYPES[0] | null>(null)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)

  const addNode = (nodeType: typeof NODE_TYPES[0]) => {
    const newNode: WorkflowNode = {
      id: `node-${Date.now()}`,
      type: nodeType.type as any,
      title: nodeType.title,
      description: nodeType.description,
      icon: nodeType.icon,
      config: {}
    }

    setWorkflow(prev => [...prev, newNode])
    onWorkflowChange([...workflow, newNode])
  }

  const removeNode = (nodeId: string) => {
    setWorkflow(prev => prev.filter(node => node.id !== nodeId))
    onWorkflowChange(workflow.filter(node => node.id !== nodeId))
  }

  const updateNodeConfig = (nodeId: string, config: any) => {
    setWorkflow(prev => prev.map(node => 
      node.id === nodeId ? { ...node, config: { ...node.config, ...config } } : node
    ))
  }

  const handleDragStart = (nodeType: typeof NODE_TYPES[0]) => {
    setDraggedNode(nodeType)
  }

  const handleDragEnd = () => {
    if (draggedNode) {
      addNode(draggedNode)
    }
    setDraggedNode(null)
  }

  return (
    <div className="h-full flex">
      {/* Node Palette */}
      <div className="w-64 bg-gray-100 border-r border-gray-200 p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-4">Workflow Nodes</h3>
        <div className="space-y-2">
          {NODE_TYPES.map((nodeType) => (
            <div
              key={nodeType.type}
              draggable
              onDragStart={() => handleDragStart(nodeType)}
              className="flex items-center p-3 bg-white rounded-lg border border-gray-200 cursor-move hover:shadow-md transition-shadow"
            >
              <div className={`w-8 h-8 ${nodeType.color} rounded-lg flex items-center justify-center mr-3`}>
                <nodeType.icon className="h-4 w-4 text-white" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">{nodeType.title}</div>
                <div className="text-xs text-gray-500">{nodeType.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Workflow Canvas */}
      <div 
        className="flex-1 bg-gray-50 relative overflow-auto"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDragEnd}
      >
        <div className="p-8 min-h-full">
          {workflow.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Plus className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Start Building Your Workflow</h3>
                <p className="text-gray-500">Drag nodes from the left panel to create your agent workflow</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {workflow.map((node, index) => (
                <motion.div
                  key={node.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`relative bg-white rounded-lg border-2 p-4 ${
                    selectedNode === node.id ? 'border-primary-500' : 'border-gray-200'
                  }`}
                  onClick={() => setSelectedNode(node.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
                        <node.icon className="h-5 w-5 text-primary-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{node.title}</h4>
                        <p className="text-sm text-gray-500">{node.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <GripVertical className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => removeNode(node.id)}
                        className="p-1 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Node Configuration */}
                  {selectedNode === node.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 pt-4 border-t border-gray-200"
                    >
                      {node.type === 'llm' && (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Prompt Template
                            </label>
                            <textarea
                              value={node.config.prompt || ''}
                              onChange={(e) => updateNodeConfig(node.id, { prompt: e.target.value })}
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm"
                              placeholder="Enter the prompt template..."
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Temperature
                              </label>
                              <input
                                type="number"
                                step="0.1"
                                min="0"
                                max="2"
                                value={node.config.temperature || 0.7}
                                onChange={(e) => updateNodeConfig(node.id, { temperature: parseFloat(e.target.value) })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Max Tokens
                              </label>
                              <input
                                type="number"
                                value={node.config.maxTokens || 1000}
                                onChange={(e) => updateNodeConfig(node.id, { maxTokens: parseInt(e.target.value) })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {node.type === 'condition' && (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Condition
                            </label>
                            <select
                              value={node.config.condition || 'contains'}
                              onChange={(e) => updateNodeConfig(node.id, { condition: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm"
                            >
                              <option value="contains">Contains text</option>
                              <option value="equals">Equals</option>
                              <option value="starts_with">Starts with</option>
                              <option value="ends_with">Ends with</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Value
                            </label>
                            <input
                              type="text"
                              value={node.config.value || ''}
                              onChange={(e) => updateNodeConfig(node.id, { value: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm"
                              placeholder="Enter the value to check..."
                            />
                          </div>
                        </div>
                      )}

                      {node.type === 'action' && (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Action Type
                            </label>
                            <select
                              value={node.config.actionType || 'send_message'}
                              onChange={(e) => updateNodeConfig(node.id, { actionType: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm"
                            >
                              <option value="send_message">Send Message</option>
                              <option value="webhook">Call Webhook</option>
                              <option value="save_data">Save Data</option>
                              <option value="redirect">Redirect</option>
                            </select>
                          </div>
                          {node.config.actionType === 'send_message' && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Message
                              </label>
                              <textarea
                                value={node.config.message || ''}
                                onChange={(e) => updateNodeConfig(node.id, { message: e.target.value })}
                                rows={2}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm"
                                placeholder="Enter the message to send..."
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Connection Arrow */}
                  {index < workflow.length - 1 && (
                    <div className="flex justify-center mt-4">
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
