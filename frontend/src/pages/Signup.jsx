import { useState } from 'react'
import './Signup.css'

export default function Signup() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: '',
    password: '',
    agreed: false,
  })

  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (!form.agreed) {
      setError('You must agree to the Terms of Service.')
      return
    }

    console.log('Signup data:', form)
    setSuccess(true)
  }

  if (success) {
    return (
      <div className="su-page">
        <nav className="su-nav">
          <span className="su-nav-logo">⚡ Fixit</span>
        </nav>
        <main className="su-main">
          <div className="su-card su-success-card">
            <div className="su-success-icon">✓</div>
            <h2>Account Created!</h2>
            <p>Welcome to Fixit. You can now sign in.</p>
            <a href="/login" className="su-btn">Go to Sign In</a>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="su-page">

      <nav className="su-nav">
        <span className="su-nav-logo">⚡ Fixit</span>
      </nav>

      <main className="su-main">
        <div className="su-card">
          <h2>Create your account</h2>
          <p className="su-subtitle">Join customers getting same-day repairs</p>

          {error && <div className="su-error">{error}</div>}

          <form onSubmit={handleSubmit} noValidate>

            <div className="su-row">
              <div className="su-field">
                <label htmlFor="su-firstName">First Name</label>
                <input
                  id="su-firstName"
                  name="firstName"
                  type="text"
                  placeholder="Salaj"
                  value={form.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="su-field">
                <label htmlFor="su-lastName">Last Name</label>
                <input
                  id="su-lastName"
                  name="lastName"
                  type="text"
                  placeholder="Chaudhary"
                  value={form.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="su-field">
              <label htmlFor="su-email">Email Address</label>
              <input
                id="su-email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="su-field">
              <label htmlFor="su-phone">Phone Number</label>
              <input
                id="su-phone"
                name="phone"
                type="tel"
                placeholder="+977 9XX XXX XXX"
                value={form.phone}
                onChange={handleChange}
                required
              />
            </div>

            <div className="su-field">
              <label htmlFor="su-city">City</label>
              <select
                id="su-city"
                name="city"
                value={form.city}
                onChange={handleChange}
                required
              >
                <option value="" disabled>Select your city</option>
                <option value="kathmandu">Kathmandu</option>
                <option value="pokhara">Pokhara</option>
                <option value="lalitpur">Lalitpur</option>
                <option value="bhaktapur">Bhaktapur</option>
                <option value="biratnagar">Biratnagar</option>
                <option value="birgunj">Birgunj</option>
              </select>
            </div>

            <div className="su-field">
              <label htmlFor="su-password">Password</label>
              <input
                id="su-password"
                name="password"
                type="password"
                placeholder="Min. 8 characters"
                value={form.password}
                onChange={handleChange}
                required
              />
              <span className="su-hint">Min. 8 characters</span>
            </div>

            <div className="su-checkbox">
              <input
                id="su-agreed"
                name="agreed"
                type="checkbox"
                checked={form.agreed}
                onChange={handleChange}
              />
              <label htmlFor="su-agreed">
                I agree to Fixit&apos;s{' '}
                <a href="/terms">Terms of Service</a> and{' '}
                <a href="/privacy">Privacy Policy</a>. I consent to
                receiving repair updates via SMS.
              </label>
            </div>

            <button type="submit" className="su-btn">
              Create Account
            </button>
          </form>

          <p className="su-signin">
            Already have an account? <a href="/login">Sign in</a>
          </p>
        </div>
      </main>

      <footer className="su-footer">
        <div className="su-footer-top">

          <div className="su-footer-brand">
            <div className="su-footer-logo">⚡ Fixit</div>
            <p className="su-footer-desc">
              Nepal&apos;s on-demand electronics repair platform. Connecting
              customers with certified technicians for fast, reliable repairs
              at home.
            </p>
            <div className="su-badges">
              <span className="su-badge">🛡 90-day warranty</span>
              <span className="su-badge">🔒 Secure &amp; encrypted</span>
              <span className="su-badge">📅 Same-day booking</span>
            </div>
          </div>

          <div className="su-footer-col">
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

          <div className="su-footer-col">
            <h4>Company</h4>
            <ul>
              <li><a href="#">About FixIt</a></li>
              <li><a href="#">How it Works</a></li>
              <li><a href="#">Become a Technician</a></li>
              <li><a href="#">Blog</a></li>
            </ul>
          </div>

          <div className="su-footer-col">
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

        <hr className="su-footer-divider" />

        <div className="su-footer-bottom">
          <span>© 2026 FixIt. All rights reserved. Built for 3rd Semester Project.</span>
          <div className="su-footer-status">
            <span className="su-status-dot" />
            <span>All systems operational</span>
            <span className="su-footer-location">Kathmandu, Nepal</span>
          </div>
        </div>
      </footer>

    </div>
  )
}
