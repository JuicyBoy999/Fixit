import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './BookRepair.css'
import SlotPicker from '../components/availability/SlotPicker'
import logo from '../assets/image.png'

const API = 'http://localhost:5000'

export default function BookRepair() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [deviceType, setDeviceType] = useState('')
  const [issue, setIssue] = useState('')
  const [city, setCity] = useState('')
  const [date, setDate] = useState('')
  const [selectedSlot, setSelectedSlot] = useState('')
  const [technicians, setTechnicians] = useState([])
  const [technicianId, setTechnicianId] = useState('')
  const [name, setName] = useState(() => {
    const u = JSON.parse(localStorage.getItem('user') || '{}')
    return `${u.firstName || ''} ${u.lastName || ''}`.trim()
  })
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState(() => {
    const u = JSON.parse(localStorage.getItem('user') || '{}')
    return u.email || ''
  })
  const [address, setAddress] = useState('')
  const [photoPreview, setPhotoPreview] = useState(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [estimate, setEstimate] = useState(null)
  const [loadingEstimate, setLoadingEstimate] = useState(false)

  function handlePhoto(e) {
    const file = e.target.files[0]
    if (!file) return
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setError('Only JPG and PNG files are supported.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Photo must be under 5 MB.')
      return
    }
    const reader = new FileReader()
    reader.onload = ev => setPhotoPreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  const storedUser = JSON.parse(localStorage.getItem('user') || '{}')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) navigate('/login')
  }, [navigate])

  useEffect(() => {
    fetch(`${API}/api/availability/technicians`)
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

  async function handleStep2() {
    if (!name.trim()) { setError('Please enter your full name.'); return }
    if (phone.length !== 10) { setError('Phone number must be exactly 10 digits.'); return }
    if (!email.trim()) { setError('Please enter your email address.'); return }
    setError('')
    setLoadingEstimate(true)
    setStep(3)

    try {
      const res = await fetch(`${API}/api/pricing/estimate?deviceType=${encodeURIComponent(deviceType)}`)
      const data = await res.json()
      if (res.ok) {
        setEstimate(data.estimate)
      } else {
        setError(data.message || 'Failed to calculate estimate')
      }
    } catch {
      setError('Connection error while fetching estimate')
    } finally {
      setLoadingEstimate(false)
    }
  }

  async function handleSubmit() {
    setError('')
    setSaving(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API}/api/repair-requests/create`, {
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
          photo_url:         photoPreview || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Booking failed. Try again.')
        if (res.status === 401) navigate('/login')
        return
      }

      const payRes = await fetch(`${API}/api/payments/esewa/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repairRequestId: data.request.id,
          amount: estimate?.subtotal || 0,
        }),
      })
      const payData = await payRes.json()
      if (!payRes.ok) {
        setError(payData.error || 'Could not start payment. Try again.')
        return
      }

      const form = document.createElement('form')
      form.method = 'POST'
      form.action = payData.formUrl
      Object.entries(payData.fields).forEach(([key, value]) => {
        const input = document.createElement('input')
        input.type = 'hidden'
        input.name = key
        input.value = value
        form.appendChild(input)
      })
      document.body.appendChild(form)
      form.submit()
    } catch {
      setError('Cannot connect to server. Make sure backend is running.')
      setSaving(false)
    }
  }

  const today = new Date().toISOString().split('T')[0]
  const selectedTech = technicians.find(t => String(t.id) === String(technicianId))

  return (
    <div className="br-page">
      <aside className="br-sidebar">
        <div className="br-brand"><img src={logo} alt="Fixit" className="brand-logo-img" /> Fixit</div>
        <div className="br-sidebar-info">
          <h2 className="br-sidebar-heading">Book a repair in minutes.</h2>
          <p className="br-sidebar-sub">Certified technicians. Same-day service. 90-day warranty on every repair.</p>
        </div>
        <div className="br-sidebar-steps">
          <div className={`br-stp ${step >= 1 ? 'br-stp--active' : ''} ${step > 1 ? 'br-stp--done' : ''}`}>
            <div className="br-stp-num">{step > 1 ? '✓' : '1'}</div>
            <div>
              <div className="br-stp-label">Repair Details</div>
              <div className="br-stp-sub">Device, issue and schedule</div>
            </div>
          </div>
          <div className="br-stp-line" />
          <div className={`br-stp ${step >= 2 ? 'br-stp--active' : ''} ${step > 2 ? 'br-stp--done' : ''}`}>
            <div className="br-stp-num">{step > 2 ? '✓' : '2'}</div>
            <div>
              <div className="br-stp-label">Contact Info</div>
              <div className="br-stp-sub">Your name and address</div>
            </div>
          </div>
          <div className="br-stp-line" />
          <div className={`br-stp ${step >= 3 ? 'br-stp--active' : ''}`}>
            <div className="br-stp-num">3</div>
            <div>
              <div className="br-stp-label">Estimate and Confirm</div>
              <div className="br-stp-sub">Review cost and confirm</div>
            </div>
          </div>
        </div>
        <div className="br-sidebar-trust">
          <div className="br-trust-item"><span className="br-trust-icon">shield</span><span>90-day warranty</span></div>
          <div className="br-trust-item"><span className="br-trust-icon">bolt</span><span>Same-day service</span></div>
          <div className="br-trust-item"><span className="br-trust-icon">check</span><span>Certified techs</span></div>
        </div>
      </aside>

      <main className="br-main">
        <div className="br-main-top">
          <div>
            <h1 className="br-main-heading">
              {step === 1 ? 'Repair Details' : step === 2 ? 'Contact Info' : 'Estimate and Confirm'}
            </h1>
            <p className="br-main-sub">
              {step === 1
                ? 'Tell us about your device and schedule a slot.'
                : step === 2
                ? 'Where should we send the technician?'
                : 'Review your upfront cost estimate before confirming.'}
            </p>
          </div>
          <button className="br-close-btn" onClick={() => navigate('/dashboard')}>X Cancel</button>
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
                placeholder="Eg. Screen is cracked, wont turn on, battery drains fast..."
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
                    <option key={t.id} value={t.id}>{t.first_name} {t.last_name} - {t.city}</option>
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

            <div className="br-field">
              <label className="br-label">Photo of Device <span className="br-optional">(optional — JPG/PNG, max 5 MB)</span></label>
              <label className="br-upload-label">
                {photoPreview ? (
                  <div className="br-photo-preview">
                    <img src={photoPreview} alt="Device preview" className="br-photo-img" />
                    <span className="br-photo-change">Click to change</span>
                  </div>
                ) : (
                  <div className="br-upload-box">
                    <span className="br-upload-icon">📷</span>
                    <span>Click to upload a photo</span>
                    <small>Helps the technician diagnose in advance</small>
                  </div>
                )}
                <input type="file" accept="image/jpeg,image/png" onChange={handlePhoto} style={{ display: 'none' }} />
              </label>
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
                  <small className="br-hint-ok">Selected: {selectedSlot}</small>
                )}
              </div>
            )}

            <div className="br-actions">
              <button className="br-btn-secondary" onClick={() => navigate('/dashboard')}>Cancel</button>
              <button className="br-btn" onClick={handleStep1}>Continue</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="br-form">
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
                <span className="br-summary-key">Technician</span><span>{selectedTech ? `${selectedTech.first_name} ${selectedTech.last_name}` : '-'}</span>
                <span className="br-summary-key">Date</span><span>{date}</span>
                <span className="br-summary-key">Time</span><span>{selectedSlot}</span>
                <span className="br-summary-key">City</span><span>{city}</span>
              </div>
            </div>

            <div className="br-actions">
              <button className="br-btn-secondary" onClick={() => { setStep(1); setError('') }}>Back</button>
              <button className="br-btn" onClick={handleStep2}>View Estimate</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="br-form">
            <div className="br-summary">
              <div className="br-summary-title">Booking Summary</div>
              <div className="br-summary-grid">
                <span className="br-summary-key">Device</span><span>{deviceType}</span>
                <span className="br-summary-key">Technician</span><span>{selectedTech ? `${selectedTech.first_name} ${selectedTech.last_name}` : '-'}</span>
                <span className="br-summary-key">Date</span><span>{date}</span>
                <span className="br-summary-key">Time</span><span>{selectedSlot}</span>
                <span className="br-summary-key">City</span><span>{city}</span>
              </div>
            </div>

            <div className="br-estimate-box">
              <h3 className="br-estimate-title">Cost Estimate</h3>
              {loadingEstimate ? (
                <p className="br-estimate-loading">Calculating your estimate...</p>
              ) : estimate ? (
                <>
                  <div className="br-estimate-list">
                    {estimate.items.map((item, idx) => (
                      <div key={idx} className="br-estimate-row">
                        <span className="br-item-label">{item.label}</span>
                        <span className="br-item-amount">
                          {item.type === 'variable'
                            ? `NPR ${item.amount}`
                            : `NPR ${Number(item.amount).toLocaleString()}`}
                          {item.type === 'variable' && ' *'}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="br-estimate-total">
                    <span>Estimated Total (excl. parts)</span>
                    <span>NPR {Number(estimate.subtotal).toLocaleString()}</span>
                  </div>
                  <p className="br-estimate-note">
                    * Parts marked with * are estimates. Final price depends on specific parts required.
                  </p>
                </>
              ) : (
                <p className="br-estimate-unavail">Estimate unavailable - you can still proceed with the booking.</p>
              )}
            </div>

            <div className="br-actions">
              <button className="br-btn-secondary" onClick={() => { setStep(2); setError('') }}>Back</button>
              <button className="br-btn" onClick={handleSubmit} disabled={saving || loadingEstimate}>
                {saving ? 'Processing...' : 'Confirm Booking'}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
