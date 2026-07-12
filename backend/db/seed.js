/**
 * db/seed.js — Seeds the database with mock data for the demo student.
 * Run: node db/seed.js
 * Safe to re-run — uses INSERT OR IGNORE.
 */
require('./schema')
const db = require('./client')
const bcrypt = require('bcryptjs')
const { randomUUID } = require('crypto')

const STUDENT_ID = 'user-dinesh-001'
const passwordHash = bcrypt.hashSync('password123', 10)

// ── Users ────────────────────────────────────────────────────────────────────
db.prepare(`INSERT OR IGNORE INTO users (id, email, name, password_hash, role)
  VALUES (?, ?, ?, ?, ?)`).run(
  STUDENT_ID, 'dinesh@sd.taylors.edu.my', 'Dinesh', passwordHash, 'student'
)

db.prepare(`INSERT OR IGNORE INTO users (id, email, name, password_hash, role)
  VALUES (?, ?, ?, ?, ?)`).run(
  'user-teacher-001', 'amelia.tan@taylors.edu.my', 'Dr. Amelia Tan',
  bcrypt.hashSync('password123', 10), 'teacher'
)

// ── Student Profile ───────────────────────────────────────────────────────────
db.prepare(`INSERT OR IGNORE INTO student_profiles
  (user_id, student_id, programme, semester, cgpa)
  VALUES (?, ?, ?, ?, ?)`).run(
  STUDENT_ID, '0369421', 'Bachelor of Software Engineering (Hons)', 5, 3.67
)

// ── Modules ───────────────────────────────────────────────────────────────────
const modules = [
  { id: 'mod-1', code: 'CSC60104', name: 'Advanced Machine Learning',      credits: 4, coordinator: 'Prof. Lee Chong Wei', lecturer: 'Dr. Amelia Tan',    tutor: 'Mr. Rajan Pillai',    lectureVenue: 'E5.03',    tutorialVenue: 'E5.05',  tutorialSection: 'TC01', accent: '#ff4d45' },
  { id: 'mod-2', code: 'CSC61304', name: 'Cloud Infrastructure & DevOps',  credits: 4, coordinator: 'Dr. Amelia Tan',       lecturer: 'Mr. Harith Rahman', tutor: 'Ms. Priya Nair',      lectureVenue: 'C4.10',    tutorialVenue: 'C4.12',  tutorialSection: 'TC02', accent: '#ff6a00' },
  { id: 'mod-3', code: 'CSC62506', name: 'Final Year Project I',           credits: 6, coordinator: 'Dr. Priya Nair',       lecturer: 'Dr. Priya Nair',    tutor: null,                  lectureVenue: 'FYP Lab 2',tutorialVenue: null,     tutorialSection: null,   accent: '#e2231a' },
  { id: 'mod-4', code: 'CSC60204', name: 'Distributed Systems',            credits: 4, coordinator: 'Dr. Wong Kai Ming',    lecturer: 'Dr. Wong Kai Ming', tutor: 'Mr. Harith Rahman',   lectureVenue: 'E3.15',    tutorialVenue: 'E3.17',  tutorialSection: 'TC03', accent: '#ff0844' },
  { id: 'mod-5', code: 'MPU34032', name: 'Community Service Initiative',   credits: 2, coordinator: 'Ms. Farah Aziz',       lecturer: 'Ms. Farah Aziz',    tutor: null,                  lectureVenue: 'Online',   tutorialVenue: null,     tutorialSection: null,   accent: '#ff8c69' },
]

