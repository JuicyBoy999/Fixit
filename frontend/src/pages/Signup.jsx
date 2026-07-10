import { useState } from 'react'
import logo from '../assets/image.png'
import './Signup.css'

export default function Signup() {

  const [role, setRole] = useState('user')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')
  const [password, setPassword] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function handlePhone(e) {
    const val = e.target.value.replace(/\D/g, '')
    if (val.length <= 10) {
      setPhone(val)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (phone.length !== 10) {
      setError('Phone number must be exactly 10 digits.')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    if (!agreed) {
      setError('Please agree to the Terms of Service to continue.')
      return
    }

    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, phone, city, password, role }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message)
        return
      }

      setSubmitted(true)

    } catch (err) {
      setError('Cannot connect to server. Make sure backend is running.')
    }
  }

  if (submitted) {
    return (
      <div className="sg-page">
        <div className="sg-main">
          <div className="sg-box">
            <div className="sg-done">
              <div className="sg-check">✓</div>
              <h2>Account Created!</h2>
              <p>Welcome to Fixit. You can now sign in.</p>
              <a href="/login" className="sg-btn">Go to Sign In →</a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="sg-page">
      <main className="sg-main">
      <div className="sg-box">

        <div className="sg-logo">
          <div className="sg-icon-box"><img src={logo} alt="Fixit" className="brand-logo-img" /></div>
          <span className="sg-brand">Fi<b>x</b>it</span>
        </div>

        <h1>Create your account</h1>
        <p className="sg-tagline">{role === 'technician' ? 'Join as a certified repair technician' : 'Join customers getting same-day repairs'}</p>

        <div className="sg-role-toggle">
          <button type="button" className={`sg-role-btn${role === 'user' ? ' sg-role-btn--active' : ''}`} onClick={() => setRole('user')}>
            Customer
          </button>
          <button type="button" className={`sg-role-btn${role === 'technician' ? ' sg-role-btn--active' : ''}`} onClick={() => setRole('technician')}>
            Technician
          </button>
        </div>

        {error && <p className="sg-error">{error}</p>}

        <form onSubmit={handleSubmit}>

          <div className="sg-row">
            <div className="sg-field">
              <label>First Name</label>
              <div className="sg-wrap">
                <input
                  type="text"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="sg-field">
              <label>Last Name</label>
              <div className="sg-wrap">
                <input
                  type="text"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div className="sg-field">
            <label>Email Address</label>
            <div className="sg-wrap">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="sg-field">
            <label>Phone Number</label>
            <div className="sg-wrap">
              <input
                type="tel"
                value={phone}
                onChange={handlePhone}
                inputMode="numeric"
                maxLength={10}
                required
              />
            </div>
            {phone.length > 0 && phone.length < 10 && (
              <small className="sg-hint">{10 - phone.length} more digits needed</small>
            )}
          </div>

          <div className="sg-field">
            <label>City</label>
            <div className="sg-wrap">
              <select value={city} onChange={e => setCity(e.target.value)} required>
                <option value="" disabled>Select your city</option>
                <option value="kathmandu">Kathmandu</option>
                <option value="pokhara">Pokhara</option>
                <option value="lalitpur">Lalitpur</option>
                <option value="bhaktapur">Bhaktapur</option>
                <option value="biratnagar">Biratnagar</option>
                <option value="birgunj">Birgunj</option>
              </select>
            </div>
          </div>

          <div className="sg-field">
            <label>PASSWORD</label>
            <div className="sg-wrap">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <button type="button" className="sg-eye" onClick={() => setShowPass(!showPass)}>
                {showPass ? 'Hide' : 'Show'}
              </button>
            </div>
            <div className="sg-bars">
              <span className={password.length >= 2 ? 'bar on' : 'bar'} />
              <span className={password.length >= 5 ? 'bar on' : 'bar'} />
              <span className={password.length >= 8 ? 'bar on' : 'bar'} />
              <span className={password.length >= 10 ? 'bar on' : 'bar'} />
            </div>
          </div>

          <div className="sg-check-row">
            <input
              type="checkbox"
              id="terms"
              checked={agreed}
              onChange={e => setAgreed(e.target.checked)}
            />
            <label htmlFor="terms">
              I agree to Fixit&apos;s <a href="/terms">Terms of Service</a> and{' '}
              <a href="/privacy">Privacy Policy</a>. I consent to receiving repair updates via SMS.
            </label>
          </div>

          <button type="submit" className="sg-btn">
            Create Account →
          </button>

        </form>

        <div className="sg-divider"><span>or</span></div>

        <a href={`http://localhost:5000/auth/google?role=${role}`} className="sg-google">
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Sign up with Google
        </a>

        <p className="sg-login-link">
          Already have an account? <a href="/login">Sign in</a>
        </p>

        <div className="sg-trust">
          <div>
            <span>🔒</span>
            <p>Secure &amp;<br />encrypted</p>
          </div>
          <div>
            <span>🕐</span>
            <p>Same-day<br />booking</p>
          </div>
          <div>
            <span>🛡</span>
            <p>90-day<br />warranty</p>
          </div>
        </div>

      </div>
      </main>

      <footer className="sg-footer">
        <div className="sg-footer-grid">
          <div className="sg-footer-brand">
            <div className="sg-footer-logo"><img src={logo} alt="Fixit" className="brand-logo-img" /> Fixit</div>
            <p className="sg-footer-desc">
              Nepal&apos;s on-demand electronics repair platform. Connecting
              customers with certified technicians for fast, reliable repairs at home.
            </p>
            <div className="sg-footer-badges">
              <span>🛡 90-day warranty</span>
              <span>🔒 Secure &amp; encrypted</span>
              <span>📅 Same-day booking</span>
            </div>
          </div>

          <div className="sg-footer-col">
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

          <div className="sg-footer-col">
            <h4>Company</h4>
            <ul>
              <li><a href="#">About FixIt</a></li>
              <li><a href="#">How it Works</a></li>
              <li><a href="#">Become a Technician</a></li>
              <li><a href="#">Blog</a></li>
            </ul>
          </div>

          <div className="sg-footer-col">
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

        <hr className="sg-footer-line" />

        <div className="sg-footer-bottom">
          <span>© 2026 FixIt. All rights reserved. Built for 3rd Semester Project.</span>
          <div className="sg-footer-right">
            <span className="sg-footer-dot" />
            <span>All systems operational</span>
            <span className="sg-footer-loc">Kathmandu, Nepal</span>
          </div>
        </div>
      </footer>

    </div>
  )
}
