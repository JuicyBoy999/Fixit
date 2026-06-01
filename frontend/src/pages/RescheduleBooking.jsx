import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './RescheduleBooking.css'

const MOCK_BOOKINGS = [
  { id: 1, device: 'Laptop', issue: 'Screen is cracked', date: '2026-06-03', time: '10:00 AM', tech: 'Ram Kumar', city: 'Kathmandu', status: 'Pending' },
  { id: 2, device: 'Smartphone', issue: 'Battery drains fast', date: '2026-06-05', time: '2:00 PM', tech: 'Sita Maharjan', city: 'Kathmandu', status: 'Confirmed' },
  { id: 3, device: 'TV', issue: 'Screen flickering', date: '2026-06-08', time: '11:00 AM', tech: 'Bikash Pradhan', city: 'Lalitpur', status: 'Confirmed' },
]

const UNAVAIL_DAYS = [4, 7, 11, 14, 17, 21, 24, 28]
const TAKEN_SLOTS = { 9: ['9:00 AM'], 10: ['2:00 PM'], 12: ['11:00 AM', '3:00 PM'], 15: ['9:00 AM', '10:00 AM'], 20: ['1:00 PM'] }
const ALL_SLOTS = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

export default function RescheduleBooking() {
  const navigate = useNavigate()
  const [step, setStep] = useState('select')
  const [selected, setSelected] = useState(null)
  const [month, setMonth] = useState(5)
  const [year, setYear] = useState(2026)
  const [selDay, setSelDay] = useState(null)
  const [selTime, setSelTime] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const today = new Date()

  function handleSelect(booking) {
    setSelected(booking)
    setStep('reschedule')
    setError('')
    setSelDay(null)
    setSelTime(null)
  }

  function handleBack() {
    setStep('select')
    setSelected(null)
    setError('')
    setSelDay(null)
    setSelTime(null)
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
  }

  function handleDayClick(d) {
    setSelDay(d)
    setSelTime(null)
    setError('')
  }

  async function handleConfirm() {
    if (!selDay || !selTime) { setError('Please select a date and time slot.'); return }
    setError('')
    setLoading(true)
    try {
      await new Promise(r => setTimeout(r, 800))
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

  return (
    <div className="rb-page">
      <div className="rb-modal">

        <div className="rb-header">
          <div className="rb-header-left">
            <div className="rb-logo">⚡</div>
            <div>
              <div className="rb-title">Reschedule Booking</div>
              <div className="rb-subtitle">Pick a new date and time</div>
            </div>
          </div>
          {step === 'reschedule' && (
            <button className="rb-back" onClick={handleBack}>← Back</button>
          )}
        </div>

        <div className="rb-body">

          {step === 'select' && (
            <>
              <p className="rb-instruction">Select a booking to reschedule:</p>
              <div className="rb-list">
                {MOCK_BOOKINGS.map(b => (
                  <div key={b.id} className="rb-item" onClick={() => handleSelect(b)}>
                    <div className="rb-item-left">
                      <div className="rb-device-icon">
                        {b.device === 'Laptop' ? '💻' : b.device === 'Smartphone' ? '📱' : '📺'}
                      </div>
                      <div className="rb-item-info">
                        <div className="rb-item-name">{b.device} repair</div>
                        <div className="rb-item-meta">{b.tech} · {b.date} · {b.time}</div>
                      </div>
                    </div>
                    <span className={`rb-badge ${b.status === 'Pending' ? 'rb-badge-pending' : 'rb-badge-confirmed'}`}>
                      {b.status}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}

          {step === 'reschedule' && selected && (
            <>
              <div className="rb-current">
                <div className="rb-current-label">Current slot</div>
                <div className="rb-current-val">{selected.device} · {selected.date} · {selected.time} · {selected.tech}</div>
              </div>

              <div className="rb-cal-head">
                <button className="rb-nav-btn" onClick={() => changeMonth(-1)}>‹</button>
                <span className="rb-month">{MONTHS[month]} {year}</span>
                <button className="rb-nav-btn" onClick={() => changeMonth(1)}>›</button>
              </div>

              <div className="rb-legend">
                <div className="rb-leg"><div className="rb-leg-dot rb-leg-avail" />Available</div>
                <div className="rb-leg"><div className="rb-leg-dot rb-leg-taken" />Unavailable</div>
                <div className="rb-leg"><div className="rb-leg-dot rb-leg-orig" />Current</div>
                <div className="rb-leg"><div className="rb-leg-dot rb-leg-sel" />Selected</div>
              </div>

              <div className="rb-day-headers">
                {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
                  <div key={d} className="rb-day-hd">{d}</div>
                ))}
              </div>

              <div className="rb-grid">
                {days.map((d, i) => {
                  if (!d) return <div key={`e-${i}`} className="rb-cell rb-empty" />
                  const isPast = new Date(year, month, d) < new Date(today.getFullYear(), today.getMonth(), today.getDate())
                  const isUnavail = UNAVAIL_DAYS.includes(d) || isPast
                  const origDate = selected.date.split('-')
                  const isOrig = d === parseInt(origDate[2]) && month === parseInt(origDate[1]) - 1 && year === parseInt(origDate[0])
                  const isSel = selDay === d

                  let cls = 'rb-cell'
                  if (isSel) cls += ' rb-sel'
                  else if (isOrig) cls += ' rb-orig'
                  else if (isUnavail) cls += ' rb-unavail'
                  else cls += ' rb-avail'

                  return (
                    <div
                      key={d}
                      className={cls}
                      onClick={() => !isUnavail && !isOrig && handleDayClick(d)}
                    >
                      {d}
                    </div>
                  )
                })}
              </div>

              {selDay && (
                <div className="rb-slots">
                  <div className="rb-slots-label">Available times — {MONTHS[month]} {selDay}</div>
                  <div className="rb-slots-grid">
                    {ALL_SLOTS.map(slot => {
                      const taken = (TAKEN_SLOTS[selDay] || []).includes(slot)
                      return (
                        <button
                          key={slot}
                          className={`rb-slot${taken ? ' rb-slot-taken' : ''}${selTime === slot ? ' rb-slot-picked' : ''}`}
                          disabled={taken}
                          onClick={() => !taken && setSelTime(slot)}
                        >
                          {slot}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {selDay && selTime && (
                <div className="rb-confirm-info">
                  → New slot: <strong>{MONTHS[month]} {selDay}, {year}</strong> at <strong>{selTime}</strong> with <strong>{selected.tech}</strong>
                </div>
              )}

              {error && <div className="rb-error">{error}</div>}

              <button
                className="rb-confirm-btn"
                onClick={handleConfirm}
                disabled={!selDay || !selTime || loading}
              >
                {loading ? 'Rescheduling...' : 'Confirm reschedule'}
              </button>

              <button className="rb-keep-btn" onClick={handleBack}>
                Keep original booking
              </button>
            </>
          )}

          {step === 'success' && selected && (
            <>
              <div className="rb-icon-wrap">
                <div className="rb-icon-circle">✓</div>
              </div>
              <h2 className="rb-heading">Booking Rescheduled!</h2>
              <p className="rb-thanks">
                Your <strong>{selected.device} repair</strong> has been moved to a new slot.
              </p>
              <p className="rb-desc">
                <strong>{selected.tech}</strong> has been notified of the change.
                Your original slot on <strong>{selected.date}</strong> is now free for others.
              </p>

              <div className="rb-details">
                <div className="rb-detail-row">
                  <span className="rb-detail-label">Device</span>
                  <span className="rb-detail-val">{selected.device}</span>
                </div>
                <div className="rb-detail-row">
                  <span className="rb-detail-label">Original slot</span>
                  <span className="rb-detail-val rb-old-val">{selected.date} · {selected.time}</span>
                </div>
                <div className="rb-detail-row">
                  <span className="rb-detail-label">New slot</span>
                  <span className="rb-detail-val rb-new-val">{MONTHS[month]} {selDay}, {year} · {selTime}</span>
                </div>
                <div className="rb-detail-row rb-detail-last">
                  <span className="rb-detail-label">Technician</span>
                  <span className="rb-detail-val">{selected.tech}</span>
                </div>
              </div>

              <div className="rb-notifs">
                <span className="rb-notif">✉ Email sent to you</span>
                <span className="rb-notif">🔔 Technician notified</span>
                <span className="rb-notif">📅 Original slot freed</span>
              </div>

              <button className="rb-done-btn" onClick={() => navigate('/dashboard')}>
                Done
              </button>

              <button className="rb-book-btn" onClick={() => navigate('/book')}>
                Book another repair
              </button>
            </>
          )}

        </div>
      </div>
    </div>
  )
}
