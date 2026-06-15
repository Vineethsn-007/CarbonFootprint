const express = require('express')
const { body, validationResult } = require('express-validator')
const { db } = require('../services/firebaseAdmin')
const { verifyToken } = require('../middleware/auth')

const router = express.Router()
router.use(verifyToken)

// Validation rules
const emissionValidation = [
  body('totalKgCO2').isFloat({ min: 0, max: 100000 }).withMessage('Invalid total CO₂ value'),
  body('transportation').isFloat({ min: 0 }).optional(),
  body('energy').isFloat({ min: 0 }).optional(),
  body('food').isFloat({ min: 0 }).optional(),
  body('shopping').isFloat({ min: 0 }).optional(),
  body('waste').isFloat({ min: 0 }).optional(),
]

// POST /api/carbon/calculate — save emission record
router.post('/calculate', emissionValidation, async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })

  try {
    const { totalKgCO2, transportation, energy, food, shopping, waste, ...rest } = req.body

    const docRef = await db.collection('emissions').add({
      userId: req.uid,
      totalKgCO2,
      transportation: transportation || 0,
      energy: energy || 0,
      food: food || 0,
      shopping: shopping || 0,
      waste: waste || 0,
      createdAt: new Date(),
    })

    // Update user's sustainability score
    const userRef = db.collection('users').doc(req.uid)
    const userDoc = await userRef.get()
    if (userDoc.exists) {
      const prev = userDoc.data().totalEmissions || 0
      const newScore = Math.max(0, Math.min(100, Math.round(((1600 - totalKgCO2) / 1600) * 100)))
      await userRef.update({
        totalEmissions: prev + totalKgCO2,
        sustainabilityScore: newScore,
        updatedAt: new Date(),
      })
    }

    res.status(201).json({ id: docRef.id, message: 'Emission saved successfully' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to save emission' })
  }
})

// GET /api/carbon/history — paginated emission history
router.get('/history', async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 12, 50)
  try {
    const snap = await db.collection('emissions')
      .where('userId', '==', req.uid)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get()
    const emissions = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    res.json({ emissions, count: emissions.length })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch history' })
  }
})

// GET /api/carbon/summary — monthly + weekly summary
router.get('/summary', async (req, res) => {
  try {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const snap = await db.collection('emissions')
      .where('userId', '==', req.uid)
      .where('createdAt', '>=', startOfMonth)
      .get()

    const monthTotal = snap.docs.reduce((sum, d) => sum + (d.data().totalKgCO2 || 0), 0)
    res.json({ monthTotal: Math.round(monthTotal * 10) / 10, count: snap.size })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch summary' })
  }
})

module.exports = router
