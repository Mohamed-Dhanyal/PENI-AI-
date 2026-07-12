/**
 * PeniConsole.jsx — PENI AI chat interface
 *
 * UI pattern: ChatGPT-style layout
 *  - Left sidebar: collapsible chat history, search, new chat button
 *  - Main area: welcome screen (empty) or chat log + composer
 *
 * AI Engine (MOCK — replace for production):
 *  - answer(q): keyword-matching function that returns pre-written strings
 *  - To replace: call your LLM API endpoint. For streaming responses use
 *    the EventSource (SSE) API or a WebSocket. Feed each chunk into
 *    setLog() the same way streamText() does — just remove the setInterval.
 *
 * Streaming text effect:
 *  - streamText(fullText): appends one character every STREAM_SPEED ms
 *    using setInterval, updating the last log entry in place.
 *  - A blinking cursor (.peni-cursor) is shown while streaming.
 *  - Send button is disabled during both typing delay and streaming.
 *
 * State:
 *  - log []              — chat messages: { me: bool, text: string, streaming: bool }
 *  - draft string        — composer input value
 *  - typing bool         — true during the pre-stream thinking delay
 *  - streaming bool      — true while characters are being appended
 *  - sidebarOpen bool    — sidebar collapsed/expanded
 *  - activeChatId number — selected history item (UI only, no real data load)
 */
import { useState, useRef, useEffect, useCallback } from 'react'
import { askAI } from '../api/index.js'

const SUGGESTIONS = [
  'How is my attendance?',
  'When is my next exam?',
  'What tasks are due?',
  'How do I improve my CGPA?',
  'What classes do I have today?',
]

const MOCK_HISTORY = [
  { id: 1, title: 'Attendance check for AML', group: 'Today' },
  { id: 2, title: 'CGPA improvement plan', group: 'Today' },
  { id: 3, title: 'FYP proposal deadline', group: 'Yesterday' },
  { id: 4, title: 'Distributed Systems exam scope', group: 'Yesterday' },
  { id: 5, title: 'Community service hours check', group: 'Previous 7 days' },
  { id: 6, title: 'Cloud infra lab submission', group: 'Previous 7 days' },
  { id: 7, title: 'Semester timetable clash', group: 'Previous 7 days' },
]

const HISTORY_GROUPS = ['Today', 'Yesterday', 'Previous 7 days']

function Bubble({ me, text, streaming, userInitial }) {
  return (
    <div className={`peni-message ${me ? 'user' : 'ai'}`}>
      <div className="peni-message-inner">
        <div className="peni-avatar">
          {me ? (
            <span className="peni-avatar-user">{userInitial || '?'}</span>
          ) : (
            <span className="peni-avatar-ai">P</span>
          )}
        </div>
        <div className="peni-bubble">
          <p style={{ whiteSpace: 'pre-line' }}>
            {text}
            {streaming && <span className="peni-cursor" />}
          </p>
        </div>
      </div>
    </div>
  )
}

const STREAM_SPEED = 8 // ms per character

