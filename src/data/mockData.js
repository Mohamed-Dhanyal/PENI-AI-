/**
 * mockData.js — Static mock data (REPLACE WITH API CALLS)
 *
 * This file is the single integration point for all data in the app.
 * Every named export below must eventually be fetched from your backend API.
 *
 * Recommended approach for backend integration:
 *  - Install React Query: `npm install @tanstack/react-query`
 *  - Create a src/hooks/ directory with one custom hook per data type
 *    e.g. useModules(), useAttendance(), useMessages()
 *  - Each hook wraps a fetch/axios call and returns { data, isLoading, error }
 *  - Replace the direct imports of these constants in each view with the hook
 *
 * Data shape contracts are documented in README.md > Data Contracts
 */

export const student = {
  name: 'Dinesh',
  id: '0369421',
  programme: 'Bachelor of Software Engineering (Hons)',
  semester: 5,
  cgpa: 3.67,
}

export const modules = [
  {
    code: 'CSC60104',
    name: 'Advanced Machine Learning',
    coordinator: 'Prof. Lee Chong Wei',
    lecturer: 'Dr. Amelia Tan',
    tutor: 'Mr. Rajan Pillai',
    credits: 4,
    attendance: 95,
    attended: 21,
    totalClasses: 22,
    grade: 'A-',
    progress: 78,
    lectureVenue: 'E5.03',
    tutorialVenue: 'E5.05',
    tutorialSection: 'TC01',
    accent: '#ff4d45',
  },
  {
    code: 'CSC61304',
    name: 'Cloud Infrastructure & DevOps',
    coordinator: 'Dr. Amelia Tan',
    lecturer: 'Mr. Harith Rahman',
    tutor: 'Ms. Priya Nair',
    credits: 4,
    attendance: 88,
    attended: 22,
    totalClasses: 25,
    grade: 'B+',
    progress: 72,
    lectureVenue: 'C4.10',
    tutorialVenue: 'C4.12',
    tutorialSection: 'TC02',
    accent: '#ff6a00',
  },
  {
    code: 'CSC62506',
    name: 'Final Year Project I',
    coordinator: 'Dr. Priya Nair',
    lecturer: 'Dr. Priya Nair',
    tutor: null,
    credits: 6,
    attendance: 100,
    attended: 12,
    totalClasses: 12,
    grade: 'A',
    progress: 85,
    lectureVenue: 'FYP Lab 2',
    tutorialVenue: null,
    tutorialSection: null,
    accent: '#e2231a',
  },
  {
    code: 'CSC60204',
    name: 'Distributed Systems',
    coordinator: 'Dr. Wong Kai Ming',
    lecturer: 'Dr. Wong Kai Ming',
    tutor: 'Mr. Harith Rahman',
    credits: 4,
    attendance: 74,
    attended: 17,
    totalClasses: 23,
    grade: 'B',
    progress: 65,
    lectureVenue: 'E3.15',
    tutorialVenue: 'E3.17',
    tutorialSection: 'TC03',
    accent: '#ff0844',
  },
  {
    code: 'MPU34032',
    name: 'Community Service Initiative',
    coordinator: 'Ms. Farah Aziz',
    lecturer: 'Ms. Farah Aziz',
    tutor: null,
    credits: 2,
    attendance: 91,
    attended: 10,
    totalClasses: 11,
    grade: 'A',
    progress: 90,
    lectureVenue: 'Online',
    tutorialVenue: null,
    tutorialSection: null,
    accent: '#ff8c69',
  },
]

