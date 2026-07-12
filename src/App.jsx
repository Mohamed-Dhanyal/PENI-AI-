/**
 * App.jsx — Root application shell
 *
 * Responsibilities:
 *  - Auth gate: renders LoginPage until sessionStorage flag is set
 *  - Theme: toggles data-theme on <html>, persisted to localStorage
 *  - Layout composition: TopBar + RightPanel + MainArea
 *  - Lifts activeNav state so nav panel and main area stay in sync
 *
 * To integrate backend auth: replace sessionStorage with a real token check
 * (e.g. validate JWT from cookie or context provider).
 */
import { useState, useEffect } from 'react'
import TopBar from './components/TopBar.jsx'
import MainArea from './components/MainArea.jsx'
import RightPanel from './components/RightPanel.jsx'
import LoginPage from './components/LoginPage.jsx'
import TeacherDashboard from './views/teacher/TeacherDashboard.jsx'
import TeacherModuleView from './views/teacher/TeacherModuleView.jsx'
import './styles/layout.css'

function decodeJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]))
  } catch {
    return null
  }
}

function decodeHash(hash) {
  const s = decodeURIComponent(hash.slice(1))
  return s || null
}

function encodeHash(nav) {
  return nav ? '#' + encodeURIComponent(nav) : '#'
}

export default function App() {
  const [activeNav, setActiveNav] = useState(() => decodeHash(window.location.hash))
  const [theme, setTheme] = useState(() => localStorage.getItem('peni-theme') || 'dark')
  const [token, setToken] = useState(() => localStorage.getItem('peni-token'))

  const user = token ? decodeJwt(token) : null
  const isAuthed = !!user

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('peni-theme', theme)
  }, [theme])

  const handleLogin = (newToken) => {
    localStorage.setItem('peni-token', newToken)
    setToken(newToken)
    // Forward token to Chrome extension (if installed) so it can auth sync requests
    try { window.chrome?.runtime?.sendMessage?.({ type: 'PENI_TOKEN', token: newToken }) } catch {}
  }

  useEffect(() => {
    const onPop = () => setActiveNav(decodeHash(window.location.hash))
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const navigate = (nav) => {
    if (nav === activeNav) return
    if (nav && nav !== 'peni') localStorage.setItem('peni-last-view', nav)
    window.history.pushState(null, '', encodeHash(nav))
    setActiveNav(nav)
  }

  const handleLogout = () => {
    localStorage.removeItem('peni-token')
    setToken(null)
    window.history.replaceState(null, '', '#')
    setActiveNav(null)
  }

  if (!isAuthed) {
    return (
      <LoginPage
        theme={theme}
        onThemeToggle={() => setTheme(t => (t === 'dark' ? 'light' : 'dark'))}
        onLogin={handleLogin}
      />
    )
  }

  const person = { name: user.name, id: user.email?.split('@')[0] }

  if (user.role === 'teacher') {
    return (
      <TeacherShell
        user={user}
        person={person}
        theme={theme}
        onThemeToggle={() => setTheme(t => (t === 'dark' ? 'light' : 'dark'))}
        onLogout={handleLogout}
      />
    )
  }

  return (
    <div className="app-shell">
      <TopBar
        student={person}
        activeNav={activeNav}
        theme={theme}
        onThemeToggle={() => setTheme(t => (t === 'dark' ? 'light' : 'dark'))}
        onLogout={handleLogout}
      />
      <div className="app-body">
        <RightPanel
          activeNav={activeNav}
          onNavSelect={navigate}
          onPeni={() => navigate('peni')}
        />
        <MainArea activeNav={activeNav} onNavSelect={navigate} lastView={localStorage.getItem('peni-last-view')} />
      </div>
    </div>
  )
}

function TeacherShell({ user, person, theme, onThemeToggle, onLogout }) {
  const [activeNav, setActiveNav] = useState(null)
  const [selectedModule, setSelectedModule] = useState(null)

  const navigate = (view, data) => {
    if (view === 'module-detail' && data) {
      setSelectedModule(data)
      setActiveNav('module-detail')
    } else {
      setSelectedModule(null)
      setActiveNav(view)
    }
  }

  return (
    <div className="app-shell">
      <TopBar
        student={{ ...person, id: 'Teacher' }}
        activeNav={activeNav}
        theme={theme}
        onThemeToggle={onThemeToggle}
        onLogout={onLogout}
      />
      <div className="app-body">
        <aside className="right-panel glass" aria-label="Teacher navigation">
          <div className="right-panel-content">
            <nav className="nav-stack">
              <button
                className={`nav-btn${activeNav === null ? ' is-active' : ''}`}
                onClick={() => navigate(null)}
              >
                <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
                <span className="nav-label">Home</span>
              </button>
              <div className="nav-divider" />
              <button
                className={`nav-btn${activeNav === 'modules' ? ' is-active' : ''}`}
                onClick={() => navigate('modules')}
              >
                <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
                <span className="nav-label">My Modules</span>
              </button>
            </nav>
          </div>
        </aside>
        <main className="main-area console">
          {activeNav === 'module-detail' && selectedModule
            ? <TeacherModuleView module={selectedModule} onBack={() => navigate('modules')} />
            : <TeacherDashboard user={user} onNavigate={navigate} />
          }
        </main>
      </div>
    </div>
  )
}
