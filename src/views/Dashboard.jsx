import { useState, useEffect } from 'react'
import { getStudent, getModules, getEvents, getTasks, getMessages, getTimetable } from '../api/index.js'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const VIEW_LABELS = {
  'Attendance': 'Attendance',
  'My Modules': 'My Modules',
  'My Calendar': 'My Calendar',
  'My Messages': 'My Messages',
  'My Study Plan': 'My Study Plan',
}

export default function Dashboard({ onNavigate, lastView }) {
  const [student,   setStudent]   = useState(null)
  const [modules,   setModules]   = useState([])
  const [events,    setEvents]    = useState([])
  const [tasks,     setTasks]     = useState([])
  const [messages,  setMessages]  = useState([])
  const [slots,     setSlots]     = useState([])

  useEffect(() => {
    getStudent().then(setStudent)
    getModules().then(setModules)
    getEvents().then(setEvents)
    getTasks().then(setTasks)
    getMessages().then(setMessages)
    getTimetable().then(setSlots)
  }, [])

  if (!student) return null

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  const avgAttendance = modules.length
    ? Math.round(modules.reduce((s, m) => s + m.attendance, 0) / modules.length)
    : 0
  const creditsCovered = modules.reduce((s, m) => s + (m.credits || 0), 0)
  const unreadMsgs = messages.filter(m => m.unread)
  const pending = tasks.filter(t => !t.done).length

  const todayName = DAYS[new Date().getDay()]
  const todaySlots = slots
    .filter(s => s.day === todayName)
    .sort((a, b) => a.start.localeCompare(b.start))
  const nextSlots = todaySlots.length
    ? todaySlots
    : slots
        .filter(s => {
          const idx = DAYS.indexOf(s.day)
          return idx > new Date().getDay()
        })
        .sort((a, b) => DAYS.indexOf(a.day) - DAYS.indexOf(b.day) || a.start.localeCompare(b.start))
        .slice(0, 3)

  const nearestDeadlines = modules.map(m => {
    const t = tasks
      .filter(t => !t.done && t.module === m.code)
      .sort((a, b) => new Date(a.due) - new Date(b.due))[0]
    return t ? { ...t, moduleName: m.name } : null
  }).filter(Boolean).sort((a, b) => new Date(a.due) - new Date(b.due))

  const upcomingEvents = events.slice(0, 3)
  const lastPeniTopic = localStorage.getItem('peni-last-topic')
  const showResume = lastView || lastPeniTopic

  return (
    <div className="view">

      <div className="dash-hero">
        <div className="dash-hero-orbs" aria-hidden="true">
          <span className="dash-hero-orb dash-hero-orb-1" />
          <span className="dash-hero-orb dash-hero-orb-2" />
        </div>
        <div className="dash-hero-grid" aria-hidden="true">
          {['📚','🎓','📊','💬','📅','✏️','🔬','📝'].map((ic, i) => (
            <span key={i} className="dash-hero-icon-cell">{ic}</span>
          ))}
        </div>
        <div className="dash-hero-content">
          <div className="dash-hero-brand">
            <span className="dash-hero-p">P</span>ENI
          </div>
          <p className="dash-hero-tagline">Peni — AI University Companion</p>
          <h2 className="dash-hero-greeting">{greeting}, {student.name.split(' ')[0]}</h2>
          <p className="dash-hero-sub">{student.programme} · Semester {student.semester}</p>
          <div className="dash-hero-actions">
            <button className="dash-hero-btn dash-hero-btn-primary" onClick={() => onNavigate('peni')}>Ask Peni</button>
            <button className="dash-hero-btn" onClick={() => onNavigate('My Modules')}>My Modules</button>
            <button className="dash-hero-btn" onClick={() => onNavigate('My Calendar')}>Calendar</button>
          </div>
        </div>
      </div>

      {showResume && (
        <div className="dash-resume-bar">
          <div className="dash-resume-left">
            <span className="dash-resume-icon">✦</span>
            <div>
              <span className="dash-resume-title">Continue studying with Peni</span>
              {lastPeniTopic && <span className="dash-resume-sub">Last asked: "{lastPeniTopic}"</span>}
            </div>
          </div>
          <div className="dash-resume-actions">
            {lastView && (
              <button className="dash-resume-btn" onClick={() => onNavigate(lastView)}>
                Resume {VIEW_LABELS[lastView] || lastView}
              </button>
            )}
            <button className="dash-resume-btn dash-resume-btn-peni" onClick={() => onNavigate('peni')}>
              Open Peni
            </button>
          </div>
        </div>
      )}

      <div className="stat-grid">
        <button className="stat-card" onClick={() => onNavigate('Attendance')}>
          <span className="stat-value">{avgAttendance}%</span>
          <span className="stat-label">Avg Attendance</span>
        </button>
        <button className="stat-card" onClick={() => onNavigate('My Study Plan')}>
          <span className="stat-value">{creditsCovered}</span>
          <span className="stat-label">Credits Covered</span>
        </button>
        <button className="stat-card" onClick={() => onNavigate('My Messages')}>
          <span className="stat-value">{unreadMsgs.length}</span>
          <span className="stat-label">Unread Messages</span>
        </button>
        <button className="stat-card" onClick={() => onNavigate('My Study Plan')}>
          <span className="stat-value">{pending}</span>
          <span className="stat-label">Pending Tasks</span>
        </button>
      </div>

      <div className="dash-columns">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {unreadMsgs.length > 0 && (
            <section className="dash-panel">
              <h3 className="panel-title">Unread Messages</h3>
              {unreadMsgs.map(m => (
                <button
                  key={m.id}
                  className="dash-msg-row"
                  onClick={() => onNavigate('My Messages')}
                >
                  <div className="dash-msg-avatar" style={{ background: m.accent || 'var(--taylors-red)' }}>
                    {m.initials || m.from?.[0]}
                  </div>
                  <div className="event-info">
                    <span className="event-title">{m.subject}</span>
                    <span className="event-meta">{m.from} · {m.preview}</span>
                  </div>
                </button>
              ))}
            </section>
          )}

          <section className="dash-panel">
            <h3 className="panel-title">{todaySlots.length ? "Today's Classes" : 'Upcoming Classes'}</h3>
            {nextSlots.length === 0 && <p className="event-meta" style={{ padding: '4px 5px' }}>No classes scheduled.</p>}
            {nextSlots.map((s, i) => (
              <div key={i} className="event-row">
                <div className="event-info">
                  <span className="event-title">{s.label} <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>— {s.type}</span></span>
                  <span className="event-meta">{s.day} · {s.start}–{s.end} · {s.venue}</span>
                </div>
              </div>
            ))}
          </section>

        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

          <section className="dash-panel">
            <h3 className="panel-title">Nearest Deadline per Subject</h3>
            {nearestDeadlines.length === 0 && <p className="event-meta" style={{ padding: '4px 5px' }}>No pending tasks.</p>}
            {nearestDeadlines.map(t => (
              <div key={t.id} className="event-row">
                <div className="event-info">
                  <span className="event-title">{t.title}</span>
                  <span className="event-meta">{t.moduleName || t.module} · due {t.due}</span>
                </div>
              </div>
            ))}
          </section>

          <section className="dash-panel">
            <h3 className="panel-title">Upcoming Events</h3>
            {upcomingEvents.map((e, i) => (
              <div key={i} className="event-row">
                <div className="event-info">
                  <span className="event-title">{e.title}</span>
                  <span className="event-meta">{e.date?.slice(5)} · {e.time}</span>
                </div>
                <span className="dash-event-type">{e.type}</span>
              </div>
            ))}
          </section>

          {modules.filter(m => m.attendance < 80).length > 0 && (
            <section className="dash-panel">
              <h3 className="panel-title">Attendance Warning</h3>
              {modules.filter(m => m.attendance < 80).map(m => (
                <div key={m.code} className="alert-card">
                  <strong>{m.name}</strong> — {m.attendance}%
                </div>
              ))}
            </section>
          )}

        </div>
      </div>
    </div>
  )
}
