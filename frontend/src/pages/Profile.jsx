import { useState } from 'react'
import './Profile.css'

const defaultData = {
  firstName: 'Salaj',
  lastName: 'Chaudhary',
  email: 'salaj@example.com',
  phone: '+977 984000000',
  city: 'kathmandu',
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
}

export default function Profile() {
  const [form, setForm] = useState(defaultData)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    setSuccess(false)
  }

  function handleCancel() {
    setForm(defaultData)
    setError('')
    setSuccess(false)
  }

  function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (form.newPassword !== '' && form.newPassword.length < 8) {
      setError('New password must be at least 8 characters.')
      return
    }
    if (form.newPassword !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (form.newPassword !== '' && form.currentPassword === '') {
      setError('Enter your current password first.')
      return
    }

    console.log('saving profile...', form)
    setSuccess(true)
  }

  const initials = form.firstName.charAt(0) + form.lastName.charAt(0)

  return (
    <div className="pf-page">
      <nav className="pf-nav">
        <span className="pf-logo">⚡ Fixit</span>
        <a href="/" className="pf-back">← Back to Home</a>
      </nav>

      <main className="pf-main">
        <div className="pf-wrapper">

          <aside className="pf-sidebar">
            <div className="pf-avatar">{initials}</div>
            <p className="pf-fullname">{form.firstName} {form.lastName}</p>
            <p className="pf-useremail">{form.email}</p>
            <span className="pf-role">⚡ Customer</span>
          </aside>

          <div className="pf-card">
            <h2>Profile Settings</h2>
            <p className="pf-subtitle">Update your personal information</p>

            {error && <div className="pf-error">{error}</div>}
            {success && <div className="pf-success">✓ Changes saved successfully!</div>}

            <form onSubmit={handleSubmit} noValidate>
              <p className="pf-section">Personal Information</p>

              <div className="pf-row">
                <div className="pf-field">
                  <label htmlFor="firstName">First Name</label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={form.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="pf-field">
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={form.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="pf-field">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="pf-field">
                <label htmlFor="phone">Phone Number</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                />
              </div>

              <div className="pf-field">
                <label htmlFor="city">City</label>
                <select
                  id="city"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                >
                  <option value="kathmandu">Kathmandu</option>
                  <option value="pokhara">Pokhara</option>
                  <option value="lalitpur">Lalitpur</option>
                  <option value="bhaktapur">Bhaktapur</option>
                  <option value="biratnagar">Biratnagar</option>
                  <option value="birgunj">Birgunj</option>
                </select>
              </div>

              <hr className="pf-line" />
              <p className="pf-section">Change Password <span className="pf-note">(leave blank to keep current)</span></p>

              <div className="pf-field">
                <label htmlFor="currentPassword">Current Password</label>
                <input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  placeholder="Enter current password"
                  value={form.currentPassword}
                  onChange={handleChange}
                />
              </div>

              <div className="pf-row">
                <div className="pf-field">
                  <label htmlFor="newPassword">New Password</label>
                  <input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    placeholder="Min. 8 characters"
                    value={form.newPassword}
                    onChange={handleChange}
                  />
                </div>
                <div className="pf-field">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Repeat new password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="pf-actions">
                <button type="button" className="pf-btn-outline" onClick={handleCancel}>
                  Cancel
                </button>
                <button type="submit" className="pf-btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>

        </div>
      </main>

      <footer className="pf-footer">
        <div className="pf-footer-grid">
          <div>
            <div className="pf-footer-logo">⚡ Fixit</div>
            <p className="pf-footer-desc">
              Nepal&apos;s on-demand electronics repair platform. Connecting
              customers with certified technicians for fast, reliable repairs at home.
            </p>
            <div className="pf-footer-badges">
              <span>🛡 90-day warranty</span>
              <span>🔒 Secure &amp; encrypted</span>
              <span>📅 Same-day booking</span>
            </div>
          </div>

          <div className="pf-footer-col">
            <h4>Services</h4>
            <ul>
              <li><a href="#">Laptop Repairs</a></li>
              <li><a href="#">TV Repairs</a></li>
              <li><a href="#">Smartphone Repairs</a></li>
              <li><a href="#">Desktop Repairs</a></li>
              <li><a href="#">Gaming Console</a></li>
              <li><a href="#">Home Appliances</a></li>
            </ul>
          </div>

          <div className="pf-footer-col">
            <h4>Company</h4>
            <ul>
              <li><a href="#">About FixIt</a></li>
              <li><a href="#">How it Works</a></li>
              <li><a href="#">Become a Technician</a></li>
              <li><a href="#">Blog</a></li>
            </ul>
          </div>

          <div className="pf-footer-col">
            <h4>Support</h4>
            <ul>
              <li><a href="#">Help Center</a></li>
              <li><a href="#">Contact Us</a></li>
              <li><a href="#">Warranty Claims</a></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
              <li><a href="mailto:support@fixit.com.np">support@fixit.com.np</a></li>
              <li><a href="tel:+977984000000">+977 984000000</a></li>
            </ul>
          </div>
        </div>

        <hr className="pf-footer-line" />

        <div className="pf-footer-bottom">
          <span>© 2026 FixIt. All rights reserved. Built for 3rd Semester Project.</span>
          <div className="pf-footer-right">
            <span className="pf-dot" />
            <span>All systems operational</span>
            <span className="pf-location">Kathmandu, Nepal</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
