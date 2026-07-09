import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/image.png';
import './ServiceArea.css';

const RADIUS_OPTIONS = ['5km', '10km', '15km', '25km', '50km', '100km'];

export default function ServiceArea() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab]       = useState('edit');
  const [baseLocation, setBaseLocation] = useState('');
  const [radius, setRadius]             = useState('10km');
  const [saving, setSaving]             = useState(false);
  const [saved, setSaved]               = useState(false);
  const [error, setError]               = useState('');

  const token = localStorage.getItem('token');
  const user  = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (!token) { navigate('/login'); return; }

    fetch('http://localhost:5000/api/service-area', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        if (data.area) {
          setBaseLocation(data.area.base_location || '');
          setRadius(data.area.radius || '10km');
        }
      })
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    if (!baseLocation.trim()) { setError('Please enter your service location.'); return; }
    setError('');
    setSaving(true);
    try {
      const res = await fetch('http://localhost:5000/api/service-area', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ baseLocation, radius }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to save.'); return; }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError('Network error. Try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="sa-page">
      <div className="sa-topbar">
        <div className="sa-logo">
          <span className="sa-logo-icon"><img src={logo} alt="Fixit" className="brand-logo-img" /></span>
          <span className="sa-logo-text">Fixit</span>
          <span className="sa-logo-sep">/ Service Area</span>
        </div>
        <div className="sa-topbar-right">
          <span className="sa-user">{user.firstName} {user.lastName}</span>
          <button className="sa-back-btn" onClick={() => navigate('/technician-dashboard')}>← Dashboard</button>
        </div>
      </div>

      <div className="sa-body">
        <h2 className="sa-heading">Service Area</h2>
        <p className="sa-sub">Set your location and how far you're willing to travel for repairs</p>

        <div className="sa-tabs">
          <button
            className={`sa-tab ${activeTab === 'edit' ? 'sa-tab--active' : ''}`}
            onClick={() => setActiveTab('edit')}
          >
            ✏️ Edit
          </button>
          <button
            className={`sa-tab ${activeTab === 'preview' ? 'sa-tab--active' : ''}`}
            onClick={() => setActiveTab('preview')}
          >
            👁 Preview
          </button>
        </div>

        {activeTab === 'edit' && (
          <div className="sa-card">
            {error && <div className="sa-error">{error}</div>}
            {saved && <div className="sa-success">✓ Service area saved successfully!</div>}

            <div className="sa-field">
              <label className="sa-label">📍 BASE LOCATION</label>
              <input
                type="text"
                className="sa-input"
                placeholder="e.g. Thamel, Kathmandu"
                value={baseLocation}
                onChange={e => setBaseLocation(e.target.value)}
              />
              <p className="sa-hint">Enter your city, neighbourhood or area you operate from</p>
            </div>

            <div className="sa-field">
              <label className="sa-label">📡 SERVICE RADIUS</label>
              <div className="sa-radius-grid">
                {RADIUS_OPTIONS.map(r => (
                  <button
                    key={r}
                    className={`sa-radius-btn ${radius === r ? 'sa-radius-btn--active' : ''}`}
                    onClick={() => setRadius(r)}
                  >
                    {r}
                  </button>
                ))}
              </div>
              <p className="sa-hint">Customers within this radius will be able to find you</p>
            </div>

            <button className="sa-save-btn" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : '💾 Save Service Area'}
            </button>
          </div>
        )}

        {activeTab === 'preview' && (
          <div className="sa-card">
            <div className="sa-preview">
              <div className="sa-preview-icon">📍</div>
              <h3 className="sa-preview-location">{baseLocation || 'No location set'}</h3>
              <div className="sa-preview-badge">{radius} radius</div>
              <p className="sa-preview-desc">
                Customers within <strong>{radius}</strong> of <strong>{baseLocation || 'your location'}</strong> will see your profile when searching for technicians.
              </p>
              <div className="sa-rules">
                <h4 className="sa-rules-title">Visibility Rules</h4>
                <div className="sa-rule">
                  <span className="sa-rule-icon sa-rule-icon--green">✓</span>
                  <span>Customers inside your radius can book you</span>
                </div>
                <div className="sa-rule">
                  <span className="sa-rule-icon sa-rule-icon--red">✕</span>
                  <span>Customers outside your radius won't see your profile</span>
                </div>
                <div className="sa-rule">
                  <span className="sa-rule-icon sa-rule-icon--blue">ℹ</span>
                  <span>You can update your service area anytime</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}