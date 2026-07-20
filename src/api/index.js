/**
 * src/api/index.js — Centralised API layer
 *
 * This is the ONLY file that imports from mockData.js.
 * Every view/component fetches data through these functions.
 *
 * ─── HOW TO REPLACE MOCK DATA WITH A REAL BACKEND ───────────────────────────
 *
 * 1. Remove the mockData imports at the top of this file.
 * 2. Replace each function body with a real fetch() call, e.g.:
 *
 *    export async function getModules() {
 *      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/modules`, {
 *        headers: { Authorization: `Bearer ${getToken()}` },
 *      })
 *      if (!res.ok) throw new Error('Failed to fetch modules')
 *      return res.json()
 *    }
 *
 * 3. In each view, wrap the call with React Query:
 *
 *    import { useQuery } from '@tanstack/react-query'
 *    import { getModules } from '../api/index.js'
 *
 *    const { data: modules = [], isLoading } = useQuery({
 *      queryKey: ['modules'],
 *      queryFn: getModules,
 *    })
 *
 * 4. Add a loading/error guard at the top of each view:
 *    if (isLoading) return <div className="view-loading">Loading…</div>
 *
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * All functions currently return Promises that resolve immediately
 * (simulating async behaviour so views are already written correctly
 * for the async swap).
 */

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001').replace(/\/+$/, '')

function getToken() {
  return localStorage.getItem('peni-token')
}

async function apiFetch(path, options = {}) {
  const token = getToken()
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  })
  if (res.status === 401) {
    localStorage.removeItem('peni-token')
    window.location.reload()
    return
  }
  if (!res.ok) throw new Error(`API ${path} failed: ${res.status}`)
  return res.json()
}

// ── Auth ──────────────────────────────────────────────────────────────────────

/**
 * @param {{ email: string, password: string }} creds
 * @returns {Promise<{ token: string, user: object }>}
 */
export async function login(creds) {
  return apiFetch('/auth/login', { method: 'POST', body: JSON.stringify(creds) })
}

/**
 * @param {{ name: string, email: string, password: string }} data
 * @returns {Promise<{ token: string, user: object }>}
 */
export async function register(data) {
  return apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(data) })
}

// ── Student ───────────────────────────────────────────────────────────────────

/** @returns {Promise<object>} student profile */
export async function getStudent() {
  return apiFetch('/api/student/me')
}

// ── Modules ───────────────────────────────────────────────────────────────────

/** @returns {Promise<Array>} */
export async function getModules() {
  return apiFetch('/api/modules')
}

// ── Attendance ────────────────────────────────────────────────────────────────

/** @returns {Promise<Array>} */
export async function getAttendanceLog() {
  return apiFetch('/api/attendance')
}

/** @returns {Promise<Array>} */
export async function getWeekSchedule() {
  return apiFetch('/api/week-schedule')
}

/**
 * @param {{ logId: string, note: string }} payload
 * @returns {Promise<{ success: boolean }>}
 */
export async function submitMcRequest(payload) {
  return apiFetch('/api/attendance/mc', { method: 'POST', body: JSON.stringify(payload) })
}

// ── Events ────────────────────────────────────────────────────────────────────

/** @returns {Promise<Array>} */
export async function getEvents() {
  return apiFetch('/api/events')
}

// ── Tasks ─────────────────────────────────────────────────────────────────────

/** @returns {Promise<Array>} */
export async function getTasks() {
  return apiFetch('/api/tasks')
}

/**
 * @param {{ id: string, done: boolean }} payload
 */
export async function updateTask({ id, done }) {
  return apiFetch(`/api/tasks/${id}`, { method: 'PATCH', body: JSON.stringify({ done }) })
}

// ── GPA & Roadmap ─────────────────────────────────────────────────────────────

/** @returns {Promise<Array>} */
export async function getGpaHistory() {
  return apiFetch('/api/gpa-history')
}

