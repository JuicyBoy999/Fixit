
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './SetAvailability.css';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const DEFAULT_SCHEDULE = DAYS.map((_, i) => ({
  dayOfWeek: i,
  startTime: '09:00',
  endTime:   '17:00',
  isActive:  i >= 1 && i <= 5, 
}));

export default function SetAvailability() {
  const navigate    = useNavigate();
  const storedUser  = JSON.parse(localStorage.getItem('user') || '{}');
  const techId      = storedUser.id;

  const [schedule,        setSchedule]        = useState(DEFAULT_SCHEDULE);
  const [unavailDates,    setUnavailDates]     = useState([]);
  const [newBlockDate,    setNewBlockDate]     = useState('');
  const [newBlockReason,  setNewBlockReason]   = useState('');
  const [saving,          setSaving]           = useState(false);
  const [blocking,        setBlocking]         = useState(false);
  const [toast,           setToast]            = useState(null);

  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };


  useEffect(() => {
    if (!techId) { navigate('/login'); return; }

    fetch(`http://localhost:5000/api/availability/${techId}/hours`, { headers })
      .then(r => r.json())
      .then(data => {
        if (data.hours && data.hours.length > 0) {
          setSchedule(prev =>
            prev.map(day => {
              const saved = data.hours.find(h => h.day_of_week === day.dayOfWeek);
              if (!saved) return day;
              return {
                ...day,
                startTime: saved.start_time.slice(0, 5),
                endTime:   saved.end_time.slice(0, 5),
                isActive:  saved.is_active,
              };
            })
          );
        }
      })
      .catch(() => {});

      fetch(`http://localhost:5000/api/availability/${techId}/unavailable`, { headers })
      .then(r => r.json())
      .then(data => { if (data.dates) setUnavailDates(data.dates); })
      .catch(() => {});
  }, [techId]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const toggleDay = (idx) =>
    setSchedule(prev => prev.map((d, i) => i === idx ? { ...d, isActive: !d.isActive } : d));

  const updateTime = (idx, field, val) =>
    setSchedule(prev => prev.map((d, i) => i === idx ? { ...d, [field]: val } : d));

  const handleSaveHours = async () => {
    setSaving(true);
    try {
      const res = await fetch(`http://localhost:5000/api/availability/${techId}/hours`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ schedule }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      showToast('Working hours saved!');
    } catch (e) {
      showToast(e.message || 'Failed to save', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleBlockDate = async () => {
    if (!newBlockDate) return;
    setBlocking(true);
    try {
      const res = await fetch(`http://localhost:5000/api/availability/${techId}/unavailable`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ date: newBlockDate, reason: newBlockReason || null }),
      });
      const data = await res.json();
      if (res.status === 409) { showToast('Already blocked', 'error'); return; }
      if (!res.ok) throw new Error(data.message);
      setUnavailDates(prev => [...prev, data.entry]);
      setNewBlockDate('');
      setNewBlockReason('');
      showToast('Date blocked');
    } catch (e) {
      showToast(e.message || 'Failed to block date', 'error');
    } finally {
      setBlocking(false);
    }
  };

  const handleUnblock = async (dateStr) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/availability/${techId}/unavailable/${dateStr}`,
        { method: 'DELETE', headers }
      );
      if (!res.ok) throw new Error();
      setUnavailDates(prev => prev.filter(d => d.unavailable_date !== dateStr));
      showToast('Date unblocked');
    } catch {
      showToast('Failed to unblock', 'error');
    }
  };

  return (
    <div className="sa-page">
      {toast && <div className={`sa-toast sa-toast--${toast.type}`}>{toast.msg}</div>}

      <div className="sa-container">
        <button className="sa-back" onClick={() => navigate('/technician-dashboard')}>← Dashboard</button>
        <h1 className="sa-title">My Availability</h1>
        <p className="sa-sub">Set your weekly hours and block specific dates off.</p>

        {}
        <section className="sa-card">
          <h2 className="sa-card-title">Weekly Working Hours</h2>

          <div className="sa-schedule">
            {schedule.map((day, idx) => (
              <div key={day.dayOfWeek} className={`sa-day ${!day.isActive ? 'sa-day--off' : ''}`}>
                <label className="sa-toggle">
                  <input
                    type="checkbox"
                    checked={day.isActive}
                    onChange={() => toggleDay(idx)}
                  />
                  <span className="sa-toggle-label">{DAYS[day.dayOfWeek]}</span>
                </label>

                {day.isActive ? (
                  <div className="sa-times">
                    <div className="sa-time-group">
                      <span>From</span>
                      <input
                        type="time"
                        value={day.startTime}
                        onChange={e => updateTime(idx, 'startTime', e.target.value)}
                        className="sa-time-input"
                      />
                    </div>
                    <div className="sa-time-group">
                      <span>To</span>
                      <input
                        type="time"
                        value={day.endTime}
                        onChange={e => updateTime(idx, 'endTime', e.target.value)}
                        className="sa-time-input"
                      />
                    </div>
                  </div>
                ) : (
                  <span className="sa-off-label">Day off</span>
                )}
              </div>
            ))}
          </div>

          <button
            className="sa-btn sa-btn--primary"
            onClick={handleSaveHours}
            disabled={saving}
          >
            {saving ? 'Saving…' : 'Save Working Hours'}
          </button>
        </section>

        {}
        <section className="sa-card">
          <h2 className="sa-card-title">Block a Date</h2>
          <p className="sa-card-sub">Use this for holidays, sick days, or one-off time off.</p>

          <div className="sa-block-form">
            <input
              type="date"
              value={newBlockDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={e => setNewBlockDate(e.target.value)}
              className="sa-input"
            />
            <input
              type="text"
              placeholder="Reason (optional)"
              value={newBlockReason}
              onChange={e => setNewBlockReason(e.target.value)}
              className="sa-input"
            />
            <button
              className="sa-btn sa-btn--secondary"
              onClick={handleBlockDate}
              disabled={blocking || !newBlockDate}
            >
              {blocking ? 'Blocking…' : 'Block Date'}
            </button>
          </div>

          {unavailDates.length > 0 && (
            <ul className="sa-blocked-list">
              {unavailDates.map(d => (
                <li key={d.unavailable_date} className="sa-blocked-item">
                  <span>
                    <strong>{d.unavailable_date}</strong>
                    {d.reason && <em> — {d.reason}</em>}
                  </span>
                  <button
                    className="sa-unblock-btn"
                    onClick={() => handleUnblock(d.unavailable_date)}
                  >
                    Unblock
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}