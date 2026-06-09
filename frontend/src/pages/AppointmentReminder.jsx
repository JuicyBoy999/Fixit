import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './AppointmentReminder.css'

const APPOINTMENTS = [
  {
    id: 1,
    device: 'Laptop',
    issue: 'Screen is cracked',
    customer: 'Tshering lama',
    date: 'Jun 3, 2026',
    time: '10:00 AM',
    city: 'Thamel, Kathmandu',
    status: 'tomorrow',
    reminders: [
      { type: '24h', label: '24-hour reminder', sent: true, sentAt: 'Jun 2 · 10:00 AM' },
      { type: '1h', label: '1-hour reminder', sent: false, sentAt: 'Jun 3 · 9:00 AM' },
    ],
  },
  {
    id: 2,
    device: 'Smartphone',
    issue: 'Battery drains fast',
    customer: 'Sheerya Sharma',
    date: 'Jun 5, 2026',
    time: '2:00 PM',
    city: 'Lazimpat, Kathmandu',
    status: 'upcoming',
    reminders: [
      { type: '24h', label: '24-hour reminder', sent: false, sentAt: 'Jun 4 · 2:00 PM' },
      { type: '1h', label: '1-hour reminder', sent: false, sentAt: 'Jun 5 · 1:00 PM' },
    ],
  },
]

const CHECKLIST = [
  'Bring all necessary tools',
  'Review customer issue description',
  'Confirm your availability',
  'Check customer address on map',
]

export default function AppointmentReminder() {
  const navigate = useNavigate()
  const [selected, setSelected] = useState(APPOINTMENTS[0])
  const [tab, setTab] = useState('details')

  return (
    <div className="ar-page">
      <div className="ar-modal">

        <div className="ar-header">
          <div className="ar-header-left">
            <div className="ar-logo">⚡</div>
            <div>
              <div className="ar-title">Appointment Reminder</div>
              <div className="ar-subtitle">Upcoming repair appointments</div>
            </div>
          </div>
          <span className="ar-count-badge">{APPOINTMENTS.length} upcoming</span>
        </div>

        <div className="ar-body">
          <div className="ar-appt-list">
            {APPOINTMENTS.map(a => (
              <div
                key={a.id}
                className={`ar-appt-item ${selected.id === a.id ? 'selected' : ''}`}
                onClick={() => { setSelected(a); setTab('details') }}
              >
                <div className={`ar-appt-status ${a.status}`} />
                <div className="ar-appt-info">
                  <div className="ar-appt-name">{a.device} · {a.customer}</div>
                  <div className="ar-appt-meta">{a.date} · {a.time}</div>
                </div>
                <span className={`ar-status-badge ar-status-${a.status}`}>
                  {a.status === 'tomorrow' ? 'Tomorrow' : 'Upcoming'}
                </span>
              </div>
            ))}
          </div>

          <div className="ar-tabs">
            <button className={`ar-tab ${tab === 'details' ? 'on' : ''}`} onClick={() => setTab('details')}>Details</button>
            <button className={`ar-tab ${tab === 'reminders' ? 'on' : ''}`} onClick={() => setTab('reminders')}>Reminders</button>
            <button className={`ar-tab ${tab === 'checklist' ? 'on' : ''}`} onClick={() => setTab('checklist')}>Checklist</button>
          </div>

          {tab === 'details' && (
            <div className="ar-details">
              <div className="ar-detail-card">
                <div className="ar-detail-row">
                  <span className="ar-detail-label">Device</span>
                  <span className="ar-detail-val">{selected.device}</span>
                </div>
                <div className="ar-detail-row">
                  <span className="ar-detail-label">Issue</span>
                  <span className="ar-detail-val">{selected.issue}</span>
                </div>
                <div className="ar-detail-row">
                  <span className="ar-detail-label">Customer</span>
                  <span className="ar-detail-val">{selected.customer}</span>
                </div>
                <div className="ar-detail-row">
                  <span className="ar-detail-label">Date</span>
                  <span className="ar-detail-val">{selected.date}</span>
                </div>
                <div className="ar-detail-row">
                  <span className="ar-detail-label">Time</span>
                  <span className="ar-detail-val">{selected.time}</span>
                </div>
                <div className="ar-detail-row ar-detail-last">
                  <span className="ar-detail-label">Location</span>
                  <span className="ar-detail-val">{selected.city}</span>
                </div>
              </div>
            </div>
          )}

          {tab === 'reminders' && (
            <div className="ar-reminders">
              {selected.reminders.map(r => (
                <div key={r.type} className="ar-reminder-item">
                  <div className={`ar-reminder-icon ${r.sent ? 'sent' : 'pending'}`}>
                    {r.sent ? '✓' : '⏰'}
                  </div>
                  <div className="ar-reminder-info">
                    <div className="ar-reminder-label">{r.label}</div>
                    <div className="ar-reminder-time">{r.sent ? 'Sent' : 'Scheduled'} — {r.sentAt}</div>
                  </div>
                  <span className={`ar-reminder-badge ${r.sent ? 'sent' : 'pending'}`}>
                    {r.sent ? 'Sent' : 'Pending'}
                  </span>
                </div>
              ))}
              <div className="ar-reminder-note">
                Reminders are sent automatically via email and push notification.
              </div>
            </div>
          )}

          {tab === 'checklist' && (
            <div className="ar-checklist">
              <p className="ar-checklist-title">Pre-appointment checklist</p>
              {CHECKLIST.map((item, i) => (
                <CheckItem key={i} label={item} />
              ))}
            </div>
          )}

          <button className="ar-done-btn" onClick={() => navigate('/dashboard')}>
            Done
          </button>
        </div>

      </div>
    </div>
  )
}

function CheckItem({ label }) {
  const [checked, setChecked] = useState(false)
  return (
    <div className={`ar-check-item ${checked ? 'checked' : ''}`} onClick={() => setChecked(!checked)}>
      <div className={`ar-check-box ${checked ? 'on' : ''}`}>
        {checked && <span>✓</span>}
      </div>
      <span className="ar-check-label">{label}</span>
    </div>
  )
}