export const attendanceLog = [
  { date: 'Jul 9, 2026',  module: 'CSC60204', name: 'Distributed Systems',             status: 'absent',  time: '11:00 AM', type: 'Lecture',  teacher: 'Dr. Wong Kai Ming',   mcSubmitted: false },
  { date: 'Jul 9, 2026',  module: 'CSC60104', name: 'Advanced Machine Learning',       status: 'present', time: '10:00 AM', type: 'Lecture',  teacher: 'Dr. Amelia Tan',      mcSubmitted: false },
  { date: 'Jul 8, 2026',  module: 'CSC62506', name: 'Final Year Project I',            status: 'present', time: '9:00 AM',  type: 'Lab',      teacher: 'Dr. Priya Nair',      mcSubmitted: false },
  { date: 'Jul 7, 2026',  module: 'CSC61304', name: 'Cloud Infrastructure & DevOps',  status: 'present', time: '2:00 PM',  type: 'Tutorial', teacher: 'Ms. Priya Nair',      mcSubmitted: false },
  { date: 'Jul 6, 2026',  module: 'CSC60104', name: 'Advanced Machine Learning',       status: 'present', time: '10:00 AM', type: 'Lecture',  teacher: 'Dr. Amelia Tan',      mcSubmitted: false },
  { date: 'Jul 3, 2026',  module: 'MPU34032', name: 'Community Service Initiative',   status: 'present', time: '3:00 PM',  type: 'Lecture',  teacher: 'Ms. Farah Aziz',      mcSubmitted: false },
  { date: 'Jul 2, 2026',  module: 'CSC60204', name: 'Distributed Systems',             status: 'absent',  time: '11:00 AM', type: 'Tutorial', teacher: 'Mr. Harith Rahman',   mcSubmitted: true  },
  { date: 'Jun 28, 2026', module: 'CSC60104', name: 'Advanced Machine Learning',       status: 'absent',  time: '10:00 AM', type: 'Tutorial', teacher: 'Mr. Rajan Pillai',    mcSubmitted: false },
  { date: 'Jun 25, 2026', module: 'CSC61304', name: 'Cloud Infrastructure & DevOps',  status: 'absent',  time: '10:00 AM', type: 'Lecture',  teacher: 'Mr. Harith Rahman',   mcSubmitted: false },
]

/* Current week schedule (Jul 7–11 2026) — replace with real data */
export const weekSchedule = [
  { day: 'Mon',  date: 'Jul 7',  name: 'Advanced Machine Learning',       type: 'Lecture',  time: '8:00 AM',  status: 'present' },
  { day: 'Mon',  date: 'Jul 7',  name: 'Cloud Infrastructure & DevOps',   type: 'Tutorial', time: '2:00 PM',  status: 'present' },
  { day: 'Tue',  date: 'Jul 8',  name: 'Final Year Project I',            type: 'Lab',      time: '10:00 AM', status: 'present' },
  { day: 'Tue',  date: 'Jul 8',  name: 'Distributed Systems',             type: 'Lecture',  time: '2:00 PM',  status: 'absent'  },
  { day: 'Wed',  date: 'Jul 9',  name: 'Advanced Machine Learning',       type: 'Tutorial', time: '9:00 AM',  status: 'present' },
  { day: 'Wed',  date: 'Jul 9',  name: 'Community Service Initiative',    type: 'Lecture',  time: '1:00 PM',  status: 'present' },
  { day: 'Thu',  date: 'Jul 10', name: 'Cloud Infrastructure & DevOps',   type: 'Lecture',  time: '10:00 AM', status: 'remaining' },
  { day: 'Thu',  date: 'Jul 10', name: 'Distributed Systems',             type: 'Tutorial', time: '3:00 PM',  status: 'remaining' },
  { day: 'Fri',  date: 'Jul 11', name: 'Final Year Project I',            type: 'Lab',      time: '9:00 AM',  status: 'remaining' },
]

