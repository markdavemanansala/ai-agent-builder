import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import rateLimit from 'express-rate-limit'

// Import routes
import authRoutes from './routes/auth'
import agentRoutes from './routes/agents'
import publicRoutes from './routes/public'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Security middleware
app.use(helmet())
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'https://frontend-hlc0hkcb4-mark-dave-manansalas-projects.vercel.app',
    'https://frontend-five-teal-14.vercel.app',
    'https://frontend-1apu9goa9-mark-dave-manansalas-projects.vercel.app',
    'https://frontend-ocj4f4ydt-mark-dave-manansalas-projects.vercel.app',
    'https://frontend-3l25ff70s-mark-dave-manansalas-projects.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
})
app.use(limiter)

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/agents', agentRoutes)
app.use('/api/public', publicRoutes)

// Root route for debugging
app.get('/', (req, res) => {
  res.json({ 
    message: 'AI Agent Builder Backend API', 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    routes: ['/api/health', '/api/agents', '/api/public']
  })
})

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Something went wrong!' })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📱 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`)
})
