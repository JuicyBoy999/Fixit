import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './Payment.css'

const API = 'http://localhost:5000/api/esewa'

export default function PaymentSuccess() {
  const navigate = useNavigate()
  const [status, setStatus] = useState('verifying') // verifying | success | failed
  const [details, setDetails] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    // eSewa redirects back with ?data=<base64> in the URL.
    const params = new URLSearchParams(window.location.search)
    const data = params.get('data')

    if (!data) {
      setStatus('failed')
      setError('No payment data received from eSewa.')
      return
    }

    fetch(`${API}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data }),
    })
      .then(r => r.json())
      .then(res => {
        if (res.verified) {
          setStatus('success')
          setDetails(res)
        } else {
          setStatus('failed')
          setError(res.error || `Payment status: ${res.status || 'unknown'}`)
        }
      })
      .catch(() => {
        setStatus('failed')
        setError('Could not verify payment with server.')
      })
  }, [])

  return (
    <div className="pay-page">
      <div className="pay-modal">

        <div className={`pay-header ${status === 'failed' ? 'pay-header-fail' : ''}`}>
          <div className="pay-header-left">
            <div className="pay-logo">⚡</div>
            <div>
              <div className="pay-title">
                {status === 'verifying' && 'Verifying Payment'}
                {status === 'success' && 'Payment Successful'}
                {status === 'failed' && 'Payment Failed'}
              </div>
              <div className="pay-subtitle">Fixit Nepal · eSewa</div>
            </div>
          </div>
        </div>

        <div className="pay-body">

          {status === 'verifying' && (
            <div className="pay-center">
              <div className="pay-spinner">⏳</div>
              <p className="pay-center-text">Confirming your payment with eSewa...</p>
            </div>
          )}

          {status === 'success' && details && (
            <>
              <div className="pay-center">
                <div className="pay-success-icon">✓</div>
                <p className="pay-success-title">Payment complete!</p>
                <p className="pay-center-text">Your repair has been paid successfully.</p>
              </div>

              <div className="pay-summary" style={{ marginTop: 16 }}>
                <div className="pay-row">
                  <span className="pay-row-label">Transaction code</span>
                  <span className="pay-row-val">{details.transaction_code}</span>
                </div>
                <div className="pay-row">
                  <span className="pay-row-label">Amount paid</span>
                  <span className="pay-row-val">Rs. {Number(details.total_amount).toLocaleString()}</span>
                </div>
                <div className="pay-row">
                  <span className="pay-row-label">Status</span>
                  <span className="pay-row-val" style={{ color: '#22c55e' }}>{details.status}</span>
                </div>
              </div>

              <button className="pay-btn" style={{ marginTop: 16 }} onClick={() => navigate('/invoice')}>
                View receipt
              </button>
            </>
          )}

          {status === 'failed' && (
            <>
              <div className="pay-center">
                <div className="pay-fail-icon">✕</div>
                <p className="pay-fail-title">Payment could not be completed</p>
                <p className="pay-center-text">{error}</p>
              </div>
              <button className="pay-btn" style={{ marginTop: 16 }} onClick={() => navigate('/dashboard')}>
                Back to dashboard
              </button>
            </>
          )}

        </div>
      </div>
    </div>
  )
}
