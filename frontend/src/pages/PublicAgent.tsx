import React from 'react'
import { useParams } from 'react-router-dom'

export const PublicAgent: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Public Agent Chat
          </h1>
          <p className="text-gray-600 mb-8">
            Agent ID: {id}
          </p>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <p className="text-gray-500">
              Chat interface coming soon! This will allow users to interact with your published agent.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
