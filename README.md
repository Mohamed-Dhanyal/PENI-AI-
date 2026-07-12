# PENI — AI University Companion

> **Full-stack MVP** — React + Vite frontend, Express + SQLite backend, JWT authentication. Built as a direct replacement for Taylor's University myTIMeS portal. Data is now fetched from the backend; the UI still uses some placeholder/seed data where real sources are not yet connected.

---

## Quick Start

You need two terminals running: the backend and the frontend.

```bash
# Terminal 1 — backend
npm install
cd backend
npm install
node --experimental-sqlite server.js
# → http://localhost:3001
# → Health: http://localhost:3001/health
```

```bash
# Terminal 2 — frontend
npm run dev
# → http://localhost:5173
```

Register with your `@sd.taylors.edu.my` (student) or `@taylors.edu.my` (staff) email, or use the seeded demo account.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 (Vite) |
| Styling | Vanilla CSS with CSS custom properties (no Tailwind / CSS-in-JS) |
| State | React `useState`, `useEffect`, `useRef`, `useCallback` (no Redux / Zustand) |
| Routing | None — single-page, view-switching via `activeNav` state in `App.jsx` |
| AI | Keyword-matching mock engine (`PeniConsole.jsx`) — replace with real LLM API |
| Auth | JWT stored in `localStorage` under `peni-token` |
| Data | Fetched from `http://localhost:3001` via `src/api/index.js` |
| Icons | Inline SVG (no icon library dependency) |

---

## Project Structure

```
src/
├── main.jsx                  # React entry point — mounts <App /> into #root
├── App.jsx                   # Root shell: auth gate, theme, layout composition
│
├── components/               # Reusable UI components (not view-specific)
│   ├── TopBar.jsx            # Fixed top bar — branding, student info, sign out
│   ├── RightPanel.jsx        # Side navigation panel — nav items + PENI button
│   ├── NavButton.jsx         # Individual nav button with inline SVG icon
│   ├── PeniButton.jsx        # Special animated button to open PENI AI console
│   ├── MainArea.jsx          # View router — maps activeNav → view component
│   ├── LoginPage.jsx         # Login screen with dissolve animation
│   └── LeftRail.jsx          # (Reserved) Left activity bar — currently unused
│
├── views/                    # Full-page feature views
│   ├── Dashboard.jsx         # Home screen — quick stats, upcoming events, tasks
│   ├── AttendanceView.jsx    # Attendance tracking — summary, bars, week grid, absences + MC
│   ├── ModulesView.jsx       # Module cards — grades, progress, details
│   ├── SemesterView.jsx      # My Calendar — semester roadmap + timetable dropdowns
│   ├── CalendarView.jsx      # (Alias/legacy) — see SemesterView
│   ├── MessagesView.jsx      # Messaging — lecturer & peer threads
│   ├── StudyPlanView.jsx     # Study plan — GPA roadmap, task tracker
│   └── PeniConsole.jsx       # PENI AI chat — streaming UI, sidebar history, suggestions
│
├── data/
│   └── mockData.js           # ALL mock data — replace exports with API hooks
│
└── styles/
    ├── global.css            # CSS custom properties (theme tokens), resets, base typography
    ├── layout.css            # App shell layout — top bar, body, panels
    ├── views.css             # All view-specific styles (attendance, modules, calendar, PENI AI)
    ├── login.css             # Login page styles — animations, glass card
    ├── nav-button.css        # Nav button + icon styles
    └── peni-button.css       # PENI neon button styles

backend/
├── server.js               # Express entry point, CORS, route mounting
├── routes/
│   ├── auth.js             # POST /auth/login, /auth/register (JWT)
│   ├── student.js          # GET /api/student/me, /api/modules, /api/attendance, etc.
│   └── sync.js             # POST /api/sync/mytimes (data ingestion hook)
├── middleware/
│   ├── verifyToken.js      # JWT Bearer token verification
│   └── requireRole.js      # Role-based access control
├── db/
│   ├── schema.js           # SQLite schema and Better-sqlite3 client
│   ├── seed.js             # Demo users, modules, attendance, events, messages
│   └── peni.db             # SQLite database file
└── package.json
```

