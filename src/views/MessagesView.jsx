import { useState, useEffect, useRef } from 'react'
import { getMessages, sendMessage } from '../api/index.js'

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'lecturer', label: 'My Lecturers' },
  { key: 'mates', label: 'My Mates' },
]

export default function MessagesView() {
  const [msgs,      setMsgs]      = useState([])
  const [activeId,  setActiveId]  = useState(null)
  const [tab,       setTab]       = useState('all')
  const [draft,     setDraft]     = useState('')
  const [sending,   setSending]   = useState(false)
  const [sendError, setSendError] = useState(null)
  const [search,    setSearch]    = useState('')
  const endRef = useRef(null)

  useEffect(() => {
    getMessages().then(data => {
      setMsgs(data)
      setActiveId(data[0]?.id ?? null)
    })
  }, [])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeId, msgs])

  const active = msgs.find(m => m.id === activeId)

  if (!active) return null

  const filtered = (tab === 'all' ? msgs : msgs.filter(m => m.category === tab))
    .filter(m => !search || m.from.toLowerCase().includes(search.toLowerCase()) || m.subject?.toLowerCase().includes(search.toLowerCase()))

  const open = id => {
    setActiveId(id)
    setMsgs(ms => ms.map(m => (m.id === id ? { ...m, unread: 0 } : m)))
  }

  const send = async e => {
    e.preventDefault()
    const text = draft.trim()
    if (!text || sending) return
    setSending(true)
    setSendError(null)
    try {
      await sendMessage({ threadId: activeId, text })
      setMsgs(ms =>
        ms.map(m =>
          m.id === activeId
            ? { ...m, thread: [...m.thread, { from: 'You', me: true, text, time: 'Just now' }], preview: text, time: 'Just now' }
            : m,
        ),
      )
      setDraft('')
    } catch (err) {
      setSendError(err.message || 'Failed to send message')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="view msg-view">

      {/* ── Sidebar ── */}
      <aside className="msg-list">
        <div className="msg-list-head">
          <h2 className="view-title small">Messages</h2>
          <div className="msg-tabs">
            {TABS.map(t => {
              const count = t.key === 'all'
                ? msgs.reduce((s, m) => s + (m.unread || 0), 0)
                : msgs.filter(m => m.category === t.key).reduce((s, m) => s + (m.unread || 0), 0)
              return (
                <button key={t.key} className={`msg-tab${tab === t.key ? ' active' : ''}`} onClick={() => setTab(t.key)}>
                  {t.label}
                  {count > 0 && <span className="msg-tab-count">{count}</span>}
                </button>
              )
            })}
          </div>
          <div className="msg-search">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            <input
              placeholder="Search…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="msg-contact-list">
          {filtered.length === 0 && (
            <p className="msg-empty">No messages found.</p>
          )}
          {filtered.map(m => (
            <button key={m.id} className={`msg-contact${m.id === activeId ? ' active' : ''}`} onClick={() => open(m.id)}>
              <div className="msg-avatar-wrap">
                <span className="msg-avatar" style={{ background: m.accent }}>{m.initials}</span>
                {m.unread > 0 && <span className="msg-unread-dot" />}
              </div>
              <div className="msg-contact-body">
                <div className="msg-contact-top">
                  <span className={`msg-from${m.unread > 0 ? ' unread' : ''}`}>{m.from}</span>
                  <span className="msg-time">{m.time}</span>
                </div>
                {m.moduleCode && (
                  <span className="msg-contact-module">{m.moduleCode}{m.module ? ` · ${m.module}` : ''}</span>
                )}
                <span className="msg-preview">{m.preview}</span>
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* ── Thread ── */}
      <section className="msg-thread">
        <header className="msg-thread-head">
          <span className="msg-avatar msg-avatar-lg" style={{ background: active.accent }}>{active.initials}</span>
          <div className="msg-thread-head-info">
            <h3 className="msg-thread-from">{active.from}</h3>
            <p className="msg-thread-role">{active.role}{active.moduleCode ? ` · ${active.moduleCode}` : ''}</p>
          </div>
          {active.subject && (
            <span className="msg-thread-subject">{active.subject}</span>
          )}
        </header>

        <div className="msg-bubbles">
          {active.thread.map((t, i) => (
            <div key={i} className={`bubble${t.me ? ' me' : ''}`}>
              {!t.me && <span className="bubble-from">{t.from}</span>}
              <p>{t.text}</p>
              <span className="bubble-time">{t.time}</span>
            </div>
          ))}
          <div ref={endRef} />
        </div>

        <div className="msg-composer-wrap">
          <form className="msg-composer" onSubmit={send}>
            <input
              value={draft}
              onChange={e => { setDraft(e.target.value); setSendError(null) }}
              placeholder={`Reply to ${active.from}…`}
              disabled={sending}
              autoFocus
            />
            <button type="submit" className="send-btn" disabled={!draft.trim() || sending}>
              {sending
                ? <span className="send-spinner" />
                : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 2L11 13" /><path d="M22 2L15 22L11 13L2 9L22 2Z" />
                  </svg>
              }
            </button>
          </form>
          {sendError && <p className="msg-send-error">{sendError}</p>}
        </div>
      </section>
    </div>
  )
}
