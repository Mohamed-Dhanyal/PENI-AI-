/**
 * SemesterView.jsx — My Calendar view
 *
 * Sections:
 *  1. Semester roadmap — chips showing modules/credits/status per semester
 *  2. Timetable bars   — Class / Exam / Assignment, each expandable via TimetableBar
 *
 * TimetableBar component:
 *  - Clicking toggles a dropdown via local useState (open bool)
 *  - Class Timetable shows a visual weekly grid (ClassGrid)
 *    - Time on Y-axis (HOURS), days on X-axis (DAYS)
 *    - Events are absolutely positioned using hourIndex() to calculate top/height
 *    - MOCK_SLOTS defines the placeholder schedule — replace with real timetable data
 *  - Exam / Assignment bars show a placeholder note only
 *
 * TODO: Replace MOCK_SLOTS with real timetable data from the user/API.
 *       Grid expects: { day, start, end, code, label, type, venue }
 *       where start/end are strings matching entries in HOURS array (e.g. '8:00')
 */
import { useState, useEffect } from 'react'
import { getRoadmap, getTimetable } from '../api/index.js'

const STATUS_LABEL = {
  current: 'Ongoing',
  completed: 'Completed',
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
const HOURS = ['8:00', '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00']

const TYPE_COLORS = {
  Lecture:  'var(--taylors-red)',
  Tutorial: '#4a90d9',
  Lab:      '#34a853',
}

function hourIndex(h) { return HOURS.indexOf(h) }

function ClassGrid({ slots }) {
  return (
    <div className="tt-grid-wrap">
      <div className="tt-grid">
        {/* Time column */}
        <div className="tt-col tt-col-time">
          <div className="tt-col-header" />
          {HOURS.map(h => (
            <div key={h} className="tt-cell tt-time-cell">{h}</div>
          ))}
        </div>

        {/* Day columns */}
        {DAYS.map(day => (
          <div key={day} className="tt-col">
            <div className="tt-col-header">{day}</div>
            <div className="tt-col-body">
              {HOURS.map(h => (
                <div key={h} className="tt-cell" />
              ))}
              {slots.filter(s => s.day === day).map((slot, i) => {
                const top = hourIndex(slot.start)
                const span = hourIndex(slot.end) - top
                return (
                  <div
                    key={i}
                    className="tt-event"
                    style={{
                      top: `calc(${top} * var(--tt-row-h))`,
                      height: `calc(${span} * var(--tt-row-h) - 4px)`,
                      background: TYPE_COLORS[slot.type] || 'var(--taylors-red)',
                    }}
                  >
                    <span className="tt-event-type">{slot.type}</span>
                    <span className="tt-event-name">{slot.label}</span>
                    <span className="tt-event-venue">{slot.venue}</span>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="tt-legend">
        {Object.entries(TYPE_COLORS).map(([type, color]) => (
          <span key={type} className="tt-legend-item">
            <span className="tt-legend-dot" style={{ background: color }} />
            {type}
          </span>
        ))}
      </div>
    </div>
  )
}

function ExamDropdown() {
  return (
    <div className="tt-placeholder">
      {/* ── NOTE ────────────────────────────────────────────────────────────
          TODO: Replace with real exam schedule (including midterms).
          Send your exam timetable and we will build the grid here.
      ──────────────────────────────────────────────────────────────────── */}
      <div className="tt-note">
        📌 Exam timetable coming soon — share your exam schedule (including midterms) and we'll build this section.
      </div>
    </div>
  )
}

function AssignmentDropdown() {
  return (
    <div className="tt-placeholder">
      {/* ── NOTE ────────────────────────────────────────────────────────────
          TODO: Replace with real assignment deadlines per module.
          Send your assignment list and we will populate this section.
      ──────────────────────────────────────────────────────────────────── */}
      <div className="tt-note">
        📌 Assignment timetable coming soon — share your assignment deadlines and we'll build this section.
      </div>
    </div>
  )
}

function TimetableBar({ label, children }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`sem-bar-wrap ${open ? 'open' : ''}`}>
      <div className="sem-bar glass" onClick={() => setOpen(o => !o)}>
        <span className="sem-bar-label">{label}</span>
        <span className={`sem-bar-arrow ${open ? 'rotated' : ''}`}>›</span>
      </div>
      {open && <div className="sem-bar-dropdown">{children}</div>}
    </div>
  )
}

export default function CalendarView() {
  const [roadmap, setRoadmap] = useState([])
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getRoadmap(), getTimetable()])
      .then(([roadmapData, slotsData]) => {
        setRoadmap(roadmapData)
        setSlots(slotsData)
      })
      .finally(() => setLoading(false))
  }, [])

  const pastSemesters = roadmap.filter(s => s.status !== 'upcoming')
  const [selected, setSelected] = useState(null)
  const activeSelected = selected ?? pastSemesters[pastSemesters.length - 1]?.sem ?? null
  const sem = pastSemesters.find(s => s.sem === activeSelected)

  if (loading) return <div className="view">Loading calendar…</div>
  if (!sem) return null

  return (
    <div className="view sem-view">
      <div className="sem-header">
        <h2 className="view-title">My Calendar</h2>
        <div className="sem-picker">
          {pastSemesters.map(s => (
            <button
              key={s.sem}
              className={`sem-tab ${activeSelected === s.sem ? 'active' : ''}`}
              onClick={() => setSelected(s.sem)}
            >
              {s.sem}
            </button>
          ))}
        </div>
      </div>

      <div className="sem-detail">
        <div className="sem-chips">
          <span className="sem-chip glass">{sem.modules} Modules</span>
          <span className="sem-chip glass">{sem.credits} Credits</span>
          <span className="sem-chip glass">{STATUS_LABEL[sem.status] || sem.status}</span>
        </div>

        <div className="sem-bars">
          <TimetableBar label="Class Timetable">
            <ClassGrid slots={slots} />
          </TimetableBar>
          <TimetableBar label="Exam Timetable">
            <ExamDropdown />
          </TimetableBar>
          <TimetableBar label="Assignment Timetable">
            <AssignmentDropdown />
          </TimetableBar>
        </div>
      </div>
    </div>
  )
}
