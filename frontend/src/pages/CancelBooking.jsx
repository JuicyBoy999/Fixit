import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import logo from '../assets/image.png'
import './CancelBooking.css'

const API = 'http://localhost:5000/api/repair-requests'

function mapBooking(r) {
  return {
    id: r.id,
    device: r.device_type,
    issue: r.fault_description,
    date: (r.preferred_date || '').split('T')[0],
    time: r.preferred_time || '—',
    tech: r.technician_first_name ? `${r.technician_first_name} ${r.technician_last_name}` : r.technician_id ? `Technician #${r.technician_id}` : 'Not assigned',
    city: r.customer_area,
    status: r.status ? r.status.charAt(0).toUpperCase() + r.status.slice(1) : 'Pending',
  }
}

const CANCEL_REASONS = [
  'I no longer need the repair',
  'Found another technician',
  'Schedule conflict',
  'Price too high',
  'Technician unavailable',
  'Other',
]

export default function CancelBooking() {
  const navigate = useNavigate()
  const [step, setStep] = useState('select')
  const [selected, setSelected] = useState(null)
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [bookings, setBookings] = useState([])

  const user = JSON.parse(localStorage.getItem('user') || '{}')

  useEffect(() => {
    if (!user.id) return
    fetch(`${API}/claim/${user.id}`, { method: 'POST' })
      .catch(() => {})
      .finally(() => {
        fetch(`${API}/my/${user.id}`)
          .then(r => r.json())
          .then(data => {
            const list = (data.requests || [])
              .filter(r => r.status !== 'cancelled')
              .map(mapBooking)
            setBookings(list)
          })
          .catch(() => {})
      })
  }, [user.id])

  function handleSelect(booking) {
    setSelected(booking)
    setStep('confirm')
    setError('')
    setReason('')
  }

  function handleBack() {
    setStep('select')
    setSelected(null)
    setError('')
    setReason('')
  }

  async function handleCancel() {
    if (!reason) { setError('Please select a reason for cancellation.'); return }
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${API}/${selected.id}/cancel`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      })
      if (!res.ok) throw new Error('failed')
      setBookings(bookings.filter(b => b.id !== selected.id))
      setStep('success')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="cb-page">
      <div className="cb-modal">

        <div className="cb-header">
          <div className="cb-header-left">
            <div className="cb-logo"><img src={logo} alt="Fixit" className="brand-logo-img" /></div>
            <div>
              <div className="cb-title">Cancel Booking</div>
              <div className="cb-subtitle">Manage your repair appointments</div>
            </div>
          </div>
          {step === 'confirm' && (
            <button className="cb-back" onClick={handleBack}>← Back</button>
          )}
        </div>

        <div className="cb-body">

          {step === 'select' && (
            <>
              <p className="cb-instruction">Select a booking to cancel:</p>
              {bookings.length === 0 && (
                <p className="cb-instruction" style={{ opacity: 0.6 }}>No active bookings to cancel.</p>
              )}
              <div className="cb-list">
                {bookings.map(b => (
                  <div key={b.id} className="cb-item" onClick={() => handleSelect(b)}>
                    <div className="cb-item-left">
                      <div className="cb-device-icon">
                        {b.device === 'Laptop' ? '💻' : b.device === 'Smartphone' ? '📱' : '📺'}
                      </div>
                      <div className="cb-item-info">
                        <div className="cb-item-name">{b.device} repair</div>
                        <div className="cb-item-meta">{b.tech} · {b.date} · {b.time}</div>
                      </div>
                    </div>
                    <span className={`cb-badge ${b.status === 'Pending' ? 'cb-badge-pending' : 'cb-badge-confirmed'}`}>
                      {b.status}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}

          {step === 'confirm' && selected && (
            <>
              <div className="cb-policy">
                <div className="cb-policy-title">⚠ Cancellation policy</div>
                <ul className="cb-policy-list">
                  <li>Cancel 24+ hours before → full refund</li>
                  <li>Cancel within 24 hours → 50% cancellation fee</li>
                  <li>No-show → full charge applies</li>
                  <li>Slot becomes available for other customers immediately</li>
                </ul>
              </div>

              <div className="cb-details">
                <div className="cb-detail-row">
                  <span className="cb-detail-label">Device</span>
                  <span className="cb-detail-val">{selected.device}</span>
                </div>
                <div className="cb-detail-row">
                  <span className="cb-detail-label">Technician</span>
                  <span className="cb-detail-val">{selected.tech}</span>
                </div>
                <div className="cb-detail-row">
                  <span className="cb-detail-label">Date & Time</span>
                  <span className="cb-detail-val">{selected.date} · {selected.time}</span>
                </div>
                <div className="cb-detail-row cb-detail-last">
                  <span className="cb-detail-label">Location</span>
                  <span className="cb-detail-val">{selected.city}</span>
                </div>
              </div>

              <div className="cb-field">
                <label className="cb-field-label">Reason for cancellation</label>
                <select
                  className="cb-select"
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                >
                  <option value="" disabled>Select a reason...</option>
                  {CANCEL_REASONS.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              {error && <div className="cb-error">{error}</div>}

              <button
                className="cb-cancel-btn"
                onClick={handleCancel}
                disabled={loading}
              >
                {loading ? 'Cancelling...' : 'Confirm cancellation'}
              </button>

              <button className="cb-keep-btn" onClick={handleBack}>
                Keep booking
              </button>
            </>
          )}

          {step === 'success' && selected && (
            <>
              <div className="cb-icon-wrap">
                <div className="cb-icon-circle">✕</div>
              </div>
              <h2 className="cb-heading">Booking Cancelled</h2>
              <p className="cb-thanks">
                Your <strong>{selected.device} repair</strong> booking has been cancelled.
              </p>
              <p className="cb-desc">
                Both you and <strong>{selected.tech}</strong> have been notified.
                The slot on <strong>{selected.date}</strong> is now available for other customers.
              </p>

              <div className="cb-details">
                <div className="cb-detail-row">
                  <span className="cb-detail-label">Device</span>
                  <span className="cb-detail-val">{selected.device}</span>
                </div>
                <div className="cb-detail-row">
                  <span className="cb-detail-label">Date</span>
                  <span className="cb-detail-val">{selected.date}</span>
                </div>
                <div className="cb-detail-row">
                  <span className="cb-detail-label">Reason</span>
                  <span className="cb-detail-val">{reason}</span>
                </div>
                <div className="cb-detail-row cb-detail-last">
                  <span className="cb-detail-label">Status</span>
                  <span className="cb-detail-val cb-cancelled-text">Cancelled</span>
                </div>
              </div>

              <div className="cb-notifs">
                <span className="cb-notif">✉ Email sent to you</span>
                <span className="cb-notif">🔔 Technician notified</span>
                <span className="cb-notif">📅 Slot freed</span>
              </div>

              <button className="cb-done-btn" onClick={() => navigate('/dashboard')}>
                Done
              </button>

              <button className="cb-book-again-btn" onClick={() => navigate('/book-repair')}>
                Book another repair
              </button>
            </>
          )}

        </div>
      </div>
    </div>
  )
}
