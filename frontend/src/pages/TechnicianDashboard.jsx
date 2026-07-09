import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/image.png';
import './TechnicianDashboard.css';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS_SHORT = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

export default function TechnicianDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ activeDays: 0, blockedDates: 0, pendingRequests: 0, totalRequests: 0 });
  const [requests, setRequests] = useState([]);
  const [upcomingSlots, setUpcomingSlots] = useState([]);
  const [earnings, setEarnings] = useState({ jobs: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Month');
  const [calMonth, setCalMonth] = useState(new Date());

  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { navigate('/login'); return; }
    const parsed = JSON.parse(stored);
    if (parsed.role !== 'technician') { navigate('/dashboard'); return; }
    setUser(parsed);
    const techId = parsed.id;

    Promise.all([
      fetch(`http://localhost:5000/api/availability/${techId}/hours`, { headers }).then(r => r.json()),
      fetch(`http://localhost:5000/api/availability/${techId}/unavailable`, { headers }).then(r => r.json()),
      fetch(`http://localhost:5000/api/repair-requests/list`, { headers }).then(r => r.json()),
      fetch(`http://localhost:5000/api/repair-requests/earnings/${techId}`, { headers }).then(r => r.json()).catch(() => ({ jobs: [], total: 0 })),
    ])
      .then(([hoursData, unavailData, requestsData, earningsData]) => {
        const hours = hoursData.hours || [];
        const blocked = unavailData.dates || [];
        const reqs = requestsData.requests || [];
        const activeDays = hours.filter(h => h.is_active).length;
        const pendingRequests = reqs.filter(r => r.status === 'pending').length;

        const slots = [];
        for (let i = 0; i < 7; i++) {
          const d = new Date();
          d.setDate(d.getDate() + i);
          const dateStr = d.toISOString().split('T')[0];
          const dayHours = hours.find(h => h.day_of_week === d.getDay() && h.is_active);
          const isBlocked = blocked.some(b => b.unavailable_date === dateStr);
          slots.push({
            date: dateStr,
            day: DAYS_SHORT[d.getDay()],
            num: d.getDate(),
            status: isBlocked ? 'blocked' : dayHours ? 'available' : 'off',
          });
        }

        setStats({ activeDays, blockedDates: blocked.length, pendingRequests, totalRequests: reqs.length });
        setRequests(reqs.slice(0, 6));
        setUpcomingSlots(slots);
        setEarnings({ jobs: earningsData.jobs || [], total: earningsData.total || 0 });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
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

  const acceptedCount = requests.filter(r => r.status === 'accepted').length;
  const totalCount = requests.length || 1;
  const acceptRate = Math.round((acceptedCount / totalCount) * 100);

  const barData = [
    { label: 'Mon', val: 3 },
    { label: 'Tue', val: 5 },
    { label: 'Wed', val: 2 },
    { label: 'Thu', val: 7 },
    { label: 'Fri', val: 4 },
    { label: 'Sat', val: 6 },
    { label: 'Sun', val: 1 },
  ];
  const maxBar = Math.max(...barData.map(b => b.val));

  const fmt = d => d ? new Date(d).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

  if (loading) return <div className="td-loading">Loading dashboard…</div>;

  return (
    <div className="td-page">

      <aside className="td-sidebar">
        <div className="td-logo">
          <span className="td-logo-icon"><img src={logo} alt="Fixit" className="brand-logo-img" /></span>
          <span className="td-logo-text">Fixit</span>
        </div>

        <nav className="td-nav">
          <button className="td-nav-item td-nav-item--active">Dashboard</button>
          <button className="td-nav-item" onClick={() => navigate('/repair-requests')}>
            Repair Requests
            {stats.pendingRequests > 0 && <span className="td-nav-badge">{stats.pendingRequests}</span>}
          </button>
          <button className="td-nav-item" onClick={() => navigate('/availability')}>Availability</button>
          <button className="td-nav-item" onClick={() => navigate('/service-area')}>Service Area</button>
          <button className="td-nav-item" onClick={() => navigate('/profile')}>Profile</button>
        </nav>

        <div className="td-sidebar-bottom">
          <button className="td-nav-item">Settings</button>
          <button className="td-nav-item">Help Center</button>
          <button className="td-nav-item td-logout-item" onClick={handleLogout}>Log out</button>
        </div>
      </aside>

      <main className="td-main">

        <div className="td-topbar">
          <h1 className="td-page-title">Dashboard</h1>
          <div className="td-topbar-right">
            <div className="td-search">
              <span className="td-search-icon">🔍</span>
              <input className="td-search-input" placeholder="Search..." />
            </div>
            <div className="td-avatar">{(user?.firstName?.[0] || 'T').toUpperCase()}</div>
          </div>
        </div>

        <div className="td-filter-bar">
          {['Day','Week','Month','Year'].map(f => (
            <button
              key={f}
              className={`td-filter-btn${filter === f ? ' td-filter-btn--active' : ''}`}
              onClick={() => setFilter(f)}
            >{f}</button>
          ))}
          <span className="td-date-range">
            📅 {new Date().toLocaleDateString('en-AU', { day:'numeric', month:'short', year:'numeric' })}
          </span>
        </div>

        <div className="td-stats">
          <div className="td-stat-card td-stat-card--dark">
            <div className="td-stat-label">Total Requests</div>
            <div className="td-stat-value">{stats.totalRequests}</div>
            <div className="td-stat-change td-stat-change--up">all time</div>
          </div>
          <div className="td-stat-card">
            <div className="td-stat-label">Active Days</div>
            <div className="td-stat-value">{stats.activeDays}</div>
            <div className="td-stat-change td-stat-change--up">per week</div>
          </div>
          <div className="td-stat-card">
            <div className="td-stat-label">Pending</div>
            <div className="td-stat-value">{stats.pendingRequests}</div>
            <div className="td-stat-change td-stat-change--down">needs action</div>
          </div>
          <div className="td-stat-card">
            <div className="td-stat-label">Blocked Dates</div>
            <div className="td-stat-value">{stats.blockedDates}</div>
            <div className="td-stat-change">scheduled off</div>
          </div>
        </div>

        <div className="td-middle">

          <div className="td-card td-chart-card">
            <div className="td-card-header">
              <span className="td-card-title">Earnings Summary</span>
              <span className="td-earnings-total">
                NPR {Number(earnings.total).toLocaleString()}
              </span>
            </div>
            {earnings.jobs.length === 0 ? (
              <p className="td-table-empty">No completed repairs yet</p>
            ) : (
              <div className="td-earnings-list">
                {earnings.jobs.slice(0, 8).map(j => (
                  <div key={j.id} className="td-earnings-row">
                    <div className="td-earnings-info">
                      <span className="td-earnings-device">{j.device_type || 'Device'}</span>
                      <span className="td-earnings-date">{fmt(j.preferred_date)}</span>
                    </div>
                    <span className="td-earnings-amount">
                      {j.cost ? `NPR ${Number(j.cost).toLocaleString()}` : '—'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="td-right-col">
            <div className="td-card td-cal-card">
              <div className="td-cal-header">
                <button className="td-cal-nav" onClick={prevMonth}>‹</button>
                <span className="td-cal-title">
                  {MONTHS[calMonth.getMonth()]} {calMonth.getFullYear()}
                </span>
                <button className="td-cal-nav" onClick={nextMonth}>›</button>
              </div>
              <div className="td-cal-grid">
                {DAYS_SHORT.map(d => <div key={d} className="td-cal-dayname">{d}</div>)}
                {calDays().map((d, i) => (
                  <div
                    key={i}
                    className={`td-cal-day${d === null ? ' td-cal-day--empty' : ''}${isCurrentMonth && d === today ? ' td-cal-day--today' : ''}`}
                  >
                    {d}
                  </div>
                ))}
              </div>
            </div>

            <div className="td-card td-growth-card">
              <div>
                <div className="td-card-title">Acceptance Rate</div>
                <div className="td-growth-change td-stat-change--up">from accepted requests</div>
              </div>
              <div className="td-donut-wrap">
                <svg viewBox="0 0 36 36" className="td-donut">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1e293b" strokeWidth="3.5" />
                  <circle
                    cx="18" cy="18" r="15.9" fill="none"
                    stroke="#38bdf8" strokeWidth="3.5"
                    strokeDasharray={`${acceptRate} ${100 - acceptRate}`}
                    strokeDashoffset="25"
                    strokeLinecap="round"
                  />
                </svg>
                <span className="td-donut-label">{acceptRate}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="td-card">
          <div className="td-card-header">
            <span className="td-card-title">Recent Repair Requests</span>
            <button className="td-btn-outline" onClick={() => navigate('/repair-requests')}>View all →</button>
          </div>
          <table className="td-table">
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
                <tr><td colSpan={5} className="td-table-empty">No repair requests yet</td></tr>
              ) : requests.map(r => (
                <tr key={r.id}>
                  <td>{r.device_type || '—'}</td>
                  <td className="td-table-desc">{r.fault_description?.slice(0, 40) || '—'}{r.fault_description?.length > 40 ? '…' : ''}</td>
                  <td>{r.customer_area || '—'}</td>
                  <td>{fmt(r.preferred_date)}</td>
                  <td>
                    <span className={`td-badge td-badge--${r.status}`}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </main>
    </div>
  );
}
