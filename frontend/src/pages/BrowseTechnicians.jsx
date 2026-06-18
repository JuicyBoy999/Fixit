import { useState, useMemo, useEffect } from 'react'
import './BrowseTechnicians.css'
import TechnicianCalendar from './TechnicianCalendar'

const API = 'http://localhost:5000/api/availability/technicians'

// The backend stores only a technician's name + city. Skills/rating/price/
// availability aren't modelled yet, so we fill those display fields with
// reasonable defaults until a technician-profile API exists.
const COLORS = ['blue', 'purple', 'green', 'amber', 'red', 'cyan', 'pink', 'orange', 'indigo', 'teal']
const DEFAULT_SKILLS = ['Laptop', 'Mobile', 'Desktop']
const AVAIL_CYCLE = ['now', 'today', 'busy']

function mapTechnician(t, i) {
  const name = `${t.first_name || ''} ${t.last_name || ''}`.trim() || 'Technician'
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  return {
    id: t.id,
    name,
    loc: t.city || 'Unknown',
    dist: +(1 + i * 1.3).toFixed(1),
    skills: DEFAULT_SKILLS,
    rating: 4.5,
    reviews: 0,
    price: 500,
    avail: AVAIL_CYCLE[i % AVAIL_CYCLE.length],
    initials,
    color: COLORS[i % COLORS.length],
  }
}

export default function BrowseTechnicians() {
  const [search, setSearch] = useState('')
  const [device, setDevice] = useState('all')
  const [avail, setAvail] = useState('all')
  const [radius, setRadius] = useState(20)
  const [sort, setSort] = useState('dist')
  const [selected, setSelected] = useState(null)
  const [technicianData, setTechnicianData] = useState([])

  useEffect(() => {
    fetch(API)
      .then(r => r.json())
      .then(data => setTechnicianData((data.technicians || []).map(mapTechnician)))
      .catch(() => {})
  }, [])

  const filtered = useMemo(() => {
    let list = technicianData.filter(t => {
      const mq = t.name.toLowerCase().includes(search.toLowerCase()) || t.skills.some(s => s.toLowerCase().includes(search.toLowerCase()))
      const md = device === 'all' || t.skills.includes(device)
      const ma = avail === 'all' || t.avail === avail || (avail === 'today' && (t.avail === 'now' || t.avail === 'today'))
      const mr = t.dist <= radius
      return mq && md && ma && mr
    })
    if (sort === 'rating') list.sort((a, b) => b.rating - a.rating)
    else if (sort === 'price') list.sort((a, b) => a.price - b.price)
    else list.sort((a, b) => a.dist - b.dist)
    return list
  }, [search, device, avail, radius, sort, technicianData])

  function availLabel(a) {
    if (a === 'now') return <span className="bt-avail bt-avail-now">Available now</span>
    if (a === 'today') return <span className="bt-avail bt-avail-today">Available today</span>
    return <span className="bt-avail bt-avail-busy">Busy</span>
  }

  function dotClass(a) {
    if (a === 'now') return 'bt-dot bt-dot-green'
    if (a === 'today') return 'bt-dot bt-dot-yellow'
    return 'bt-dot bt-dot-gray'
  }

  if (selected) {
    return <TechnicianProfile tech={selected} onBack={() => setSelected(null)} />
  }

  return (
    <div className="bt-page">
      <div className="bt-header">
        <div>
          <h1 className="bt-title">Browse nearby technicians</h1>
          <p className="bt-sub">Certified repair specialists near Kathmandu</p>
        </div>
      </div>

      <div className="bt-filters">
        <div className="bt-search-wrap">
          <span className="bt-filter-label">Search</span>
          <div className="bt-search-box">
            <span className="bt-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Name or skill..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bt-search-input"
            />
          </div>
        </div>

        <div className="bt-filter-group">
          <span className="bt-filter-label">Device type</span>
          <select value={device} onChange={e => setDevice(e.target.value)} className="bt-select">
            <option value="all">All devices</option>
            <option value="Laptop">Laptop</option>
            <option value="Mobile">Mobile</option>
            <option value="TV">TV</option>
            <option value="Desktop">Desktop</option>
            <option value="Gaming">Gaming</option>
            <option value="Appliance">Appliance</option>
          </select>
        </div>

        <div className="bt-filter-group">
          <span className="bt-filter-label">Availability</span>
          <select value={avail} onChange={e => setAvail(e.target.value)} className="bt-select">
            <option value="all">Any time</option>
            <option value="now">Available now</option>
            <option value="today">Available today</option>
            <option value="busy">Busy</option>
          </select>
        </div>

        <div className="bt-radius-wrap">
          <div className="bt-radius-top">
            <span className="bt-filter-label">Radius</span>
            <span className="bt-radius-val">{radius} km</span>
          </div>
          <input
            type="range"
            min="1"
            max="20"
            value={radius}
            onChange={e => setRadius(parseInt(e.target.value))}
            className="bt-range"
          />
        </div>
      </div>

      <div className="bt-results-bar">
        <span className="bt-results-count">Showing {filtered.length} technician{filtered.length !== 1 ? 's' : ''}</span>
        <div className="bt-sort-wrap">
          <span>Sort by</span>
          <select value={sort} onChange={e => setSort(e.target.value)} className="bt-select-sm">
            <option value="dist">Distance</option>
            <option value="rating">Rating</option>
            <option value="price">Price</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bt-empty">
          <div className="bt-empty-icon">📍</div>
          <p>No technicians found in this area.</p>
          <p className="bt-empty-sub">Try increasing the radius or changing filters.</p>
        </div>
      ) : (
        <div className="bt-grid">
          {filtered.map(t => (
            <div key={t.id} className="bt-card" onClick={() => setSelected(t)}>
              <div className="bt-card-top">
                <div className="bt-avatar-wrap">
                  <div className={`bt-avatar bt-avatar-${t.color}`}>{t.initials}</div>
                  <div className={dotClass(t.avail)} />
                </div>
                <span className="bt-dist-badge">📍 {t.dist} km</span>
              </div>
              <p className="bt-name">{t.name}</p>
              <p className="bt-loc">📌 {t.loc}, Kathmandu</p>
              <div className="bt-skills">
                {t.skills.map(s => <span key={s} className="bt-skill">{s}</span>)}
              </div>
              {availLabel(t.avail)}
              <div className="bt-card-footer">
                <div className="bt-rating">
                  ⭐ {t.rating} <span className="bt-reviews">({t.reviews})</span>
                </div>
                <span className="bt-price">Rs. {t.price}+</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function TechnicianProfile({ tech, onBack }) {
  return (
    <div className="bt-page">
      <button className="bt-back-btn" onClick={onBack}>← Back to technicians</button>
      <div className="bt-profile-card">
        <div className="bt-profile-top">
          <div className={`bt-avatar bt-avatar-${tech.color} bt-avatar-lg`}>{tech.initials}</div>
          <div>
            <h2 className="bt-profile-name">{tech.name}</h2>
            <p className="bt-profile-loc">📌 {tech.loc}, Kathmandu · {tech.dist} km away</p>
            <div className="bt-skills" style={{ marginTop: 6 }}>
              {tech.skills.map(s => <span key={s} className="bt-skill">{s}</span>)}
            </div>
            <div className="bt-profile-stats">
              <span>⭐ {tech.rating} ({tech.reviews} reviews)</span>
              <span>Rs. {tech.price}+ per repair</span>
            </div>
          </div>
        </div>
      </div>
      <div style={{ marginTop: 12 }}>
        <TechnicianCalendar tech={tech} />
      </div>
    </div>
  )
}