for (const m of modules) {
  db.prepare(`INSERT OR IGNORE INTO modules
    (id, code, name, credits, coordinator, lecturer, tutor, lecture_venue, tutorial_venue, tutorial_section, accent)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
    m.id, m.code, m.name, m.credits, m.coordinator, m.lecturer, m.tutor,
    m.lectureVenue, m.tutorialVenue, m.tutorialSection, m.accent
  )
}

// ── Enrollments ───────────────────────────────────────────────────────────────
const enrollments = [
  { moduleId: 'mod-1', attended: 21, total: 22, pct: 95, grade: 'A-', progress: 78 },
  { moduleId: 'mod-2', attended: 22, total: 25, pct: 88, grade: 'B+', progress: 72 },
  { moduleId: 'mod-3', attended: 12, total: 12, pct: 100, grade: 'A', progress: 85 },
  { moduleId: 'mod-4', attended: 17, total: 23, pct: 74, grade: 'B',  progress: 65 },
  { moduleId: 'mod-5', attended: 10, total: 11, pct: 91, grade: 'A',  progress: 90 },
]

for (const e of enrollments) {
  db.prepare(`INSERT OR IGNORE INTO enrollments
    (user_id, module_id, attended, total_classes, attendance_pct, grade, progress)
    VALUES (?, ?, ?, ?, ?, ?, ?)`).run(
    STUDENT_ID, e.moduleId, e.attended, e.total, e.pct, e.grade, e.progress
  )
}

// ── Attendance Log ────────────────────────────────────────────────────────────
const attendanceLogs = [
  { id: randomUUID(), moduleId: 'mod-4', code: 'CSC60204', name: 'Distributed Systems',            date: 'Jul 9, 2026',  time: '11:00 AM', type: 'Lecture',  teacher: 'Dr. Wong Kai Ming',  status: 'absent',  mc: 0 },
  { id: randomUUID(), moduleId: 'mod-1', code: 'CSC60104', name: 'Advanced Machine Learning',      date: 'Jul 9, 2026',  time: '10:00 AM', type: 'Lecture',  teacher: 'Dr. Amelia Tan',     status: 'present', mc: 0 },
  { id: randomUUID(), moduleId: 'mod-3', code: 'CSC62506', name: 'Final Year Project I',           date: 'Jul 8, 2026',  time: '9:00 AM',  type: 'Lab',      teacher: 'Dr. Priya Nair',     status: 'present', mc: 0 },
  { id: randomUUID(), moduleId: 'mod-2', code: 'CSC61304', name: 'Cloud Infrastructure & DevOps', date: 'Jul 7, 2026',  time: '2:00 PM',  type: 'Tutorial', teacher: 'Ms. Priya Nair',     status: 'present', mc: 0 },
  { id: randomUUID(), moduleId: 'mod-1', code: 'CSC60104', name: 'Advanced Machine Learning',      date: 'Jul 6, 2026',  time: '10:00 AM', type: 'Lecture',  teacher: 'Dr. Amelia Tan',     status: 'present', mc: 0 },
  { id: randomUUID(), moduleId: 'mod-5', code: 'MPU34032', name: 'Community Service Initiative',  date: 'Jul 3, 2026',  time: '3:00 PM',  type: 'Lecture',  teacher: 'Ms. Farah Aziz',     status: 'present', mc: 0 },
  { id: randomUUID(), moduleId: 'mod-4', code: 'CSC60204', name: 'Distributed Systems',            date: 'Jul 2, 2026',  time: '11:00 AM', type: 'Tutorial', teacher: 'Mr. Harith Rahman',  status: 'absent',  mc: 1 },
  { id: randomUUID(), moduleId: 'mod-1', code: 'CSC60104', name: 'Advanced Machine Learning',      date: 'Jun 28, 2026', time: '10:00 AM', type: 'Tutorial', teacher: 'Mr. Rajan Pillai',   status: 'absent',  mc: 0 },
  { id: randomUUID(), moduleId: 'mod-2', code: 'CSC61304', name: 'Cloud Infrastructure & DevOps', date: 'Jun 25, 2026', time: '10:00 AM', type: 'Lecture',  teacher: 'Mr. Harith Rahman',  status: 'absent',  mc: 0 },
]

for (const a of attendanceLogs) {
  db.prepare(`INSERT OR IGNORE INTO attendance_log
    (id, user_id, module_id, module_code, module_name, date, time, type, teacher, status, mc_submitted)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
    a.id, STUDENT_ID, a.moduleId, a.code, a.name, a.date, a.time, a.type, a.teacher, a.status, a.mc
  )
}

