import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './TechnicianDashboard.css';

export default function TechnicianDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ totalSlots: 0, activeDays: 0, blockedDates: 0 });
  const [upcomingSlots, setUpcomingSlots] = useState([]);
  const [loading, setLoading] = useState(true);

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
    ])
      .then(([hoursData, unavailData]) => {
        const hours = hoursData.hours || [];
        const blocked = unavailData.dates || [];
        const activeDays = hours.filter(h => h.is_active).length;

        
        const slots = [];
        for (let i = 0; i < 7; i++) {
          const d = new Date();
          d.setDate(d.getDate() + i);
          const dateStr = d.toISOString().split('T')[0];
          const dayOfWeek = d.getDay();
          const dayHours = hours.find(h => h.day_of_week === dayOfWeek && h.is_active);
          const isBlocked = blocked.some(b => b.unavailable_date === dateStr);

          slots.push({
            date: dateStr,
            label: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
            status: isBlocked ? 'blocked' : dayHours ? 'available' : 'off',
            hours: dayHours ? `${dayHours.start_time.slice(0,5)} – ${dayHours.end_time.slice(0,5)}` : null,
          });
        }

        setStats({
          activeDays,
          blockedDates: blocked.length,
          totalSlots: activeDays * 8,
        });
        setUpcomingSlots(slots);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) return <div className="td-loading">Loading dashboard…</div>;

  return (
    <div className="td-page">

      {}
      <aside className="td-sidebar">
        <div className="td-logo">
          <span className="td-logo-icon">⚡</span>
          <span className="td-logo-text">Fixit</span>
        </div>

        <nav className="td-nav">
          <button className="td-nav-item td-nav-item--active">
            <span className="td-nav-icon">⊞</span>
            Dashboard
          </button>
          <button className="td-nav-item" onClick={() => navigate('/availability')}>
            <span className="td-nav-icon">📅</span>
            Availability
          </button>
          <button className="td-nav-item" onClick={() => navigate('/profile')}>
            <span className="td-nav-icon">👤</span>
            Profile
          </button>
        </nav>

        <button className="td-logout" onClick={handleLogout}>
          <span>⎋</span> Sign Out
        </button>
      </aside>

      {}
      <main className="td-main">

        {}
        <header className="td-header">
          <div>
            <h1 className="td-heading">Welcome back, {user?.firstName || 'Technician'}</h1>
            <p className="td-subheading">Here's your availability overview</p>
          </div>
          <div className="td-avatar">
            {(user?.firstName?.[0] || 'T').toUpperCase()}
          </div>
        </header>

        {}
        <div className="td-stats">
          <div className="td-stat-card">
            <div className="td-stat-icon td-stat-icon--blue">📅</div>
            <div>
              <div className="td-stat-value">{stats.activeDays}</div>
              <div className="td-stat-label">Active Days / Week</div>
            </div>
          </div>
          <div className="td-stat-card">
            <div className="td-stat-icon td-stat-icon--cyan">🕐</div>
            <div>
              <div className="td-stat-value">{stats.totalSlots}</div>
              <div className="td-stat-label">Weekly Slots</div>
            </div>
          </div>
          <div className="td-stat-card">
            <div className="td-stat-icon td-stat-icon--red">🚫</div>
            <div>
              <div className="td-stat-value">{stats.blockedDates}</div>
              <div className="td-stat-label">Blocked Dates</div>
            </div>
          </div>
        </div>

        {}
        <section className="td-card">
          <div className="td-card-header">
            <h2 className="td-card-title">Next 7 Days</h2>
            <button className="td-btn-outline" onClick={() => navigate('/availability')}>
              Manage Availability →
            </button>
          </div>

          <div className="td-week">
            {upcomingSlots.map(slot => (
              <div key={slot.date} className={`td-day-card td-day-card--${slot.status}`}>
                <div className="td-day-label">{slot.label}</div>
                <div className={`td-day-badge td-day-badge--${slot.status}`}>
                  {slot.status === 'available' ? 'Available' : slot.status === 'blocked' ? 'Blocked' : 'Day Off'}
                </div>
                {slot.hours && <div className="td-day-hours">{slot.hours}</div>}
              </div>
            ))}
          </div>
        </section>

        {}
        <section className="td-card">
          <h2 className="td-card-title">Quick Actions</h2>
          <div className="td-actions">
            <button className="td-action-btn" onClick={() => navigate('/availability')}>
              <span className="td-action-icon">🕐</span>
              <span className="td-action-label">Set Working Hours</span>
              <span className="td-action-arrow">→</span>
            </button>
            <button className="td-action-btn" onClick={() => navigate('/availability')}>
              <span className="td-action-icon">🚫</span>
              <span className="td-action-label">Block a Date</span>
              <span className="td-action-arrow">→</span>
            </button>
            <button className="td-action-btn" onClick={() => navigate('/profile')}>
              <span className="td-action-icon">👤</span>
              <span className="td-action-label">Edit Profile</span>
              <span className="td-action-arrow">→</span>
            </button>
          </div>
        </section>

      </main>
    </div>
  );
}