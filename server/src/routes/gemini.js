const express = require('express')
const { GoogleGenerativeAI } = require('@google/generative-ai')
const { verifyToken } = require('../middleware/auth')

const router = express.Router()
router.use(verifyToken)

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

// POST /api/gemini/insights
router.post('/insights', async (req, res) => {
  const { emissionData } = req.body
  if (!emissionData) return res.status(400).json({ error: 'emissionData is required' })

  const prompt = `Analyze this carbon footprint data and return 4 JSON insight objects:
Total: ${emissionData.totalKgCO2} kg/month
Transportation: ${emissionData.transportation} kg
Energy: ${emissionData.energy} kg
Food: ${emissionData.food} kg
Shopping: ${emissionData.shopping} kg
Waste: ${emissionData.waste} kg

Return a JSON array: [{"title":"...","message":"...","impact":"...","category":"...","priority":"high|medium|low"}]`

  try {
    const result = await model.generateContent(prompt)
    const text = result.response.text()
    const match = text.match(/\[[\s\S]*\]/)
    if (match) return res.json({ insights: JSON.parse(match[0]) })
    res.json({ insights: [] })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'AI request failed' })
  }
})

// POST /api/gemini/chat
router.post('/chat', async (req, res) => {
  const { messages } = req.body
  if (!messages?.length) return res.status(400).json({ error: 'messages is required' })

  const lastMsg = messages[messages.length - 1]
  const context = 'You are EcoBot, an AI sustainability coach. Be concise, friendly, and provide specific CO₂ savings estimates.'

  try {
    const result = await model.generateContent(`${context}\n\nUser: ${lastMsg.content}`)
    res.json({ response: result.response.text() })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'AI chat failed' })
  }
})

module.exports = router