export default function PeniConsole() {
  const [log, setLog] = useState([])
  const [draft, setDraft] = useState('')
  const [typing, setTyping] = useState(false)
  const [streaming, setStreaming] = useState(false)
  const [activeChatId, setActiveChatId] = useState(null)
  const [search, setSearch] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [error, setError] = useState(null)
  const endRef = useRef(null)
  const streamRef = useRef(null)

  const userInitial = (() => {
    try {
      const token = localStorage.getItem('peni-token')
      if (!token) return '?'
      const payload = JSON.parse(atob(token.split('.')[1]))
      return payload.name?.[0] || '?'
    } catch {
      return '?'
    }
  })()

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [log, typing])

  const streamText = useCallback((fullText) => {
    let i = 0
    setStreaming(true)
    setLog(l => [...l, { me: false, text: '', streaming: true }])

    streamRef.current = setInterval(() => {
      i++
      setLog(l => {
        const updated = [...l]
        updated[updated.length - 1] = { me: false, text: fullText.slice(0, i), streaming: i < fullText.length }
        return updated
      })
      endRef.current?.scrollIntoView({ behavior: 'smooth' })
      if (i >= fullText.length) {
        clearInterval(streamRef.current)
        setStreaming(false)
      }
    }, STREAM_SPEED)
  }, [])

  useEffect(() => () => clearInterval(streamRef.current), [])

  const ask = async text => {
    if (!text.trim() || typing || streaming) return
    localStorage.setItem('peni-last-topic', text.slice(0, 80))
    setLog(l => [...l, { me: true, text }])
    setDraft('')
    setTyping(true)
    setError(null)
    try {
      const reply = await askAI(text)
      setTyping(false)
      streamText(reply)
    } catch (err) {
      setTyping(false)
      setError(err.message || 'Peni is unavailable. Try again later.')
    }
  }

  const newChat = () => {
    setActiveChatId(null)
    setLog([])
  }

  const filteredHistory = MOCK_HISTORY.filter(h =>
    h.title.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="peni-console">
      <aside className={`peni-sidebar ${sidebarOpen ? '' : 'collapsed'}`}>
        <div className="peni-sidebar-top">
          <button className="peni-sidebar-toggle" onClick={() => setSidebarOpen(o => !o)} title="Toggle sidebar">
            {sidebarOpen ? '⟨' : '⟩'}
          </button>
          {sidebarOpen && (
            <button className="peni-new-chat" onClick={newChat}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
              New chat
            </button>
          )}
        </div>

        {sidebarOpen && (
          <>
            <div className="peni-sidebar-search">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                placeholder="Search chats"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <div className="peni-sidebar-list">
              {HISTORY_GROUPS.map(group => {
                const items = filteredHistory.filter(h => h.group === group)
                if (!items.length) return null
                return (
                  <div key={group} className="peni-sidebar-group">
                    <span className="peni-sidebar-group-title">{group}</span>
                    {items.map(h => (
                      <button
                        key={h.id}
                        className={`peni-sidebar-item ${activeChatId === h.id ? 'active' : ''}`}
                        onClick={() => setActiveChatId(h.id)}
                      >
                        {h.title}
                      </button>
                    ))}
                  </div>
                )
              })}
            </div>
          </>
        )}
      </aside>

      <div className="peni-main">
      {log.length === 0 && !typing ? (
        <div className="peni-welcome">
          <div className="peni-welcome-logo">P</div>
          <h2 className="peni-welcome-title">How can I help you today?</h2>
          <p className="peni-welcome-sub">Ask me about your campus life, academics, or schedule.</p>
          <div className="peni-suggestions">
            {SUGGESTIONS.map(s => (
              <button key={s} className="peni-suggestion" onClick={() => ask(s)}>
                {s}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="peni-chat">
          {log.map((m, i) => (
            <Bubble key={i} me={m.me} text={m.text} streaming={m.streaming} userInitial={userInitial} />
          ))}
          {error && (
            <div className="peni-message ai">
              <div className="peni-message-inner">
                <div className="peni-avatar"><span className="peni-avatar-ai">P</span></div>
                <div className="peni-bubble" style={{ color: 'var(--taylors-red)' }}>
                  <p>{error}</p>
                </div>
              </div>
            </div>
          )}
          {typing && (
            <div className="peni-message ai">
              <div className="peni-message-inner">
                <div className="peni-avatar">
                  <span className="peni-avatar-ai">P</span>
                </div>
                <div className="peni-typing">
                  <span className="peni-dot" />
                  <span className="peni-dot" />
                  <span className="peni-dot" />
                </div>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>
      )}

      <div className="peni-composer-wrap">
        <form
          className="peni-composer"
          onSubmit={e => {
            e.preventDefault()
            ask(draft)
          }}
        >
          <input
            className="peni-input"
            value={draft}
            onChange={e => setDraft(e.target.value)}
            placeholder="Message Peni…"
          />
          <button type="submit" className="peni-send" disabled={!draft.trim() || typing || streaming}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 2L11 13" />
              <path d="M22 2L15 22L11 13L2 9L22 2Z" />
            </svg>
          </button>
        </form>
        <p className="peni-disclaimer">Peni is an AI assistant. Verify important academic details with official sources.</p>
      </div>
      </div>
    </div>
  )
}
