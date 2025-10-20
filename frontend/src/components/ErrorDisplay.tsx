import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X, Copy, CheckCircle } from 'lucide-react'

interface ErrorDetails {
  message: string
  details?: string
  suggestions?: string[]
  timestamp: Date
}

interface ErrorDisplayProps {
  error: ErrorDetails | null
  onClose: () => void
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, onClose }) => {
  const [copied, setCopied] = useState(false)

  const copyErrorDetails = () => {
    if (!error) return
    
    const errorText = `
Error: ${error.message}
Details: ${error.details || 'No additional details'}
Suggestions: ${error.suggestions?.join('\n- ') || 'No suggestions'}
Timestamp: ${error.timestamp.toISOString()}
URL: ${window.location.href}
User Agent: ${navigator.userAgent}
    `.trim()
    
    navigator.clipboard.writeText(errorText).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  if (!error) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className="fixed top-4 right-4 z-50 max-w-md"
      >
        <div className="bg-red-50 border border-red-200 rounded-lg shadow-lg p-4">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800 mb-2">
                Error Encountered
              </h3>
              
              <div className="text-sm text-red-700 mb-3">
                <p className="font-medium mb-1">{error.message}</p>
                {error.details && (
                  <p className="text-xs text-red-600 mt-1">{error.details}</p>
                )}
              </div>

              {error.suggestions && error.suggestions.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-medium text-red-800 mb-1">Suggestions:</p>
                  <ul className="text-xs text-red-700 list-disc list-inside space-y-1">
                    {error.suggestions.map((suggestion, index) => (
                      <li key={index}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex items-center justify-between">
                <button
                  onClick={copyErrorDetails}
                  className="flex items-center text-xs text-red-600 hover:text-red-700"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3 mr-1" />
                      Copy Error Details
                    </>
                  )}
                </button>
                
                <button
                  onClick={onClose}
                  className="text-red-400 hover:text-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

// Helper function to create error details
export const createErrorDetails = (
  message: string,
  details?: string,
  suggestions?: string[]
): ErrorDetails => ({
  message,
  details,
  suggestions,
  timestamp: new Date()
})

// Common error suggestions
export const COMMON_ERROR_SUGGESTIONS = {
  NETWORK_ERROR: [
    'Check your internet connection',
    'Verify the backend server is running',
    'Check if the API URL is correct in environment variables',
    'Ensure CORS is properly configured on the backend'
  ],
  AUTH_ERROR: [
    'Make sure you are logged in',
    'Check if your session has expired',
    'Try logging out and logging back in',
    'Verify Supabase configuration'
  ],
  VALIDATION_ERROR: [
    'Check that all required fields are filled',
    'Verify the data format is correct',
    'Ensure the agent name and prompt are not empty'
  ],
  SERVER_ERROR: [
    'The server may be temporarily unavailable',
    'Check the backend logs for more details',
    'Try again in a few moments',
    'Contact support if the issue persists'
  ]
}
