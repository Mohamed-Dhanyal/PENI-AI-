import { useState, useEffect } from 'react'
import {
  getWeeklyMaterials, uploadWeeklyMaterial, deleteWeeklyMaterial,
  getAssignments, createAssignment, updateAssignment, deleteAssignment,
  attachAssignmentDoc, getSubmissions, gradeSubmission,
} from '../../api/index.js'

const MATERIAL_TYPES = ['lecture-slides','tutorial-slides','tutorial-answers','video','reference','other']
const MATERIAL_ICONS = {
  'lecture-slides':'📄','tutorial-slides':'📋','tutorial-answers':'✅',
  'video':'🎬','reference':'🔗','other':'📎',
}

export default function TeacherModuleView({ module: m, onBack }) {
  const [tab, setTab] = useState('materials')

  return (
    <div className="view">
      <header className="view-header">
        <button className="module-back" onClick={onBack}>← Back</button>
      </header>

      <div className="mod-detail-hero" style={{ borderColor: m.accent || 'var(--taylors-red)' }}>
        <span className="mod-detail-code">{m.code}</span>
        <h2 className="mod-detail-name">{m.name}</h2>
        <p className="mod-detail-people">Teacher Portal</p>
      </div>

      <div className="mod-tabs">
        {['materials','assignments'].map(t => (
          <button key={t} className={`mod-tab${tab === t ? ' mod-tab-active' : ''}`} onClick={() => setTab(t)}>
            {t === 'materials' ? 'Weekly Materials' : 'Assignments'}
          </button>
        ))}
      </div>

      {tab === 'materials' && <MaterialsTab moduleCode={m.code} />}
      {tab === 'assignments' && <AssignmentsTab moduleCode={m.code} />}
    </div>
  )
}

