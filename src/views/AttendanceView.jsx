/**
 * AttendanceView.jsx — Attendance tracking page
 *
 * Sections (top to bottom):
 *  1. Attendance Summary  — overall % bar, total/attended/missed counts
 *  2. Attendance          — per-module cards; click to expand venue/lecturer details
 *  3. Current Week        — 5-column day grid showing present/absent/remaining chips
 *  4. Absences            — 2-record preview with "View all" link
 *
 * AbsenceDetailView (rendered in-place when "View all" is clicked):
 *  - Full absence list with module code, class type, responsible teacher
 *  - Inline MC leave request form per absence (Submit MC button)
 *  - MC submitted state tracked locally — wire to POST /attendance/mc on backend
 *
 * State:
 *  - showAllAbsences (boolean)     — toggles between main view and detail view
 *  - AttendanceCard: open (boolean) — per-card expand/collapse
 *  - AbsenceDetailView: submitted (object) — per-absence MC submission state
 *  - AbsenceDetailView: mcOpen (number|null) — which MC form is open
 */
import { useState, useEffect } from 'react'
import { getModules, getAttendanceLog, getWeekSchedule, submitMcRequest } from '../api/index.js'

const PREVIEW_COUNT = 2

function AbsenceRow({ absence, onMcSubmit }) {
  return (
    <div className="abs-card">
      <div className="abs-card-top">
        <div className="abs-card-info">
          <span className="abs-card-name">{absence.name}</span>
          <span className="abs-card-meta">{absence.module} · {absence.type} · {absence.date} · {absence.time}</span>
          <span className="abs-card-teacher">Responsible: {absence.teacher}</span>
        </div>
        {absence.mcSubmitted
          ? <span className="abs-mc-badge submitted">MC Submitted</span>
          : (
            <button className="abs-mc-btn" onClick={() => onMcSubmit(absence)}>
              Submit MC
            </button>
          )
        }
      </div>
    </div>
  )
}

