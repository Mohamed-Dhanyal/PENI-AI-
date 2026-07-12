/**
 * routes/auth.js — Authentication routes
 *
 * POST /auth/register  → create account (Taylor's email enforced)
 * POST /auth/login     → returns JWT
 * GET  /auth/me        → returns decoded user from JWT
 *
 * Future: GET /auth/microsoft        → redirect to Azure OAuth
 *         GET /auth/microsoft/callback → exchange code, issue JWT
 */
const router = require('express').Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { randomUUID } = require('crypto')
const db = require('../db/schema')

const ALLOWED_DOMAINS = ['sd.taylors.edu.my', 'taylors.edu.my']

function issueToken(user) {
  return jwt.sign(
    { userId: user.id, email: user.email, name: user.name, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  )
}

function domainOf(email) {
  return email.split('@')[1] || ''
}

function roleFromEmail(email) {
  const domain = domainOf(email)
  if (domain === 'sd.taylors.edu.my') return 'student'
  if (domain === 'taylors.edu.my') return 'teacher'
  return null
}

// POST /auth/register
router.post('/register', (req, res) => {
  const { name, email, password } = req.body
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'name, email and password are required' })
  }

  const domain = domainOf(email.toLowerCase())
  if (!ALLOWED_DOMAINS.includes(domain)) {
    return res.status(400).json({
      error: 'Only @sd.taylors.edu.my (student) or @taylors.edu.my (staff) emails are allowed',
    })
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' })
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase())
  if (existing) return res.status(409).json({ error: 'Email already registered' })

  const role = roleFromEmail(email.toLowerCase())
  const id = randomUUID()
  const hash = bcrypt.hashSync(password, 10)

  db.prepare('INSERT INTO users (id, email, name, password_hash, role) VALUES (?, ?, ?, ?, ?)')
    .run(id, email.toLowerCase(), name, hash, role)

  if (role === 'student') {
    db.prepare('INSERT OR IGNORE INTO student_profiles (user_id) VALUES (?)').run(id)
  }

  const user = { id, email: email.toLowerCase(), name, role }
  res.status(201).json({ token: issueToken(user), user })
})

// POST /auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' })
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase())
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid email or password' })
  }

  const { password_hash, ...safe } = user
  res.json({ token: issueToken(safe), user: safe })
})

// GET /auth/me
const verifyToken = require('../middleware/verifyToken')
router.get('/me', verifyToken, (req, res) => {
  const user = db.prepare('SELECT id, email, name, role, photo_url FROM users WHERE id = ?')
    .get(req.user.userId)
  if (!user) return res.status(404).json({ error: 'User not found' })
  res.json({ user })
})

module.exports = router