// ── Week Schedule ─────────────────────────────────────────────────────────────
const weekSchedule = [
  { day: 'Mon', date: 'Jul 7',  name: 'Advanced Machine Learning',      type: 'Lecture',  time: '8:00 AM',  status: 'present' },
  { day: 'Mon', date: 'Jul 7',  name: 'Cloud Infrastructure & DevOps',  type: 'Tutorial', time: '2:00 PM',  status: 'present' },
  { day: 'Tue', date: 'Jul 8',  name: 'Final Year Project I',           type: 'Lab',      time: '10:00 AM', status: 'present' },
  { day: 'Tue', date: 'Jul 8',  name: 'Distributed Systems',            type: 'Lecture',  time: '2:00 PM',  status: 'absent'  },
  { day: 'Wed', date: 'Jul 9',  name: 'Advanced Machine Learning',      type: 'Tutorial', time: '9:00 AM',  status: 'present' },
  { day: 'Wed', date: 'Jul 9',  name: 'Community Service Initiative',   type: 'Lecture',  time: '1:00 PM',  status: 'present' },
  { day: 'Thu', date: 'Jul 10', name: 'Cloud Infrastructure & DevOps',  type: 'Lecture',  time: '10:00 AM', status: 'remaining' },
  { day: 'Thu', date: 'Jul 10', name: 'Distributed Systems',            type: 'Tutorial', time: '3:00 PM',  status: 'remaining' },
  { day: 'Fri', date: 'Jul 11', name: 'Final Year Project I',           type: 'Lab',      time: '9:00 AM',  status: 'remaining' },
]

