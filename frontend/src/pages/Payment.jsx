import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import './Payment.css'

const API = 'http://localhost:5000/api/esewa'

export default function Payment() {
  const location = useLocation()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const {
    invoiceNumber = 'FXT-2026-0483',
    items = [
      { name: 'Laptop screen replacement', amount: 800 },
      { name: 'Replacement screen panel', amount: 3200 },
      { name: 'Parts & materials', amount: 150 },
      { name: 'Home visit fee', amount: 200 },
    ],
    vatRate = 0.13,
  } = location.state || {}

  const subtotal = items.reduce((s, i) => s + i.amount, 0)
  const vat = Math.round(subtotal * vatRate)
  const total = subtotal + vat

  async function handlePay() {
    setError('')
    setLoading(true)

    // eSewa needs a unique transaction id per attempt.
    const transaction_uuid = `${invoiceNumber}-${Date.now()}`

    try {
      const res = await fetch(`${API}/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: total, transaction_uuid }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Could not start payment. Try again.')
        setLoading(false)
        return
      }

      // eSewa's v2 API works by POSTing a form to their hosted page.
      // We build that form dynamically and submit it, which redirects
      // the user to eSewa to complete payment.
      const form = document.createElement('form')
      form.method = 'POST'
      form.action = data.action

      Object.entries(data.fields).forEach(([key, value]) => {
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
      setLoading(false)
    }
  }

  return (
    <div className="pay-page">
      <div className="pay-modal">

        <div className="pay-header">
          <div className="pay-header-left">
            <div className="pay-logo">⚡</div>
            <div>
              <div className="pay-title">Complete Payment</div>
              <div className="pay-subtitle">Repair #{invoiceNumber}</div>
            </div>
          </div>
        </div>

        <div className="pay-body">
          <div className="pay-sandbox">
            🧪 Sandbox mode — no real money will be charged
          </div>

          {error && <div className="pay-error">{error}</div>}

          <div className="pay-section-label">Payment summary</div>
          <div className="pay-summary">
            {items.map((item, i) => (
              <div className="pay-row" key={i}>
                <span className="pay-row-label">{item.name}</span>
                <span className="pay-row-val">Rs. {item.amount.toLocaleString()}</span>
              </div>
            ))}
            <div className="pay-divider" />
            <div className="pay-row">
              <span className="pay-row-label">Subtotal</span>
              <span className="pay-row-val">Rs. {subtotal.toLocaleString()}</span>
            </div>
            <div className="pay-row">
              <span className="pay-row-label">VAT (13%)</span>
              <span className="pay-row-val">Rs. {vat.toLocaleString()}</span>
            </div>
            <div className="pay-divider" />
            <div className="pay-total">
              <span className="pay-total-label">Total due</span>
              <span className="pay-total-val">Rs. {total.toLocaleString()}</span>
            </div>
          </div>

          <div className="pay-section-label">Payment method</div>
          <div className="pay-method">
            <div className="pay-method-radio"><div className="pay-method-dot" /></div>
            <div className="pay-method-info">
              <div className="pay-method-name">eSewa</div>
              <div className="pay-method-desc">Pay securely with your eSewa wallet</div>
            </div>
            <span className="pay-esewa-badge">eSewa</span>
          </div>

          <button className="pay-btn" onClick={handlePay} disabled={loading}>
            {loading ? 'Redirecting to eSewa...' : `🔒 Pay Rs. ${total.toLocaleString()} with eSewa`}
          </button>

          <p className="pay-note">
            You'll be redirected to eSewa's secure page to complete payment.
            After paying, you'll return here and your receipt will be generated.
          </p>

          <p className="pay-back" onClick={() => navigate(-1)}>← Cancel</p>
        </div>

      </div>
    </div>
  )
}
