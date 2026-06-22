import { useState, useEffect } from 'react'
import './BookRepair.css'
import SlotPicker from '../components/availability/SlotPicker'

export default function BookRepair() {
  const [step, setStep] = useState(1)
  const [deviceType, setDeviceType] = useState('')
  const [issue, setIssue] = useState('')
  const [city, setCity] = useState('')
  const [date, setDate] = useState('')
  const [selectedSlot, setSelectedSlot] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [technicians, setTechnicians] = useState([])
  const [technicianId, setTechnicianId] = useState('')

  useEffect(() => {
    fetch('http://localhost:5000/api/availability/technicians')
      .then(r => r.json())
      .then(data => {
        if (data.technicians) setTechnicians(data.technicians)
      })
      .catch(() => {})
  }, [])

  function handlePhone(e) {
    const val = e.target.value.replace(/\D/g, '')
    if (val.length <= 10) setPhone(val)
  }

  function handleStep1() {
    if (!deviceType) { setError('Please select a device type.'); return }
    if (!issue.trim()) { setError('Please describe the issue.'); return }
    if (!city) { setError('Please select a city.'); return }
    if (!technicianId) { setError('Please select a technician.'); return }
    if (!date) { setError('Please select a preferred date.'); return }
    if (!selectedSlot) { setError('Please select an available time slot.'); return }
    setError('')
    setStep(2)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) { setError('Please enter your full name.'); return }
    if (phone.length !== 10) { setError('Phone number must be exactly 10 digits.'); return }
    if (!email.trim()) { setError('Please enter your email address.'); return }
    setError('')

    const storedUser = JSON.parse(localStorage.getItem('user') || '{}')

    try {
      const res = await fetch('http://localhost:5000/api/repair-requests/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id:       storedUser.id || null,
          technician_id:     technicianId || null,
          device_type:       deviceType,
          fault_description: issue,
          preferred_date:    date,
          preferred_time:    selectedSlot,
          customer_area:     city,
          customer_email:    email,
          customer_name:     name,
          address:           address,
          photo_url:         null,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Booking failed. Try again.'); return }
      setDone(true)
    } catch {
      setError('Network error. Please try again.')
    }
  }

  const today = new Date().toISOString().split('T')[0]

  if (done) {
    return (
      <div className="br-page">
        <div className="br-modal">
          <div className="br-header">
            <div className="br-header-left">
              <div className="br-logo">⚡</div>
              <div>
                <div className="br-title">Booking Confirmed!</div>
                <div className="br-subtitle">We will contact you shortly</div>
              </div>
            </div>
          </div>
          <div className="br-body">
            <div className="br-success-icon">✓</div>
            <p className="br-success-msg">Your repair has been booked successfully. A certified technician will be assigned to you.</p>
            <div className="br-confirm-box">
              <div className="br-confirm-row">
                <span>Device</span>
                <span>{deviceType}</span>
              </div>
              <div className="br-confirm-row">
                <span>City</span>
                <span>{city}</span>
              </div>
              <div className="br-confirm-row">
                <span>Technician</span>
                <span>{technicians.find(t => String(t.id) === String(technicianId))?.first_name} {technicians.find(t => String(t.id) === String(technicianId))?.last_name}</span>
              </div>
              <div className="br-confirm-row">
                <span>Date</span>
                <span>{date}</span>
              </div>
              <div className="br-confirm-row">
                <span>Time</span>
                <span>{selectedSlot}</span>
              </div>
              <div className="br-confirm-row">
                <span>Name</span>
                <span>{name}</span>
              </div>
              <div className="br-confirm-row">
                <span>Phone</span>
                <span>{phone}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="br-page">
      <div className="br-modal">
        <div className="br-header">
          <div className="br-header-left">
            <div className="br-logo">⚡</div>
            <div>
              <div className="br-title">Book a Repair</div>
              <div className="br-subtitle">Fast, certified, at your home</div>
            </div>
          </div>
          <button className="br-close" onClick={() => window.history.back()}>✕</button>
        </div>

        <div className="br-body">
          <div className="br-steps">
            <div className={`br-step-circle ${step >= 1 ? 'active' : ''}`}>1</div>
            <div className={`br-step-label ${step === 1 ? 'active' : ''}`}>Repair Details</div>
            <div className="br-step-line" />
            <div className={`br-step-circle ${step >= 2 ? 'active' : ''}`}>2</div>
            <div className={`br-step-label ${step === 2 ? 'active' : ''}`}>Contact Info</div>
          </div>

          {error && <div className="br-error">{error}</div>}

          {step === 1 && (
            <div className="br-form">
              <div className="br-field">
                <div className="br-field-label">
                  <span className="br-field-icon">📱</span>
                  DEVICE TYPE
                </div>
                <select
                  className="br-input"
                  value={deviceType}
                  onChange={e => setDeviceType(e.target.value)}
                >
                  <option value="" disabled>Select device type...</option>
                  <option>Smartphone</option>
                  <option>Laptop</option>
                  <option>TV</option>
                  <option>Desktop</option>
                  <option>Tablet</option>
                  <option>Gaming Console</option>
                  <option>Home Appliance</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="br-field">
                <div className="br-field-label">
                  <span className="br-field-icon">💬</span>
                  DESCRIBE THE ISSUE
                </div>
                <textarea
                  className="br-input br-textarea"
                  placeholder="Eg. Screen is cracked, won't turn on, battery drains fast...."
                  value={issue}
                  onChange={e => setIssue(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="br-row">
                <div className="br-field">
                  <div className="br-field-label">
                    <span className="br-field-icon">📍</span>
                    CITY
                  </div>
                  <select
                    className="br-input"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                  >
                    <option value="" disabled>Select city...</option>
                    <option>Kathmandu</option>
                    <option>Lalitpur</option>
                    <option>Bhaktapur</option>
                    <option>Pokhara</option>
                    <option>Biratnagar</option>
                    <option>Birgunj</option>
                    <option>Butwal</option>
                    <option>Dharan</option>
                  </select>
                </div>

                <div className="br-field">
                  <div className="br-field-label">
                    <span className="br-field-icon">📅</span>
                    PREFERRED DATE
                  </div>
                  <input
                    type="date"
                    className="br-input"
                    value={date}
                    min={today}
                    onChange={e => { setDate(e.target.value); setSelectedSlot('') }}
                  />
                </div>
              </div>

              <div className="br-field">
                <div className="br-field-label">
                  <span className="br-field-icon">🔧</span>
                  SELECT TECHNICIAN
                </div>
                <select
                  className="br-input"
                  value={technicianId}
                  onChange={e => { setTechnicianId(e.target.value); setSelectedSlot('') }}
                >
                  <option value="" disabled>Select a technician...</option>
                  {technicians.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.first_name} {t.last_name} — {t.city}
                    </option>
                  ))}
                </select>
              </div>

              {date && technicianId && (
                <div className="br-field">
                  <div className="br-field-label">
                    <span className="br-field-icon">🕐</span>
                    PREFERRED TIME
                  </div>
                  <SlotPicker
                    technicianId={technicianId}
                    date={date}
                    selectedSlot={selectedSlot}
                    onSelect={setSelectedSlot}
                  />
                  {selectedSlot && (
                    <small className="br-hint" style={{ color: '#15803d' }}>
                      ✓ Selected: {selectedSlot}
                    </small>
                  )}
                </div>
              )}

              <button className="br-btn" onClick={handleStep1}>
                Continue
              </button>
            </div>
          )}

          {step === 2 && (
            <form className="br-form" onSubmit={handleSubmit}>
              <div className="br-field">
                <div className="br-field-label">
                  <span className="br-field-icon">👤</span>
                  FULL NAME
                </div>
                <input
                  type="text"
                  className="br-input"
                  placeholder="Salaj Chaudhary"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>

              <div className="br-field">
                <div className="br-field-label">
                  <span className="br-field-icon">📞</span>
                  PHONE NUMBER
                </div>
                <input
                  type="tel"
                  className="br-input"
                  placeholder="9XXXXXXXXX"
                  value={phone}
                  onChange={handlePhone}
                  inputMode="numeric"
                  maxLength={10}
                />
                {phone.length > 0 && phone.length < 10 && (
                  <small className="br-hint">{10 - phone.length} more digits needed</small>
                )}
              </div>

              <div className="br-field">
                <div className="br-field-label">
                  <span className="br-field-icon">✉️</span>
                  EMAIL ADDRESS
                </div>
                <input
                  type="email"
                  className="br-input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>

              <div className="br-field">
                <div className="br-field-label">
                  <span className="br-field-icon">🏠</span>
                  ADDRESS / LANDMARK
                </div>
                <input
                  type="text"
                  className="br-input"
                  placeholder="e.g. Near Basantapur, Thamel"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                />
              </div>

              <button type="submit" className="br-btn">
                Confirm Booking
              </button>

              <p className="br-back" onClick={() => { setStep(1); setError('') }}>
                ← Back to repair details
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}