/* ─── Weekly Materials Tab ───────────────────────────────────────────────── */
function MaterialsTab({ moduleCode }) {
  const [materials, setMaterials] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ weekNumber: '', weekLabel: '', type: 'lecture-slides', title: '', url: '', description: '' })
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const load = () => {
    setLoading(true)
    getWeeklyMaterials(moduleCode).then(d => { setMaterials(d); setLoading(false) }).catch(() => setLoading(false))
  }
  useEffect(load, [])

  const grouped = materials.reduce((acc, item) => {
    const key = item.weekNumber
    if (!acc[key]) acc[key] = { label: item.weekLabel || `Week ${key}`, items: [] }
    acc[key].items.push(item)
    return acc
  }, {})

  const handleAdd = async () => {
    if (!form.weekNumber || !form.title) return
    setSaving(true)
    try {
      await uploadWeeklyMaterial(moduleCode, {
        weekNumber: Number(form.weekNumber),
        weekLabel: form.weekLabel || `Week ${form.weekNumber}`,
        type: form.type, title: form.title,
        url: form.url || null, description: form.description || null,
      })
      setForm({ weekNumber: '', weekLabel: '', type: 'lecture-slides', title: '', url: '', description: '' })
      setShowForm(false)
      load()
    } catch {}
    setSaving(false)
  }

  const handleDelete = async (id) => {
    await deleteWeeklyMaterial(id)
    setMaterials(prev => prev.filter(m => m.id !== id))
  }

  return (
    <div className="mod-materials">
      <div className="t-toolbar">
        <button className="t-add-btn" onClick={() => setShowForm(s => !s)}>
          {showForm ? '✕ Cancel' : '+ Add Material'}
        </button>
      </div>

      {showForm && (
        <div className="t-form-card">
          <div className="t-form-row">
            <label className="t-label">Week #</label>
            <input className="t-input" type="number" min="1" placeholder="1" value={form.weekNumber}
              onChange={e => setForm(s => ({ ...s, weekNumber: e.target.value }))} />
          </div>
          <div className="t-form-row">
            <label className="t-label">Week Label</label>
            <input className="t-input" placeholder="e.g. Week 1 — Introduction" value={form.weekLabel}
              onChange={e => setForm(s => ({ ...s, weekLabel: e.target.value }))} />
          </div>
          <div className="t-form-row">
            <label className="t-label">Type</label>
            <select className="t-input" value={form.type} onChange={e => setForm(s => ({ ...s, type: e.target.value }))}>
              {MATERIAL_TYPES.map(t => <option key={t} value={t}>{t.replace(/-/g,' ')}</option>)}
            </select>
          </div>
          <div className="t-form-row">
            <label className="t-label">Title *</label>
            <input className="t-input" placeholder="Lecture Slides Week 1" value={form.title}
              onChange={e => setForm(s => ({ ...s, title: e.target.value }))} />
          </div>
          <div className="t-form-row">
            <label className="t-label">URL</label>
            <input className="t-input" placeholder="https://…" value={form.url}
              onChange={e => setForm(s => ({ ...s, url: e.target.value }))} />
          </div>
          <div className="t-form-row">
            <label className="t-label">Description</label>
            <input className="t-input" placeholder="Optional note" value={form.description}
              onChange={e => setForm(s => ({ ...s, description: e.target.value }))} />
          </div>
          <button className="asgn-submit-btn" disabled={saving || !form.weekNumber || !form.title} onClick={handleAdd}>
            {saving ? 'Saving…' : 'Upload Material'}
          </button>
        </div>
      )}

      {loading && <p className="event-meta" style={{ padding: '8px' }}>Loading…</p>}
      {!loading && Object.keys(grouped).length === 0 && <p className="event-meta" style={{ padding: '8px' }}>No materials yet.</p>}

      {Object.entries(grouped).map(([week, group]) => (
        <div key={week} className="mat-week-group">
          <h4 className="mat-week-label">{group.label}</h4>
          {group.items.map(item => (
            <div key={item.id} className="mat-item t-mat-item">
              <span className="mat-item-icon">{MATERIAL_ICONS[item.type] || '📎'}</span>
              <div className="mat-item-info">
                <span className="mat-item-title">{item.title}</span>
                {item.description && <span className="mat-item-desc">{item.description}</span>}
                {item.url && <span className="mat-item-desc" style={{ color: 'var(--taylors-red-light)' }}>{item.url}</span>}
              </div>
              <span className="mat-item-type">{item.type?.replace(/-/g,' ')}</span>
              <button className="t-delete-btn" onClick={() => handleDelete(item.id)} title="Delete">✕</button>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

/* ─── Assignments Tab ────────────────────────────────────────────────────── */
function AssignmentsTab({ moduleCode }) {
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ weekNumber: '', title: '', brief: '', dueDate: '', submissionLink: '', maxMarks: '100' })
  const [saving, setSaving] = useState(false)
  const [expanded, setExpanded] = useState(null)
  const [docForms, setDocForms] = useState({})
  const [submissions, setSubmissions] = useState({})
  const [gradeForm, setGradeForm] = useState({})

  const load = () => {
    setLoading(true)
    getAssignments(moduleCode).then(d => { setAssignments(d); setLoading(false) }).catch(() => setLoading(false))
  }
  useEffect(load, [])

  const handleCreate = async () => {
    if (!form.title) return
    setSaving(true)
    try {
      await createAssignment(moduleCode, {
        weekNumber: form.weekNumber ? Number(form.weekNumber) : null,
        title: form.title, brief: form.brief || null,
        dueDate: form.dueDate || null, submissionLink: form.submissionLink || null,
        maxMarks: Number(form.maxMarks) || 100,
      })
      setForm({ weekNumber: '', title: '', brief: '', dueDate: '', submissionLink: '', maxMarks: '100' })
      setShowForm(false)
      load()
    } catch {}
    setSaving(false)
  }

  const handleDelete = async (id) => {
    await deleteAssignment(id)
    setAssignments(prev => prev.filter(a => a.id !== id))
  }

  const handleAttachDoc = async (asgnId) => {
    const df = docForms[asgnId] || {}
    if (!df.type || !df.title) return
    await attachAssignmentDoc(asgnId, { type: df.type, title: df.title, url: df.url || null })
    setDocForms(s => ({ ...s, [asgnId]: { type: 'lecture-slides', title: '', url: '' } }))
    load()
  }

  const loadSubmissions = async (asgnId) => {
    if (submissions[asgnId]) return
    const data = await getSubmissions(asgnId)
    setSubmissions(s => ({ ...s, [asgnId]: data }))
  }

  const handleGrade = async (subId, asgnId) => {
    const gf = gradeForm[subId] || {}
    await gradeSubmission(subId, { grade: gf.grade || '', feedback: gf.feedback || '' })
    setSubmissions(s => ({
      ...s,
      [asgnId]: s[asgnId].map(sub => sub.id === subId ? { ...sub, status: 'graded', grade: gf.grade, feedback: gf.feedback } : sub)
    }))
    setGradeForm(s => ({ ...s, [subId]: undefined }))
  }

  return (
    <div className="mod-assignments">
      <div className="t-toolbar">
        <button className="t-add-btn" onClick={() => setShowForm(s => !s)}>
          {showForm ? '✕ Cancel' : '+ New Assignment'}
        </button>
      </div>

      {showForm && (
        <div className="t-form-card">
          <div className="t-form-row">
            <label className="t-label">Title *</label>
            <input className="t-input" placeholder="Assignment 1" value={form.title}
              onChange={e => setForm(s => ({ ...s, title: e.target.value }))} />
          </div>
          <div className="t-form-row">
            <label className="t-label">Week #</label>
            <input className="t-input" type="number" min="1" placeholder="optional" value={form.weekNumber}
              onChange={e => setForm(s => ({ ...s, weekNumber: e.target.value }))} />
          </div>
          <div className="t-form-row">
            <label className="t-label">Brief</label>
            <textarea className="t-input" rows={3} placeholder="Assignment description…" value={form.brief}
              onChange={e => setForm(s => ({ ...s, brief: e.target.value }))} />
          </div>
          <div className="t-form-row">
            <label className="t-label">Due Date</label>
            <input className="t-input" type="date" value={form.dueDate}
              onChange={e => setForm(s => ({ ...s, dueDate: e.target.value }))} />
          </div>
          <div className="t-form-row">
            <label className="t-label">Submission Link</label>
            <input className="t-input" placeholder="https://turnitin.com/…" value={form.submissionLink}
              onChange={e => setForm(s => ({ ...s, submissionLink: e.target.value }))} />
          </div>
          <div className="t-form-row">
            <label className="t-label">Max Marks</label>
            <input className="t-input" type="number" value={form.maxMarks}
              onChange={e => setForm(s => ({ ...s, maxMarks: e.target.value }))} />
          </div>
          <button className="asgn-submit-btn" disabled={saving || !form.title} onClick={handleCreate}>
            {saving ? 'Creating…' : 'Create Assignment'}
          </button>
        </div>
      )}

      {loading && <p className="event-meta" style={{ padding: '8px' }}>Loading…</p>}
      {!loading && assignments.length === 0 && <p className="event-meta" style={{ padding: '8px' }}>No assignments yet.</p>}

      {assignments.map(a => {
        const isOpen = expanded === a.id
        const subs = submissions[a.id]
        const df = docForms[a.id] || { type: 'lecture-slides', title: '', url: '' }

        return (
          <div key={a.id} className={`asgn-card${isOpen ? ' asgn-card-open' : ''}`}>
            <button className="asgn-card-head" onClick={() => {
              setExpanded(isOpen ? null : a.id)
              if (!isOpen) loadSubmissions(a.id)
            }}>
              <div className="asgn-card-left">
                <span className="asgn-title">{a.title}</span>
                {a.weekNumber && <span className="asgn-week">Week {a.weekNumber}</span>}
              </div>
              <div className="asgn-card-right">
                {a.dueDate && <span className="asgn-due">Due {a.dueDate}</span>}
                <span className="asgn-chevron">{isOpen ? '▲' : '▼'}</span>
              </div>
            </button>

            {isOpen && (
              <div className="asgn-body">
                {a.brief && <p className="asgn-brief">{a.brief}</p>}
                {a.submissionLink && <p className="event-meta">Submission portal: <a href={a.submissionLink} target="_blank" rel="noreferrer" className="asgn-ext-link">{a.submissionLink} ↗</a></p>}

                {/* Attached docs */}
                {a.docs.length > 0 && (
                  <div className="asgn-docs">
                    <span className="asgn-docs-label">Attached Documents</span>
                    {a.docs.map(d => (
                      <div key={d.id} className="mat-item mat-item-sm">
                        <span className="mat-item-icon">{MATERIAL_ICONS[d.type] || '📎'}</span>
                        <span className="mat-item-title">{d.title}</span>
                        <span className="mat-item-type">{d.type}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Attach doc form */}
                <div className="t-attach-row">
                  <span className="asgn-docs-label">Attach Document</span>
                  <div className="t-attach-inputs">
                    <select className="t-input t-input-sm" value={df.type}
                      onChange={e => setDocForms(s => ({ ...s, [a.id]: { ...df, type: e.target.value } }))}>
                      {MATERIAL_TYPES.map(t => <option key={t} value={t}>{t.replace(/-/g,' ')}</option>)}
                    </select>
                    <input className="t-input t-input-sm" placeholder="Title" value={df.title}
                      onChange={e => setDocForms(s => ({ ...s, [a.id]: { ...df, title: e.target.value } }))} />
                    <input className="t-input t-input-sm" placeholder="URL (optional)" value={df.url}
                      onChange={e => setDocForms(s => ({ ...s, [a.id]: { ...df, url: e.target.value } }))} />
                    <button className="t-add-btn" onClick={() => handleAttachDoc(a.id)}>Attach</button>
                  </div>
                </div>

                {/* Submissions */}
                <div className="t-submissions">
                  <span className="asgn-docs-label">Student Submissions</span>
                  {!subs && <p className="event-meta">Loading…</p>}
                  {subs && subs.length === 0 && <p className="event-meta">No submissions yet.</p>}
                  {subs && subs.map(sub => (
                    <div key={sub.id} className="t-sub-row">
                      <div className="t-sub-info">
                        <span className="t-sub-name">{sub.studentName}</span>
                        <span className="t-sub-meta">{sub.email} · {sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString() : ''}</span>
                        {sub.note && <span className="t-sub-meta">"{sub.note}"</span>}
                      </div>
                      <div className="t-sub-right">
                        {sub.status === 'graded'
                          ? <span className="asgn-status" style={{ color: '#4ade80' }}>Graded: {sub.grade}</span>
                          : (
                            gradeForm[sub.id] !== undefined
                              ? (
                                <div className="t-grade-form">
                                  <input className="t-input t-input-sm" placeholder="Grade (e.g. A, 85)" value={gradeForm[sub.id]?.grade || ''}
                                    onChange={e => setGradeForm(s => ({ ...s, [sub.id]: { ...s[sub.id], grade: e.target.value } }))} />
                                  <input className="t-input t-input-sm" placeholder="Feedback" value={gradeForm[sub.id]?.feedback || ''}
                                    onChange={e => setGradeForm(s => ({ ...s, [sub.id]: { ...s[sub.id], feedback: e.target.value } }))} />
                                  <button className="asgn-submit-btn" style={{ padding: '5px 12px', fontSize: '0.7rem' }}
                                    onClick={() => handleGrade(sub.id, a.id)}>Save</button>
                                  <button className="asgn-cancel-btn" style={{ padding: '5px 10px', fontSize: '0.7rem' }}
                                    onClick={() => setGradeForm(s => ({ ...s, [sub.id]: undefined }))}>Cancel</button>
                                </div>
                              )
                              : <button className="t-grade-btn" onClick={() => setGradeForm(s => ({ ...s, [sub.id]: { grade: '', feedback: '' } }))}>Grade</button>
                          )
                        }
                      </div>
                    </div>
                  ))}
                </div>

                <button className="t-delete-full-btn" onClick={() => handleDelete(a.id)}>Delete Assignment</button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
