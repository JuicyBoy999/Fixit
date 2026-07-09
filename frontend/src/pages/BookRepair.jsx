import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './BookRepair.css'
import SlotPicker from '../components/availability/SlotPicker'

export default function BookRepair() {
  const navigate = useNavigate()
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

  const storedUser = JSON.parse(localStorage.getItem('user') || '{}')

  useEffect(() => {
    if (storedUser.firstName) setName(`${storedUser.firstName} ${storedUser.lastName || ''}`.trim())
    if (storedUser.email) setEmail(storedUser.email)
  }, [])

  useEffect(() => {
    fetch('http://localhost:5000/api/availability/technicians')
      .then(r => r.json())
      .then(data => { if (data.technicians) setTechnicians(data.technicians) })
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

    try {
      const token = localStorage.getItem('token')
      const res = await fetch('http://localhost:5000/api/repair-requests/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          customer_id:       storedUser.id || null,
          technician_id:     technicianId || null,
          device_type:       deviceType,
          fault_description: issue,
          preferred_date:    date,
          preferred_time:    selectedSlot,
          customer_area:     city,
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
  const selectedTech = technicians.find(t => String(t.id) === String(technicianId))

  if (done) {
    return (
      <div className="br-page">
        <aside className="br-sidebar">
          <div className="br-brand">⚡ Fixit</div>
          <div className="br-sidebar-info">
            <h2 className="br-sidebar-heading">Booking confirmed!</h2>
            <p className="br-sidebar-sub">Your technician will be in touch shortly to confirm the appointment.</p>
          </div>
          <div className="br-sidebar-steps">
            <div className="br-stp br-stp--done">
              <div className="br-stp-num">✓</div>
              <div>
                <div className="br-stp-label">Repair Details</div>
                <div className="br-stp-sub">{deviceType}</div>
              </div>
            </div>
            <div className="br-stp-line" />
            <div className="br-stp br-stp--done">
              <div className="br-stp-num">✓</div>
              <div>
                <div className="br-stp-label">Contact Info</div>
                <div className="br-stp-sub">{name}</div>
              </div>
            </div>
          </div>
        </aside>

        <main className="br-main">
          <div className="br-success-wrap">
            <div className="br-success-icon">✓</div>
            <h1 className="br-success-heading">You're all set!</h1>
            <p className="br-success-msg">Your repair has been booked. A certified technician will contact you shortly.</p>
            <div className="br-confirm-box">
              <div className="br-confirm-row"><span>Device</span><span>{deviceType}</span></div>
              <div className="br-confirm-row"><span>City</span><span>{city}</span></div>
              <div className="br-confirm-row"><span>Technician</span><span>{selectedTech ? `${selectedTech.first_name} ${selectedTech.last_name}` : '—'}</span></div>
              <div className="br-confirm-row"><span>Date</span><span>{date}</span></div>
              <div className="br-confirm-row"><span>Time</span><span>{selectedSlot}</span></div>
              <div className="br-confirm-row"><span>Name</span><span>{name}</span></div>
              <div className="br-confirm-row"><span>Phone</span><span>{phone}</span></div>
            </div>
            <button className="br-btn" onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="br-page">
      <aside className="br-sidebar">
        <div className="br-brand">⚡ Fixit</div>
        <div className="br-sidebar-info">
          <h2 className="br-sidebar-heading">Book a repair in minutes.</h2>
          <p className="br-sidebar-sub">Certified technicians. Same-day service. 90-day warranty on every repair.</p>
        </div>
        <div className="br-sidebar-steps">
          <div className={`br-stp ${step >= 1 ? 'br-stp--active' : ''} ${step > 1 ? 'br-stp--done' : ''}`}>
            <div className="br-stp-num">{step > 1 ? '✓' : '1'}</div>
            <div>
              <div className="br-stp-label">Repair Details</div>
              <div className="br-stp-sub">Device, issue & schedule</div>
            </div>
          </div>
          <div className="br-stp-line" />
          <div className={`br-stp ${step >= 2 ? 'br-stp--active' : ''}`}>
            <div className="br-stp-num">2</div>
            <div>
              <div className="br-stp-label">Contact Info</div>
              <div className="br-stp-sub">Your name & address</div>
            </div>
          </div>
        </div>
        <div className="br-sidebar-trust">
          <div className="br-trust-item"><span className="br-trust-icon">🛡</span><span>90-day warranty</span></div>
          <div className="br-trust-item"><span className="br-trust-icon">⚡</span><span>Same-day service</span></div>
          <div className="br-trust-item"><span className="br-trust-icon">✓</span><span>Certified techs</span></div>
        </div>
      </aside>

      <main className="br-main">
        <div className="br-main-top">
          <div>
            <h1 className="br-main-heading">{step === 1 ? 'Repair Details' : 'Contact Info'}</h1>
            <p className="br-main-sub">{step === 1 ? 'Tell us about your device and schedule a slot.' : 'Where should we send the technician?'}</p>
          </div>
          <button className="br-close-btn" onClick={() => navigate('/dashboard')}>✕ Cancel</button>
        </div>

        {error && <div className="br-error">{error}</div>}

        {step === 1 && (
          <div className="br-form">
            <div className="br-form-grid">
              <div className="br-field">
                <label className="br-label">Device Type</label>
                <select className="br-input" value={deviceType} onChange={e => setDeviceType(e.target.value)}>
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
                <label className="br-label">City</label>
                <select className="br-input" value={city} onChange={e => setCity(e.target.value)}>
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
            </div>

            <div className="br-field">
              <label className="br-label">Describe the Issue</label>
              <textarea
                className="br-input br-textarea"
                placeholder="Eg. Screen is cracked, won't turn on, battery drains fast..."
                value={issue}
                onChange={e => setIssue(e.target.value)}
                rows={4}
              />
            </div>

            <div className="br-form-grid">
              <div className="br-field">
                <label className="br-label">Select Technician</label>
                <select className="br-input" value={technicianId} onChange={e => { setTechnicianId(e.target.value); setSelectedSlot('') }}>
                  <option value="" disabled>Select a technician...</option>
                  {technicians.map(t => (
                    <option key={t.id} value={t.id}>{t.first_name} {t.last_name} — {t.city}</option>
                  ))}
                </select>
              </div>

              <div className="br-field">
                <label className="br-label">Preferred Date</label>
                <input
                  type="date"
                  className="br-input"
                  value={date}
                  min={today}
                  onChange={e => { setDate(e.target.value); setSelectedSlot('') }}
                />
              </div>
            </div>

            {date && technicianId && (
              <div className="br-field">
                <label className="br-label">Available Time Slots</label>
                <SlotPicker
                  technicianId={technicianId}
                  date={date}
                  selectedSlot={selectedSlot}
                  onSelect={setSelectedSlot}
                />
                {selectedSlot && (
                  <small className="br-hint-ok">✓ Selected: {selectedSlot}</small>
                )}
              </div>
            )}

            <div className="br-actions">
              <button className="br-btn-secondary" onClick={() => navigate('/dashboard')}>Cancel</button>
              <button className="br-btn" onClick={handleStep1}>Continue →</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <form className="br-form" onSubmit={handleSubmit}>
            <div className="br-form-grid">
              <div className="br-field">
                <label className="br-label">Full Name</label>
                <input
                  type="text"
                  className="br-input"
                  placeholder="Salaj Chaudhary"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>

              <div className="br-field">
                <label className="br-label">Phone Number</label>
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
            </div>

            <div className="br-field">
              <label className="br-label">Email Address</label>
              <input
                type="email"
                className="br-input"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            <div className="br-field">
              <label className="br-label">Address / Landmark</label>
              <input
                type="text"
                className="br-input"
                placeholder="e.g. Near Basantapur, Thamel"
                value={address}
                onChange={e => setAddress(e.target.value)}
              />
            </div>

            <div className="br-summary">
              <div className="br-summary-title">Booking Summary</div>
              <div className="br-summary-grid">
                <span className="br-summary-key">Device</span><span>{deviceType}</span>
                <span className="br-summary-key">Technician</span><span>{selectedTech ? `${selectedTech.first_name} ${selectedTech.last_name}` : '—'}</span>
                <span className="br-summary-key">Date</span><span>{date}</span>
                <span className="br-summary-key">Time</span><span>{selectedSlot}</span>
                <span className="br-summary-key">City</span><span>{city}</span>
              </div>
            </div>

            <div className="br-actions">
              <button type="button" className="br-btn-secondary" onClick={() => { setStep(1); setError('') }}>← Back</button>
              <button type="submit" className="br-btn">Confirm Booking</button>
            </div>
          </form>
        )}
      </main>
    </div>
  )
}
