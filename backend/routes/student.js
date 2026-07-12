/**
 * routes/student.js — Student data endpoints
 * All routes require a valid Bearer token (student or teacher role).
 */
const router = require('express').Router()
const db = require('../db/schema')
const verifyToken = require('../middleware/verifyToken')
const { randomUUID } = require('crypto')

router.use(verifyToken)

const uid = req => req.user.userId

// GET /api/student/me
router.get('/me', (req, res) => {
  const user = db.prepare('SELECT id, email, name, role, photo_url FROM users WHERE id = ?').get(uid(req))
  const profile = db.prepare('SELECT * FROM student_profiles WHERE user_id = ?').get(uid(req))
  res.json({ ...user, ...(profile || {}) })
})

// GET /api/modules
router.get('/modules', (req, res) => {
  const rows = db.prepare(`
    SELECT m.*, e.attended, e.total_classes, e.attendance_pct AS attendance,
           e.grade, e.progress
    FROM modules m
    JOIN enrollments e ON e.module_id = m.id
    WHERE e.user_id = ?
  `).all(uid(req))

  const modules = rows.map(m => ({
    code: m.code, name: m.name, coordinator: m.coordinator,
    lecturer: m.lecturer, tutor: m.tutor, credits: m.credits,
    attendance: m.attendance, attended: m.attended, totalClasses: m.total_classes,
    grade: m.grade, progress: m.progress, lectureVenue: m.lecture_venue,
    tutorialVenue: m.tutorial_venue, tutorialSection: m.tutorial_section,
    accent: m.accent,
  }))
  res.json(modules)
})

// GET /api/attendance
router.get('/attendance', (req, res) => {
  const rows = db.prepare(`
    SELECT * FROM attendance_log WHERE user_id = ? ORDER BY date DESC
  `).all(uid(req))

  res.json(rows.map(r => ({
    id: r.id, date: r.date, module: r.module_code, name: r.module_name,
    status: r.status, time: r.time, type: r.type,
    teacher: r.teacher, mcSubmitted: !!r.mc_submitted,
  })))
})

// POST /api/attendance/mc
router.post('/attendance/mc', (req, res) => {
  const { logId, note } = req.body
  if (!logId) return res.status(400).json({ error: 'logId required' })
  db.prepare('UPDATE attendance_log SET mc_submitted = 1 WHERE id = ? AND user_id = ?')
    .run(logId, uid(req))
  res.json({ success: true })
})

// GET /api/week-schedule
router.get('/week-schedule', (req, res) => {
  const rows = db.prepare('SELECT * FROM week_schedule WHERE user_id = ?').all(uid(req))
  res.json(rows.map(r => ({
    day: r.day, date: r.date, name: r.name,
    type: r.type, time: r.time, status: r.status,
  })))
})

// GET /api/events
router.get('/events', (req, res) => {
  const rows = db.prepare('SELECT * FROM events WHERE user_id = ? ORDER BY date ASC').all(uid(req))
  res.json(rows.map(r => ({
    date: r.date, time: r.time, title: r.title,
    type: r.type, module: r.module_code,
  })))
})

// GET /api/tasks
router.get('/tasks', (req, res) => {
  const rows = db.prepare('SELECT * FROM tasks WHERE user_id = ?').all(uid(req))
  res.json(rows.map(r => ({
    id: r.id, title: r.title, module: r.module,
    due: r.due, priority: r.priority, done: !!r.done,
  })))
})

// PATCH /api/tasks/:id
router.patch('/tasks/:id', (req, res) => {
  const { done } = req.body
  db.prepare('UPDATE tasks SET done = ? WHERE id = ? AND user_id = ?')
    .run(done ? 1 : 0, req.params.id, uid(req))
  res.json({ success: true })
})

// GET /api/roadmap
router.get('/roadmap', (req, res) => {
  const rows = db.prepare('SELECT * FROM roadmap WHERE user_id = ?').all(uid(req))
  const seen = new Set()
  const unique = rows.filter(r => { if (seen.has(r.sem)) return false; seen.add(r.sem); return true })
  res.json(unique.map(r => ({
    sem: r.sem, status: r.status, modules: r.modules, credits: r.credits, gpa: r.gpa,
  })))
})

// GET /api/gpa-history
router.get('/gpa-history', (req, res) => {
  const rows = db.prepare('SELECT * FROM gpa_history WHERE user_id = ?').all(uid(req))
  const seen = new Set()
  const unique = rows.filter(r => { if (seen.has(r.sem)) return false; seen.add(r.sem); return true })
  res.json(unique.map(r => ({ sem: r.sem, gpa: r.gpa })))
})