// Events keyed by ISO date (July 2026 focus)
export const events = [
  { date: '2026-07-10', time: '3:00 PM', title: 'Community Service Briefing', type: 'class', module: 'MPU34032' },
  { date: '2026-07-13', time: '10:00 AM', title: 'AML Lecture — Transformers II', type: 'class', module: 'CSC60104' },
  { date: '2026-07-14', time: '10:00 AM', title: 'AML Quiz 2', type: 'exam', module: 'CSC60104' },
  { date: '2026-07-16', time: '11:59 PM', title: 'DevOps Assignment 2 Due', type: 'deadline', module: 'CSC61304' },
  { date: '2026-07-20', time: '9:00 AM', title: 'FYP Supervisor Meeting', type: 'meeting', module: 'CSC62506' },
  { date: '2026-07-22', time: '11:00 AM', title: 'Distributed Systems Lab Test', type: 'exam', module: 'CSC60204' },
  { date: '2026-07-24', time: '11:59 PM', title: 'FYP Proposal Draft Due', type: 'deadline', module: 'CSC62506' },
  { date: '2026-07-28', time: '2:00 PM', title: 'Cloud Migration Workshop', type: 'class', module: 'CSC61304' },
  { date: '2026-07-31', time: '6:00 PM', title: 'Taylor\'s Tech Career Fair', type: 'event', module: null },
  { date: '2026-08-04', time: '10:00 AM', title: 'AML Final Presentation', type: 'exam', module: 'CSC60104' },
]

export const tasks = [
  { id: 1, title: 'Finish DevOps Assignment 2', module: 'CSC61304', due: 'Jul 16', priority: 'high', done: false },
  { id: 2, title: 'Revise Transformers for AML Quiz 2', module: 'CSC60104', due: 'Jul 14', priority: 'high', done: false },
  { id: 3, title: 'Draft FYP literature review', module: 'CSC62506', due: 'Jul 24', priority: 'medium', done: false },
  { id: 4, title: 'Lab prep — consensus algorithms', module: 'CSC60204', due: 'Jul 22', priority: 'medium', done: false },
  { id: 5, title: 'Log community service hours', module: 'MPU34032', due: 'Jul 18', priority: 'low', done: true },
  { id: 6, title: 'Peer review cloud architecture doc', module: 'CSC61304', due: 'Jul 12', priority: 'low', done: true },
]

export const gpaHistory = [
  { sem: 'Sem 1', gpa: 3.42 },
  { sem: 'Sem 2', gpa: 3.51 },
  { sem: 'Sem 3', gpa: 3.58 },
  { sem: 'Sem 4', gpa: 3.72 },
  { sem: 'Sem 5', gpa: 3.67 },
]

export const roadmap = [
  { sem: 'Semester 1', status: 'completed', modules: 5, credits: 18, gpa: 3.42 },
  { sem: 'Semester 2', status: 'completed', modules: 5, credits: 19, gpa: 3.51 },
  { sem: 'Semester 3', status: 'completed', modules: 6, credits: 20, gpa: 3.58 },
  { sem: 'Semester 4', status: 'completed', modules: 5, credits: 18, gpa: 3.72 },
  { sem: 'Semester 5', status: 'current', modules: 5, credits: 20, gpa: null },
  { sem: 'Semester 6', status: 'upcoming', modules: 5, credits: 19, gpa: null },
  { sem: 'Semester 7', status: 'upcoming', modules: 4, credits: 16, gpa: null },
  { sem: 'Semester 8', status: 'upcoming', modules: 3, credits: 14, gpa: null },
]

