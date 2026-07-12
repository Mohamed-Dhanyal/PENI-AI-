/**
 * db/schema.js — Creates all tables if they don't exist
 * Run automatically on server start.
 */
const db = require('./client')

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id          TEXT PRIMARY KEY,
    email       TEXT UNIQUE NOT NULL,
    name        TEXT NOT NULL,
    password_hash TEXT,
    role        TEXT NOT NULL DEFAULT 'student',
    microsoft_id TEXT,
    photo_url   TEXT,
    created_at  TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS student_profiles (
    user_id     TEXT PRIMARY KEY REFERENCES users(id),
    student_id  TEXT,
    programme   TEXT,
    semester    INTEGER,
    cgpa        REAL,
    last_synced TEXT
  );

  CREATE TABLE IF NOT EXISTS modules (
    id               TEXT PRIMARY KEY,
    code             TEXT NOT NULL,
    name             TEXT NOT NULL,
    credits          INTEGER,
    coordinator      TEXT,
    lecturer         TEXT,
    tutor            TEXT,
    lecture_venue    TEXT,
    tutorial_venue   TEXT,
    tutorial_section TEXT,
    accent           TEXT DEFAULT '#ff4d45'
  );

  CREATE TABLE IF NOT EXISTS enrollments (
    user_id         TEXT REFERENCES users(id),
    module_id       TEXT REFERENCES modules(id),
    attended        INTEGER DEFAULT 0,
    total_classes   INTEGER DEFAULT 0,
    attendance_pct  INTEGER DEFAULT 0,
    grade           TEXT,
    progress        INTEGER DEFAULT 0,
    PRIMARY KEY (user_id, module_id)
  );

  CREATE TABLE IF NOT EXISTS attendance_log (
    id           TEXT PRIMARY KEY,
    user_id      TEXT REFERENCES users(id),
    module_id    TEXT REFERENCES modules(id),
    module_code  TEXT,
    module_name  TEXT,
    date         TEXT,
    time         TEXT,
    type         TEXT,
    teacher      TEXT,
    status       TEXT,
    mc_submitted INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS week_schedule (
    id          TEXT PRIMARY KEY,
    user_id     TEXT REFERENCES users(id),
    day         TEXT,
    date        TEXT,
    name        TEXT,
    type        TEXT,
    time        TEXT,
    status      TEXT
  );

  CREATE TABLE IF NOT EXISTS events (
    id          TEXT PRIMARY KEY,
    user_id     TEXT REFERENCES users(id),
    date        TEXT,
    time        TEXT,
    title       TEXT,
    type        TEXT,
    module_code TEXT
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id          TEXT PRIMARY KEY,
    user_id     TEXT REFERENCES users(id),
    title       TEXT,
    module      TEXT,
    due         TEXT,
    priority    TEXT DEFAULT 'medium',
    done        INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS roadmap (
    id        TEXT PRIMARY KEY,
    user_id   TEXT REFERENCES users(id),
    sem       TEXT,
    status    TEXT,
    modules   INTEGER,
    credits   INTEGER,
    gpa       REAL
  );

  CREATE TABLE IF NOT EXISTS gpa_history (
    id      TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id),
    sem     TEXT,
    gpa     REAL
  );

  CREATE TABLE IF NOT EXISTS messages (
    id          TEXT PRIMARY KEY,
    user_id     TEXT REFERENCES users(id),
    category    TEXT,
    from_name   TEXT,
    role        TEXT,
    module      TEXT,
    module_code TEXT,
    initials    TEXT,
    accent      TEXT,
    subject     TEXT,
    preview     TEXT,
    time        TEXT,
    unread      INTEGER DEFAULT 0,
    thread_json TEXT
  );

  CREATE TABLE IF NOT EXISTS timetable (
    id        TEXT PRIMARY KEY,
    user_id   TEXT REFERENCES users(id),
    day       TEXT NOT NULL,
    start     TEXT NOT NULL,
    end       TEXT NOT NULL,
    code      TEXT NOT NULL,
    label     TEXT NOT NULL,
    type      TEXT NOT NULL,
    venue     TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS weekly_materials (
    id           TEXT PRIMARY KEY,
    module_id    TEXT REFERENCES modules(id),
    week_number  INTEGER NOT NULL,
    week_label   TEXT,
    item_type    TEXT NOT NULL,
    title        TEXT NOT NULL,
    url          TEXT,
    description  TEXT,
    uploaded_at  TEXT DEFAULT (datetime('now')),
    uploaded_by  TEXT
  );

  CREATE TABLE IF NOT EXISTS assignments (
    id               TEXT PRIMARY KEY,
    module_id        TEXT REFERENCES modules(id),
    week_number      INTEGER,
    title            TEXT NOT NULL,
    brief            TEXT,
    due_date         TEXT,
    submission_link  TEXT,
    max_marks        INTEGER DEFAULT 100,
    created_at       TEXT DEFAULT (datetime('now')),
    created_by       TEXT
  );

  CREATE TABLE IF NOT EXISTS assignment_submissions (
    id              TEXT PRIMARY KEY,
    assignment_id   TEXT REFERENCES assignments(id),
    user_id         TEXT REFERENCES users(id),
    submitted_at    TEXT DEFAULT (datetime('now')),
    file_url        TEXT,
    note            TEXT,
    grade           TEXT,
    feedback        TEXT,
    status          TEXT DEFAULT 'submitted'
  );

  CREATE TABLE IF NOT EXISTS assignment_docs (
    id             TEXT PRIMARY KEY,
    assignment_id  TEXT REFERENCES assignments(id),
    item_type      TEXT NOT NULL,
    title          TEXT NOT NULL,
    url            TEXT,
    uploaded_at    TEXT DEFAULT (datetime('now'))
  );
`)

console.log('[DB] Schema ready')
module.exports = db
