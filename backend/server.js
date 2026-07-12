/**
 * server.js — PENI Backend Entry Point
 *
 * Runs on PORT 3001 by default.
 * Start: node server.js  (or npm run dev for --watch mode)
 */
require('dotenv').config()
require('./db/schema') // ensures tables exist on startup

const express = require('express')
const cors = require('cors')

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({
  origin: (origin, cb) => {
    const allowed = process.env.CORS_ORIGIN
    if (!origin) return cb(null, true)
    if (allowed && origin === allowed) return cb(null, true)
    if (!allowed && (
      origin.startsWith('http://localhost') ||
      origin.startsWith('http://127.0.0.1') ||
      origin.startsWith('chrome-extension://')
    )) return cb(null, true)
    // In dev, allow all origins rather than crashing the app
    if (process.env.NODE_ENV !== 'production') return cb(null, true)
    cb(new Error('Not allowed by CORS'))
  },
  credentials: true,
}))
app.options('*', cors())
app.use(express.json())

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/auth',        require('./routes/auth'))
app.use('/api/sync',    require('./routes/sync'))
app.use('/api/ai',      require('./routes/ai'))
app.use('/api/teacher', require('./routes/teacher'))
app.use('/api',         require('./routes/student'))
app.use('/api/student', require('./routes/student'))

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }))

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ error: `Route ${req.method} ${req.path} not found` }))

// ── Error handler ─────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[Error]', err.message)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`[PENI Backend] running on http://localhost:${PORT}`)
  console.log(`[PENI Backend] Health: http://localhost:${PORT}/health`)
})
