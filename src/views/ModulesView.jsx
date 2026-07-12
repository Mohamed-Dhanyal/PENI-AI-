import { useState, useEffect } from 'react'
import { getModules, getWeeklyMaterials, getAssignments, submitAssignment } from '../api/index.js'
import StudyModal from '../components/StudyModal.jsx'

export default function ModulesView() {
  const [selected, setSelected] = useState(null)
  const [modules, setModules]   = useState([])

  useEffect(() => { getModules().then(setModules) }, [])

  const totalCredits = modules.reduce((s, m) => s + m.credits, 0)

  if (selected) {
    return (
      <ModuleDetail
        module={selected}
        onBack={() => setSelected(null)}
      />
    )
  }

  return (
    <div className="view">
      <header className="view-header">
        <div>
          <h2 className="view-title">My Modules</h2>
          <p className="view-sub">{modules.length} modules · {totalCredits} credit hours this semester</p>
        </div>
      </header>

      <div className="module-grid">
        {modules.map(m => (
          <article
            key={m.code}
            className="module-card"
            style={{ borderLeftColor: m.accent || 'var(--taylors-red)' }}
            onClick={() => setSelected(m)}
          >
            <div className="module-top">
              <span className="module-code">{m.code}</span>
              <span className="module-credits-chip">{m.credits} cr</span>
            </div>
            <h3 className="module-name">{m.name}</h3>

            <div className="module-people">
              <div className="module-person-row">
                <span className="module-person-label">Coordinator</span>
                <span className="module-person-name">{m.coordinator}</span>
              </div>
              <div className="module-person-row">
                <span className="module-person-label">Lecturer</span>
                <span className="module-person-name">{m.lecturer}</span>
              </div>
              {m.tutor && (
                <div className="module-person-row">
                  <span className="module-person-label">Tutor</span>
                  <span className="module-person-name">{m.tutor}</span>
                </div>
              )}
            </div>

            <div className="module-venues">
              <div className="module-venue-row">
                <span className="module-venue-label">Lecture Venue</span>
                <span className="module-venue-val">{m.lectureVenue}</span>
              </div>
              {m.tutorialVenue && (
                <div className="module-venue-row">
                  <span className="module-venue-label">Tutorial Venue</span>
                  <span className="module-venue-val">{m.tutorialVenue}</span>
                </div>
              )}
              {m.tutorialSection && (
                <div className="module-venue-row">
                  <span className="module-venue-label">Tutorial Section</span>
                  <span className="module-venue-val">{m.tutorialSection}</span>
                </div>
              )}
            </div>

          </article>
        ))}
      </div>
    </div>
  )
}

const MATERIAL_ICONS = {
  'lecture-slides':  '📄',
  'tutorial-slides': '📋',
  'tutorial-answers':'✅',
  'video':           '🎬',
  'reference':       '🔗',
  'other':           '📎',
}

const ASSIGNMENT_STATUS_COLOR = {
  submitted: 'var(--taylors-red-light)',
  graded:    '#4ade80',
  pending:   'var(--text-muted)',
}

