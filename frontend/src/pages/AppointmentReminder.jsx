import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './AppointmentReminder.css'

const API = 'http://localhost:5000/api/repair-requests'

const CHECKLIST = [
  'Bring all necessary tools',
  'Review customer issue description',
  'Confirm your availability',
  'Check customer address on map',
]

function isTomorrow(dateStr) {
  if (!dateStr) return false
  const d = new Date(dateStr)
  const t = new Date()
  t.setDate(t.getDate() + 1)
  return d.toDateString() === t.toDateString()
}

function mapAppointment(r, customerName) {
  const dateStr = (r.preferred_date || '').split('T')[0]
  const tomorrow = isTomorrow(r.preferred_date)
  return {
    id: r.id,
    device: r.device_type,
    issue: r.fault_description,
    customer: customerName,
    date: dateStr,
    time: r.preferred_time || '—',
    city: r.customer_area,
    status: tomorrow ? 'tomorrow' : 'upcoming',
    reminders: [
      { type: '24h', label: '24-hour reminder', sent: tomorrow, sentAt: `${dateStr} (24h before)` },
      { type: '1h', label: '1-hour reminder', sent: false, sentAt: `${dateStr} (1h before)` },
    ],
  }
}

export default function AppointmentReminder() {
  const navigate = useNavigate()
  const [appointments, setAppointments] = useState([])
  const [selected, setSelected] = useState(null)
  const [tab, setTab] = useState('details')

  const user = JSON.parse(localStorage.getItem('user') || '{}')

  useEffect(() => {
    if (!user.id) return
    const name = [user.firstName, user.lastName].filter(Boolean).join(' ') || 'You'
    fetch(`${API}/reminders/${user.id}`)
      .then(r => r.json())
      .then(data => {
        const list = (data.reminders || []).map(r => mapAppointment(r, name))
        setAppointments(list)
        if (list.length) setSelected(list[0])
      })
      .catch(() => {})
  }, [user.id])

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
          <span className="ar-count-badge">{appointments.length} upcoming</span>
        </div>

        <div className="ar-body">
          {appointments.length === 0 && (
            <p className="ar-instruction" style={{ opacity: 0.6, padding: '12px 0' }}>
              No upcoming appointments.
            </p>
          )}
          <div className="ar-appt-list">
            {appointments.map(a => (
              <div
                key={a.id}
                className={`ar-appt-item ${selected?.id === a.id ? 'selected' : ''}`}
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

          {selected && tab === 'details' && (
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

          {selected && tab === 'reminders' && (
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
