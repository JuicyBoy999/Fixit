import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import logo from '../assets/image.png'
import './TechnicianProfile.css'

const API = 'http://localhost:5000'

function Stars({ rating }) {
  const r = Math.round(Number(rating) || 0)
  return (
    <span style={{ display: 'inline-flex', gap: 2 }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ color: i <= r ? '#f59e0b' : '#8FCBE3', fontSize: '1rem' }}>★</span>
      ))}
    </span>
  )
}

export default function TechnicianProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [technician, setTechnician] = useState(null)
  const [reviews, setReviews] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const techRes = await fetch(`${API}/api/technicians/${id}`)
        const techData = await techRes.json()
        if (!techRes.ok) throw new Error(techData.message || 'Not found')
        setTechnician(techData.technician)

        if (techData.technician?.user_id) {
          try {
            const token = localStorage.getItem('token')
            const rvRes = await fetch(`${API}/api/reviews/technicians/${techData.technician.user_id}`, {
              headers: token ? { Authorization: `Bearer ${token}` } : {},
            })
            const rvData = await rvRes.json()
            setReviews(rvData.reviews || [])
          } catch {}
        }

        setStatus('ready')
      } catch (err) {
        setError(err.message || 'Failed to load profile')
        setStatus('error')
      }
    }
    load()
  }, [id])

  const fmt = d => d ? new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric' }).format(new Date(d)) : 'Verified'

  return (
    <main className="tp-page">
      <section className="tp-shell">
        <header className="tp-topbar">
          <button className="tp-brand" type="button" onClick={() => navigate('/technicians')}>
            <span className="tp-brand-mark"><img src={logo} alt="Fixit" className="brand-logo-img" /></span>
            <span>Fixit</span>
          </button>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="tp-secondary" type="button" onClick={() => navigate('/technicians')}>All Technicians</button>
            <button className="tp-primary" type="button" onClick={() => navigate('/book-repair')}>Book a Repair</button>
          </div>
        </header>

        {status === 'loading' && <div className="tp-state">Loading technician profile...</div>}
        {status === 'error'   && <div className="tp-state tp-state-error">{error}</div>}

        {status === 'ready' && technician && (
          <>
            <section className="tp-profile-hero">
              <div className="tp-avatar tp-avatar-large">
                {(technician.full_name || '?').charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <p className="tp-kicker">{technician.location} technician</p>
                <h1>{technician.full_name}</h1>
                <p className="tp-title">{technician.title}</p>
                <p className="tp-bio">{technician.bio}</p>
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                  <button className="tp-primary" onClick={() => navigate('/book-repair')}>Book Repair →</button>
                </div>
              </div>
            </section>

            <section className="tp-stats">
              <div>
                <strong>{Number(technician.average_rating).toFixed(1)}</strong>
                <span>Average rating</span>
              </div>
              <div>
                <strong>{technician.review_count}</strong>
                <span>Customer reviews</span>
              </div>
              <div>
                <strong>{technician.years_experience || 0} yrs</strong>
                <span>Experience</span>
              </div>
              {technician.hourly_rate && (
                <div>
                  <strong>NPR {Number(technician.hourly_rate).toLocaleString()}</strong>
                  <span>Per hour</span>
                </div>
              )}
            </section>

            <div className="tp-profile-grid">
              <section className="tp-panel">
                <h2>Skills</h2>
                <div className="tp-chip-row">
                  {(technician.skills || []).map(s => (
                    <span className="tp-chip" key={s}>{s}</span>
                  ))}
                  {(!technician.skills || technician.skills.length === 0) && (
                    <p className="tp-muted">No skills listed yet.</p>
                  )}
                </div>
              </section>

              <section className="tp-panel">
                <h2>Certification Badges</h2>
                <div className="tp-cert-list">
                  {(technician.certifications || []).map(cert => (
                    <div className="tp-cert" key={cert.id}>
                      <span className="tp-cert-badge">CERT</span>
                      <div>
                        <strong>{cert.name}</strong>
                        <span>{cert.issuer || 'Verified provider'} — {fmt(cert.issued_on)}</span>
                      </div>
                    </div>
                  ))}
                  {(!technician.certifications || technician.certifications.length === 0) && (
                    <p className="tp-muted">No certifications listed yet.</p>
                  )}
                </div>
              </section>
            </div>

            <section className="tp-panel">
              <h2>Customer Reviews</h2>
              <div className="tp-review-list">
                {/* Seed reviews from technician_reviews table */}
                {(technician.reviews || []).concat(reviews).length === 0 && (
                  <p className="tp-muted">No reviews yet — be the first to review this technician after your repair.</p>
                )}
                {(technician.reviews || []).map(rv => (
                  <article className="tp-review" key={`tr-${rv.id}`}>
                    <div className="tp-review-head">
                      <strong>{rv.reviewer_name}</strong>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Stars rating={rv.rating} />
                        <span style={{ fontSize: '0.8rem', color: '#4E7182' }}>
                          {new Date(rv.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                    {rv.comment && <p>{rv.comment}</p>}
                  </article>
                ))}
                {reviews.map(rv => (
                  <article className="tp-review" key={`rv-${rv.id}`}>
                    <div className="tp-review-head">
                      <strong>{rv.first_name} {rv.last_name}</strong>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Stars rating={rv.rating} />
                        <span style={{ fontSize: '0.8rem', color: '#4E7182' }}>
                          {new Date(rv.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                    {rv.body && <p>{rv.body}</p>}
                    {rv.edited_at && <small style={{ color: '#4E7182' }}>Edited {new Date(rv.edited_at).toLocaleDateString()}</small>}
                  </article>
                ))}
              </div>
            </section>
          </>
        )}
      </section>
    </main>
  )
}
