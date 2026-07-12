export default function LeftRail({ theme, onThemeToggle }) {
  return (
    <aside className="left-rail glass" aria-label="Activity bar">
      <button
        className="theme-toggle"
        onClick={onThemeToggle}
        aria-label="Toggle theme"
        title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        <span className="theme-toggle-icon">{theme === 'dark' ? '☀' : '☾'}</span>
      </button>
    </aside>
  )
}
