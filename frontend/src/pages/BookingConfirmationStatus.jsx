import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import './BookingConfirmationStatus.css'

export default function BookingConfirmationStatus() {
  const location = useLocation()
  const navigate = useNavigate()

  const {
    name = 'User',
    email = '',
    phone = '',
    device = '',
    issue = '',
    preferredDate = '',
    time = '10:00 AM',
    address = '',
    tech = 'Ram Kumar',
  } = location.state || {}

  const [emailStatus, setEmailStatus] = useState('sending')
  const [smsStatus, setSmsStatus] = useState('sending')
  const [tab, setTab] = useState('email')
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const tick = setInterval(() => setElapsed(e => e + 1), 1000)

    const emailTimer = setTimeout(() => setEmailStatus('sent'), 1200)
    const smsTimer = setTimeout(() => setSmsStatus('sent'), 2000)

    return () => {
      clearInterval(tick)
      clearTimeout(emailTimer)
      clearTimeout(smsTimer)
    }
  }, [])

  const bothSent = emailStatus === 'sent' && smsStatus === 'sent'

  return (
    <div className="bcs-page">
      <div className="bcs-modal">

        <div className="bcs-header">
          <div className="bcs-header-left">
            <div className="bcs-logo">⚡</div>
            <div>
              <div className="bcs-title">Booking Confirmed</div>
              <div className="bcs-subtitle">Sending your confirmation...</div>
            </div>
          </div>
        </div>

        <div className="bcs-body">

          <div className={`bcs-timer-badge ${bothSent ? 'done' : ''}`}>
            <span className="bcs-timer-icon">{bothSent ? '✓' : '⏱'}</span>
            {bothSent
              ? `Delivered within ${elapsed}s of booking`
              : `Sending confirmation... ${elapsed}s`}
          </div>

          <div className="bcs-tabs">
            <button className={`bcs-tab ${tab === 'email' ? 'on' : ''}`} onClick={() => setTab('email')}>
              ✉ Email
            </button>
            <button className={`bcs-tab ${tab === 'sms' ? 'on' : ''}`} onClick={() => setTab('sms')}>
              💬 SMS
            </button>
          </div>

          {tab === 'email' && (
            <div className="bcs-channel-card">
              <div className="bcs-channel-status">
                <StatusPill status={emailStatus} />
              </div>
              <div className="bcs-email-preview">
                <div className="bcs-email-meta">From: <strong>Fixit Nepal</strong> &lt;noreply@fixit.com.np&gt;</div>
                <div className="bcs-email-meta">To: <strong>{email || 'your email'}</strong></div>
                <div className="bcs-email-subject">
                  Booking confirmed — {device || 'Device'} repair on {preferredDate || 'your date'}
                </div>
                <div className="bcs-divider" />
                <p className="bcs-email-greeting">Hi {name},</p>
                <p className="bcs-email-text">
                  Your booking is confirmed! Here are your appointment details:
                </p>
                <div className="bcs-details">
                  <Row label="Technician" value={tech} />
                  <Row label="Device" value={device} />
                  {issue && <Row label="Issue" value={issue} />}
                  <Row label="Date" value={preferredDate} />
                  <Row label="Time" value={time} />
                  <Row label="Address" value={address} last />
                </div>
              </div>
            </div>
          )}

          {tab === 'sms' && (
            <div className="bcs-channel-card">
              <div className="bcs-channel-status">
                <StatusPill status={smsStatus} />
              </div>
              <div className="bcs-sms-phone">
                <div className="bcs-sms-bubble">
                  Fixit: Booking confirmed! {tech} will repair your {device || 'device'} on {preferredDate}, {time} at {address || 'your address'}. Reply HELP for support.
                </div>
                <div className="bcs-sms-to">To: {phone || 'your phone number'}</div>
              </div>
            </div>
          )}

          <div className="bcs-details" style={{ marginTop: 14 }}>
            <Row label="Device" value={device} />
            <Row label="Preferred Date" value={preferredDate} />
            <Row label="Location" value={address} last />
          </div>

          <button className="bcs-done-btn" onClick={() => navigate('/dashboard')}>
            Done
          </button>

        </div>
      </div>
    </div>
  )
}

function Row({ label, value, last }) {
  return (
    <div className={`bcs-detail-row ${last ? 'bcs-detail-last' : ''}`}>
      <span className="bcs-detail-label">{label}</span>
      <span className="bcs-detail-val">{value}</span>
    </div>
  )
}

function StatusPill({ status }) {
  if (status === 'sending') {
    return <span className="bcs-pill bcs-pill-sending"><span className="bcs-spin">⏳</span> Sending...</span>
  }
  return <span className="bcs-pill bcs-pill-sent">✓ Delivered</span>
}
