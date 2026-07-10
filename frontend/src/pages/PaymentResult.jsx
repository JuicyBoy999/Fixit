import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import logo from '../assets/image.png'
import './BookRepair.css'

const API = 'http://localhost:5000'

export default function PaymentResult({ status }) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const bookingId = searchParams.get('bookingId')
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(status === 'success' && Boolean(bookingId))

  useEffect(() => {
    if (status !== 'success' || !bookingId) return
    fetch(`${API}/api/repair-requests/${bookingId}`)
      .then(r => r.json())
      .then(data => setBooking(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [status, bookingId])

  if (status === 'success') {
    return (
      <div className="br-page">
        <aside className="br-sidebar">
          <div className="br-brand"><img src={logo} alt="Fixit" className="brand-logo-img" /> Fixit</div>
          <div className="br-sidebar-info">
            <h2 className="br-sidebar-heading">Payment confirmed!</h2>
            <p className="br-sidebar-sub">Your technician will be in touch shortly to confirm the appointment.</p>
          </div>
        </aside>
        <main className="br-main">
          <div className="br-success-wrap">
            <div className="br-success-icon">✓</div>
            <h1 className="br-success-heading">You are all set!</h1>
            <p className="br-success-msg">Payment received and your repair has been booked. A certified technician will contact you shortly.</p>

            {loading && <p className="br-success-msg">Loading booking details…</p>}

            {booking && (
              <div className="br-confirm-box">
                <div className="br-confirm-row"><span>Device</span><span>{booking.device_type}</span></div>
                <div className="br-confirm-row"><span>City</span><span>{booking.customer_area}</span></div>
                <div className="br-confirm-row"><span>Date</span><span>{booking.preferred_date?.split('T')[0]}</span></div>
                <div className="br-confirm-row"><span>Time</span><span>{booking.preferred_time || '—'}</span></div>
                <div className="br-confirm-row"><span>Amount paid</span><span>NPR {Number(booking.amount).toLocaleString()}</span></div>
              </div>
            )}

            <button className="br-btn" onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="br-page">
      <aside className="br-sidebar">
        <div className="br-brand"><img src={logo} alt="Fixit" className="brand-logo-img" /> Fixit</div>
        <div className="br-sidebar-info">
          <h2 className="br-sidebar-heading">Payment didn't go through</h2>
          <p className="br-sidebar-sub">Your booking was not confirmed — no charge was made.</p>
        </div>
      </aside>
      <main className="br-main">
        <div className="br-success-wrap">
          <div className="br-success-icon" style={{ background: '#dc2626' }}>✕</div>
          <h1 className="br-success-heading">Payment failed</h1>
          <p className="br-success-msg">Something went wrong with your eSewa payment, so your booking wasn&apos;t confirmed. You can try booking again.</p>
          <button className="br-btn" onClick={() => navigate('/book-repair')}>Try again</button>
          <button className="br-btn" style={{ background: 'transparent', border: '1px solid #8FCBE3', color: '#16303D', marginTop: '0.75rem' }} onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </button>
        </div>
      </main>
    </div>
  )
}