---

## Feature Implementation Map

### Authentication
- **File:** `App.jsx`, `LoginPage.jsx`, `backend/routes/auth.js`, `backend/middleware/verifyToken.js`
- **Method:** Login/registration hit `POST /auth/login` or `POST /auth/register`. The backend returns a JWT signed with `JWT_SECRET` from `.env` (defaults to a development secret). The token is stored in `localStorage` as `peni-token` and sent as a `Bearer` header on every API call.
- **To improve:** Add token refresh, HTTP-only cookie option, and password reset flow.

### Theme (Dark / Light)
- **File:** `App.jsx`, `global.css`
- **Method:** `data-theme` attribute on `<html>` toggled via `useState`. CSS variables scoped to `[data-theme='light']` override dark defaults. Persisted to `localStorage`.
- **To replace:** No change needed — CSS variable system is production-ready.

### Navigation / View Routing
- **File:** `App.jsx` → `RightPanel.jsx` → `MainArea.jsx`
- **Method:** Single `activeNav` string state lifted to `App`. `MainArea` maps it to a view component via a plain object (`VIEWS`). No React Router needed at this scale.
- **To replace:** If you add deep-linking or browser history, swap the `VIEWS` map for React Router v6 `<Routes>`.

### Attendance View
- **File:** `src/views/AttendanceView.jsx`
- **Method:**
  - Per-module cards use local `useState` for expand/collapse (dropdown details).
  - Summary stats computed inline with `Array.reduce`.
  - Current week grid derived from `weekSchedule` data fetched from `/api/week-schedule`.
  - Absences preview shows first 2; "View all" swaps to `AbsenceDetailView` via `useState` flag (no route change).
  - MC submission is UI-only — **not persisted**. Wire to a POST endpoint.
- **To improve:** Persist MC submission to a real endpoint; add loading skeletons.

### PENI AI Console
- **File:** `src/views/PeniConsole.jsx`
- **Method:**
  - Keyword-matching `answer()` function — completely local, no network call.
  - Streaming effect: `setInterval` at 8ms/char appending characters to the last log entry.
  - Thinking dots shown during artificial delay (900ms) before streaming begins.
  - Sidebar history is mock static data.
- **To replace:** Replace `answer()` with a `fetch` / `EventSource` call to your LLM backend (OpenAI, Gemini, or self-hosted). The streaming UI is already built to handle incremental text — just feed chunks into the same `setLog` pattern. Remove the `setInterval` and use SSE or WebSocket instead.

### My Calendar (Semester View)
- **File:** `src/views/SemesterView.jsx`
- **Method:**
  - Timetable bars toggle dropdowns via local `useState`.
  - Class timetable renders a CSS grid with absolute-positioned event blocks calculated from `hourIndex()`.
  - Roadmap fetched from `/api/gpa-history` and `/api/roadmap`.
  - Timetable slots currently use `MOCK_SLOTS` placeholder; the grid is ready for real data.
- **To improve:** Replace `MOCK_SLOTS` with a real `/api/timetable` endpoint. Grid requires `start`/`end` time strings in `HH:MM` 24h format.

### Messages
- **File:** `src/views/MessagesView.jsx`
- **Method:** Thread selection via `useState`. Filters (All / Lecturers / Classmates) toggle via tab state. Threads are fetched from `/api/messages`. Composer is UI-only — send button doesn't POST.
- **To improve:** POST composer input to `/api/messages` and optionally use WebSocket for real-time updates.

### Modules View
- **File:** `src/views/ModulesView.jsx`
- **Method:** Cards with expand/collapse. Module data is fetched from `/api/modules` and combined with enrollment/attendance/grade info.
- **To improve:** Add loading skeletons and module detail pages.

---

## Data Contracts

The frontend expects the backend to return data in these shapes. The `src/data/mockData.js` file is legacy and is no longer used by the live views.

### `student`
```js
{ name: string, id: string, programme: string, semester: number, cgpa: number }
```

