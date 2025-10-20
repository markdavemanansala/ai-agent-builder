import express from 'express'
import { supabase } from '../services/supabase'
import { llmService } from '../services/llm'

const router = express.Router()

// Get public agent by ID
router.get('/agent/:id', async (req, res) => {
  try {
    const { id } = req.params

    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .eq('id', id)
      .eq('is_public', true)
      .single()

    if (error || !data) {
      return res.status(404).json({ error: 'Agent not found' })
    }

    res.json({ agent: data })
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Chat with public agent
router.post('/agent/:id/chat', async (req, res) => {
  try {
    const { id } = req.params
    const { message, session_id } = req.body

    // Get agent
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('*')
      .eq('id', id)
      .eq('is_public', true)
      .single()

    if (agentError || !agent) {
      return res.status(404).json({ error: 'Agent not found' })
    }

    // Generate response using LLM service
    const response = await llmService.generateResponse({
      prompt: agent.prompt,
      message,
      model: agent.model,
      sessionId: session_id,
    })

    // Update usage count
    await supabase
      .from('agents')
      .update({ 
        usage_count: agent.usage_count + 1,
        last_run: new Date().toISOString(),
      })
      .eq('id', id)

    res.json({ 
      response: response.content,
      session_id: response.sessionId,
    })
  } catch (error) {
    console.error('Chat error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
