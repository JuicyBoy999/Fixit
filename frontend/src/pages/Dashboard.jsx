import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS_SHORT = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, accepted: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [calMonth, setCalMonth] = useState(new Date());

  const token = localStorage.getItem('token');

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { navigate('/login'); return; }
    const parsed = JSON.parse(stored);
    if (parsed.role === 'technician') { navigate('/technician-dashboard'); return; }
    setUser(parsed);

    if (token) {
      fetch('http://localhost:5000/api/repair-requests/list', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(r => r.json())
        .then(data => {
          const reqs = data.requests || [];
          setRequests(reqs.slice(0, 6));
          setStats({
            total: reqs.length,
            pending: reqs.filter(r => r.status === 'pending').length,
            accepted: reqs.filter(r => r.status === 'accepted').length,
            completed: reqs.filter(r => r.status === 'completed').length,
          });
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const prevMonth = () => setCalMonth(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () => setCalMonth(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  const calDays = () => {
    const year = calMonth.getFullYear();
    const month = calMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    return cells;
  };

  const today = new Date().getDate();
  const isCurrentMonth =
    calMonth.getFullYear() === new Date().getFullYear() &&
    calMonth.getMonth() === new Date().getMonth();

  const fmt = d => d ? new Date(d).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

  if (loading) return <div className="cd-loading">Loading dashboard…</div>;

  return (
    <div className="cd-page">

      <aside className="cd-sidebar">
        <div className="cd-logo">
          <span className="cd-logo-icon">⚡</span>
          <span className="cd-logo-text">Fixit</span>
        </div>

        <nav className="cd-nav">
          <button className="cd-nav-item cd-nav-item--active">Dashboard</button>
          <button className="cd-nav-item" onClick={() => navigate('/book-repair')}>Book a Repair</button>
          <button className="cd-nav-item" onClick={() => navigate('/my-requests')}>My Requests
            {stats.pending > 0 && <span className="cd-nav-badge">{stats.pending}</span>}
          </button>
          <button className="cd-nav-item" onClick={() => navigate('/profile')}>Profile</button>
        </nav>

        <div className="cd-sidebar-bottom">
          <button className="cd-nav-item">Settings</button>
          <button className="cd-nav-item">Help Center</button>
          <button className="cd-nav-item cd-logout-item" onClick={handleLogout}>Log out</button>
        </div>
      </aside>

      <main className="cd-main">

        <div className="cd-topbar">
          <h1 className="cd-page-title">Dashboard</h1>
          <div className="cd-topbar-right">
            <div className="cd-search">
              <span className="cd-search-icon">🔍</span>
              <input className="cd-search-input" placeholder="Search..." />
            </div>
            <div className="cd-avatar">{(user?.firstName?.[0] || 'U').toUpperCase()}</div>
          </div>
        </div>

        <div className="cd-welcome">
          Welcome back, <strong>{user?.firstName || 'Customer'}</strong> — here's your repair overview
        </div>

        <div className="cd-stats">
          <div className="cd-stat-card cd-stat-card--dark">
            <div className="cd-stat-label">Total Repairs</div>
            <div className="cd-stat-value">{stats.total}</div>
            <div className="cd-stat-change">all time</div>
          </div>
          <div className="cd-stat-card">
            <div className="cd-stat-label">Pending</div>
            <div className="cd-stat-value">{stats.pending}</div>
            <div className="cd-stat-change cd-stat-change--warn">awaiting technician</div>
          </div>
          <div className="cd-stat-card">
            <div className="cd-stat-label">Accepted</div>
            <div className="cd-stat-value">{stats.accepted}</div>
            <div className="cd-stat-change cd-stat-change--up">in progress</div>
          </div>
          <div className="cd-stat-card">
            <div className="cd-stat-label">Completed</div>
            <div className="cd-stat-value">{stats.completed}</div>
            <div className="cd-stat-change cd-stat-change--up">done</div>
          </div>
        </div>

        <div className="cd-middle">

          <div className="cd-card cd-actions-card">
            <div className="cd-card-header">
              <span className="cd-card-title">Quick Actions</span>
            </div>
            <div className="cd-actions">
              <button className="cd-action-btn" onClick={() => navigate('/book-repair')}>
                <div className="cd-action-icon-wrap cd-action-icon-wrap--blue">🔧</div>
                <div>
                  <div className="cd-action-label">Book a Repair</div>
                  <div className="cd-action-sub">Schedule a new repair request</div>
                </div>
                <span className="cd-action-arrow">→</span>
              </button>
              <button className="cd-action-btn" onClick={() => navigate('/my-requests')}>
                <div className="cd-action-icon-wrap cd-action-icon-wrap--cyan">📋</div>
                <div>
                  <div className="cd-action-label">View My Requests</div>
                  <div className="cd-action-sub">Track your repair status</div>
                </div>
                <span className="cd-action-arrow">→</span>
              </button>
              <button className="cd-action-btn" onClick={() => navigate('/profile')}>
                <div className="cd-action-icon-wrap cd-action-icon-wrap--purple">👤</div>
                <div>
                  <div className="cd-action-label">Edit Profile</div>
                  <div className="cd-action-sub">Update your information</div>
                </div>
                <span className="cd-action-arrow">→</span>
              </button>
            </div>
          </div>

          <div className="cd-right-col">
            <div className="cd-card cd-cal-card">
              <div className="cd-cal-header">
                <button className="cd-cal-nav" onClick={prevMonth}>‹</button>
                <span className="cd-cal-title">
                  {MONTHS[calMonth.getMonth()]} {calMonth.getFullYear()}
                </span>
                <button className="cd-cal-nav" onClick={nextMonth}>›</button>
              </div>
              <div className="cd-cal-grid">
                {DAYS_SHORT.map(d => <div key={d} className="cd-cal-dayname">{d}</div>)}
                {calDays().map((d, i) => (
                  <div
                    key={i}
                    className={`cd-cal-day${d === null ? ' cd-cal-day--empty' : ''}${isCurrentMonth && d === today ? ' cd-cal-day--today' : ''}`}
                  >
                    {d}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="cd-card">
          <div className="cd-card-header">
            <span className="cd-card-title">Recent Repair Requests</span>
            <button className="cd-btn-outline" onClick={() => navigate('/book-repair')}>+ New Repair</button>
          </div>
          <table className="cd-table">
            <thead>
              <tr>
                <th>Device</th>
                <th>Description</th>
                <th>Area</th>
                <th>Preferred Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr><td colSpan={5} className="cd-table-empty">No repair requests yet — <button className="cd-link" onClick={() => navigate('/book-repair')}>book your first repair</button></td></tr>
              ) : requests.map(r => (
                <tr key={r.id}>
                  <td>{r.device_type || '—'}</td>
                  <td className="cd-table-desc">{r.fault_description?.slice(0, 40) || '—'}{r.fault_description?.length > 40 ? '…' : ''}</td>
                  <td>{r.customer_area || '—'}</td>
                  <td>{fmt(r.preferred_date)}</td>
                  <td><span className={`cd-badge cd-badge--${r.status}`}>{r.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </main>
    </div>
  );
}
