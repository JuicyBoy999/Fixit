import { useLocation, useNavigate } from 'react-router-dom'
import './Invoice.css'

export default function Invoice() {
  const location = useLocation()
  const navigate = useNavigate()

  const {
    invoiceNumber = 'FXT-2026-0483',
    date = 'Jun 18, 2026',
    customerName = 'Sajal Chaudhary',
    customerEmail = 'sajalchaudhary46@gmail.com',
    customerAddress = 'Thamel, Kathmandu',
    techName = 'Ram Kumar',
    techId = 'TC-112',
    items = [
      { name: 'Laptop screen replacement', description: 'Service type: Hardware repair · Device: Laptop', qty: 1, amount: 800 },
      { name: 'Replacement screen panel', description: 'Part: LCD display 15.6" · Brand compatible', qty: 1, amount: 3200 },
      { name: 'Thermal paste + cleaning', description: 'Part: consumable materials', qty: 1, amount: 150 },
      { name: 'Home visit fee', description: 'On-site repair at customer location', qty: 1, amount: 200 },
    ],
    vatRate = 0.13,
    discount = 0,
  } = location.state || {}

  const subtotal = items.reduce((sum, item) => sum + item.amount * item.qty, 0)
  const vat = Math.round(subtotal * vatRate)
  const total = subtotal + vat - discount

  function handlePrint() {
    window.print()
  }

  return (
    <div className="inv-page">
      <div className="inv-modal" id="invoice-print">

        <div className="inv-header">
          <div className="inv-brand">
            <div className="inv-logo">⚡</div>
            <div>
              <div className="inv-brand-name">Fixit Nepal</div>
              <div className="inv-brand-sub">Tax Invoice</div>
            </div>
          </div>
          <div className="inv-meta">
            <div className="inv-meta-row"><span>Invoice #</span><strong>{invoiceNumber}</strong></div>
            <div className="inv-meta-row"><span>Date</span><strong>{date}</strong></div>
            <div className="inv-meta-row"><span>Status</span><strong className="inv-paid">✓ Paid</strong></div>
          </div>
        </div>

        <div className="inv-body">
          <div className="inv-parties">
            <div className="inv-party">
              <div className="inv-party-label">Billed to</div>
              <div className="inv-party-name">{customerName}</div>
              <div className="inv-party-detail">{customerEmail}</div>
              <div className="inv-party-detail">{customerAddress}</div>
            </div>
            <div className="inv-party">
              <div className="inv-party-label">Technician</div>
              <div className="inv-party-name">{techName}</div>
              <div className="inv-party-detail">Certified Technician</div>
              <div className="inv-party-detail">Fixit Nepal · ID #{techId}</div>
            </div>
          </div>

          <div className="inv-section-label">Service details</div>
          <div className="inv-table-wrap">
            <table className="inv-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th className="inv-center">Qty</th>
                  <th className="inv-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={i}>
                    <td>
                      <div className="inv-item-name">{item.name}</div>
                      <div className="inv-item-sub">{item.description}</div>
                    </td>
                    <td className="inv-center">{item.qty}</td>
                    <td className="inv-right">Rs. {(item.amount * item.qty).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="inv-totals">
            <div className="inv-total-row">
              <span className="inv-total-label">Subtotal</span>
              <span className="inv-total-val">Rs. {subtotal.toLocaleString()}</span>
            </div>
            <div className="inv-total-row">
              <span className="inv-total-label">Tax (13% VAT)</span>
              <span className="inv-total-val">Rs. {vat.toLocaleString()}</span>
            </div>
            {discount > 0 && (
              <div className="inv-total-row">
                <span className="inv-total-label">Discount</span>
                <span className="inv-total-val inv-discount">− Rs. {discount.toLocaleString()}</span>
              </div>
            )}
            <div className="inv-grand">
              <span>Total paid</span>
              <span className="inv-grand-val">Rs. {total.toLocaleString()}</span>
            </div>
          </div>

          <div className="inv-warranty">
            🛡 This repair is covered by Fixit Nepal's 90-day warranty.
            Contact <strong>support@fixit.com.np</strong> for claims.
          </div>
        </div>

        <div className="inv-footer no-print">
          <button className="inv-btn" onClick={() => navigate('/dashboard')}>
            Done
          </button>
          <button className="inv-btn inv-btn-primary" onClick={handlePrint}>
            ⬇ Download PDF
          </button>
        </div>

      </div>
    </div>
  )
}
