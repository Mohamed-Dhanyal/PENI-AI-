export default function TopBar({ student = {}, activeNav, theme, onThemeToggle, onLogout }) {
  return (
    <header className="top-bar glass">
      <div className="top-bar-brand">
        <span className="top-bar-p">P</span>ENI
      </div>

      <div className="top-bar-divider" />

      <span className="top-bar-view">Previously myTIMeS</span>

      <div className="top-bar-right">
        <div className="top-bar-student">
          <span className="top-bar-name">{student.name}</span>
          <span className="top-bar-id">{student.id}</span>
        </div>
        <button
          className="theme-toggle"
          onClick={onThemeToggle}
          aria-label="Toggle theme"
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          <span>{theme === 'dark' ? '☀' : '☾'}</span>
        </button>
        <button className="logout-btn" onClick={onLogout} title="Sign out">
          Sign out
        </button>
      </div>
    </header>
  )
}
