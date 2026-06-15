const express = require('express')
const { db } = require('../services/firebaseAdmin')
const { verifyToken } = require('../middleware/auth')

const router = express.Router()
router.use(verifyToken)

// GET /api/goals
router.get('/', async (req, res) => {
  try {
    const snap = await db.collection('goals')
      .where('userId', '==', req.uid)
      .orderBy('createdAt', 'desc')
      .get()
    res.json({ goals: snap.docs.map((d) => ({ id: d.id, ...d.data() })) })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch goals' })
  }
})

// POST /api/goals
router.post('/', async (req, res) => {
  const { title, description, targetValue, unit, deadline } = req.body
  if (!title?.trim()) return res.status(400).json({ error: 'Title is required' })
  if (!targetValue || targetValue <= 0) return res.status(400).json({ error: 'targetValue must be positive' })

  try {
    const docRef = await db.collection('goals').add({
      userId: req.uid, title, description, targetValue: Number(targetValue),
      unit: unit || 'times', deadline: deadline || null,
      currentValue: 0, status: 'active', createdAt: new Date(),
    })
    res.status(201).json({ id: docRef.id, message: 'Goal created' })
  } catch {
    res.status(500).json({ error: 'Failed to create goal' })
  }
})

// PATCH /api/goals/:id
router.patch('/:id', async (req, res) => {
  const { currentValue, status } = req.body
  try {
    const ref = db.collection('goals').doc(req.params.id)
    const doc = await ref.get()
    if (!doc.exists || doc.data().userId !== req.uid) {
      return res.status(404).json({ error: 'Goal not found' })
    }
    await ref.update({ currentValue, status, updatedAt: new Date() })
    res.json({ message: 'Goal updated' })
  } catch {
    res.status(500).json({ error: 'Failed to update goal' })
  }
})

// DELETE /api/goals/:id
router.delete('/:id', async (req, res) => {
  try {
    const ref = db.collection('goals').doc(req.params.id)
    const doc = await ref.get()
    if (!doc.exists || doc.data().userId !== req.uid) {
      return res.status(404).json({ error: 'Goal not found' })
    }
    await ref.delete()
    res.json({ message: 'Goal deleted' })
  } catch {
    res.status(500).json({ error: 'Failed to delete goal' })
  }
})

module.exports = router
