import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/image.png';
import CancelBooking from './CancelBooking';
import './Dashboard.css';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS_SHORT = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

export default function Dashboard() {
  const navigate = useNavigate();
  const [user] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [requests, setRequests] = useState([]);
  const [activeRepair, setActiveRepair] = useState(null);
  const [stats, setStats] = useState({ total: 0, pending: 0, accepted: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [calMonth, setCalMonth] = useState(new Date());
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    if (user.role === 'technician') { navigate('/technician-dashboard'); return; }

    const base = 'http://localhost:5000/api/repair-requests';
    const token = localStorage.getItem('token');

    const loadBookings = async () => {
      try {
        const res = await fetch(`${base}/mine`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const data = await res.json();
          return data.requests || [];
        }
      } catch { /* fall through to orphaned-booking claim */ }
      if (user.id) {
        try { await fetch(`${base}/claim/${user.id}`, { method: 'POST' }); } catch { /* ignore claim failure */ }
        try {
          const res = await fetch(`${base}/my/${user.id}`);
          const data = await res.json();
          return data.requests || [];
        } catch { /* no bookings found */ }
      }
      return [];
    };

    loadBookings().then(reqs => {
      setRequests(reqs.slice(0, 6));
      const active = reqs.find(r => ['confirmed','in_route','in_progress'].includes(r.status));
      setActiveRepair(active || null);
      setStats({
        total: reqs.length,
        pending: reqs.filter(r => r.status === 'pending').length,
        accepted: reqs.filter(r => ['accepted','confirmed','in_route','in_progress'].includes(r.status)).length,
        completed: reqs.filter(r => r.status === 'completed').length,
      });
    }).finally(() => setLoading(false));
  }, [user, navigate, refreshKey]);

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
          <span className="cd-logo-icon"><img src={logo} alt="Fixit" className="brand-logo-img" /></span>
          <span className="cd-logo-text">Fixit</span>
        </div>

        <nav className="cd-nav">
          <button className="cd-nav-item cd-nav-item--active">Dashboard</button>
          <button className="cd-nav-item" onClick={() => navigate('/book-repair')}>Book a Repair</button>
          <button className="cd-nav-item" onClick={() => navigate('/technicians')}>Browse Technicians</button>
          <button className="cd-nav-item" onClick={() => navigate('/reschedule-booking')}>My Bookings</button>
          <button className="cd-nav-item" onClick={() => navigate('/notifications')}>
            Notifications
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
            <button className="cd-notif-btn" onClick={() => navigate('/notifications')}>🔔</button>
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
              <button className="cd-action-btn" onClick={() => navigate('/technicians')}>
                <div className="cd-action-icon-wrap cd-action-icon-wrap--cyan">👥</div>
                <div>
                  <div className="cd-action-label">Browse Technicians</div>
                  <div className="cd-action-sub">Find available technicians near you</div>
                </div>
                <span className="cd-action-arrow">→</span>
              </button>
              <button className="cd-action-btn" onClick={() => navigate('/reschedule-booking')}>
                <div className="cd-action-icon-wrap cd-action-icon-wrap--green">📋</div>
                <div>
                  <div className="cd-action-label">Reschedule Booking</div>
                  <div className="cd-action-sub">Change your appointment date</div>
                </div>
                <span className="cd-action-arrow">→</span>
              </button>
              <button className="cd-action-btn" onClick={() => setShowCancelModal(true)}>
                <div className="cd-action-icon-wrap cd-action-icon-wrap--red">✕</div>
                <div>
                  <div className="cd-action-label">Cancel Booking</div>
                  <div className="cd-action-sub">Cancel an existing repair request</div>
                </div>
                <span className="cd-action-arrow">→</span>
              </button>
              <button className="cd-action-btn" onClick={() => navigate('/notifications')}>
                <div className="cd-action-icon-wrap cd-action-icon-wrap--purple">🔔</div>
                <div>
                  <div className="cd-action-label">Notifications</div>
                  <div className="cd-action-sub">View updates on your repairs</div>
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

        {activeRepair && (() => {
          const stages = ['pending','confirmed','in_route','in_progress','completed'];
          const stageLabels = { pending: 'Pending', confirmed: 'Confirmed', in_route: 'On the Way', in_progress: 'In Progress', completed: 'Completed' };
          const cur = stages.indexOf(activeRepair.status);
          return (
            <div className="cd-card cd-status-tracker">
              <div className="cd-card-header">
                <span className="cd-card-title">Active Repair — {activeRepair.device_type}</span>
                <button className="cd-btn-outline" onClick={() => navigate('/reschedule-booking')}>View Bookings</button>
              </div>
              <div className="cd-timeline">
                {stages.map((s, i) => (
                  <div key={s} className="cd-tl-item">
                    <div className={`cd-tl-dot ${i < cur ? 'cd-tl-dot--done' : ''} ${i === cur ? 'cd-tl-dot--active' : ''}`}>
                      {i < cur ? '✓' : i + 1}
                    </div>
                    <span className={`cd-tl-label ${i === cur ? 'cd-tl-label--active' : ''}`}>{stageLabels[s]}</span>
                    {i < stages.length - 1 && <div className={`cd-tl-line ${i < cur ? 'cd-tl-line--done' : ''}`} />}
                  </div>
                ))}
              </div>
              {activeRepair.status === 'in_route' && (
                <p className="cd-tl-note">Your technician is on the way — please be ready at home.</p>
              )}
              <div style={{ marginTop: '0.75rem' }}>
                <button
                  className="cd-btn-outline"
                  onClick={() => navigate(`/chat/${activeRepair.id}`)}
                  style={{ fontSize: '0.85rem' }}
                >
                  💬 Chat with Technician
                </button>
              </div>
            </div>
          );
        })()}

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
                <th>Technician</th>
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
                  <td>{r.technician_first_name ? `${r.technician_first_name} ${r.technician_last_name}` : 'Not assigned'}</td>
                  <td>{fmt(r.preferred_date)}</td>
                  <td><span className={`cd-badge cd-badge--${r.status}`}>{r.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </main>

      {showCancelModal && (
        <CancelBooking
          onClose={() => {
            setShowCancelModal(false);
            setRefreshKey(k => k + 1);
          }}
        />
      )}
    </div>
  );
}