### `modules[]`
```js
{
  code: string, name: string, coordinator: string, lecturer: string,
  tutor: string | null, credits: number, attendance: number,   // 0–100
  attended: number, totalClasses: number, grade: string,
  progress: number,   // 0–100, assignment/task completion
  lectureVenue: string, tutorialVenue: string | null,
  tutorialSection: string | null, accent: string   // hex colour for UI
}
```

### `attendanceLog[]`
```js
{
  date: string, module: string, name: string,
  status: 'present' | 'absent', time: string,
  type: 'Lecture' | 'Tutorial' | 'Lab',
  teacher: string, mcSubmitted: boolean
}
```

### `weekSchedule[]`
```js
{
  day: 'Mon'|'Tue'|'Wed'|'Thu'|'Fri', date: string, name: string,
  type: 'Lecture'|'Tutorial'|'Lab', time: string,
  status: 'present'|'absent'|'remaining'
}
```

### `events[]`
```js
{ date: string, time: string, title: string, type: 'class'|'exam'|'deadline'|'meeting'|'event', module: string | null }
```

### `tasks[]`
```js
{ id: number, title: string, module: string, due: string, priority: 'high'|'medium'|'low', done: boolean }
```

### `messages[]`
```js
{
  id: number, category: 'lecturer'|'mates', from: string, role: string,
  module: string, moduleCode: string | null, initials: string, accent: string,
  subject: string, preview: string, time: string, unread: number,
  thread: Array<{ from: string, me: boolean, text: string, time: string }>
}
```

---

## CSS Architecture

All styles use **CSS custom properties** defined in `global.css`. No preprocessor required.

Key tokens:
```css
--taylors-red          /* primary brand colour */
--taylors-red-light    /* lighter variant for text on dark bg */
--taylors-red-dark     /* darker variant for gradients */
--glass-tint-a/b       /* liquid glass background layers */
--glass-border         /* border colour, theme-aware */
--glass-highlight      /* top-edge glass sheen */
--control-bg           /* card/input background */
--text / --text-muted  /* primary and secondary text */
--bg                   /* page background */
```

Theme switching is done by overriding these tokens under `[data-theme='light']` in `global.css`.

---

## Backend Integration Checklist

- [x] Replace mock auth with JWT backend flow (`/auth/login`, `/auth/register`, `verifyToken` middleware)
- [x] Create API endpoints for `student`, `modules`, `attendance`, `week-schedule`, `events`, `tasks`, `messages`, `gpa-history`, `roadmap`
- [x] Connect frontend data fetches to backend via `src/api/index.js`
- [ ] Wrap data fetches with React Query or SWR for caching and loading states
- [ ] Add loading skeletons (`.skeleton` CSS class pattern recommended)
- [ ] Replace PENI `answer()` with streaming LLM API (SSE or WebSocket)
- [ ] Wire MC submission (`abs-mc-submit-btn`) to a POST `/api/attendance/mc` endpoint
- [ ] Wire message composer to POST `/api/messages` endpoint
- [ ] Add error boundary components around each view
- [ ] Set up environment variables (`VITE_API_BASE_URL`, `JWT_SECRET`, `VITE_AI_API_KEY`)
- [ ] Add ESLint + Prettier config for team consistency
- [ ] Add real timetable endpoint to replace `MOCK_SLOTS` in `SemesterView.jsx`

---

## Notes

- **Seeded demo account:** `dinesh@sd.taylors.edu.my` / `password123` (created by `backend/db/seed.js`). You can also register a new account with a valid `@sd.taylors.edu.my` or `@taylors.edu.my` email.
- **Timetable data** in `SemesterView.jsx` (`MOCK_SLOTS`) is placeholder — the grid is built but the slot data needs to be provided by a real `/api/timetable` endpoint or external source.
- **myTIMeS / Campus Central sync:** A Chrome extension and Playwright crawler were prototyped and removed. The backend ingestion endpoint `POST /api/sync/mytimes` remains if you want to re-add a sync mechanism later.
- **Legacy mock data:** `src/data/mockData.js` is no longer imported by the live views but kept as a reference for data shapes.