for (const s of weekSchedule) {
  db.prepare(`INSERT OR IGNORE INTO week_schedule (id, user_id, day, date, name, type, time, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(
    randomUUID(), STUDENT_ID, s.day, s.date, s.name, s.type, s.time, s.status
  )
}

// ── Events ────────────────────────────────────────────────────────────────────
const events = [
  { date: '2026-07-10', time: '3:00 PM',   title: 'Community Service Briefing',      type: 'class',    module: 'MPU34032' },
  { date: '2026-07-13', time: '10:00 AM',  title: 'AML Lecture — Transformers II',   type: 'class',    module: 'CSC60104' },
  { date: '2026-07-14', time: '10:00 AM',  title: 'AML Quiz 2',                      type: 'exam',     module: 'CSC60104' },
  { date: '2026-07-16', time: '11:59 PM',  title: 'DevOps Assignment 2 Due',         type: 'deadline', module: 'CSC61304' },
  { date: '2026-07-20', time: '9:00 AM',   title: 'FYP Supervisor Meeting',          type: 'meeting',  module: 'CSC62506' },
  { date: '2026-07-22', time: '11:00 AM',  title: 'Distributed Systems Lab Test',    type: 'exam',     module: 'CSC60204' },
  { date: '2026-07-24', time: '11:59 PM',  title: 'FYP Proposal Draft Due',          type: 'deadline', module: 'CSC62506' },
  { date: '2026-07-28', time: '2:00 PM',   title: 'Cloud Migration Workshop',        type: 'class',    module: 'CSC61304' },
  { date: '2026-07-31', time: '6:00 PM',   title: "Taylor's Tech Career Fair",       type: 'event',    module: null       },
  { date: '2026-08-04', time: '10:00 AM',  title: 'AML Final Presentation',          type: 'exam',     module: 'CSC60104' },
]

for (const e of events) {
  db.prepare(`INSERT OR IGNORE INTO events (id, user_id, date, time, title, type, module_code)
    VALUES (?, ?, ?, ?, ?, ?, ?)`).run(
    randomUUID(), STUDENT_ID, e.date, e.time, e.title, e.type, e.module
  )
}

// ── Tasks ─────────────────────────────────────────────────────────────────────
const tasks = [
  { id: 'task-1', title: 'Finish DevOps Assignment 2',         module: 'CSC61304', due: 'Jul 16', priority: 'high',   done: 0 },
  { id: 'task-2', title: 'Revise Transformers for AML Quiz 2', module: 'CSC60104', due: 'Jul 14', priority: 'high',   done: 0 },
  { id: 'task-3', title: 'Draft FYP literature review',        module: 'CSC62506', due: 'Jul 24', priority: 'medium', done: 0 },
  { id: 'task-4', title: 'Lab prep — consensus algorithms',    module: 'CSC60204', due: 'Jul 22', priority: 'medium', done: 0 },
  { id: 'task-5', title: 'Log community service hours',        module: 'MPU34032', due: 'Jul 18', priority: 'low',    done: 1 },
  { id: 'task-6', title: 'Peer review cloud architecture doc', module: 'CSC61304', due: 'Jul 12', priority: 'low',    done: 1 },
]

for (const t of tasks) {
  db.prepare(`INSERT OR IGNORE INTO tasks (id, user_id, title, module, due, priority, done)
    VALUES (?, ?, ?, ?, ?, ?, ?)`).run(
    t.id, STUDENT_ID, t.title, t.module, t.due, t.priority, t.done
  )
}

// ── GPA History ───────────────────────────────────────────────────────────────
const gpaHistory = [
  { sem: 'Sem 1', gpa: 3.42 }, { sem: 'Sem 2', gpa: 3.51 },
  { sem: 'Sem 3', gpa: 3.58 }, { sem: 'Sem 4', gpa: 3.72 },
  { sem: 'Sem 5', gpa: 3.67 },
]

for (const g of gpaHistory) {
  db.prepare(`INSERT OR IGNORE INTO gpa_history (id, user_id, sem, gpa) VALUES (?, ?, ?, ?)`)
    .run(randomUUID(), STUDENT_ID, g.sem, g.gpa)
}

// ── Roadmap ───────────────────────────────────────────────────────────────────
const roadmap = [
  { sem: 'Semester 1', status: 'completed', modules: 5, credits: 18, gpa: 3.42 },
  { sem: 'Semester 2', status: 'completed', modules: 5, credits: 19, gpa: 3.51 },
  { sem: 'Semester 3', status: 'completed', modules: 6, credits: 20, gpa: 3.58 },
  { sem: 'Semester 4', status: 'completed', modules: 5, credits: 18, gpa: 3.72 },
  { sem: 'Semester 5', status: 'current',   modules: 5, credits: 20, gpa: null  },
  { sem: 'Semester 6', status: 'upcoming',  modules: 5, credits: 19, gpa: null  },
  { sem: 'Semester 7', status: 'upcoming',  modules: 4, credits: 16, gpa: null  },
  { sem: 'Semester 8', status: 'upcoming',  modules: 3, credits: 14, gpa: null  },
]

for (const r of roadmap) {
  db.prepare(`INSERT OR IGNORE INTO roadmap (id, user_id, sem, status, modules, credits, gpa)
    VALUES (?, ?, ?, ?, ?, ?, ?)`).run(
    randomUUID(), STUDENT_ID, r.sem, r.status, r.modules, r.credits, r.gpa
  )
}

// ── Messages ──────────────────────────────────────────────────────────────────
const messages = [
  {
    id: 'msg-1', category: 'lecturer', from: 'Dr. Amelia Tan', role: 'Lecturer',
    module: 'Advanced Machine Learning', moduleCode: 'CSC60104', initials: 'AT', accent: '#ff4d45',
    subject: 'AML Quiz 2 — Scope Confirmed', preview: 'Quiz 2 will cover lectures 6–9…', time: '2h ago', unread: 2,
    thread: [
      { from: 'Dr. Amelia Tan', me: false, text: 'Hi everyone, Quiz 2 will cover lectures 6–9: attention mechanisms, transformers, and fine-tuning strategies.', time: 'Today, 10:12 AM' },
      { from: 'Dr. Amelia Tan', me: false, text: 'Past year samples are up on the portal. Focus on the encoder-decoder walkthrough from Lab 7.', time: 'Today, 10:14 AM' },
    ],
  },
  {
    id: 'msg-2', category: 'mates', from: 'FYP Group 12', role: 'Group Chat',
    module: 'Final Year Project I', moduleCode: 'CSC62506', initials: 'G12', accent: '#ff6a00',
    subject: 'Proposal draft — section split', preview: "Sara: I'll handle the Gantt chart…", time: '5h ago', unread: 1,
    thread: [
      { from: 'Wei Jian', me: false, text: "I've pushed the methodology skeleton to the repo. Can you take the lit review section?", time: 'Today, 7:02 AM' },
      { from: 'You', me: true, text: "On it. I'll have a draft by Sunday night.", time: 'Today, 7:45 AM' },
      { from: 'Sara', me: false, text: "I'll handle the Gantt chart and risk matrix then.", time: 'Today, 8:10 AM' },
    ],
  },
  {
    id: 'msg-3', category: 'lecturer', from: 'Dr. Wong Kai Ming', role: 'Lecturer',
    module: 'Distributed Systems', moduleCode: 'CSC60204', initials: 'WK', accent: '#ff0844',
    subject: 'Attendance Warning — Action Required', preview: 'Your attendance has fallen to 74%…', time: '1d ago', unread: 2,
    thread: [
      { from: 'Dr. Wong Kai Ming', me: false, text: 'Your attendance for Distributed Systems has fallen to 74%. Below 70% you will be barred from the final exam.', time: 'Yesterday, 4:30 PM' },
      { from: 'Dr. Wong Kai Ming', me: false, text: 'Please see me during consultation hours (Thu 2–4 PM) if there are extenuating circumstances.', time: 'Yesterday, 4:31 PM' },
    ],
  },
]

for (const m of messages) {
  db.prepare(`INSERT OR IGNORE INTO messages
    (id, user_id, category, from_name, role, module, module_code, initials, accent, subject, preview, time, unread, thread_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
    m.id, STUDENT_ID, m.category, m.from, m.role, m.module, m.moduleCode,
    m.initials, m.accent, m.subject, m.preview, m.time, m.unread,
    JSON.stringify(m.thread)
  )
}

// ── Timetable ───────────────────────────────────────────────────────────────
const timetable = [
  { day: 'Monday',    start: '8:00',  end: '10:00', code: 'CSC60104', label: 'Advanced ML',          type: 'Lecture',  venue: 'E5.03' },
  { day: 'Monday',    start: '14:00', end: '16:00', code: 'CSC61304', label: 'Cloud & DevOps',       type: 'Tutorial', venue: 'C4.12' },
  { day: 'Tuesday',   start: '10:00', end: '12:00', code: 'CSC62506', label: 'FYP I',                type: 'Lab',      venue: 'FYP Lab 2' },
  { day: 'Tuesday',   start: '14:00', end: '16:00', code: 'CSC60204', label: 'Distributed Systems',  type: 'Lecture',  venue: 'E3.15' },
  { day: 'Wednesday', start: '9:00',  end: '11:00', code: 'CSC60104', label: 'Advanced ML',          type: 'Tutorial', venue: 'E5.05' },
  { day: 'Wednesday', start: '13:00', end: '15:00', code: 'MPU34032', label: 'Community Service',    type: 'Lecture',  venue: 'DK1' },
  { day: 'Thursday',  start: '10:00', end: '12:00', code: 'CSC61304', label: 'Cloud & DevOps',       type: 'Lecture',  venue: 'C4.10' },
  { day: 'Thursday',  start: '15:00', end: '17:00', code: 'CSC60204', label: 'Distributed Systems',  type: 'Tutorial', venue: 'E3.17' },
  { day: 'Friday',    start: '9:00',  end: '11:00', code: 'CSC62506', label: 'FYP I',                type: 'Lab',      venue: 'FYP Lab 2' },
]

for (const slot of timetable) {
  db.prepare(`INSERT OR IGNORE INTO timetable
    (id, user_id, day, start, end, code, label, type, venue)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
    randomUUID(), STUDENT_ID, slot.day, slot.start, slot.end, slot.code, slot.label, slot.type, slot.venue
  )
}

// ── Weekly Materials ──────────────────────────────────────────────────────────
const materials = [
  // CSC60104 — Advanced Machine Learning
  { id: 'mat-1',  moduleId: 'mod-1', week: 1,  weekLabel: 'Week 1 — Introduction to ML',           type: 'lecture-slides',  title: 'Course Overview & ML Fundamentals',        url: null, desc: 'Slides covering supervised, unsupervised and reinforcement learning.' },
  { id: 'mat-2',  moduleId: 'mod-1', week: 1,  weekLabel: 'Week 1 — Introduction to ML',           type: 'reference',       title: 'Bishop — Pattern Recognition Ch.1',         url: null, desc: 'Recommended reading.' },
  { id: 'mat-3',  moduleId: 'mod-1', week: 2,  weekLabel: 'Week 2 — Neural Networks',              type: 'lecture-slides',  title: 'Deep Neural Networks & Backpropagation',    url: null, desc: null },
  { id: 'mat-4',  moduleId: 'mod-1', week: 2,  weekLabel: 'Week 2 — Neural Networks',              type: 'tutorial-slides', title: 'Tutorial 2 — PyTorch Basics',               url: null, desc: null },
  { id: 'mat-5',  moduleId: 'mod-1', week: 3,  weekLabel: 'Week 3 — CNNs',                         type: 'lecture-slides',  title: 'Convolutional Neural Networks',             url: null, desc: null },
  { id: 'mat-6',  moduleId: 'mod-1', week: 3,  weekLabel: 'Week 3 — CNNs',                         type: 'video',           title: 'Lecture Recording — CNNs (Week 3)',         url: null, desc: null },
  { id: 'mat-7',  moduleId: 'mod-1', week: 6,  weekLabel: 'Week 6 — Attention Mechanisms',         type: 'lecture-slides',  title: 'Self-Attention & Multi-Head Attention',      url: null, desc: null },
  { id: 'mat-8',  moduleId: 'mod-1', week: 7,  weekLabel: 'Week 7 — Transformers',                 type: 'lecture-slides',  title: 'Transformer Architecture Deep Dive',        url: null, desc: 'Encoder-decoder walkthrough from Lab 7.' },
  { id: 'mat-9',  moduleId: 'mod-1', week: 7,  weekLabel: 'Week 7 — Transformers',                 type: 'tutorial-answers','title': 'Tutorial 7 Answers — Attention',          url: null, desc: null },
  { id: 'mat-10', moduleId: 'mod-1', week: 8,  weekLabel: 'Week 8 — Fine-Tuning Strategies',       type: 'lecture-slides',  title: 'Transfer Learning & Fine-Tuning',           url: null, desc: null },

  // CSC61304 — Cloud Infrastructure & DevOps
  { id: 'mat-11', moduleId: 'mod-2', week: 1,  weekLabel: 'Week 1 — Cloud Fundamentals',           type: 'lecture-slides',  title: 'Cloud Models: IaaS, PaaS, SaaS',            url: null, desc: null },
  { id: 'mat-12', moduleId: 'mod-2', week: 2,  weekLabel: 'Week 2 — Containerisation',             type: 'lecture-slides',  title: 'Docker & Container Orchestration',          url: null, desc: null },
  { id: 'mat-13', moduleId: 'mod-2', week: 2,  weekLabel: 'Week 2 — Containerisation',             type: 'tutorial-slides', title: 'Tutorial 2 — Docker Compose Lab',           url: null, desc: null },
  { id: 'mat-14', moduleId: 'mod-2', week: 3,  weekLabel: 'Week 3 — Kubernetes',                   type: 'lecture-slides',  title: 'Kubernetes Architecture & Deployments',     url: null, desc: null },
  { id: 'mat-15', moduleId: 'mod-2', week: 4,  weekLabel: 'Week 4 — CI/CD Pipelines',              type: 'lecture-slides',  title: 'CI/CD with GitHub Actions',                 url: null, desc: null },
  { id: 'mat-16', moduleId: 'mod-2', week: 4,  weekLabel: 'Week 4 — CI/CD Pipelines',              type: 'reference',       title: 'GitHub Actions Docs — Official Guide',      url: null, desc: null },

  // CSC62506 — Final Year Project I
  { id: 'mat-17', moduleId: 'mod-3', week: 1,  weekLabel: 'Week 1 — FYP Orientation',              type: 'lecture-slides',  title: 'FYP Guidelines & Assessment Criteria',      url: null, desc: null },
  { id: 'mat-18', moduleId: 'mod-3', week: 2,  weekLabel: 'Week 2 — Literature Review',            type: 'reference',       title: 'How to Write a Literature Review',          url: null, desc: null },
  { id: 'mat-19', moduleId: 'mod-3', week: 3,  weekLabel: 'Week 3 — Proposal Writing',             type: 'lecture-slides',  title: 'Research Proposal Structure',               url: null, desc: null },
  { id: 'mat-20', moduleId: 'mod-3', week: 3,  weekLabel: 'Week 3 — Proposal Writing',             type: 'tutorial-slides', title: 'Sample FYP Proposals (Past Years)',         url: null, desc: null },

  // CSC60204 — Distributed Systems
  { id: 'mat-21', moduleId: 'mod-4', week: 1,  weekLabel: 'Week 1 — Intro to Distributed Systems', type: 'lecture-slides',  title: 'Fallacies of Distributed Computing',        url: null, desc: null },
  { id: 'mat-22', moduleId: 'mod-4', week: 2,  weekLabel: 'Week 2 — Consensus Algorithms',         type: 'lecture-slides',  title: 'Paxos & Raft Consensus Protocols',           url: null, desc: null },
  { id: 'mat-23', moduleId: 'mod-4', week: 2,  weekLabel: 'Week 2 — Consensus Algorithms',         type: 'tutorial-slides', title: 'Tutorial 2 — Raft Simulation',              url: null, desc: null },
  { id: 'mat-24', moduleId: 'mod-4', week: 3,  weekLabel: 'Week 3 — Replication',                  type: 'lecture-slides',  title: 'Data Replication Strategies',               url: null, desc: null },

  // MPU34032 — Community Service Initiative
  { id: 'mat-25', moduleId: 'mod-5', week: 1,  weekLabel: 'Week 1 — Module Introduction',          type: 'lecture-slides',  title: 'Community Service Module Overview',         url: null, desc: null },
  { id: 'mat-26', moduleId: 'mod-5', week: 2,  weekLabel: 'Week 2 — Service Learning',             type: 'reference',       title: 'Service Learning Framework',                url: null, desc: null },
]

for (const mat of materials) {
  db.prepare(`INSERT OR IGNORE INTO weekly_materials
    (id, module_id, week_number, week_label, item_type, title, url, description, uploaded_at, uploaded_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
    mat.id, mat.moduleId, mat.week, mat.weekLabel, mat.type, mat.title,
    mat.url, mat.desc, new Date().toISOString(), 'user-teacher-001'
  )
}

// ── Assignments ────────────────────────────────────────────────────────────────
const assignments = [
  { id: 'asgn-1', moduleId: 'mod-1', week: 4,  title: 'Assignment 1 — CNN Image Classifier',      brief: 'Build and train a CNN on CIFAR-10 using PyTorch. Report accuracy and include confusion matrix.', due: '2026-06-30', max: 100 },
  { id: 'asgn-2', moduleId: 'mod-1', week: 8,  title: 'Assignment 2 — Transformer Fine-Tuning',   brief: 'Fine-tune a pre-trained BERT model for sentiment classification. Compare with baseline.', due: '2026-07-28', max: 100 },
  { id: 'asgn-3', moduleId: 'mod-2', week: 3,  title: 'Assignment 1 — Docker Deployment',         brief: 'Containerise a Node.js REST API using Docker. Include docker-compose with a database service.', due: '2026-06-28', max: 50  },
  { id: 'asgn-4', moduleId: 'mod-2', week: 6,  title: 'Assignment 2 — CI/CD Pipeline',            brief: 'Set up a GitHub Actions pipeline that builds, tests and deploys a sample app to a cloud provider.', due: '2026-07-16', max: 100 },
  { id: 'asgn-5', moduleId: 'mod-3', week: 4,  title: 'FYP Proposal Draft',                       brief: 'Submit a 2,000-word project proposal including problem statement, objectives, and methodology.', due: '2026-07-24', max: 100 },
  { id: 'asgn-6', moduleId: 'mod-4', week: 5,  title: 'Assignment 1 — Raft Implementation',       brief: 'Implement the Raft leader election protocol in any language. Include test cases for split-brain scenarios.', due: '2026-07-10', max: 80  },
  { id: 'asgn-7', moduleId: 'mod-4', week: 8,  title: 'Assignment 2 — Distributed KV Store',      brief: 'Build a simple distributed key-value store with replication and fault tolerance.', due: '2026-07-22', max: 100 },
  { id: 'asgn-8', moduleId: 'mod-5', week: 6,  title: 'Community Service Log & Reflection',       brief: 'Submit 20 hours of logged community service with a 500-word reflection essay.', due: '2026-07-18', max: 50  },
]

for (const a of assignments) {
  db.prepare(`INSERT OR IGNORE INTO assignments
    (id, module_id, week_number, title, brief, due_date, max_marks, created_at, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
    a.id, a.moduleId, a.week, a.title, a.brief, a.due, a.max,
    new Date().toISOString(), 'user-teacher-001'
  )
}

console.log('[Seed] Demo data inserted successfully')
console.log('[Seed] Student login: dinesh@sd.taylors.edu.my / password123')
console.log('[Seed] Teacher login: amelia.tan@taylors.edu.my / password123')
