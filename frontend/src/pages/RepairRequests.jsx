import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './RepairRequests.css';

const STATUS_COLORS = {
  pending:  { bg: 'rgba(245,158,11,0.1)',  border: '#f59e0b', color: '#f59e0b', label: '⏳ Pending'  },
  accepted: { bg: 'rgba(34,197,94,0.1)',   border: '#22c55e', color: '#22c55e', label: '✅ Accepted' },
  declined: { bg: 'rgba(239,68,68,0.1)',   border: '#ef4444', color: '#ef4444', label: '❌ Declined' },
};

export default function RepairRequests() {
  const navigate = useNavigate();
  const [requests, setRequests]             = useState([]);
  const [selected, setSelected]             = useState(null);
  const [loading, setLoading]               = useState(true);
  const [actionLoading, setActionLoading]   = useState(false);
  const [message, setMessage]               = useState('');

  const token = localStorage.getItem('token');
  const user  = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (!token) { navigate('/login'); return; }

    fetch('http://localhost:5000/api/repair-requests/list', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        setRequests(data.requests || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleStatus = async (id, status) => {
    setActionLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/repair-requests/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
        if (selected?.id === id) setSelected(prev => ({ ...prev, status }));
        setMessage(status === 'accepted' ? '✅ Request accepted!' : '❌ Request declined.');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch {
      setMessage('Failed to update status. Try again.');
      setTimeout(() => setMessage(''), 3000);
    }
    setActionLoading(false);
  };

  const pendingCount  = requests.filter(r => r.status === 'pending').length;
  const acceptedCount = requests.filter(r => r.status === 'accepted').length;
  const declinedCount = requests.filter(r => r.status === 'declined').length;

  const fmt = d => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

  return (
    <div className="rr-page">

      {}
      <div className="rr-topbar">
        <div className="rr-logo">
          <span className="rr-logo-icon">⚡</span>
          <span className="rr-logo-text">Fixit</span>
          <span className="rr-logo-sep">/ Repair Requests</span>
        </div>
        <div className="rr-topbar-right">
          <span className="rr-user">{user.firstName} {user.lastName}</span>
          <button className="rr-back-btn" onClick={() => navigate('/dashboard')}>← Dashboard</button>
        </div>
      </div>

      <div className="rr-body">
        <h2 className="rr-heading">Repair Requests</h2>
        <p className="rr-sub">Review and respond to customer repair requests</p>

        {}
        <div className="rr-stats">
          {[
            { label: 'Pending',  value: pendingCount,  color: '#f59e0b' },
            { label: 'Accepted', value: acceptedCount, color: '#22c55e' },
            { label: 'Declined', value: declinedCount, color: '#ef4444' },
          ].map(s => (
            <div key={s.label} className="rr-stat-card">
              <p className="rr-stat-value" style={{ color: s.color }}>{s.value}</p>
              <p className="rr-stat-label">{s.label}</p>
            </div>
          ))}
        </div>

        {}
        {message && (
          <div className={`rr-message ${message.includes('✅') ? 'rr-message--success' : 'rr-message--error'}`}>
            {message}
          </div>
        )}

        {}
        <div className={`rr-grid ${selected ? 'rr-grid--split' : ''}`}>

          {}
          <div className="rr-list">
            {loading && <p className="rr-hint">Loading requests…</p>}
            {!loading && requests.length === 0 && (
              <div className="rr-empty">
                <p>📭 No repair requests yet.</p>
                <p className="rr-hint">Requests from customers will appear here.</p>
              </div>
            )}
            {requests.map(req => {
              const s = STATUS_COLORS[req.status] || STATUS_COLORS.pending;
              return (
                <div
                  key={req.id}
                  className={`rr-card ${selected?.id === req.id ? 'rr-card--active' : ''}`}
                  onClick={() => setSelected(req)}
                >
                  <div className="rr-card-top">
                    <div>
                      <p className="rr-card-device">📱 {req.device_type}</p>
                      <p className="rr-card-meta">#{req.id} • {req.customer_area}</p>
                    </div>
                    <span className="rr-badge" style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color }}>
                      {s.label}
                    </span>
                  </div>
                  <p className="rr-card-desc">{req.fault_description}</p>
                  <p className="rr-card-date">📅 {fmt(req.preferred_date)}</p>
                </div>
              );
            })}
          </div>

          {}
          {selected && (
            <div className="rr-detail">
              <div className="rr-detail-header">
                <h3 className="rr-detail-title">Request Details</h3>
                <button className="rr-close-btn" onClick={() => setSelected(null)}>✕</button>
              </div>

              <div className="rr-detail-field">
                <p className="rr-field-label">DEVICE TYPE</p>
                <p className="rr-field-value">📱 {selected.device_type}</p>
              </div>

              <div className="rr-detail-field">
                <p className="rr-field-label">FAULT DESCRIPTION</p>
                <p className="rr-field-value rr-field-value--muted">{selected.fault_description}</p>
              </div>

              <div className="rr-detail-field">
                <p className="rr-field-label">PHOTO</p>
                {selected.photo_url ? (
                  <img src={selected.photo_url} alt="Device" className="rr-photo" />
                ) : (
                  <div className="rr-no-photo">📷 No photo uploaded</div>
                )}
              </div>

              <div className="rr-detail-field">
                <p className="rr-field-label">PREFERRED DATE</p>
                <p className="rr-field-value">📅 {fmt(selected.preferred_date)}</p>
              </div>

              <div className="rr-detail-field">
                <p className="rr-field-label">CUSTOMER AREA</p>
                <p className="rr-field-value">📍 {selected.customer_area}</p>
              </div>

              <div className="rr-detail-field">
                <p className="rr-field-label">SUBMITTED ON</p>
                <p className="rr-field-value">🕐 {fmt(selected.created_at)}</p>
              </div>

              {selected.status === 'pending' ? (
                <div className="rr-actions">
                  <button
                    className="rr-btn rr-btn--decline"
                    onClick={() => handleStatus(selected.id, 'declined')}
                    disabled={actionLoading}
                  >
                    ❌ Decline
                  </button>
                  <button
                    className="rr-btn rr-btn--accept"
                    onClick={() => handleStatus(selected.id, 'accepted')}
                    disabled={actionLoading}
                  >
                    ✅ Accept
                  </button>
                </div>
              ) : (
                <div className="rr-status-result" style={{
                  background: STATUS_COLORS[selected.status]?.bg,
                  border: `1px solid ${STATUS_COLORS[selected.status]?.border}`,
                  color: STATUS_COLORS[selected.status]?.color,
                }}>
                  {STATUS_COLORS[selected.status]?.label}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}