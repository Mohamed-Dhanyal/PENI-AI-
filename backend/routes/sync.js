/**
 * routes/sync.js — myTIMeS Chrome Extension Sync Endpoint
 *
 * POST /api/sync/mytimes
 * Receives scraped data from the Chrome extension and upserts it
 * into the database for the authenticated student.
 *
 * Payload shape (from extension/content.js):
 * {
 *   profile:    { name, studentId, programme }
 *   modules:    [{ code, name, credits, section, lecturer, lectureVenue, tutorialVenue }]
 *   attendance: { summary: [...], log: [...] }
 *   timetable:  [{ day, time, name, type, venue, lecturer }]
 *   grades:     [{ code, name, grade, points, credits }]
 *   exams:      [{ date, time, subject, venue, duration }]
 * }
 */
const router = require('express').Router()
const db = require('../db/schema')
const verifyToken = require('../middleware/verifyToken')
const { randomUUID } = require('crypto')

router.use(verifyToken)

router.post('/mytimes', (req, res) => {
  const userId = req.user.userId
  const { profile, modules, attendance, timetable, grades, exams } = req.body

  console.log('[Sync] Received from extension:', JSON.stringify({
    profile,
    modulesCount: modules?.length,
    attendanceSummaryCount: attendance?.summary?.length,
    attendanceLogCount: attendance?.log?.length,
    timetableCount: timetable?.length,
    gradesCount: grades?.length,
    examsCount: exams?.length,
  }))

  const upsertCount = { modules: 0, attendance: 0, timetable: 0, grades: 0 }

  // ── Profile ────────────────────────────────────────────────────────────────
  if (profile && (profile.name || profile.studentId || profile.programme)) {
    db.prepare(`
      INSERT INTO student_profiles (user_id, student_id, programme, last_synced)
      VALUES (?, ?, ?, datetime('now'))
      ON CONFLICT(user_id) DO UPDATE SET
        student_id  = excluded.student_id,
        programme   = excluded.programme,
        last_synced = excluded.last_synced
    `).run(userId, profile.studentId || '', profile.programme || '')

    if (profile.name) {
      db.prepare('UPDATE users SET name = ? WHERE id = ?').run(profile.name, userId)
    }
  }

  // ── Modules + Enrollments ─────────────────────────────────────────────────
  if (modules?.length) {
    for (const m of modules) {
      if (!m.code) continue
      const existing = db.prepare('SELECT id FROM modules WHERE code = ?').get(m.code)
      let moduleId = existing?.id

      if (!moduleId) {
        moduleId = randomUUID()
        db.prepare(`
          INSERT OR IGNORE INTO modules (id, code, name, credits, lecturer, lecture_venue, tutorial_venue, tutorial_section)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(moduleId, m.code, m.name || m.code, m.credits || 0,
               m.lecturer || '', m.lectureVenue || '', m.tutorialVenue || '', m.section || '')
      } else {
        db.prepare(`
          UPDATE modules SET name = ?, credits = ?, lecturer = ?,
            lecture_venue = ?, tutorial_venue = ?, tutorial_section = ?
          WHERE id = ?
        `).run(m.name || '', m.credits || 0, m.lecturer || '',
               m.lectureVenue || '', m.tutorialVenue || '', m.section || '', moduleId)
      }

      // Find grade for this module if provided
      const gradeRow = (grades || []).find(g => g.code === m.code)

      db.prepare(`
        INSERT INTO enrollments (user_id, module_id, grade)
        VALUES (?, ?, ?)
        ON CONFLICT(user_id, module_id) DO UPDATE SET
          grade = excluded.grade
      `).run(userId, moduleId, gradeRow?.grade || null)

      upsertCount.modules++
    }
  }

  // ── Attendance Summary (updates attendance %) ──────────────────────────────
  if (attendance?.summary?.length) {
    for (const a of attendance.summary) {
      if (!a.code) continue

      // OVERALL = store overall attendance % on student profile
      if (a.code === 'OVERALL') {
        db.prepare(`
          UPDATE student_profiles SET cgpa = cgpa WHERE user_id = ?
        `).run(userId)
        continue
      }

      // Find or create the module
      let mod = db.prepare('SELECT id FROM modules WHERE code = ?').get(a.code)
      if (!mod) {
        const moduleId = randomUUID()
        db.prepare(`
          INSERT OR IGNORE INTO modules (id, code, name, credits)
          VALUES (?, ?, ?, 0)
        `).run(moduleId, a.code, a.name || a.code)
        mod = { id: moduleId }

        // Create enrollment if needed
        db.prepare(`
          INSERT OR IGNORE INTO enrollments (user_id, module_id) VALUES (?, ?)
        `).run(userId, moduleId)
      }

      db.prepare(`
        UPDATE enrollments SET attended = ?, total_classes = ?, attendance_pct = ?
        WHERE user_id = ? AND module_id = ?
      `).run(a.attended || 0, a.totalClasses || 0, a.attendance || 0, userId, mod.id)
      upsertCount.attendance++
    }
  }

  // ── Attendance Log (individual class records) ──────────────────────────────
  if (attendance?.log?.length) {
    // Clear old log for this user and re-insert fresh scraped data
    db.prepare('DELETE FROM attendance_log WHERE user_id = ?').run(userId)

    for (const entry of attendance.log) {
      if (!entry.date) continue
      const mod = db.prepare('SELECT id FROM modules WHERE name LIKE ? OR code LIKE ?')
        .get(`%${entry.module}%`, `%${entry.module}%`)

      db.prepare(`
        INSERT INTO attendance_log
          (id, user_id, module_id, module_code, module_name, date, time, type, teacher, status, mc_submitted)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
      `).run(
        randomUUID(), userId,
        mod?.id || null, entry.module || '', entry.module || '',
        entry.date, entry.time || '', entry.type || '',
        entry.teacher || '', entry.status || 'absent'
      )
      upsertCount.attendance++
    }
  }

  // ── Timetable (week schedule) ─────────────────────────────────────────────
  if (timetable?.length) {
    db.prepare('DELETE FROM week_schedule WHERE user_id = ?').run(userId)

    for (const slot of timetable) {
      if (!slot.day || !slot.time) continue
      db.prepare(`
        INSERT INTO week_schedule (id, user_id, day, name, type, time, status)
        VALUES (?, ?, ?, ?, ?, ?, 'remaining')
      `).run(randomUUID(), userId, slot.day, slot.name || '', slot.type || '', slot.time)
      upsertCount.timetable++
    }
  }

  // ── Grades → update enrollment grade ─────────────────────────────────────
  if (grades?.length) {
    for (const g of grades) {
      if (!g.code || g.code === 'CREDITS') continue
      let mod = db.prepare('SELECT id FROM modules WHERE code = ?').get(g.code)
      if (!mod) {
        const moduleId = randomUUID()
        db.prepare(`INSERT OR IGNORE INTO modules (id, code, name, credits) VALUES (?, ?, ?, 0)`)
          .run(moduleId, g.code, g.name || g.code)
        db.prepare(`INSERT OR IGNORE INTO enrollments (user_id, module_id) VALUES (?, ?)`)
          .run(userId, moduleId)
        mod = { id: moduleId }
      }
      db.prepare(`UPDATE enrollments SET grade = ? WHERE user_id = ? AND module_id = ?`)
        .run(g.grade || '', userId, mod.id)
      upsertCount.grades++
    }
  }

  // ── Exams → insert as events ──────────────────────────────────────────────
  if (exams?.length) {
    // Remove old scraped exam events, keep manually added ones
    db.prepare("DELETE FROM events WHERE user_id = ? AND type = 'exam'").run(userId)
    for (const e of exams) {
      if (!e.date) continue
      db.prepare(`
        INSERT INTO events (id, user_id, date, time, title, type, module_code)
        VALUES (?, ?, ?, ?, ?, 'exam', ?)
      `).run(randomUUID(), userId, e.date, e.time || '', e.subject || 'Exam', e.subject || '')
    }
  }

  // Update last_synced timestamp
  db.prepare(`
    UPDATE student_profiles SET last_synced = datetime('now') WHERE user_id = ?
  `).run(userId)

  res.json({
    success: true,
    upserted: upsertCount,
    received: {
      modules: modules?.length ?? 0,
      attendanceSummary: attendance?.summary?.length ?? 0,
      attendanceLog: attendance?.log?.length ?? 0,
      timetable: timetable?.length ?? 0,
      grades: grades?.length ?? 0,
    },
    message: `Sync complete — ${upsertCount.modules} modules, ${upsertCount.attendance} attendance records`,
  })
})

module.exports = router
