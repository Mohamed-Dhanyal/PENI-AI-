import { useState, useEffect } from 'react'
import { getStudent, getTasks, getGpaHistory, getRoadmap } from '../api/index.js'

function GpaChart({ gpaHistory }) {
  const w = 320
  const h = 110
  const pad = 18
  const min = 3.2
  const max = 4.0
  if (!gpaHistory.length) return null
  const pts = gpaHistory.map((g, i) => {
    const x = pad + (i * (w - pad * 2)) / (gpaHistory.length - 1)
    const y = h - pad - ((g.gpa - min) / (max - min)) * (h - pad * 2)
    return { x, y, ...g }
  })
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="gpa-chart">
      <path d={path} fill="none" className="gpa-line" strokeWidth="2.5" strokeLinecap="round" />
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="4" className="gpa-dot" />
          <text x={p.x} y={p.y - 10} textAnchor="middle" className="gpa-label">{p.gpa}</text>
          <text x={p.x} y={h - 2} textAnchor="middle" className="gpa-sem">{p.sem.replace('Sem ', 'S')}</text>
        </g>
      ))}
    </svg>
  )
}

export default function StudyPlanView() {
  const [student,    setStudent]    = useState(null)
  const [tasks,      setTasks]      = useState([])
  const [gpaHistory, setGpaHistory] = useState([])
  const [roadmap,    setRoadmap]    = useState([])

  useEffect(() => {
    getStudent().then(setStudent)
    getTasks().then(setTasks)
    getGpaHistory().then(setGpaHistory)
    getRoadmap().then(setRoadmap)
  }, [])

  const toggle = id => setTasks(ts => ts.map(t => (t.id === id ? { ...t, done: !t.done } : t)))
  const doneCount = tasks.filter(t => t.done).length

  if (!student) return null

  return (
    <div className="view">
      <header className="view-header">
        <div>
          <h2 className="view-title">My Study Plan</h2>
          <p className="view-sub">CGPA {student.cgpa} · Semester {student.semester} of 8</p>
        </div>
      </header>

      <div className="dash-columns">
        <section className="dash-panel">
          <h3 className="panel-title">GPA Trend</h3>
          <GpaChart gpaHistory={gpaHistory} />

          <h3 className="panel-title" style={{ marginTop: '14px' }}>
            Tasks <span className="panel-count">{doneCount}/{tasks.length}</span>
          </h3>
          {tasks.map(t => (
            <label key={t.id} className={`task-row ${t.done ? 'done' : ''}`}>
              <input type="checkbox" checked={t.done} onChange={() => toggle(t.id)} />
              <span className="task-check" />
              <div className="event-info">
                <span className="event-title">{t.title}</span>
                <span className="event-meta">{t.module} · due {t.due}</span>
              </div>
              <span className={`chip prio-${t.priority}`}>{t.priority}</span>
            </label>
          ))}
        </section>

        <section className="dash-panel">
          <h3 className="panel-title">Programme Roadmap</h3>
          <div className="roadmap">
            {roadmap.map((r, i) => (
              <div key={i} className={`roadmap-row ${r.status}`}>
                <span className="roadmap-node" />
                <div className="event-info">
                  <span className="event-title">{r.sem}</span>
                  <span className="event-meta">
                    {r.modules} modules · {r.credits} credits{r.gpa ? ` · GPA ${r.gpa}` : ''}
                  </span>
                </div>
                <span className={`chip road-${r.status}`}>{r.status}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
