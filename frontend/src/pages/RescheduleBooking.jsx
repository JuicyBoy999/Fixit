import { useState, useEffect, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import ReviewForm from '../components/ReviewForm'
import logo from '../assets/image.png'
import './RescheduleBooking.css'

const API = 'http://localhost:5000/api/repair-requests'
const AVAIL_API = 'http://localhost:5000/api/availability'

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

function mapBooking(r) {
  return {
    ...r,
    id: r.id,
    device: r.device_type,
    issue: r.fault_description,
    date: (r.preferred_date || '').split('T')[0],
    time: r.preferred_time || '—',
    techId: r.technician_id,
    tech: r.technician_first_name
      ? `${r.technician_first_name} ${r.technician_last_name}`
      : r.technician_id ? `Technician #${r.technician_id}` : 'Not assigned',
    city: r.customer_area,
    rawStatus: r.status,
    status: r.status ? r.status.charAt(0).toUpperCase() + r.status.slice(1) : 'Pending',
  }
}

export default function RescheduleBooking() {
  const navigate = useNavigate()
  const [step, setStep] = useState('select')
  const [selected, setSelected] = useState(null)
  const [month, setMonth] = useState(new Date().getMonth())
  const [year, setYear] = useState(new Date().getFullYear())
  const [selDay, setSelDay] = useState(null)
  const [selTime, setSelTime] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [bookings, setBookings] = useState([])
  const [fetchingBookings, setFetchingBookings] = useState(true)
  const [slots, setSlots] = useState([])
  const [loadingSlots, setLoadingSlots] = useState(false)

  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const today = new Date()

  useEffect(() => {
    if (!user.id && !localStorage.getItem('token')) {
      setFetchingBookings(false)
      return
    }
    setFetchingBookings(true)
    const token = localStorage.getItem('token')

    const doFetch = async () => {
      // Try authenticated endpoint first
      if (token) {
        try {
          const res = await fetch(`${API}/mine`, { headers: { Authorization: `Bearer ${token}` } })
          if (res.ok) {
            const data = await res.json()
            return data.requests || []
          }
        } catch {}
      }
      // Fallback: claim + fetch by id
      if (user.id) {
        try { await fetch(`${API}/claim/${user.id}`, { method: 'POST' }) } catch {}
        try {
          const res = await fetch(`${API}/my/${user.id}`)
          const data = await res.json()
          return data.requests || []
        } catch {}
      }
      return []
    }

    doFetch().then(requests => {
      const list = requests
        .filter(r => !['cancelled', 'declined'].includes(r.status))
        .map(mapBooking)
      setBookings(list)
    }).finally(() => setFetchingBookings(false))
  }, [user.id])

  const handleReviewSaved = (bookingId, review) => {
    setBookings(prev => prev.map(b => (
      b.id === bookingId
        ? {
            ...b,
            review_id: review.id,
            review_rating: review.rating,
            review_body: review.body,
            review_created_at: review.created_at,
            review_edited_at: review.edited_at,
            review_original_body: review.original_body,
          }
        : b
    )))
  }

  const fetchSlots = useCallback((techId, date) => {
    if (!techId || !date) { setSlots([]); return }
    setLoadingSlots(true)
    fetch(`${AVAIL_API}/${techId}/slots?date=${date}`)
      .then(r => r.json())
      .then(data => setSlots(data.slots || []))
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false))
  }, [])

  function handleSelect(booking) {
    setSelected(booking)
    setStep('reschedule')
    setError('')
    setSelDay(null)
    setSelTime(null)
    setSlots([])
  }

  function handleBack() {
    setStep('select')
    setSelected(null)
    setError('')
    setSelDay(null)
    setSelTime(null)
    setSlots([])
  }

  function changeMonth(dir) {
    let m = month + dir
    let y = year
    if (m > 11) { m = 0; y++ }
    if (m < 0) { m = 11; y-- }
    setMonth(m)
    setYear(y)
    setSelDay(null)
    setSelTime(null)
    setSlots([])
  }

  function handleDayClick(d) {
    setSelDay(d)
    setSelTime(null)
    setError('')
    if (selected?.techId) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      fetchSlots(selected.techId, dateStr)
    }
  }

  async function handleConfirm() {
    if (!selDay || !selTime) { setError('Please select a date and time slot.'); return }
    setError('')
    setLoading(true)
    try {
      const newDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(selDay).padStart(2, '0')}`
      const res = await fetch(`${API}/${selected.id}/reschedule`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferred_date: newDate, preferred_time: selTime }),
      })
      if (!res.ok) throw new Error('failed')
      setStep('success')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const days = []
  for (let i = 0; i < firstDay; i++) days.push(null)
  for (let d = 1; d <= daysInMonth; d++) days.push(d)

  if (step === 'success' && selected) {
    const newDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(selDay).padStart(2, '0')}`
    return (
      <div className="rb-page">
        <aside className="rb-sidebar">
          <div className="rb-brand"><img src={logo} alt="Fixit" className="brand-logo-img" /> Fixit</div>
          <div className="rb-sidebar-info">
            <h2 className="rb-sidebar-heading">Booking rescheduled!</h2>
            <p className="rb-sidebar-sub">Your technician has been notified of the new slot.</p>
          </div>
          <div className="rb-sidebar-steps">
            <div className="rb-stp rb-stp--done"><div className="rb-stp-num">✓</div><div><div className="rb-stp-label">Select Booking</div></div></div>
            <div className="rb-stp-line" />
            <div className="rb-stp rb-stp--done"><div className="rb-stp-num">✓</div><div><div className="rb-stp-label">Pick New Slot</div></div></div>
          </div>
        </aside>
        <main className="rb-main">
          <div className="rb-success-wrap">
            <div className="rb-success-icon">✓</div>
            <h1 className="rb-success-heading">All rescheduled!</h1>
            <p className="rb-success-msg">Your <strong>{selected.device}</strong> repair has been moved to the new slot.</p>
            <div className="rb-confirm-box">
              <div className="rb-confirm-row"><span>Device</span><span>{selected.device}</span></div>
              <div className="rb-confirm-row"><span>Technician</span><span>{selected.tech}</span></div>
              <div className="rb-confirm-row"><span>Original slot</span><span className="rb-old-val">{selected.date} · {selected.time}</span></div>
              <div className="rb-confirm-row"><span>New slot</span><span className="rb-new-val">{newDate} · {selTime}</span></div>
            </div>
            <div className="rb-actions">
              <button className="rb-btn-secondary" onClick={() => navigate('/book-repair')}>Book another</button>
              <button className="rb-btn" onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="rb-page">
      <aside className="rb-sidebar">
        <div className="rb-brand"><img src={logo} alt="Fixit" className="brand-logo-img" /> Fixit</div>
        <div className="rb-sidebar-info">
          <h2 className="rb-sidebar-heading">
            {step === 'select' ? 'Reschedule a booking.' : `Rescheduling ${selected?.device} repair.`}
          </h2>
          <p className="rb-sidebar-sub">
            {step === 'select'
              ? 'Pick a booking below then choose a new date and time slot.'
              : `Currently scheduled for ${selected?.date} at ${selected?.time}.`}
          </p>
        </div>
        <div className="rb-sidebar-steps">
          <div className={`rb-stp ${step === 'select' ? 'rb-stp--active' : 'rb-stp--done'}`}>
            <div className="rb-stp-num">{step !== 'select' ? '✓' : '1'}</div>
            <div><div className="rb-stp-label">Select Booking</div><div className="rb-stp-sub">Choose which repair to move</div></div>
          </div>
          <div className="rb-stp-line" />
          <div className={`rb-stp ${step === 'reschedule' ? 'rb-stp--active' : ''}`}>
            <div className="rb-stp-num">2</div>
            <div><div className="rb-stp-label">Pick New Slot</div><div className="rb-stp-sub">Date & time</div></div>
          </div>
        </div>
      </aside>

      <main className="rb-main">
        <div className="rb-main-top">
          <div>
            <h1 className="rb-main-heading">{step === 'select' ? 'Your Bookings' : 'Pick a New Slot'}</h1>
            <p className="rb-main-sub">
              {step === 'select'
                ? 'Select a booking you want to reschedule.'
                : `Choose a new date and time for your ${selected?.device} repair.`}
            </p>
          </div>
          <button className="rb-close-btn" onClick={() => step === 'reschedule' ? handleBack() : navigate('/dashboard')}>
            {step === 'reschedule' ? '← Back' : '✕ Cancel'}
          </button>
        </div>

        {error && <div className="rb-error">{error}</div>}

        {step === 'select' && (
          <>
            {fetchingBookings ? (
              <div className="rb-loading">Loading your bookings...</div>
            ) : bookings.length === 0 ? (
              <div className="rb-empty">
                <div className="rb-empty-icon">📅</div>
                <p>No bookings yet.</p>
                <p className="rb-empty-sub">Your repair requests will appear here once you book one.</p>
                <button className="rb-btn" onClick={() => navigate('/book-repair')} style={{ marginTop: '1.5rem' }}>
                  Book a Repair
                </button>
              </div>
            ) : (
              <div className="rb-booking-list">
                {bookings.map(b => (
                  <div key={b.id} className={`rb-booking-card-wrap ${b.rawStatus === 'completed' ? 'rb-booking-card-wrap--completed' : ''}`}>
                    <div className="rb-booking-card">
                      <div className="rb-booking-icon">
                        {b.device === 'Laptop' ? '💻' : b.device === 'Smartphone' ? '📱' : b.device === 'TV' ? '📺' : '🔧'}
                      </div>
                      <div className="rb-booking-info">
                        <div className="rb-booking-device">{b.device} Repair</div>
                        <div className="rb-booking-meta">{b.tech} · {b.date} {b.time !== '—' ? `at ${b.time}` : ''}</div>
                        {b.issue && <div className="rb-booking-issue">{b.issue.slice(0, 60)}{b.issue.length > 60 ? '…' : ''}</div>}
                      </div>
                      <div className="rb-booking-right">
                        <span className={`rb-badge rb-badge-${b.status.toLowerCase()}`}>{b.status}</span>
                        <Link to={`/chat/${b.id}`} className="rb-chat-btn" title="Chat with technician">💬 Chat</Link>
                        {b.rawStatus !== 'completed' && (
                          <button className="rb-reschedule-btn" onClick={() => handleSelect(b)}>Reschedule →</button>
                        )}
                      </div>
                    </div>
                    <ReviewForm repair={{ ...b, status: b.rawStatus }} onSaved={handleReviewSaved} />
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {step === 'reschedule' && selected && (
          <div className="rb-reschedule-layout">
            <div className="rb-calendar-col">
              <div className="rb-current-slot">
                <span className="rb-current-label">Current booking</span>
                <span className="rb-current-val">{selected.device} · {selected.date} · {selected.time}</span>
              </div>

              <div className="rb-cal-nav-row">
                <button className="rb-nav-btn" onClick={() => changeMonth(-1)}>‹</button>
                <span className="rb-month-label">{MONTHS[month]} {year}</span>
                <button className="rb-nav-btn" onClick={() => changeMonth(1)}>›</button>
              </div>

              <div className="rb-cal-grid">
                {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
                  <div key={d} className="rb-day-hd">{d}</div>
                ))}
                {days.map((d, i) => {
                  if (!d) return <div key={`e-${i}`} />
                  const isPast = new Date(year, month, d) < new Date(today.getFullYear(), today.getMonth(), today.getDate())
                  const origParts = selected.date.split('-')
                  const isOrig = d === parseInt(origParts[2]) && month === parseInt(origParts[1]) - 1 && year === parseInt(origParts[0])
                  const isSel = selDay === d

                  let cls = 'rb-cal-day'
                  if (isSel) cls += ' rb-cal-day--sel'
                  else if (isOrig) cls += ' rb-cal-day--orig'
                  else if (isPast) cls += ' rb-cal-day--past'
                  else cls += ' rb-cal-day--avail'

                  return (
                    <div
                      key={d}
                      className={cls}
                      onClick={() => !isPast && !isOrig && handleDayClick(d)}
                    >{d}</div>
                  )
                })}
              </div>

              <div className="rb-legend">
                <div className="rb-leg"><div className="rb-leg-dot rb-leg-avail" />Available</div>
                <div className="rb-leg"><div className="rb-leg-dot rb-leg-orig" />Current slot</div>
                <div className="rb-leg"><div className="rb-leg-dot rb-leg-sel" />Selected</div>
                <div className="rb-leg"><div className="rb-leg-dot rb-leg-past" />Unavailable</div>
              </div>
            </div>

            <div className="rb-slots-col">
              {!selDay ? (
                <div className="rb-slots-placeholder">
                  <div className="rb-slots-placeholder-icon">👆</div>
                  <p>Select a date to see available time slots</p>
                </div>
              ) : loadingSlots ? (
                <div className="rb-slots-placeholder">Loading slots...</div>
              ) : slots.length === 0 ? (
                <div className="rb-slots-placeholder">
                  <div className="rb-slots-placeholder-icon">😕</div>
                  <p>No slots available on this date.</p>
                  <p style={{ fontSize: '0.8rem', color: '#4E7182', marginTop: '0.5rem' }}>
                    Try another day or the technician hasn't set hours yet.
                  </p>
                </div>
              ) : (
                <>
                  <div className="rb-slots-heading">
                    Available on {MONTHS[month]} {selDay}
                  </div>
                  <div className="rb-slots-grid">
                    {slots.map(slot => (
                      <button
                        key={slot.time}
                        className={`rb-slot${!slot.available ? ' rb-slot-taken' : ''}${selTime === slot.time ? ' rb-slot-picked' : ''}`}
                        disabled={!slot.available}
                        onClick={() => slot.available && setSelTime(slot.time)}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {selDay && selTime && (
                <div className="rb-confirm-info">
                  New slot: <strong>{MONTHS[month]} {selDay}, {year}</strong> at <strong>{selTime}</strong>
                </div>
              )}

              <div className="rb-reschedule-actions">
                <button className="rb-btn-secondary" onClick={handleBack}>Keep original</button>
                <button
                  className="rb-btn"
                  onClick={handleConfirm}
                  disabled={!selDay || !selTime || loading}
                >
                  {loading ? 'Rescheduling...' : 'Confirm Reschedule'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
