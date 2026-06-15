const express = require('express')
const { db } = require('../services/firebaseAdmin')
const { verifyToken } = require('../middleware/auth')

const router = express.Router()
router.use(verifyToken)

// GET /api/leaderboard
router.get('/', async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 20, 50)
  try {
    const snap = await db.collection('users')
      .where('role', '==', 'user')
      .orderBy('sustainabilityScore', 'desc')
      .limit(limit)
      .get()
    const leaders = snap.docs.map((d, i) => ({
      id: d.id,
      rank: i + 1,
      displayName: d.data().displayName || 'Anonymous',
      sustainabilityScore: d.data().sustainabilityScore || 0,
      totalEmissions: d.data().totalEmissions || 0,
    }))
    res.json({ leaders })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch leaderboard' })
  }
})

module.exports = router
