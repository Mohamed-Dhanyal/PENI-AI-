import NavButton from './NavButton.jsx'
import PeniButton from './PeniButton.jsx'

const NAV_ITEMS = [
  'Attendance',
  'My Modules',
  'My Calendar',
  'My Messages',
]

export default function RightPanel({ activeNav, onNavSelect, onPeni }) {
  return (
    <aside className="right-panel glass" aria-label="Navigation panel">
      <div className="right-panel-content">
        <nav className="nav-stack">
          <NavButton
            label="Home"
            active={activeNav === null}
            onClick={() => onNavSelect(null)}
          />
          <div className="nav-divider" />
          {NAV_ITEMS.map(item => (
            <NavButton
              key={item}
              label={item}
              active={activeNav === item}
              onClick={() => onNavSelect(item)}
            />
          ))}
        </nav>

        <div className="peni-slot">
          <PeniButton onClick={onPeni} active={activeNav === 'peni'} />
        </div>
      </div>
    </aside>
  )
}