export const messages = [
  {
    id: 1,
    category: 'lecturer',
    from: 'Dr. Amelia Tan',
    role: 'Lecturer',
    module: 'Advanced Machine Learning',
    moduleCode: 'CSC60104',
    initials: 'AT',
    accent: '#ff4d45',
    subject: 'AML Quiz 2 — Scope Confirmed',
    preview: 'Quiz 2 will cover lectures 6–9: attention mechanisms, transformers…',
    time: '2h ago',
    unread: 2,
    thread: [
      { from: 'Dr. Amelia Tan', me: false, text: 'Hi everyone, Quiz 2 will cover lectures 6–9: attention mechanisms, transformers, and fine-tuning strategies.', time: 'Today, 10:12 AM' },
      { from: 'Dr. Amelia Tan', me: false, text: 'Past year samples are up on the portal. Focus on the encoder-decoder walkthrough from Lab 7.', time: 'Today, 10:14 AM' },
    ],
  },
  {
    id: 2,
    category: 'mates',
    from: 'FYP Group 12',
    role: 'Group Chat',
    module: 'Final Year Project I',
    moduleCode: 'CSC62506',
    initials: 'G12',
    accent: '#ff6a00',
    subject: 'Proposal draft — section split',
    preview: 'Sara: I\'ll handle the Gantt chart and risk matrix then.',
    time: '5h ago',
    unread: 1,
    thread: [
      { from: 'Wei Jian', me: false, text: 'I\'ve pushed the methodology skeleton to the repo. Can you take the lit review section?', time: 'Today, 7:02 AM' },
      { from: 'You', me: true, text: 'On it. I\'ll have a draft by Sunday night.', time: 'Today, 7:45 AM' },
      { from: 'Sara', me: false, text: 'I\'ll handle the Gantt chart and risk matrix then.', time: 'Today, 8:10 AM' },
    ],
  },
  {
    id: 3,
    category: 'lecturer',
    from: 'Dr. Wong Kai Ming',
    role: 'Lecturer',
    module: 'Distributed Systems',
    moduleCode: 'CSC60204',
    initials: 'WK',
    accent: '#ff0844',
    subject: 'Attendance Warning — Action Required',
    preview: 'Your attendance has fallen to 74%. Below 70% you will be barred…',
    time: '1d ago',
    unread: 2,
    thread: [
      { from: 'Dr. Wong Kai Ming', me: false, text: 'Your attendance for Distributed Systems has fallen to 74%. Below 70% you will be barred from the final exam.', time: 'Yesterday, 4:30 PM' },
      { from: 'Dr. Wong Kai Ming', me: false, text: 'Please see me during consultation hours (Thu 2–4 PM) if there are extenuating circumstances.', time: 'Yesterday, 4:31 PM' },
    ],
  },
  {
    id: 4,
    category: 'lecturer',
    from: 'Ms. Farah Aziz',
    role: 'Lecturer',
    module: 'Community Service Initiative',
    moduleCode: 'MPU34032',
    initials: 'FA',
    accent: '#e2231a',
    subject: 'Semester Fee Statement Ready',
    preview: 'Your fee statement for August 2026 is now available on the portal.',
    time: '2d ago',
    unread: 0,
    thread: [
      { from: 'Ms. Farah Aziz', me: false, text: 'Your fee statement for August 2026 semester is now available on the student portal. Payment deadline: Aug 15.', time: 'Jul 8, 9:00 AM' },
    ],
  },
  {
    id: 5,
    category: 'mates',
    from: 'Taylor\'s AI Society',
    role: 'Student Club',
    module: 'Extracurricular',
    moduleCode: null,
    initials: 'AI',
    accent: '#ff8c69',
    subject: 'Hackathon 2026 — Team registration open!',
    preview: 'You: Registered team "Neural Knights" — see you there!',
    time: '3d ago',
    unread: 0,
    thread: [
      { from: 'Taylor\'s AI Society', me: false, text: 'Registration for HackX 2026 is live! Teams of 3–5. Theme: AI for Campus Life. Grand prize RM5,000.', time: 'Jul 7, 6:00 PM' },
      { from: 'You', me: true, text: 'Registered team "Neural Knights" — see you there!', time: 'Jul 7, 8:22 PM' },
    ],
  },
  {
    id: 6,
    category: 'mates',
    from: 'Wei Jian',
    role: 'Classmate',
    module: 'Advanced Machine Learning',
    moduleCode: 'CSC60104',
    initials: 'WJ',
    accent: '#a78bfa',
    subject: 'Lab 7 notes',
    preview: 'Hey, did you get the encoder-decoder part? I\'m stuck on the…',
    time: '3d ago',
    unread: 0,
    thread: [
      { from: 'Wei Jian', me: false, text: 'Hey, did you get the encoder-decoder part? I\'m stuck on the attention mask shapes.', time: 'Jul 7, 9:15 AM' },
      { from: 'You', me: true, text: 'Yeah — key/query dimensions have to match. I\'ll drop you my notes after lunch.', time: 'Jul 7, 12:30 PM' },
    ],
  },
]
