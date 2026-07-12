/**
 * MainArea.jsx — View router
 *
 * Maps the activeNav string from App state to the correct full-page view component.
 * Null activeNav renders the Dashboard (home screen).
 *
 * To add a new view:
 *  1. Create the view component in src/views/
 *  2. Import it here
 *  3. Add an entry to the VIEWS map keyed by the nav label string
 */
import Dashboard from '../views/Dashboard.jsx'
import AttendanceView from '../views/AttendanceView.jsx'
import ModulesView from '../views/ModulesView.jsx'
import SemesterView from '../views/SemesterView.jsx'
import MessagesView from '../views/MessagesView.jsx'
import PeniConsole from '../views/PeniConsole.jsx'
import '../styles/views.css'

const VIEWS = {
  Attendance: AttendanceView,
  'My Modules': ModulesView,
  'My Calendar': SemesterView,
  'My Messages': MessagesView,
  peni: PeniConsole,
}

export default function MainArea({ activeNav, onNavSelect, lastView }) {
  const View = VIEWS[activeNav] || Dashboard
  const extraClass = activeNav === 'peni' ? 'peni' : activeNav === 'My Messages' ? 'msg' : ''
  return (
    <main className={`main-area console ${extraClass}`}>
      <View key={activeNav || 'dashboard'} onNavigate={onNavSelect} lastView={lastView} />
    </main>
  )
}
