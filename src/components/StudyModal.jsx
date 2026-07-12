import { useState, useRef, useEffect, useCallback } from 'react'
import { askAI } from '../api/index.js'

const STREAM_SPEED = 8

const MATERIAL_ICONS = {
  'lecture-slides':  '📄',
  'tutorial-slides': '📋',
  'tutorial-answers':'✅',
  'video':           '🎬',
  'reference':       '🔗',
  'other':           '📎',
}

function Bubble({ me, text, streaming, userInitial }) {
  return (
    <div className={`peni-message ${me ? 'user' : 'ai'}`}>
      <div className="peni-message-inner">
        <div className="peni-avatar">
          {me
            ? <span className="peni-avatar-user">{userInitial || '?'}</span>
            : <span className="peni-avatar-ai">P</span>
          }
        </div>
        <div className="peni-bubble">
          <p style={{ whiteSpace: 'pre-line' }}>
            {text}{streaming && <span className="peni-cursor" />}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function StudyModal({ item, moduleName, mode, onClose }) {
  const [log,       setLog]       = useState([])
  const [draft,     setDraft]     = useState('')
  const [typing,    setTyping]    = useState(false)
  const [streaming, setStreaming] = useState(false)
  const [error,     setError]     = useState(null)
  const [activeMode, setActiveMode] = useState(mode || 'geni')
  const endRef   = useRef(null)
  const streamRef = useRef(null)
  const inputRef  = useRef(null)
  const seededRef = useRef(false)

  const userInitial = (() => {
    try {
      const token = localStorage.getItem('peni-token')
      if (!token) return '?'
      return JSON.parse(atob(token.split('.')[1])).name?.[0] || '?'
    } catch { return '?' }
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

  const ask = useCallback(async (text, silent = false) => {
    if (!text.trim() || typing || streaming) return
    if (!silent) setLog(l => [...l, { me: true, text }])
    setDraft('')
    setTyping(true)
    setError(null)
    try {
      const reply = await askAI(text)
      setTyping(false)
      streamText(reply)
    } catch (err) {
      setTyping(false)
      setError(err.message || 'Peni is unavailable.')
    }
  }, [typing, streaming, streamText])

  const seedPrompt = useCallback((m) => {
    if (seededRef.current) return
    seededRef.current = true
    const prompt = m === 'plan'
      ? `Generate a structured weekly study plan for the topic "${item.title}" from ${moduleName}. Include key concepts to cover each day, recommended exercises, and a revision schedule.`
      : `I'm studying "${item.title}" from ${moduleName}. Give me a concise overview of the key concepts I should understand for this topic, then ask me what I'd like to dive into first.`
    setLog([{ me: true, text: prompt }])
    setTimeout(() => ask(prompt, true), 300)
  }, [item, moduleName, ask])

  useEffect(() => {
    seedPrompt(activeMode)
  }, [])

  const switchMode = (m) => {
    if (m === activeMode) return
    seededRef.current = false
    setActiveMode(m)
    setLog([])
    setError(null)
    clearInterval(streamRef.current)
    setStreaming(false)
    setTyping(false)
    setTimeout(() => seedPrompt(m), 50)
  }

  const handleKey = (e) => {
    if (e.key === 'Escape') onClose()
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); ask(draft) }
  }

  return (
    <div className="study-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="study-modal">

        {/* Header */}
        <div className="study-modal-header">
          <div className="study-modal-header-left">
            <span className="study-modal-icon">{MATERIAL_ICONS[item.type] || '📎'}</span>
            <div className="study-modal-title-group">
              <span className="study-modal-title">{item.title}</span>
              <span className="study-modal-sub">{moduleName} · {item.type?.replace(/-/g, ' ')}</span>
            </div>
          </div>
          <div className="study-modal-header-right">
            <div className="study-mode-tabs">
              <button
                className={`study-mode-tab${activeMode === 'geni' ? ' active' : ''}`}
                onClick={() => switchMode('geni')}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"/>
                  <path d="M12 8v4l3 3"/>
                </svg>
                Study with Geni
              </button>
              <button
                className={`study-mode-tab${activeMode === 'plan' ? ' active' : ''}`}
                onClick={() => switchMode('plan')}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 11l3 3L22 4"/>
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                </svg>
                Study Plan
              </button>
            </div>
            <button className="study-modal-close" onClick={onClose} title="Close">✕</button>
          </div>
        </div>

        {/* Chat body */}
        <div className="study-modal-chat">
          {log.map((m, i) => (
            <Bubble key={i} me={m.me} text={m.text} streaming={m.streaming} userInitial={userInitial} />
          ))}
          {error && (
            <div className="peni-message ai">
              <div className="peni-message-inner">
                <div className="peni-avatar"><span className="peni-avatar-ai">P</span></div>
                <div className="peni-bubble" style={{ color: 'var(--taylors-red)' }}><p>{error}</p></div>
              </div>
            </div>
          )}
          {typing && (
            <div className="peni-message ai">
              <div className="peni-message-inner">
                <div className="peni-avatar"><span className="peni-avatar-ai">P</span></div>
                <div className="peni-typing">
                  <span className="peni-dot" /><span className="peni-dot" /><span className="peni-dot" />
                </div>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Composer */}
        <div className="study-modal-composer">
          <form onSubmit={e => { e.preventDefault(); ask(draft) }} className="peni-composer" style={{ margin: 0 }}>
            <input
              ref={inputRef}
              className="peni-input"
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={handleKey}
              placeholder={activeMode === 'plan' ? 'Ask to adjust your study plan…' : 'Ask about this topic…'}
              autoFocus
            />
            <button type="submit" className="peni-send" disabled={!draft.trim() || typing || streaming}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 2L11 13" /><path d="M22 2L15 22L11 13L2 9L22 2Z" />
              </svg>
            </button>
          </form>
        </div>

      </div>
    </div>
  )
}