// GET /api/timetable
router.get('/timetable', (req, res) => {
  const rows = db.prepare('SELECT * FROM timetable WHERE user_id = ? ORDER BY day, start').all(uid(req))
  res.json(rows.map(r => ({
    day: r.day, start: r.start, end: r.end, code: r.code,
    label: r.label, type: r.type, venue: r.venue,
  })))
})

// GET /api/messages
router.get('/messages', (req, res) => {
  const rows = db.prepare('SELECT * FROM messages WHERE user_id = ?').all(uid(req))
  res.json(rows.map(r => ({
    id: r.id, category: r.category, from: r.from_name, role: r.role,
    module: r.module, moduleCode: r.module_code, initials: r.initials,
    accent: r.accent, subject: r.subject, preview: r.preview,
    time: r.time, unread: r.unread,
    thread: JSON.parse(r.thread_json || '[]'),
  })))
})

// GET /api/modules/:code/materials  — weekly materials for a module
router.get('/modules/:code/materials', (req, res) => {
  const mod = db.prepare('SELECT id FROM modules WHERE code = ?').get(req.params.code)
  if (!mod) return res.status(404).json({ error: 'Module not found' })
  const rows = db.prepare(`
    SELECT * FROM weekly_materials WHERE module_id = ? ORDER BY week_number ASC, uploaded_at ASC
  `).all(mod.id)
  res.json(rows.map(r => ({
    id: r.id, weekNumber: r.week_number, weekLabel: r.week_label,
    type: r.item_type, title: r.title, url: r.url,
    description: r.description, uploadedAt: r.uploaded_at, uploadedBy: r.uploaded_by,
  })))
})

// GET /api/modules/:code/assignments  — assignments for a module + student's own submission status
router.get('/modules/:code/assignments', (req, res) => {
  const mod = db.prepare('SELECT id FROM modules WHERE code = ?').get(req.params.code)
  if (!mod) return res.status(404).json({ error: 'Module not found' })
  const rows = db.prepare(`
    SELECT * FROM assignments WHERE module_id = ? ORDER BY due_date ASC
  `).all(mod.id)
  const result = rows.map(a => {
    const docs = db.prepare('SELECT * FROM assignment_docs WHERE assignment_id = ?').all(a.id)
    const sub  = db.prepare('SELECT * FROM assignment_submissions WHERE assignment_id = ? AND user_id = ?').get(a.id, uid(req))
    return {
      id: a.id, weekNumber: a.week_number, title: a.title, brief: a.brief,
      dueDate: a.due_date, submissionLink: a.submission_link, maxMarks: a.max_marks,
      docs: docs.map(d => ({ id: d.id, type: d.item_type, title: d.title, url: d.url })),
      submission: sub ? {
        id: sub.id, status: sub.status, submittedAt: sub.submitted_at,
        grade: sub.grade, feedback: sub.feedback, note: sub.note,
      } : null,
    }
  })
  res.json(result)
})

// POST /api/assignments/:id/submit  — student submits an assignment
router.post('/assignments/:id/submit', (req, res) => {
  const { note, fileUrl } = req.body
  const existing = db.prepare('SELECT id FROM assignment_submissions WHERE assignment_id = ? AND user_id = ?')
    .get(req.params.id, uid(req))
  if (existing) {
    db.prepare('UPDATE assignment_submissions SET note = ?, file_url = ?, submitted_at = datetime("now"), status = "submitted" WHERE id = ?')
      .run(note || null, fileUrl || null, existing.id)
    return res.json({ success: true, resubmitted: true })
  }
  const { randomUUID } = require('crypto')
  db.prepare('INSERT INTO assignment_submissions (id, assignment_id, user_id, note, file_url) VALUES (?,?,?,?,?)')
    .run(randomUUID(), req.params.id, uid(req), note || null, fileUrl || null)
  res.json({ success: true })
})

// POST /api/messages/send
router.post('/messages/send', (req, res) => {
  const { threadId, text } = req.body
  if (!threadId || !text?.trim()) {
    return res.status(400).json({ error: 'threadId and text required' })
  }

  const row = db.prepare('SELECT thread_json FROM messages WHERE id = ? AND user_id = ?')
    .get(threadId, uid(req))
  if (!row) return res.status(404).json({ error: 'Thread not found' })

  const thread = JSON.parse(row.thread_json || '[]')
  const trimmed = text.trim()
  thread.push({ from: 'You', me: true, text: trimmed, time: 'Just now' })

  db.prepare(`
    UPDATE messages
    SET thread_json = ?, preview = ?, time = ?, unread = 0
    WHERE id = ? AND user_id = ?
  `).run(JSON.stringify(thread), trimmed, 'Just now', threadId, uid(req))

  res.json({ success: true, message: { from: 'You', me: true, text: trimmed, time: 'Just now' } })
})


module.exports = router
