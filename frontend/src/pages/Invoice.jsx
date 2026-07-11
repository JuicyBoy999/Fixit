import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import logo from '../assets/image.png'
import './Invoice.css'

const API = 'http://localhost:5000'

export default function Invoice() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [booking, setBooking] = useState(null)
  const [estimate, setEstimate] = useState(null)
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    fetch(`${API}/api/repair-requests/${id}`)
      .then(r => r.json())
      .then(data => {
        if (!data || data.error) { setStatus('error'); return }
        setBooking(data)
        setStatus('ready')
        return fetch(`${API}/api/pricing/estimate?deviceType=${encodeURIComponent(data.device_type)}`)
          .then(r => r.json())
          .then(estData => { if (estData.estimate) setEstimate(estData.estimate) })
          .catch(() => {})
      })
      .catch(() => setStatus('error'))
  }, [id])

  if (status === 'loading') return <div className="inv-page"><p className="inv-state">Loading invoice…</p></div>
  if (status === 'error' || !booking) return <div className="inv-page"><p className="inv-state">Could not load this invoice.</p></div>

  const total = Number(booking.amount || booking.cost || estimate?.subtotal || 0)
  const technicianName = booking.technician_first_name
    ? `${booking.technician_first_name} ${booking.technician_last_name}`
    : 'Not yet assigned'
  const customerName = booking.customer_first_name
    ? `${booking.customer_first_name} ${booking.customer_last_name}`
    : '—'

  return (
    <div className="inv-page">
      <div className="inv-toolbar">
        <button className="inv-back" onClick={() => navigate(-1)}>← Back</button>
        <button className="inv-print" onClick={() => window.print()}>🖨 Print / Save as PDF</button>
      </div>

      <div className="inv-sheet">
        <div className="inv-header">
          <div className="inv-brand"><img src={logo} alt="Fixit" className="brand-logo-img" /> Fixit</div>
          <div className="inv-meta">
            <h1>Invoice</h1>
            <span>Invoice #{booking.id}</span>
            <span>{new Date(booking.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="inv-parties">
          <div>
            <span className="inv-label">Billed to</span>
            <strong>{customerName}</strong>
            <span>{booking.address || booking.customer_area}</span>
          </div>
          <div>
            <span className="inv-label">Technician</span>
            <strong>{technicianName}</strong>
            <span>{booking.customer_area}</span>
          </div>
          <div>
            <span className="inv-label">Status</span>
            <strong className="inv-status">{booking.status}</strong>
            <span>Payment: {booking.payment_status || 'pending'}</span>
          </div>
        </div>

        <table className="inv-table">
          <thead>
            <tr><th>Description</th><th>Type</th><th>Amount</th></tr>
          </thead>
          <tbody>
            <tr>
              <td>{booking.device_type} repair — {booking.fault_description || 'General service'}</td>
              <td>Service</td>
              <td>—</td>
            </tr>
            {estimate?.items?.map((item, idx) => (
              <tr key={idx}>
                <td>{item.label}</td>
                <td>{item.type === 'variable' ? 'Parts (estimate)' : 'Labour'}</td>
                <td>{item.type === 'variable' ? `NPR ${item.amount} *` : `NPR ${Number(item.amount).toLocaleString()}`}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={2}>Total charged</td>
              <td>NPR {total.toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>

        {estimate?.items?.some(i => i.type === 'variable') && (
          <p className="inv-note">* Parts costs are estimates; final total reflects what was actually charged.</p>
        )}

        <p className="inv-footer">Thank you for choosing Fixit. This invoice was generated automatically and reflects the amount recorded for this repair.</p>
      </div>
    </div>
  )
}
