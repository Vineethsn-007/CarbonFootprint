const express = require('express')
const { db } = require('../services/firebaseAdmin')

const router = express.Router()

// GET /api/education — public, paginated
router.get('/', async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 9, 50)
  const { category } = req.query

  try {
    let q = db.collection('articles').orderBy('publishedAt', 'desc').limit(limit)
    if (category) q = db.collection('articles').where('category', '==', category).orderBy('publishedAt', 'desc').limit(limit)
    const snap = await q.get()
    res.json({ articles: snap.docs.map((d) => ({ id: d.id, ...d.data() })), count: snap.size })
  } catch {
    res.status(500).json({ error: 'Failed to fetch articles' })
  }
})

module.exports = router
