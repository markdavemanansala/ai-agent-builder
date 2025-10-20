import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { DarkModeProvider } from './contexts/DarkModeContext'
import { Dashboard } from './pages/Dashboard'
import { AgentBuilder } from './pages/AgentBuilder'
import { Login } from './pages/Login'
import { Signup } from './pages/Signup'
import { PublicAgent } from './pages/PublicAgent'
import { ProtectedRoute } from './components/ProtectedRoute'

function App() {
  return (
    <DarkModeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/agent/:id" element={<PublicAgent />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/builder"
                element={
                  <ProtectedRoute>
                    <AgentBuilder />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/builder/:id"
                element={
                  <ProtectedRoute>
                    <AgentBuilder />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </DarkModeProvider>
  )
}

export default App
