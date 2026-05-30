import { useState } from 'react'
import './TechnicianCalendar.css'

const bookedDates = [3, 7, 10, 14, 17, 21, 24]
const bookedSlots = {
  26: ['9:00 AM', '2:00 PM'],
  27: ['11:00 AM'],
  28: ['9:00 AM', '10:00 AM', '3:00 PM'],
  30: ['1:00 PM', '4:00 PM'],
}
const allSlots = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM']
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export default function TechnicianCalendar({ tech, onBook }) {
  const [month, setMonth] = useState(4)
  const [year, setYear] = useState(2026)
  const [selectedDay, setSelectedDay] = useState(null)
  const [selectedTime, setSelectedTime] = useState(null)

  const today = new Date()

  function changeMonth(dir) {
    let m = month + dir
    let y = year
    if (m > 11) { m = 0; y++ }
    if (m < 0) { m = 11; y-- }
    setMonth(m)
    setYear(y)
    setSelectedDay(null)
    setSelectedTime(null)
  }

  function selectDay(d) {
    setSelectedDay(d)
    setSelectedTime(null)
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
          const isBooked = bookedDates.includes(d)
          const isToday = d === today.getDate() && month === today.getMonth() && year === today.getFullYear()
          const isSelected = selectedDay === d

          let cls = 'tc-cell'
          if (isSelected) cls += ' tc-selected'
          else if (isBooked || isPast) cls += ' tc-booked'
          else cls += ' tc-available'
          if (isToday) cls += ' tc-today'

          return (
            <div
              key={d}
              className={cls}
              onClick={() => !isBooked && !isPast && selectDay(d)}
            >
              <span className="tc-day-num">{d}</span>
              {!isPast && !isBooked && <span className="tc-open-dot" />}
            </div>
          )
        })}
      </div>

      {selectedDay && (
        <div className="tc-slots">
          <div className="tc-slots-title">Available slots — {months[month]} {selectedDay}</div>
          <div className="tc-slots-grid">
            {allSlots.map(slot => {
              const taken = (bookedSlots[selectedDay] || []).includes(slot)
              return (
                <button
                  key={slot}
                  className={`tc-slot${taken ? ' tc-slot-taken' : ''}${selectedTime === slot ? ' tc-slot-picked' : ''}`}
                  disabled={taken}
                  onClick={() => !taken && setSelectedTime(slot)}
                >
                  {slot}
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
