import express from 'express'
import { supabase } from '../services/supabase'

const router = express.Router()

// Sign up
router.post('/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || '',
        },
      },
    })

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    res.json({ user: data.user })
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Sign in
router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    res.json({ user: data.user, session: data.session })
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Sign out
router.post('/signout', async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      return res.status(400).json({ error: error.message })
    }

    res.json({ message: 'Signed out successfully' })
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
