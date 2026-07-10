import { useContext, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import useSessionTimeout from '../../hooks/useSessionTimeout';
import logo from '../../assets/image.png';
import './AdminShell.css';

const navItems = [
  { to: '/admin-panel', label: 'Overview', icon: 'grid' },
  { to: '/admin/directory', label: 'People', icon: 'users' },
  { to: '/admin/revenue', label: 'Revenue', icon: 'chart' },
  { to: '/admin/leaderboard', label: 'Leaderboard', icon: 'star' },
  { to: '/admin/categories', label: 'Service catalog', icon: 'tool' },
];

export function AdminIcon({ name, size = 18 }) {
  const paths = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>,
    chart: <><path d="M3 3v18h18"/><path d="m7 16 4-5 4 3 5-7"/></>,
    star: <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>,
    tool: <><path d="M14.7 6.3a4 4 0 0 0-5-5L7.3 3.7l3 3 2.4-2.4a4 4 0 0 0 2 5z"/><path d="m9.5 8.5-7 7a2.12 2.12 0 0 0 3 3l7-7"/><path d="m14 12 7 7"/></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></>,
    refresh: <><path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></>,
    download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5M12 15V3"/></>,
    search: <><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></>,
    check: <path d="m20 6-11 11-5-5"/>,
    close: <><path d="m18 6-12 12M6 6l12 12"/></>,
    external: <><path d="M15 3h6v6M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></>,
  };
  return <svg className="adm-icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

export default function AdminShell({ eyebrow, title, description, actions, children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  useSessionTimeout(15 * 60 * 1000);

  const signOut = () => {
    logout();
    navigate('/admin-login');
  };

  return (
    <div className="adm-app">
      <aside className={`adm-sidebar ${mobileOpen ? 'is-open' : ''}`}>
        <div className="adm-brand">
          <img src={logo} alt="" />
          <div><strong>Fixit</strong><span>Control room</span></div>
        </div>
        <nav className="adm-nav" aria-label="Admin navigation">
          <span className="adm-nav-label">Workspace</span>
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} end className={({ isActive }) => `adm-nav-link ${isActive ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>
              <AdminIcon name={item.icon} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="adm-sidebar-foot">
          <div className="adm-admin-avatar">A</div>
          <div className="adm-admin-meta"><strong>Platform admin</strong><span>{user?.email || 'Secure session'}</span></div>
          <button type="button" onClick={signOut} aria-label="Sign out">↗</button>
        </div>
      </aside>

      <div className="adm-main">
        <header className="adm-mobile-bar">
          <button type="button" onClick={() => setMobileOpen(v => !v)} aria-label="Toggle navigation">☰</button>
          <span>Fixit Control room</span>
        </header>
        <main className="adm-content">
          <div className="adm-page-head">
            <div>
              <p className="adm-eyebrow">{eyebrow}</p>
              <h1>{title}</h1>
              {description && <p className="adm-description">{description}</p>}
            </div>
            {actions && <div className="adm-head-actions">{actions}</div>}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}

export function AdminNotice({ type = 'error', children }) {
  return <div className={`adm-notice adm-notice-${type}`} role={type === 'error' ? 'alert' : 'status'}>{children}</div>;
}

export function AdminEmpty({ title, description }) {
  return <div className="adm-empty"><div className="adm-empty-mark">✓</div><h3>{title}</h3><p>{description}</p></div>;
}