function ModuleDetail({ module: m, onBack }) {
  const [tab, setTab] = useState('overview')
  const [materials, setMaterials] = useState([])
  const [assignments, setAssignments] = useState([])
  const [loadingMat, setLoadingMat] = useState(false)
  const [loadingAsgn, setLoadingAsgn] = useState(false)
  const [expandedAsgn, setExpandedAsgn] = useState(null)
  const [submitState, setSubmitState] = useState({})
  const [submitNote, setSubmitNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [studyItem, setStudyItem] = useState(null)
  const [studyMode, setStudyMode] = useState('geni')

  useEffect(() => {
    if (tab === 'materials' && materials.length === 0) {
      setLoadingMat(true)
      getWeeklyMaterials(m.code).then(d => { setMaterials(d); setLoadingMat(false) }).catch(() => setLoadingMat(false))
    }
    if (tab === 'assignments' && assignments.length === 0) {
      setLoadingAsgn(true)
      getAssignments(m.code).then(d => { setAssignments(d); setLoadingAsgn(false) }).catch(() => setLoadingAsgn(false))
    }
  }, [tab])

  const groupedMaterials = materials.reduce((acc, item) => {
    const key = item.weekNumber
    if (!acc[key]) acc[key] = { label: item.weekLabel || `Week ${key}`, items: [] }
    acc[key].items.push(item)
    return acc
  }, {})

  const handleSubmit = async (asgnId) => {
    setSubmitting(true)
    try {
      await submitAssignment({ id: asgnId, note: submitNote })
      setAssignments(prev => prev.map(a => a.id === asgnId
        ? { ...a, submission: { status: 'submitted', submittedAt: new Date().toISOString(), note: submitNote } }
        : a
      ))
      setSubmitNote('')
      setSubmitState(s => ({ ...s, [asgnId]: false }))
    } catch {}
    setSubmitting(false)
  }

  return (
    <div className="view">
      <header className="view-header">
        <button className="module-back" onClick={onBack}>← Back</button>
      </header>

      <div className="mod-detail-hero" style={{ borderColor: m.accent || 'var(--taylors-red)' }}>
        <span className="mod-detail-code">{m.code}</span>
        <h2 className="mod-detail-name">{m.name}</h2>
        <p className="mod-detail-people">{m.lecturer}{m.tutor ? ` · Tutor: ${m.tutor}` : ''}</p>
      </div>

      <div className="mod-tabs">
        {['overview','materials','assignments'].map(t => (
          <button key={t} className={`mod-tab${tab === t ? ' mod-tab-active' : ''}`} onClick={() => setTab(t)}>
            {t === 'overview' ? 'Overview' : t === 'materials' ? 'Weekly Materials' : 'Assignments'}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="mod-detail-body">
          <div className="mod-detail-section">
            <span className="mod-detail-section-title">People</span>
            {[['Coordinator', m.coordinator], ['Lecturer', m.lecturer], m.tutor && ['Tutor', m.tutor]].filter(Boolean).map(([l,v]) => (
              <div key={l} className="mod-detail-row"><span className="mod-detail-label">{l}</span><span className="mod-detail-value">{v}</span></div>
            ))}
          </div>
          <div className="mod-detail-section">
            <span className="mod-detail-section-title">Venue & Section</span>
            {[
              ['Lecture Venue', m.lectureVenue],
              m.tutorialVenue && ['Tutorial Venue', m.tutorialVenue],
              m.tutorialSection && ['Tutorial Section', m.tutorialSection],
            ].filter(Boolean).map(([l,v]) => (
              <div key={l} className="mod-detail-row"><span className="mod-detail-label">{l}</span><span className="mod-detail-value">{v}</span></div>
            ))}
          </div>
          <div className="mod-detail-section">
            <span className="mod-detail-section-title">Progress</span>
            <div className="mod-detail-row"><span className="mod-detail-label">Attendance</span><span className="mod-detail-value">{m.attendance}%</span></div>
            <div className="mod-detail-row"><span className="mod-detail-label">Grade</span><span className="mod-detail-value">{m.grade || '—'}</span></div>
            <div className="mod-detail-row"><span className="mod-detail-label">Credits</span><span className="mod-detail-value">{m.credits}</span></div>
          </div>
        </div>
      )}

      {tab === 'materials' && (
        <div className="mod-materials">
          {loadingMat && <p className="event-meta" style={{padding:'8px'}}>Loading…</p>}
          {!loadingMat && Object.keys(groupedMaterials).length === 0 && (
            <p className="event-meta" style={{padding:'8px'}}>No materials uploaded yet.</p>
          )}
          {Object.entries(groupedMaterials).map(([week, group]) => (
            <div key={week} className="mat-week-group">
              <h4 className="mat-week-label">{group.label}</h4>
              {group.items.map(item => (
                <div key={item.id} className="mat-item-row">
                  <a
                    href={item.url || '#'}
                    target={item.url ? '_blank' : undefined}
                    rel="noreferrer"
                    className="mat-item"
                  >
                    <span className="mat-item-icon">{MATERIAL_ICONS[item.type] || '📎'}</span>
                    <div className="mat-item-info">
                      <span className="mat-item-title">{item.title}</span>
                      {item.description && <span className="mat-item-desc">{item.description}</span>}
                    </div>
                    <span className="mat-item-type">{item.type?.replace(/-/g,' ')}</span>
                  </a>
                  <div className="mat-item-actions">
                    <button
                      className="mat-study-btn"
                      title="Study this topic with Peni"
                      onClick={() => { setStudyMode('geni'); setStudyItem(item) }}
                    >
                      ✦ Study with Peni
                    </button>
                    <button
                      className="mat-plan-btn"
                      title="Generate a study plan for this topic"
                      onClick={() => { setStudyMode('plan'); setStudyItem(item) }}
                    >
                      Study Plan
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {tab === 'assignments' && (
        <div className="mod-assignments">
          {loadingAsgn && <p className="event-meta" style={{padding:'8px'}}>Loading…</p>}
          {!loadingAsgn && assignments.length === 0 && (
            <p className="event-meta" style={{padding:'8px'}}>No assignments yet.</p>
          )}
          {assignments.map(a => {
            const isOpen = expandedAsgn === a.id
            const sub = a.submission
            const showForm = submitState[a.id]
            return (
              <div key={a.id} className={`asgn-card${isOpen ? ' asgn-card-open' : ''}`}>
                <button className="asgn-card-head" onClick={() => setExpandedAsgn(isOpen ? null : a.id)}>
                  <div className="asgn-card-left">
                    <span className="asgn-title">{a.title}</span>
                    {a.weekNumber && <span className="asgn-week">Week {a.weekNumber}</span>}
                  </div>
                  <div className="asgn-card-right">
                    {a.dueDate && <span className="asgn-due">Due {a.dueDate}</span>}
                    {sub
                      ? <span className="asgn-status" style={{ color: ASSIGNMENT_STATUS_COLOR[sub.status] || 'var(--text-muted)' }}>
                          {sub.status === 'graded' ? `Graded: ${sub.grade}` : 'Submitted'}
                        </span>
                      : <span className="asgn-status" style={{ color: 'var(--text-muted)' }}>Not submitted</span>
                    }
                    <span className="asgn-chevron">{isOpen ? '▲' : '▼'}</span>
                  </div>
                </button>

                {isOpen && (
                  <div className="asgn-body">
                    {a.brief && <p className="asgn-brief">{a.brief}</p>}

                    {a.docs.length > 0 && (
                      <div className="asgn-docs">
                        <span className="asgn-docs-label">Documents</span>
                        {a.docs.map(d => (
                          <a key={d.id} href={d.url || '#'} target={d.url ? '_blank' : undefined} rel="noreferrer" className="mat-item mat-item-sm">
                            <span className="mat-item-icon">{MATERIAL_ICONS[d.type] || '📎'}</span>
                            <span className="mat-item-title">{d.title}</span>
                            <span className="mat-item-type">{d.type}</span>
                          </a>
                        ))}
                      </div>
                    )}

                    {a.submissionLink && (
                      <a href={a.submissionLink} target="_blank" rel="noreferrer" className="asgn-ext-link">
                        Open submission portal ↗
                      </a>
                    )}

                    {sub && sub.status === 'graded' && (
                      <div className="asgn-feedback">
                        <span className="asgn-docs-label">Feedback</span>
                        <p className="asgn-brief">{sub.feedback || 'No feedback provided.'}</p>
                      </div>
                    )}

                    {!sub && !showForm && (
                      <button className="asgn-submit-btn" onClick={() => setSubmitState(s => ({ ...s, [a.id]: true }))}>
                        Submit for Grading
                      </button>
                    )}

                    {!sub && showForm && (
                      <div className="asgn-submit-form">
                        <textarea
                          className="asgn-submit-note"
                          placeholder="Add a note (optional)…"
                          value={submitNote}
                          onChange={e => setSubmitNote(e.target.value)}
                          rows={3}
                        />
                        <div className="asgn-submit-actions">
                          <button className="asgn-submit-btn" disabled={submitting} onClick={() => handleSubmit(a.id)}>
                            {submitting ? 'Submitting…' : 'Confirm Submit'}
                          </button>
                          <button className="asgn-cancel-btn" onClick={() => setSubmitState(s => ({ ...s, [a.id]: false }))}>Cancel</button>
                        </div>
                      </div>
                    )}

                    {sub && sub.status === 'submitted' && (
                      <p className="event-meta" style={{marginTop:'8px'}}>
                        Submitted {sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString() : ''}
                        {sub.note ? ` · "${sub.note}"` : ''}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {studyItem && (
        <StudyModal
          item={studyItem}
          moduleName={m.name}
          mode={studyMode}
          onClose={() => setStudyItem(null)}
        />
      )}
    </div>
  )
}
