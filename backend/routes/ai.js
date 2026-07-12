/**
 * routes/ai.js — PENI AI chat endpoint
 *
 * Currently runs a keyword-matching engine against the user's own data.
 * Replace the answer() body with a real LLM call when you're ready.
 */
const router = require('express').Router()
const db = require('../db/schema')
const verifyToken = require('../middleware/verifyToken')

router.use(verifyToken)

const uid = req => req.user.userId

function answer(q, { student, modules, events, tasks, messages }) {
  const s = q.toLowerCase()

  if (s.includes('attendance') || s.includes('barred') || s.includes('absent')) {
    const worst = [...modules].sort((a, b) => a.attendance - b.attendance)[0]
    const avg = Math.round(modules.reduce((x, m) => x + m.attendance, 0) / modules.length)
    return `Your semester average attendance is ${avg}%. ${worst ? `⚠️ Watch out: ${worst.name} (${worst.code}) is at ${worst.attendance}% — below 70% you'll be barred from finals. Check your next lecture venue: ${worst.lectureVenue}.` : ''}`
  }
  if (s.includes('exam') || s.includes('quiz') || s.includes('test')) {
    const next = events.filter(e => e.type === 'exam')[0]
    if (!next) return 'I don\'t see any upcoming exams on your calendar.'
    return `Your next assessment is **${next.title}** on ${next.date} at ${next.time}. Based on your study plan, I'd suggest revising the relevant module topics before the exam.`
  }
  if (s.includes('deadline') || s.includes('due') || s.includes('assignment') || s.includes('task')) {
    const pending = tasks.filter(t => !t.done)
    const nearest = pending[0]
    if (!nearest) return 'You have no pending tasks. Great job!'
    return `You have **${pending.length} pending tasks**. Most urgent: "${nearest.title}" (${nearest.module}) due ${nearest.due}. ${pending[1] ? `Next: "${pending[1].title}" due ${pending[1].due}.` : ''}`
  }
  if (s.includes('gpa') || s.includes('cgpa') || s.includes('grade')) {
    if (!student.cgpa) return 'I don\'t have your CGPA on record yet.'
    return `Your CGPA is **${student.cgpa}**. Focus on your lowest-scoring modules to push it higher.`
  }
  if (s.includes('class') || s.includes('today') || s.includes('tomorrow') || s.includes('schedule')) {
    return `Check your **My Calendar** view for the full timetable. I can also answer specific questions about attendance, exams, deadlines, and GPA.`
  }
  if (s.includes('message') || s.includes('unread') || s.includes('mail')) {
    const unread = messages.filter(m => m.unread)
    return `You have **${unread.length} unread messages**. ${unread.length ? unread.map(m => `"${m.subject}" from ${m.from}`).join('; ') : 'Your inbox is clear.'}`
  }
  if (s.includes('hello') || s.includes('hi') || s.includes('hey')) {
    return `Hey ${student.name || 'there'}! I'm Peni, your AI university companion. I can help with attendance, exams, deadlines, GPA, and messages. What do you need?`
  }
  return `I can help with things like:\n• **Attendance** — "How's my attendance?"\n• **Exams** — "When is my next exam?"\n• **Deadlines** — "What's due this week?"\n• **GPA** — "How can I improve my CGPA?"\n• **Schedule** — "What classes do I have today?"`
}

router.post('/chat', (req, res) => {
  const { query } = req.body
  if (!query?.trim()) return res.status(400).json({ error: 'query required' })

  const userId = uid(req)
  const profile = db.prepare('SELECT cgpa FROM student_profiles WHERE user_id = ?').get(userId)
  const modules = db.prepare(`
    SELECT m.code, m.name, m.lecture_venue, e.attendance_pct AS attendance
    FROM modules m JOIN enrollments e ON e.module_id = m.id
    WHERE e.user_id = ?
  `).all(userId)
  const events = db.prepare('SELECT * FROM events WHERE user_id = ? ORDER BY date ASC').all(userId)
  const tasks = db.prepare('SELECT * FROM tasks WHERE user_id = ?').all(userId)
  const messages = db.prepare('SELECT * FROM messages WHERE user_id = ?').all(userId)

  const reply = answer(query, {
    student: { name: req.user?.name, cgpa: profile?.cgpa },
    modules: modules || [],
    events: events || [],
    tasks: tasks || [],
    messages: messages || [],
  })

  res.json({ reply })
})

module.exports = router
