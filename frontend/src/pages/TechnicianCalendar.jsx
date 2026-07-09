import { useState } from 'react'
import './TechnicianCalendar.css'

const API = 'http://localhost:5000/api/availability'
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export default function TechnicianCalendar({ tech, onBook }) {
  const today = new Date()
  const [month, setMonth] = useState(today.getMonth())
  const [year, setYear] = useState(today.getFullYear())
  const [selectedDay, setSelectedDay] = useState(null)
  const [selectedTime, setSelectedTime] = useState(null)
  const [slots, setSlots] = useState([])
  const [loadingSlots, setLoadingSlots] = useState(false)

  function changeMonth(dir) {
    let m = month + dir
    let y = year
    if (m > 11) { m = 0; y++ }
    if (m < 0) { m = 11; y-- }
    setMonth(m)
    setYear(y)
    setSelectedDay(null)
    setSelectedTime(null)
    setSlots([])
  }

  function selectDay(d) {
    setSelectedDay(d)
    setSelectedTime(null)
    setSlots([])
    if (!tech?.id) return
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    setLoadingSlots(true)
    fetch(`${API}/${tech.id}/slots?date=${dateStr}`)
      .then(r => r.json())
      .then(data => setSlots(data.slots || []))
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false))
  }

  function handleBook() {
    if (onBook) {
      onBook({ day: selectedDay, time: selectedTime, month: months[month], year })
    }
  }

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const days = []
  for (let i = 0; i < firstDay; i++) days.push(null)
  for (let d = 1; d <= daysInMonth; d++) days.push(d)

  return (
    <div className="tc-wrap">
      <div className="tc-head">
        <span className="tc-cal-title">📅 Pick a date</span>
        <div className="tc-nav">
          <button className="tc-nav-btn" onClick={() => changeMonth(-1)}>‹</button>
          <span className="tc-month">{months[month]} {year}</span>
          <button className="tc-nav-btn" onClick={() => changeMonth(1)}>›</button>
        </div>
      </div>

      <div className="tc-legend">
        <div className="tc-leg"><div className="tc-leg-dot tc-leg-avail" />Available</div>
        <div className="tc-leg"><div className="tc-leg-dot tc-leg-booked" />Booked</div>
        <div className="tc-leg"><div className="tc-leg-dot tc-leg-sel" />Selected</div>
      </div>

      <div className="tc-day-headers">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="tc-day-hd">{d}</div>
        ))}
      </div>

      <div className="tc-grid">
        {days.map((d, i) => {
          if (!d) return <div key={`e-${i}`} className="tc-cell tc-empty" />
          const isPast = new Date(year, month, d) < new Date(today.getFullYear(), today.getMonth(), today.getDate())
          const isToday = d === today.getDate() && month === today.getMonth() && year === today.getFullYear()
          const isSelected = selectedDay === d

          let cls = 'tc-cell'
          if (isSelected) cls += ' tc-selected'
          else if (isPast) cls += ' tc-booked'
          else cls += ' tc-available'
          if (isToday) cls += ' tc-today'

          return (
            <div
              key={d}
              className={cls}
              onClick={() => !isPast && selectDay(d)}
            >
              <span className="tc-day-num">{d}</span>
              {!isPast && <span className="tc-open-dot" />}
            </div>
          )
        })}
      </div>

      {selectedDay && (
        <div className="tc-slots">
          <div className="tc-slots-title">Available slots — {months[month]} {selectedDay}</div>
          {loadingSlots && <div className="tc-confirm-info">Loading slots…</div>}
          {!loadingSlots && slots.length === 0 && (
            <div className="tc-confirm-info">No slots available on this day.</div>
          )}
          <div className="tc-slots-grid">
            {slots.map(s => {
              const taken = !s.available
              return (
                <button
                  key={s.time}
                  className={`tc-slot${taken ? ' tc-slot-taken' : ''}${selectedTime === s.time ? ' tc-slot-picked' : ''}`}
                  disabled={taken}
                  onClick={() => !taken && setSelectedTime(s.time)}
                >
                  {s.time}
                </button>
              )
            })}
          </div>

          {selectedTime && (
            <div className="tc-confirm-info">
              📅 <strong>{months[month]} {selectedDay}, {year}</strong> at <strong>{selectedTime}</strong>
              {tech && <> with <strong>{tech.name}</strong></>}
            </div>
          )}

          {selectedTime && (
            <button className="tc-book-btn" onClick={handleBook}>
              ✓ Confirm booking
            </button>
          )}
        </div>
      )}
    </div>
  )
}
