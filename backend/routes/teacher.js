/**
 * routes/teacher.js — Teacher content management endpoints
 * All routes require a valid Bearer token with role = 'teacher'.
 */
const router = require('express').Router()
const db = require('../db/schema')
const verifyToken = require('../middleware/verifyToken')
const { randomUUID } = require('crypto')

router.use(verifyToken)

const requireTeacher = (req, res, next) => {
  if (req.user.role !== 'teacher') return res.status(403).json({ error: 'Teacher role required' })
  next()
}
router.use(requireTeacher)

// ── Weekly Materials ──────────────────────────────────────────────────────────

// GET /api/teacher/modules  — modules where this teacher is lecturer
router.get('/modules', (req, res) => {
  const name = db.prepare('SELECT name FROM users WHERE id = ?').get(req.user.userId)?.name
  const rows = db.prepare(`SELECT * FROM modules WHERE lecturer = ? OR coordinator = ?`).all(name, name)
  res.json(rows.map(m => ({ id: m.id, code: m.code, name: m.name })))
})

// POST /api/teacher/modules/:code/materials  — upload a weekly material item
router.post('/modules/:code/materials', (req, res) => {
  const { weekNumber, weekLabel, type, title, url, description } = req.body
  if (!weekNumber || !type || !title) return res.status(400).json({ error: 'weekNumber, type, title required' })
  const mod = db.prepare('SELECT id FROM modules WHERE code = ?').get(req.params.code)
  if (!mod) return res.status(404).json({ error: 'Module not found' })
  const name = db.prepare('SELECT name FROM users WHERE id = ?').get(req.user.userId)?.name
  const id = randomUUID()
  db.prepare(`
    INSERT INTO weekly_materials (id, module_id, week_number, week_label, item_type, title, url, description, uploaded_by)
    VALUES (?,?,?,?,?,?,?,?,?)
  `).run(id, mod.id, weekNumber, weekLabel || `Week ${weekNumber}`, type, title, url || null, description || null, name)
  res.json({ success: true, id })
})

// DELETE /api/teacher/materials/:id
router.delete('/materials/:id', (req, res) => {
  db.prepare('DELETE FROM weekly_materials WHERE id = ?').run(req.params.id)
  res.json({ success: true })
})

// ── Assignments ───────────────────────────────────────────────────────────────

// POST /api/teacher/modules/:code/assignments  — create an assignment
router.post('/modules/:code/assignments', (req, res) => {
  const { weekNumber, title, brief, dueDate, submissionLink, maxMarks } = req.body
  if (!title) return res.status(400).json({ error: 'title required' })
  const mod = db.prepare('SELECT id FROM modules WHERE code = ?').get(req.params.code)
  if (!mod) return res.status(404).json({ error: 'Module not found' })
  const name = db.prepare('SELECT name FROM users WHERE id = ?').get(req.user.userId)?.name
  const id = randomUUID()
  db.prepare(`
    INSERT INTO assignments (id, module_id, week_number, title, brief, due_date, submission_link, max_marks, created_by)
    VALUES (?,?,?,?,?,?,?,?,?)
  `).run(id, mod.id, weekNumber || null, title, brief || null, dueDate || null, submissionLink || null, maxMarks || 100, name)
  res.json({ success: true, id })
})

// PATCH /api/teacher/assignments/:id  — edit an assignment
router.patch('/assignments/:id', (req, res) => {
  const { title, brief, dueDate, submissionLink, maxMarks } = req.body
  db.prepare(`
    UPDATE assignments SET title = COALESCE(?,title), brief = COALESCE(?,brief),
      due_date = COALESCE(?,due_date), submission_link = COALESCE(?,submission_link),
      max_marks = COALESCE(?,max_marks)
    WHERE id = ?
  `).run(title||null, brief||null, dueDate||null, submissionLink||null, maxMarks||null, req.params.id)
  res.json({ success: true })
})

// DELETE /api/teacher/assignments/:id
router.delete('/assignments/:id', (req, res) => {
  db.prepare('DELETE FROM assignment_docs WHERE assignment_id = ?').run(req.params.id)
  db.prepare('DELETE FROM assignments WHERE id = ?').run(req.params.id)
  res.json({ success: true })
})

// POST /api/teacher/assignments/:id/docs  — attach a doc to an assignment
router.post('/assignments/:id/docs', (req, res) => {
  const { type, title, url } = req.body
  if (!type || !title) return res.status(400).json({ error: 'type and title required' })
  const id = randomUUID()
  db.prepare('INSERT INTO assignment_docs (id, assignment_id, item_type, title, url) VALUES (?,?,?,?,?)')
    .run(id, req.params.id, type, title, url || null)
  res.json({ success: true, id })
})

// GET /api/teacher/assignments/:id/submissions  — view all student submissions
router.get('/assignments/:id/submissions', (req, res) => {
  const rows = db.prepare(`
    SELECT s.*, u.name, u.email FROM assignment_submissions s
    JOIN users u ON u.id = s.user_id
    WHERE s.assignment_id = ?
  `).all(req.params.id)
  res.json(rows.map(r => ({
    id: r.id, studentName: r.name, email: r.email, status: r.status,
    submittedAt: r.submitted_at, grade: r.grade, feedback: r.feedback, note: r.note,
  })))
})

// PATCH /api/teacher/submissions/:id/grade  — grade a submission
router.patch('/submissions/:id/grade', (req, res) => {
  const { grade, feedback } = req.body
  db.prepare('UPDATE assignment_submissions SET grade = ?, feedback = ?, status = "graded" WHERE id = ?')
    .run(grade || null, feedback || null, req.params.id)
  res.json({ success: true })
})

module.exports = router
