const { db } = require('../services/firebaseAdmin')
const { getAuth } = require('firebase-admin/auth')

/**
 * Verify Firebase ID token from Authorization header
 */
async function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' })
  }

  const token = authHeader.split(' ')[1]
  try {
    const decoded = await getAuth().verifyIdToken(token)
    req.uid = decoded.uid
    req.email = decoded.email
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}

/**
 * Check that the authenticated user has admin role in Firestore
 */
async function requireAdmin(req, res, next) {
  try {
    const userDoc = await db.collection('users').doc(req.uid).get()
    if (!userDoc.exists || userDoc.data().role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' })
    }
    next()
  } catch {
    return res.status(500).json({ error: 'Failed to verify admin status' })
  }
}

module.exports = { verifyToken, requireAdmin }