/** @returns {Promise<Array>} */
export async function getRoadmap() {
  return apiFetch('/api/roadmap')
}

// ── Messages ──────────────────────────────────────────────────────────────────

/** @returns {Promise<Array>} */
export async function getMessages() {
  return apiFetch('/api/messages')
}

/**
 * @param {{ threadId: string, text: string }} payload
 */
export async function sendMessage({ threadId, text }) {
  return apiFetch('/api/messages/send', { method: 'POST', body: JSON.stringify({ threadId, text }) })
}

// ── Timetable ─────────────────────────────────────────────────────────────────

/** @returns {Promise<Array>} */
export async function getTimetable() {
  return apiFetch('/api/timetable')
}

// ── Weekly Materials ──────────────────────────────────────────────────────────

/** @param {string} moduleCode @returns {Promise<Array>} */
export async function getWeeklyMaterials(moduleCode) {
  return apiFetch(`/api/modules/${moduleCode}/materials`)
}

// ── Assignments ───────────────────────────────────────────────────────────────

/** @param {string} moduleCode @returns {Promise<Array>} */
export async function getAssignments(moduleCode) {
  return apiFetch(`/api/modules/${moduleCode}/assignments`)
}

/** @param {{ id: string, note?: string, fileUrl?: string }} payload */
export async function submitAssignment({ id, note, fileUrl }) {
  return apiFetch(`/api/assignments/${id}/submit`, { method: 'POST', body: JSON.stringify({ note, fileUrl }) })
}

// ── Teacher ───────────────────────────────────────────────────────────────────

/** @returns {Promise<Array>} teacher's own modules */
export async function getTeacherModules() {
  return apiFetch('/api/teacher/modules')
}

/** @param {string} moduleCode @param {object} payload */
export async function uploadWeeklyMaterial(moduleCode, payload) {
  return apiFetch(`/api/teacher/modules/${moduleCode}/materials`, { method: 'POST', body: JSON.stringify(payload) })
}

/** @param {string} materialId */
export async function deleteWeeklyMaterial(materialId) {
  return apiFetch(`/api/teacher/materials/${materialId}`, { method: 'DELETE' })
}

/** @param {string} moduleCode @param {object} payload */
export async function createAssignment(moduleCode, payload) {
  return apiFetch(`/api/teacher/modules/${moduleCode}/assignments`, { method: 'POST', body: JSON.stringify(payload) })
}

/** @param {string} assignmentId @param {object} payload */
export async function updateAssignment(assignmentId, payload) {
  return apiFetch(`/api/teacher/assignments/${assignmentId}`, { method: 'PATCH', body: JSON.stringify(payload) })
}

/** @param {string} assignmentId */
export async function deleteAssignment(assignmentId) {
  return apiFetch(`/api/teacher/assignments/${assignmentId}`, { method: 'DELETE' })
}

/** @param {string} assignmentId @param {object} doc */
export async function attachAssignmentDoc(assignmentId, doc) {
  return apiFetch(`/api/teacher/assignments/${assignmentId}/docs`, { method: 'POST', body: JSON.stringify(doc) })
}

/** @param {string} assignmentId @returns {Promise<Array>} */
export async function getSubmissions(assignmentId) {
  return apiFetch(`/api/teacher/assignments/${assignmentId}/submissions`)
}

/** @param {string} submissionId @param {{ grade: string, feedback: string }} payload */
export async function gradeSubmission(submissionId, payload) {
  return apiFetch(`/api/teacher/submissions/${submissionId}/grade`, { method: 'PATCH', body: JSON.stringify(payload) })
}

// ── AI Chat ───────────────────────────────────────────────────────────────────

/**
 * @param {string} query
 * @returns {Promise<string>}
 */
export async function askAI(query) {
  const { reply } = await apiFetch('/api/ai/chat', { method: 'POST', body: JSON.stringify({ query }) })
  return reply
}
