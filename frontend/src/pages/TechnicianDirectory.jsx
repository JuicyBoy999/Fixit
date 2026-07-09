import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import logo from '../assets/image.png'
import './TechnicianDirectory.css'

const API = 'http://localhost:5000'

function Stars({ rating }) {
  const r = Math.round(Number(rating) || 0)
  return (
    <span className="td-stars">
      {[1,2,3,4,5].map(i => (
        <span key={i} className={i <= r ? 'td-star td-star--on' : 'td-star'}>★</span>
      ))}
    </span>
  )
}

export default function TechnicianDirectory() {
  const navigate = useNavigate()
  const [technicians, setTechnicians] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [cityFilter, setCityFilter] = useState('All')
  const [ratingFilter, setRatingFilter] = useState(0)
  const [specialtyFilter, setSpecialtyFilter] = useState('All')

  useEffect(() => {
    const token = localStorage.getItem('token')

    fetch(`${API}/api/technicians`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(r => r.json())
      .then(data => {
        setTechnicians(data.technicians || [])
        setStatus('ready')
      })
      .catch(() => {
        setError('Could not load technicians. Make sure the backend is running.')
        setStatus('error')
      })
  }, [navigate])

  const cities = ['All', ...Array.from(new Set(technicians.map(t => t.location).filter(Boolean))).sort()]
  const SPECIALTIES = ['All','Smartphone','Laptop','TV','Tablet','Desktop','Gaming Console','Home Appliance']

  const filtered = technicians.filter(t => {
    const matchCity = cityFilter === 'All' || t.location === cityFilter
    const matchRating = ratingFilter === 0 || Number(t.average_rating) >= ratingFilter
    const matchSpec = specialtyFilter === 'All' || (t.skills || []).some(s => s.toLowerCase().includes(specialtyFilter.toLowerCase()))
    const q = search.toLowerCase()
    const matchSearch = !q ||
      (t.full_name || '').toLowerCase().includes(q) ||
      (t.title || '').toLowerCase().includes(q) ||
      (t.bio || '').toLowerCase().includes(q) ||
      (t.skills || []).some(s => s.toLowerCase().includes(q))
    return matchCity && matchRating && matchSpec && matchSearch
  })

  return (
    <div className="td-page">
      <aside className="td-sidebar">
        <div className="td-brand" onClick={() => navigate('/dashboard')}><img src={logo} alt="Fixit" className="brand-logo-img" /> Fixit</div>

        <div className="td-sidebar-section">
          <div className="td-sidebar-label">Min. Rating</div>
          {[0,3,4,5].map(r => (
            <button
              key={r}
              className={`td-city-btn ${ratingFilter === r ? 'td-city-btn--active' : ''}`}
              onClick={() => setRatingFilter(r)}
            >
              {r === 0 ? 'All ratings' : `${r}★ and above`}
            </button>
          ))}
        </div>

        <div className="td-sidebar-section">
          <div className="td-sidebar-label">Speciality</div>
          {SPECIALTIES.map(s => (
            <button
              key={s}
              className={`td-city-btn ${specialtyFilter === s ? 'td-city-btn--active' : ''}`}
              onClick={() => setSpecialtyFilter(s)}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="td-sidebar-section">
          <div className="td-sidebar-label">Filter by City</div>
          {cities.map(c => (
            <button
              key={c}
              className={`td-city-btn ${cityFilter === c ? 'td-city-btn--active' : ''}`}
              onClick={() => setCityFilter(c)}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="td-sidebar-bottom">
          <button className="td-back-btn" onClick={() => navigate('/dashboard')}>← Dashboard</button>
        </div>
      </aside>

      <main className="td-main">
        <div className="td-topbar">
          <div>
            <h1 className="td-heading">Browse Technicians</h1>
            <p className="td-sub">Find the right certified technician for your repair</p>
          </div>
          <button className="td-book-btn" onClick={() => navigate('/book-repair')}>+ Book a Repair</button>
        </div>

        <div className="td-search-row">
          <div className="td-search-wrap">
            <span className="td-search-icon">🔍</span>
            <input
              className="td-search"
              placeholder="Search by name, skill, or expertise..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className="td-search-clear" onClick={() => setSearch('')}>✕</button>
            )}
          </div>
          <span className="td-count">
            {status === 'ready' ? `${filtered.length} technician${filtered.length !== 1 ? 's' : ''}` : ''}
          </span>
        </div>

        {status === 'loading' && (
          <div className="td-state">Loading technicians...</div>
        )}

        {status === 'error' && (
          <div className="td-state td-state--error">{error}</div>
        )}

        {status === 'ready' && filtered.length === 0 && (
          <div className="td-empty">
            <div className="td-empty-icon">🔧</div>
            <h2>No technicians found</h2>
            <p>{search || cityFilter !== 'All' ? 'Try adjusting your search or filters.' : 'No technicians are available right now.'}</p>
            {(search || cityFilter !== 'All') && (
              <button className="td-clear-btn" onClick={() => { setSearch(''); setCityFilter('All') }}>
                Clear filters
              </button>
            )}
          </div>
        )}

        {status === 'ready' && filtered.length > 0 && (
          <div className="td-grid">
            {filtered.map(tech => (
              <article key={tech.id} className="td-card">
                <div className="td-card-top">
                  <div className="td-avatar">
                    {(tech.full_name || '?').charAt(0).toUpperCase()}
                  </div>
                  <div className="td-card-info">
                    <h2 className="td-name">{tech.full_name}</h2>
                    <p className="td-title">{tech.title || 'Repair Technician'}</p>
                    <div className="td-meta">
                      {tech.location && <span className="td-loc">📍 {tech.location}</span>}
                      {tech.years_experience && <span className="td-exp">{tech.years_experience} yrs exp</span>}
                    </div>
                  </div>
                  {tech.verification_status === 'approved' && (
                    <span className="td-verified" title="Verified technician">✓</span>
                  )}
                </div>

                {tech.bio && (
                  <p className="td-bio">{tech.bio.length > 110 ? tech.bio.slice(0, 110) + '…' : tech.bio}</p>
                )}

                {(tech.skills || []).length > 0 && (
                  <div className="td-skills">
                    {(tech.skills || []).slice(0, 4).map(s => (
                      <span key={s} className="td-skill">{s}</span>
                    ))}
                    {tech.skills.length > 4 && (
                      <span className="td-skill td-skill--more">+{tech.skills.length - 4}</span>
                    )}
                  </div>
                )}

                <div className="td-card-foot">
                  <div className="td-rating-row">
                    <Stars rating={tech.average_rating} />
                    <span className="td-rating-num">{Number(tech.average_rating).toFixed(1)}</span>
                    <span className="td-review-count">({tech.review_count} review{tech.review_count !== 1 ? 's' : ''})</span>
                  </div>
                  {tech.hourly_rate && (
                    <span className="td-rate">NPR {Number(tech.hourly_rate).toLocaleString()}/hr</span>
                  )}
                </div>

                <button
                  className="td-view-btn"
                  onClick={() => navigate(`/technicians/${tech.id}`)}
                >
                  View Profile →
                </button>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
