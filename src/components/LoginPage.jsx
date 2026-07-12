import { useState } from 'react'
import { login, register } from '../api/index.js'
import '../styles/login.css'

const ALLOWED_HINT = '@sd.taylors.edu.my (student) or @taylors.edu.my (staff)'

export default function LoginPage({ onLogin, theme, onThemeToggle }) {
  const [mode, setMode]       = useState('login')   // 'login' | 'register'
  const [name, setName]       = useState('')
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const [phase, setPhase]     = useState('idle')    // idle | dissolve | welcome
  const [welcomeName, setWelcomeName] = useState('')

  const submit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const payload = mode === 'login'
        ? await login({ email, password })
        : await register({ name, email, password })

      setWelcomeName(payload.user.name)
      setPhase('dissolve')
      setTimeout(() => setPhase('welcome'), 600)
      setTimeout(() => onLogin(payload.token), 2800)
    } catch (err) {
      setError(err.message?.includes('400') || err.message?.includes('401')
        ? (mode === 'login' ? 'Invalid email or password.' : 'Registration failed. Check your details.')
        : 'Cannot connect to server. Make sure the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <button
        className="login-theme-toggle"
        type="button"
        onClick={onThemeToggle}
        aria-label="Toggle theme"
        title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {theme === 'dark' ? '☀ Light mode' : '☾ Dark mode'}
      </button>
      <div className="rain-bg" aria-hidden="true" />
      <div className="bg-orbs" aria-hidden="true">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      <form
        className={`login-card glass ${phase !== 'idle' ? 'login-card--dissolve' : ''}`}
        onSubmit={submit}
      >
        <div className="login-brand">
          <span className="login-p">P</span>eni
        </div>
        <p className="login-sub">
          {mode === 'login' ? 'Sign in to your university console' : 'Create your PENI account'}
        </p>

        {mode === 'register' && (
          <label className="login-field">
            <span>Full Name</span>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your full name"
              required
            />
          </label>
        )}

        <label className="login-field">
          <span>Taylor's Email</span>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@sd.taylors.edu.my"
            autoFocus
            required
          />
        </label>

        <label className="login-field">
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </label>

        {error && <p className="login-error">{error}</p>}

        <button type="submit" className="login-submit" disabled={loading}>
          {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
        </button>

        <button
          type="button"
          className="login-mode-toggle"
          onClick={() => { setMode(m => m === 'login' ? 'register' : 'login'); setError('') }}
        >
          {mode === 'login' ? "Don't have an account? Register" : 'Already have an account? Sign in'}
        </button>

        <p className="login-hint">
          Demo: <strong>dinesh@sd.taylors.edu.my</strong> / <strong>password123</strong>
        </p>
      </form>

      {phase === 'welcome' && (
        <div className="login-welcome" aria-live="polite">
          <span className="login-welcome-text">Welcome back, {welcomeName}</span>
        </div>
      )}
    </div>
  )
}
