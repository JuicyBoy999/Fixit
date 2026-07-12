import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import logo from '../assets/image.png'
import './Profile.css'

export default function Profile() {
  const navigate = useNavigate()
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
  const dashboardPath = storedUser.role === 'technician' ? '/technician-dashboard' : '/dashboard'

  const [firstName, setFirstName] = useState(storedUser.firstName || '')
  const [lastName, setLastName] = useState(storedUser.lastName || '')
  const [email, setEmail] = useState(storedUser.email || '')
  const [phone, setPhone] = useState(storedUser.phone || '')
  const [city, setCity] = useState(storedUser.city || 'kathmandu')
  const [address, setAddress] = useState(storedUser.address || '')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const isTechnician = storedUser.role === 'technician'
  const [techTitle, setTechTitle] = useState('')
  const [techBio, setTechBio] = useState('')
  const [techSkills, setTechSkills] = useState('')
  const [techYears, setTechYears] = useState('')
  const [techRate, setTechRate] = useState('')
  const [techError, setTechError] = useState('')
  const [techSuccess, setTechSuccess] = useState(false)
  const [techSaving, setTechSaving] = useState(false)

  useEffect(() => {
    if (!isTechnician) return
    const token = localStorage.getItem('token')
    fetch('http://localhost:5000/api/technicians/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        const t = data.technician
        if (!t) return
        setTechTitle(t.title || '')
        setTechBio(t.bio || '')
        setTechSkills((t.skills || []).join(', '))
        setTechYears(t.years_experience ?? '')
        setTechRate(t.hourly_rate ?? '')
      })
      .catch(() => {})
  }, [isTechnician])

  async function handleTechSubmit(e) {
    e.preventDefault()
    setTechError('')
    setTechSuccess(false)
    setTechSaving(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('http://localhost:5000/api/technicians/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: techTitle,
          bio: techBio,
          skills: techSkills,
          years_experience: techYears === '' ? null : Number(techYears),
          hourly_rate: techRate === '' ? null : Number(techRate),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setTechError(data.message || 'Failed to save professional profile.')
        return
      }
      setTechSuccess(true)
    } catch {
      setTechError('Cannot connect to server.')
    } finally {
      setTechSaving(false)
    }
  }

  const initials = firstName.charAt(0) + lastName.charAt(0)

  function handlePhone(e) {
    const val = e.target.value.replace(/\D/g, '')
    if (val.length <= 10) setPhone(val)
  }

  function handleCancel() {
    setFirstName(storedUser.firstName || '')
    setLastName(storedUser.lastName || '')
    setEmail(storedUser.email || '')
    setPhone(storedUser.phone || '')
    setCity(storedUser.city || 'kathmandu')
    setAddress(storedUser.address || '')
    setNewPassword('')
    setConfirmPassword('')
    setError('')
    setSuccess(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (phone.length > 0 && phone.length !== 10) {
      setError('Phone number must be exactly 10 digits.')
      return
    }
    if (address.trim() !== '' && address.trim().length < 5) {
      setError('Address must be at least 5 characters.')
      return
    }
    if (newPassword !== '' && newPassword.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    try {
      const token = localStorage.getItem('token')
      const userId = storedUser.id
      const res = await fetch(`http://localhost:5000/api/profile/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ firstName, lastName, email, phone, city, address, newPassword }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || 'Failed to save changes.')
        return
      }

      const updated = { ...storedUser, firstName, lastName, email, phone, city, address }
      localStorage.setItem('user', JSON.stringify(updated))
      setSuccess(true)

    } catch {
      setError('Cannot connect to server. Make sure backend is running.')
    }
  }

  return (
    <div className="pf-page">

      <nav className="pf-nav">
        <div className="pf-nav-logo">
          <div className="pf-icon-box">
            <img src={logo} alt="Fixit" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />
          </div>
          <span>Fi<b>x</b>it</span>
        </div>
        <button className="pf-back" onClick={() => navigate(dashboardPath)}>← Dashboard</button>
      </nav>

      <main className="pf-main">
        <div className="pf-wrapper">

          <aside className="pf-sidebar">
            <div className="pf-avatar">{initials}</div>
            <p className="pf-name">{firstName} {lastName}</p>
            <p className="pf-email">{email}</p>
            <span className="pf-role">⚡ {storedUser.role === 'technician' ? 'Technician' : 'Customer'}</span>
          </aside>

          <div className="pf-main-col">
          <div className="pf-card">
            <h2>Profile Settings</h2>
            <p className="pf-sub">Update your personal information</p>

            {error && <p className="pf-error">{error}</p>}
            {success && <p className="pf-success">✓ Changes saved!</p>}

            <form onSubmit={handleSubmit}>

              <p className="pf-section">Personal Information</p>

              <div className="pf-row">
                <div className="pf-field">
                  <label>First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="pf-field">
                  <label>Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="pf-field">
                <label>Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="pf-field">
                <label>Phone Number</label>
                <input
                  type="tel"
                  placeholder="9XXXXXXXXX"
                  value={phone}
                  onChange={handlePhone}
                  inputMode="numeric"
                  maxLength={10}
                />
                {phone.length > 0 && phone.length < 10 && (
                  <small className="pf-hint">{10 - phone.length} more digits needed</small>
                )}
              </div>

              <div className="pf-field">
                <label>City</label>
                <select value={city} onChange={e => setCity(e.target.value)}>
                  <option value="kathmandu">Kathmandu</option>
                  <option value="pokhara">Pokhara</option>
                  <option value="lalitpur">Lalitpur</option>
                  <option value="bhaktapur">Bhaktapur</option>
                  <option value="biratnagar">Biratnagar</option>
                  <option value="birgunj">Birgunj</option>
                </select>
              </div>

              <div className="pf-field">
                <label>Address</label>
                <input
                  type="text"
                  placeholder="e.g. Near Basantapur, Thamel"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                />
                {address.trim().length > 0 && address.trim().length < 5 && (
                  <small className="pf-hint">Address must be at least 5 characters</small>
                )}
              </div>

              <hr className="pf-line" />
              <p className="pf-section">Change Password <span className="pf-note">(leave blank to keep current)</span></p>

              <div className="pf-row">
                <div className="pf-field">
                  <label>New Password</label>
                  <input
                    type="password"
                    placeholder="Min. 8 characters"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                  />
                </div>
                <div className="pf-field">
                  <label>Confirm Password</label>
                  <input
                    type="password"
                    placeholder="Repeat new password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="pf-actions">
                <button type="button" className="pf-btn-cancel" onClick={handleCancel}>
                  Cancel
                </button>
                <button type="submit" className="pf-btn-save">
                  Save Changes
                </button>
              </div>

            </form>
          </div>

          {isTechnician && (
            <div className="pf-card">
              <h2>Professional Profile</h2>
              <p className="pf-sub">Shown to customers on your technician profile page</p>

              {techError && <p className="pf-error">{techError}</p>}
              {techSuccess && <p className="pf-success">✓ Professional profile saved!</p>}

              <form onSubmit={handleTechSubmit}>
                <div className="pf-field">
                  <label>Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Senior Mobile and Laptop Repair Specialist"
                    value={techTitle}
                    onChange={e => setTechTitle(e.target.value)}
                  />
                </div>

                <div className="pf-field">
                  <label>Bio</label>
                  <textarea
                    rows={4}
                    placeholder="Tell customers about your experience and approach..."
                    value={techBio}
                    onChange={e => setTechBio(e.target.value)}
                  />
                </div>

                <div className="pf-field">
                  <label>Skills / Device Specialities</label>
                  <input
                    type="text"
                    placeholder="e.g. Smartphone repair, Laptop diagnostics, Board repair"
                    value={techSkills}
                    onChange={e => setTechSkills(e.target.value)}
                  />
                  <small className="pf-hint">Separate multiple skills with commas</small>
                </div>

                <div className="pf-row">
                  <div className="pf-field">
                    <label>Years of Experience</label>
                    <input
                      type="number"
                      min="0"
                      value={techYears}
                      onChange={e => setTechYears(e.target.value)}
                    />
                  </div>
                  <div className="pf-field">
                    <label>Hourly Rate (NPR)</label>
                    <input
                      type="number"
                      min="0"
                      value={techRate}
                      onChange={e => setTechRate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="pf-actions">
                  <button type="submit" className="pf-btn-save" disabled={techSaving}>
                    {techSaving ? 'Saving...' : 'Save Professional Profile'}
                  </button>
                </div>
              </form>
            </div>
          )}
          </div>

        </div>
      </main>

    </div>
  )
}
