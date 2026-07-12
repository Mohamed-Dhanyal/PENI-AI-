import { useState } from 'react'
import { events } from '../data/mockData.js'

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const iso = (y, m, d) => `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`

export default function CalendarView() {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selected, setSelected] = useState(iso(today.getFullYear(), today.getMonth(), today.getDate()))

  const first = new Date(year, month, 1)
  const offset = (first.getDay() + 6) % 7 // Monday-first
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells = []
  for (let i = 0; i < offset; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const eventsOn = dateStr => events.filter(e => e.date === dateStr)
  const selectedEvents = eventsOn(selected)

  const shift = dir => {
    let m = month + dir
    let y = year
    if (m < 0) { m = 11; y-- }
    if (m > 11) { m = 0; y++ }
    setMonth(m)
    setYear(y)
  }

  return (
    <div className="view">
      <header className="view-header">
        <div>
          <h2 className="view-title">Calendar</h2>
          <p className="view-sub">{MONTHS[month]} {year}</p>
        </div>
        <div className="cal-nav">
          <button className="cal-nav-btn" onClick={() => shift(-1)}>‹</button>
          <button className="cal-nav-btn" onClick={() => shift(1)}>›</button>
        </div>
      </header>

      <div className="cal-layout">
        <div className="cal-grid-wrap">
          <div className="cal-grid cal-head">
            {DAYS.map(d => <span key={d} className="cal-dayname">{d}</span>)}
          </div>
          <div className="cal-grid">
            {cells.map((d, i) => {
              if (!d) return <span key={`x${i}`} className="cal-cell empty" />
              const dateStr = iso(year, month, d)
              const evts = eventsOn(dateStr)
              const isToday =
                d === today.getDate() && month === today.getMonth() && year === today.getFullYear()
              return (
                <button
                  key={dateStr}
                  className={`cal-cell ${isToday ? 'today' : ''} ${selected === dateStr ? 'selected' : ''}`}
                  onClick={() => setSelected(dateStr)}
                >
                  <span className="cal-daynum">{d}</span>
                  <span className="cal-dots">
                    {evts.slice(0, 3).map((e, j) => <span key={j} className={`event-dot ${e.type}`} />)}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <aside className="cal-side dash-panel">
          <h3 className="panel-title">
            {new Date(selected + 'T00:00').toLocaleDateString('en-MY', { weekday: 'long', day: 'numeric', month: 'short' })}
          </h3>
          {selectedEvents.length === 0 && <p className="empty-note">No events — free day 🎉</p>}
          {selectedEvents.map((e, i) => (
            <div key={i} className="event-row">
              <span className={`event-dot ${e.type}`} />
              <div className="event-info">
                <span className="event-title">{e.title}</span>
                <span className="event-meta">{e.time}{e.module ? ` · ${e.module}` : ''}</span>
              </div>
              <span className={`chip chip-${e.type}`}>{e.type}</span>
            </div>
          ))}
        </aside>
      </div>
    </div>
  )
}
