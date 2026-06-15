require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')

const carbonRoutes = require('./src/routes/carbon')
const goalsRoutes = require('./src/routes/goals')
const leaderboardRoutes = require('./src/routes/leaderboard')
const geminiRoutes = require('./src/routes/gemini')
const adminRoutes = require('./src/routes/admin')
const educationRoutes = require('./src/routes/education')

const app = express()
const PORT = process.env.PORT || 5000

// ─── Security middleware ─────────────────────────────────────────────────────
app.use(helmet())
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}))

// ─── Rate limiting ───────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' },
})

const geminiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: { error: 'Too many AI requests. Please wait a moment.' },
})

app.use(limiter)
app.use(express.json({ limit: '10kb' }))
app.use(express.urlencoded({ extended: true }))

// ─── Health check ────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ─── API Routes ──────────────────────────────────────────────────────────────
app.use('/api/carbon', carbonRoutes)
app.use('/api/goals', goalsRoutes)
app.use('/api/leaderboard', leaderboardRoutes)
app.use('/api/gemini', geminiLimiter, geminiRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/education', educationRoutes)

// ─── 404 handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// ─── Global error handler ────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[Error]', err.message)
  const status = err.status || 500
  res.status(status).json({
    error: status === 500 ? 'Internal server error' : err.message,
  })
})

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🌿 EcoTrack API running on http://localhost:${PORT}`)
  })
}

module.exports = app
