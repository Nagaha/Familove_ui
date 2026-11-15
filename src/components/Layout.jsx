import { NavLink, Link } from 'react-router-dom'
import { useAuth } from '../auth.jsx'
import { useFamilies } from '../family-context.jsx'
import Icon, { Logo } from './Icon.jsx'
import { Avatar } from './People.jsx'
import ThemeToggle from './ThemeToggle.jsx'
import { useNotifications } from '../notifications-context.jsx'

const LINKS = [
  { to: '/', label: 'Home', icon: 'home', end: true },
  { to: '/family', label: 'Family', icon: 'users' },
  { to: '/my-meals', label: 'My meals', icon: 'meals' },
  { to: '/profile', label: 'Profile', icon: 'user' },
]

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const { families, current, select } = useFamilies()
  const { unread } = useNotifications()

  return (
    <div className="shell">
      <aside className="sidebar">
        <Link to="/" className="sidebar-brand">
          <Logo size={34} />
          <span>Familove</span>
        </Link>
        <nav className="sidebar-nav">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end}>
              <Icon name={l.icon} />
              {l.label}
            </NavLink>
          ))}
        </nav>
        <p className="sidebar-tag">Good food brings families together.</p>
      </aside>

      <div className="main">
        <header className="topbar">
          <Link to="/" className="topbar-brand">
            <Logo size={30} />
          </Link>

          {families && families.length > 1 ? (
            <label className="family-switch">
              <span className="sr-only">Family</span>
              <select value={current?.id ?? ''} onChange={(e) => select(e.target.value)}>
                {families.map((f) => <option key={f.id} value={f.id}>{f.familyName}</option>)}
              </select>
            </label>
          ) : (
            <span className="family-name">{current?.familyName ?? ''}</span>
          )}

          <div className="topbar-user">
            <Link to="/profile" className="user-chip">
              <Avatar name={user.name} url={user.avatarUrl} size={32} />
              <span>{user.name}</span>
            </Link>
            <Link
              to="/notifications"
              className="icon-btn bell"
              aria-label={unread ? `Notifications, ${unread} unread` : 'Notifications'}
              title="Notifications"
            >
              <Icon name="bell" />
              {unread > 0 && <span className="bell-badge">{unread > 9 ? '9+' : unread}</span>}
            </Link>
            <ThemeToggle />
            <button type="button" className="icon-btn" onClick={logout} aria-label="Log out" title="Log out">
              <Icon name="logout" />
            </button>
          </div>
        </header>

        <main className="page">{children}</main>
      </div>

      <nav className="tabbar" aria-label="Main">
        {LINKS.map((l) => (
          <NavLink key={l.to} to={l.to} end={l.end}>
            <Icon name={l.icon} />
            <span>{l.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
