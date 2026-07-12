import { useState, useEffect } from 'react'
import { getTeacherModules } from '../../api/index.js'

export default function TeacherDashboard({ user, onNavigate }) {
  const [modules, setModules] = useState([])

  useEffect(() => {
    getTeacherModules().then(setModules).catch(() => {})
  }, [])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="view">
      <div className="dash-hero">
        <div className="dash-hero-orbs" aria-hidden="true">
          <span className="dash-hero-orb dash-hero-orb-1" />
          <span className="dash-hero-orb dash-hero-orb-2" />
        </div>
        <div className="dash-hero-grid" aria-hidden="true">
          {['📚','✏️','📊','💬','📋','✅','🎬','🔗'].map((ic, i) => (
            <span key={i} className="dash-hero-icon-cell">{ic}</span>
          ))}
        </div>
        <div className="dash-hero-content">
          <div className="dash-hero-brand"><span className="dash-hero-p">P</span>ENI</div>
          <p className="dash-hero-tagline">Teacher Portal</p>
          <h2 className="dash-hero-greeting">{greeting}, {user.name.split(' ')[0]}</h2>
          <p className="dash-hero-sub">Lecturer · {modules.length} module{modules.length !== 1 ? 's' : ''} assigned</p>
          <div className="dash-hero-actions">
            <button className="dash-hero-btn dash-hero-btn-primary" onClick={() => onNavigate('modules')}>My Modules</button>
          </div>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <span className="stat-value">{modules.length}</span>
          <span className="stat-label">Modules</span>
        </div>
      </div>

      <section className="dash-panel">
        <h3 className="panel-title">Your Modules</h3>
        {modules.length === 0 && <p className="event-meta" style={{ padding: '4px 5px' }}>No modules assigned yet.</p>}
        {modules.map(m => (
          <button
            key={m.id}
            className="dash-msg-row"
            onClick={() => onNavigate('module-detail', m)}
          >
            <div className="event-info">
              <span className="event-title">{m.code} — {m.name}</span>
            </div>
            <span className="dash-event-type">Manage →</span>
          </button>
        ))}
      </section>
    </div>
  )
}