function AbsenceDetailView({ absences, onBack }) {
  const [submitted, setSubmitted] = useState(
    absences.reduce((acc, a, i) => ({ ...acc, [i]: a.mcSubmitted }), {})
  )
  const [mcOpen, setMcOpen] = useState(null)
  const [mcNote, setMcNote] = useState('')
  const [loading, setLoading] = useState({})
  const [errors, setErrors] = useState({})

  const handleSubmit = async idx => {
    const a = absences[idx]
    const note = mcNote.trim()
    setLoading(l => ({ ...l, [idx]: true }))
    setErrors(e => ({ ...e, [idx]: null }))
    try {
      await submitMcRequest({ logId: a.id, note })
      setSubmitted(s => ({ ...s, [idx]: true }))
      setMcOpen(null)
      setMcNote('')
    } catch (err) {
      setErrors(e => ({ ...e, [idx]: err.message || 'Failed to submit MC' }))
    } finally {
      setLoading(l => ({ ...l, [idx]: false }))
    }
  }

  return (
    <div className="view">
      <div className="abs-detail-header">
        <button className="abs-back-btn" onClick={onBack}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Back
        </button>
        <h2 className="view-title">All Absences</h2>
        <span className="att-code">{absences.length} absence{absences.length !== 1 ? 's' : ''} recorded</span>
      </div>

      <div className="abs-list">
        {absences.map((a, i) => (
          <div key={i} className="abs-detail-card">
            <div className="abs-detail-top">
              <div>
                <span className="abs-card-name">{a.name}</span>
                <span className="abs-card-meta">{a.date} · {a.time}</span>
              </div>
              {submitted[i]
                ? <span className="abs-mc-badge submitted">MC Submitted</span>
                : <button className="abs-mc-btn" onClick={() => setMcOpen(mcOpen === i ? null : i)}>
                    {mcOpen === i ? 'Cancel' : 'Submit MC'}
                  </button>
              }
            </div>

            <div className="abs-detail-grid">
              <div className="att-detail-item">
                <span className="att-detail-label">Module Code</span>
                <span className="att-detail-value">{a.module}</span>
              </div>
              <div className="att-detail-item">
                <span className="att-detail-label">Class Type</span>
                <span className="att-detail-value">{a.type}</span>
              </div>
              <div className="att-detail-item">
                <span className="att-detail-label">Responsible</span>
                <span className="att-detail-value">{a.teacher}</span>
              </div>
            </div>

            {mcOpen === i && (
              <div className="abs-mc-form">
                <p className="abs-mc-form-label">Reason / MC Note</p>
                <textarea
                  className="abs-mc-textarea"
                  placeholder="Briefly describe your reason or paste your MC details..."
                  value={mcNote}
                  onChange={e => setMcNote(e.target.value)}
                  rows={3}
                />
                {errors[i] && <p className="abs-mc-error" style={{ color: 'var(--taylors-red)', margin: '6px 0' }}>{errors[i]}</p>}
                <button
                  className="abs-mc-submit-btn"
                  disabled={!mcNote.trim() || loading[i]}
                  onClick={() => handleSubmit(i)}
                >
                  {loading[i] ? 'Submitting…' : 'Submit Request'}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

const RING_R = 32
const CIRCUMFERENCE = 2 * Math.PI * RING_R

function RingDonut({ pct, warning }) {
  const offset = CIRCUMFERENCE - (pct / 100) * CIRCUMFERENCE
  const color = warning ? 'var(--taylors-red)' : '#34d399'
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" className="att-ring" style={{ overflow: 'visible' }}>
      <circle cx="40" cy="40" r={RING_R} fill="none" stroke="var(--control-bg-hover)" strokeWidth="6" strokeLinecap="round" />
      <circle
        cx="40" cy="40" r={RING_R} fill="none"
        stroke={color} strokeWidth="6"
        strokeDasharray={CIRCUMFERENCE}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 40 40)"
        style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.22,1,0.36,1)', filter: `drop-shadow(0 0 6px ${color})` }}
      />
      <text x="40" y="44" textAnchor="middle" dominantBaseline="middle"
        style={{ fill: 'var(--text)', fontSize: '0.95rem', fontWeight: 700, fontFamily: 'inherit' }}>
        {pct}%
      </text>
    </svg>
  )
}

function AttendanceCard({ m, onClick }) {
  const warn = m.attendance < 80
  const borderColor = warn ? 'rgba(226,35,26,0.5)' : 'rgba(52,211,153,0.35)'
  const accentBg    = warn ? 'rgba(226,35,26,0.04)' : 'rgba(52,211,153,0.04)'

  return (
    <div className="att-module-card" style={{ borderColor, background: accentBg }}
         onClick={onClick} role="button" tabIndex={0}
         onKeyDown={e => e.key === 'Enter' && onClick()}>
      <div className="att-module-card-head">
        <div className="att-module-card-left">
          <RingDonut pct={m.attendance} warning={warn} />
          <div className="att-module-card-info">
            <span className="att-module-name">{m.name}</span>
            <span className="att-module-code">{m.code}</span>
            <span className="att-module-stat">{m.attended}/{m.totalClasses} classes attended</span>
            {warn && <span className="att-warn-chip">⚠ Below 80%</span>}
          </div>
        </div>
        <div className="att-module-card-right">
          <div className="bar-track" style={{ width: 90 }}>
            <div className="bar-fill" style={{ width: `${m.attendance}%`, background: warn ? 'var(--taylors-red)' : '#34d399', boxShadow: warn ? '0 0 8px rgba(226,35,26,0.5)' : '0 0 8px rgba(52,211,153,0.4)' }} />
            <span className="bar-marker" title="80% threshold" />
          </div>
          <span className="att-chevron">›</span>
        </div>
      </div>
    </div>
  )
}

function ModuleAttendanceDetail({ m, log, onBack }) {
  const sessions = log.filter(l => l.module === m.code)
  const present   = sessions.filter(s => s.status === 'present')
  const absent    = sessions.filter(s => s.status === 'absent')
  const remaining = sessions.filter(s => s.status === 'remaining')
  const warn = m.attendance < 80

  const [submitted, setSubmitted] = useState(
    absent.reduce((acc, a, i) => ({ ...acc, [a.id]: a.mcSubmitted }), {})
  )
  const [mcOpen, setMcOpen] = useState(null)
  const [mcNote, setMcNote]   = useState('')
  const [loading, setLoading] = useState({})
  const [errors,  setErrors]  = useState({})

  const handleMcSubmit = async (a) => {
    setLoading(l => ({ ...l, [a.id]: true }))
    setErrors(e => ({ ...e, [a.id]: null }))
    try {
      await submitMcRequest({ logId: a.id, note: mcNote.trim() })
      setSubmitted(s => ({ ...s, [a.id]: true }))
      setMcOpen(null)
      setMcNote('')
    } catch (err) {
      setErrors(e => ({ ...e, [a.id]: err.message || 'Failed' }))
    } finally {
      setLoading(l => ({ ...l, [a.id]: false }))
    }
  }

  const statusDot = status => {
    if (status === 'present')   return { color: '#34d399', label: 'Present' }
    if (status === 'absent')    return { color: 'var(--taylors-red)', label: 'Absent' }
    return { color: 'var(--text-muted)', label: 'Upcoming' }
  }

  return (
    <div className="view">
      <header className="view-header">
        <button className="module-back" onClick={onBack}>← Back</button>
      </header>

      {/* Hero */}
      <div className="att-mod-detail-hero" style={{ borderColor: warn ? 'rgba(226,35,26,0.5)' : 'rgba(52,211,153,0.4)' }}>
        <div className="att-mod-detail-left">
          <RingDonut pct={m.attendance} warning={warn} />
          <div>
            <h2 className="att-mod-detail-name">{m.name}</h2>
            <span className="att-module-code">{m.code}</span>
            {warn && <span className="att-warn-chip" style={{ marginTop: 6 }}>⚠ Below 80% threshold</span>}
          </div>
        </div>
        <div className="att-mod-detail-stats">
          <div className="att-mod-stat-pill" style={{ color: '#34d399', borderColor: 'rgba(52,211,153,0.3)' }}>
            <span className="att-mod-stat-num">{present.length}</span>
            <span className="att-mod-stat-lbl">Present</span>
          </div>
          <div className="att-mod-stat-pill" style={{ color: 'var(--taylors-red-light)', borderColor: 'rgba(226,35,26,0.3)' }}>
            <span className="att-mod-stat-num">{absent.length}</span>
            <span className="att-mod-stat-lbl">Absent</span>
          </div>
          <div className="att-mod-stat-pill">
            <span className="att-mod-stat-num">{remaining.length}</span>
            <span className="att-mod-stat-lbl">Upcoming</span>
          </div>
          <div className="att-mod-stat-pill">
            <span className="att-mod-stat-num">{m.credits}</span>
            <span className="att-mod-stat-lbl">Credits</span>
          </div>
        </div>
      </div>

      {/* Info grid */}
      <div className="att-mod-info-grid">
        {[
          ['Lecturer',         m.lecturer],
          m.tutor            && ['Tutor',            m.tutor],
          m.lectureVenue     && ['Lecture Venue',    m.lectureVenue],
          m.tutorialVenue    && ['Tutorial Venue',   m.tutorialVenue],
          m.tutorialSection  && ['Tutorial Section', m.tutorialSection],
        ].filter(Boolean).map(([label, val]) => (
          <div key={label} className="att-detail-item">
            <span className="att-detail-label">{label}</span>
            <span className="att-detail-value">{val}</span>
          </div>
        ))}
      </div>

      {/* Session list */}
      <h3 className="att-col-title" style={{ marginTop: 4 }}>Class Sessions ({sessions.length})</h3>
      <div className="att-sessions-list">
        {sessions.length === 0 && <p className="att-code">No sessions recorded yet.</p>}
        {sessions.map((s, i) => {
          const dot = statusDot(s.status)
          const isAbs = s.status === 'absent'
          const isMcOpen = mcOpen === s.id
          return (
            <div key={s.id || i} className={`att-session-detail-row${isAbs ? ' att-session-detail-absent' : ''}`}>
              <div className="att-session-detail-top">
                <span className="att-session-detail-dot" style={{ background: dot.color }} />
                <div className="att-session-detail-info">
                  <span className="att-session-detail-title">
                    {s.type} — {s.date}
                  </span>
                  <span className="att-session-detail-meta">{s.time}{s.teacher ? ` · ${s.teacher}` : ''}</span>
                </div>
                <span className="att-session-detail-status" style={{ color: dot.color }}>{dot.label}</span>
                {isAbs && (
                  submitted[s.id]
                    ? <span className="abs-mc-badge submitted">MC</span>
                    : <button className="abs-mc-btn" onClick={() => { setMcOpen(isMcOpen ? null : s.id); setMcNote('') }}>
                        {isMcOpen ? 'Cancel' : 'Submit MC'}
                      </button>
                )}
              </div>
              {isMcOpen && (
                <div className="att-mc-inline">
                  <textarea
                    className="asgn-submit-note"
                    placeholder="Reason / MC details…"
                    rows={2}
                    value={mcNote}
                    onChange={e => setMcNote(e.target.value)}
                  />
                  {errors[s.id] && <p style={{ color: 'var(--taylors-red)', fontSize: '0.72rem' }}>{errors[s.id]}</p>}
                  <div className="asgn-submit-actions">
                    <button className="asgn-submit-btn" disabled={!mcNote.trim() || loading[s.id]}
                      onClick={() => handleMcSubmit(s)}>
                      {loading[s.id] ? 'Submitting…' : 'Submit Request'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function AttendanceView() {
  const [showAllAbsences, setShowAllAbsences] = useState(false)
  const [selectedModule,  setSelectedModule]  = useState(null)
  const [modules,       setModules]       = useState([])
  const [attendanceLog, setAttendanceLog] = useState([])
  const [weekSchedule,  setWeekSchedule]  = useState([])

  useEffect(() => {
    getModules().then(setModules)
    getAttendanceLog().then(setAttendanceLog)
    getWeekSchedule().then(setWeekSchedule)
  }, [])

  const totalAttended = modules.reduce((s, m) => s + m.attended, 0)
  const totalClasses  = modules.reduce((s, m) => s + m.totalClasses, 0)
  const overallPct    = totalClasses ? Math.round((totalAttended / totalClasses) * 100) : 0
  const missed        = totalClasses - totalAttended
  const atRisk        = modules.filter(m => m.attendance < 80).length
  const absences      = attendanceLog.filter(l => l.status === 'absent')
  const weekPresent   = weekSchedule.filter(s => s.status === 'present').length
  const weekTotal     = weekSchedule.length

  if (showAllAbsences) {
    return <AbsenceDetailView absences={absences} onBack={() => setShowAllAbsences(false)} />
  }

  if (selectedModule) {
    return <ModuleAttendanceDetail m={selectedModule} log={attendanceLog} onBack={() => setSelectedModule(null)} />
  }

  return (
    <div className="view">

      {/* ── Hero stat strip ── */}
      <div className="att-hero">
        <div className="att-hero-donut">
          <RingDonut pct={overallPct} warning={overallPct < 80} />
          <span className="att-hero-label">Overall</span>
        </div>
        <div className="att-hero-divider" />
        <div className="att-hero-stats">
          <div className="att-hero-stat">
            <span className="att-hero-stat-val">{totalClasses}</span>
            <span className="att-hero-stat-label">Total Classes</span>
          </div>
          <div className="att-hero-stat">
            <span className="att-hero-stat-val" style={{ color: '#34d399' }}>{totalAttended}</span>
            <span className="att-hero-stat-label">Attended</span>
          </div>
          <div className="att-hero-stat">
            <span className="att-hero-stat-val" style={{ color: missed > 0 ? 'var(--taylors-red-light)' : 'var(--text)' }}>{missed}</span>
            <span className="att-hero-stat-label">Missed</span>
          </div>
          <div className="att-hero-stat">
            <span className="att-hero-stat-val" style={{ color: atRisk > 0 ? 'var(--taylors-red-light)' : '#34d399' }}>{atRisk}</span>
            <span className="att-hero-stat-label">At Risk</span>
          </div>
        </div>
        <div className="att-hero-bar-wrap">
          <div className="bar-track">
            <div className="bar-fill" style={{ width: `${overallPct}%` }} />
            <span className="bar-marker" title="80% safe threshold" />
          </div>
          <span className="att-hero-bar-label">80% threshold</span>
        </div>
      </div>

      {/* ── Two-column body ── */}
      <div className="att-body-grid">

        {/* Left — module cards */}
        <div className="att-modules-col">
          <h3 className="att-col-title">Per Module</h3>
          {modules.map(m => <AttendanceCard key={m.code} m={m} onClick={() => setSelectedModule(m)} />)}
        </div>

        {/* Right — week + absences */}
        <div className="att-right-col">

          <div className="att-week-section">
            <div className="att-col-title-row">
              <h3 className="att-col-title">This Week</h3>
              <span className="att-code">{weekPresent}/{weekTotal} attended</span>
            </div>
            <div className="att-week-grid">
              {['Mon','Tue','Wed','Thu','Fri'].map(day => {
                const daySessions = weekSchedule.filter(s => s.day === day)
                return (
                  <div key={day} className="att-week-col">
                    <div className="att-week-day">{day}</div>
                    {daySessions.length === 0
                      ? <div className="att-week-empty">—</div>
                      : daySessions.map((s, i) => (
                        <div key={i} className={`att-week-chip ${s.status}`}>
                          <span className="att-week-chip-type">{s.type}</span>
                          <span className="att-week-chip-name">{s.name.split(' ').slice(0,2).join(' ')}</span>
                          <span className="att-week-chip-status">{s.status}</span>
                        </div>
                      ))
                    }
                  </div>
                )
              })}
            </div>
          </div>

          <div className="att-abs-section">
            <div className="att-col-title-row">
              <h3 className="att-col-title">Absences</h3>
              {absences.length > PREVIEW_COUNT && (
                <button className="abs-view-all-btn" onClick={() => setShowAllAbsences(true)}>
                  View all {absences.length} →
                </button>
              )}
            </div>
            {absences.length === 0
              ? <p className="att-code" style={{ padding: '6px 0' }}>No absences recorded.</p>
              : absences.slice(0, PREVIEW_COUNT).map((a, i) => (
                <div key={i} className="att-abs-row">
                  <span className="att-session-dot absent" />
                  <div className="att-session-info">
                    <span className="att-module">{a.name}</span>
                    <span className="att-code">{a.date} · {a.time} · {a.type}</span>
                  </div>
                  {a.mcSubmitted
                    ? <span className="abs-mc-badge submitted">MC</span>
                    : <span className="att-session-status absent">Absent</span>
                  }
                </div>
              ))
            }
            {absences.length > PREVIEW_COUNT && (
              <button className="abs-view-more-row" onClick={() => setShowAllAbsences(true)}>
                + {absences.length - PREVIEW_COUNT} more — View all
              </button>
            )}
          </div>

        </div>
      </div>

    </div>
  )
}
