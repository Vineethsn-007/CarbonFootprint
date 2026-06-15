const express = require('express')
const { db } = require('../services/firebaseAdmin')
const { verifyToken, requireAdmin } = require('../middleware/auth')

const router = express.Router()
router.use(verifyToken, requireAdmin)

// GET /api/admin/users
router.get('/users', async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 20, 100)
  try {
    const snap = await db.collection('users').orderBy('createdAt', 'desc').limit(limit).get()
    res.json({ users: snap.docs.map((d) => ({ id: d.id, ...d.data() })), count: snap.size })
  } catch {
    res.status(500).json({ error: 'Failed to fetch users' })
  }
})

// PATCH /api/admin/users/:id
router.patch('/users/:id', async (req, res) => {
  const { role, displayName } = req.body
  const allowed = ['user', 'admin']
  if (role && !allowed.includes(role)) return res.status(400).json({ error: 'Invalid role' })
  try {
    await db.collection('users').doc(req.params.id).update({ ...(role && { role }), ...(displayName && { displayName }), updatedAt: new Date() })
    res.json({ message: 'User updated' })
  } catch {
    res.status(500).json({ error: 'Failed to update user' })
  }
})

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
  try {
    const [usersSnap, emissionsSnap, goalsSnap, articlesSnap] = await Promise.all([
      db.collection('users').count().get(),
      db.collection('emissions').count().get(),
      db.collection('goals').count().get(),
      db.collection('articles').count().get(),
    ])
    res.json({
      totalUsers: usersSnap.data().count,
      totalEmissions: emissionsSnap.data().count,
      totalGoals: goalsSnap.data().count,
      totalArticles: articlesSnap.data().count,
    })
  } catch {
    res.status(500).json({ error: 'Failed to fetch stats' })
  }
})

module.exports = router
