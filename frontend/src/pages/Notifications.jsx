import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './Notifications.css'

const API = 'http://localhost:5000/api/notifications'

const ICON_MAP = {
  confirmed: { icon: '✓', cls: 'nf-icon-success' },
  success:   { icon: '✓', cls: 'nf-icon-success' },
  onway:     { icon: '→', cls: 'nf-icon-info' },
  info:      { icon: '→', cls: 'nf-icon-info' },
  reminder:  { icon: '⏰', cls: 'nf-icon-warning' },
  warning:   { icon: '⏰', cls: 'nf-icon-warning' },
  cancelled: { icon: '✕', cls: 'nf-icon-danger' },
  danger:    { icon: '✕', cls: 'nf-icon-danger' },
}

function relativeTime(ts) {
  if (!ts) return ''
  const diff = Date.now() - new Date(ts).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'Just now'
  if (min < 60) return `${min} min ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr} hr ago`
  const days = Math.floor(hr / 24)
  return days === 1 ? 'Yesterday' : `${days} days ago`
}

export default function Notifications() {
  const navigate = useNavigate()
  const [notifs, setNotifs] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  const user = JSON.parse(localStorage.getItem('user') || '{}')

  useEffect(() => {
    if (!user.id) { setLoading(false); return }
    fetch(`${API}/${user.id}`)
      .then(r => r.json())
      .then(data => {
        const list = (data.notifications || []).map(n => ({
          id: n.id,
          type: n.type,
          title: n.title,
          message: n.message,
          time: relativeTime(n.created_at),
          read: n.is_read,
        }))
        setNotifs(list)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user.id])

  const unread = notifs.filter(n => !n.read).length

  function markAll() {
    setNotifs(notifs.map(n => ({ ...n, read: true })))
    if (user.id) fetch(`${API}/${user.id}/read-all`, { method: 'PATCH' }).catch(() => {})
  }

  function dismiss(id) {
    setNotifs(notifs.filter(n => n.id !== id))
    fetch(`${API}/${id}`, { method: 'DELETE' }).catch(() => {})
  }

  function markRead(id) {
    setNotifs(notifs.map(n => n.id === id ? { ...n, read: true } : n))
    fetch(`${API}/${id}/read`, { method: 'PATCH' }).catch(() => {})
  }

  const filtered = filter === 'unread' ? notifs.filter(n => !n.read) : notifs

  return (
    <div className="nf-page">
      <aside className="nf-sidebar">
        <div className="nf-brand">⚡ Fixit</div>
        <div className="nf-sidebar-info">
          <h2 className="nf-sidebar-heading">Notifications</h2>
          <p className="nf-sidebar-sub">Stay up to date with your repair bookings and technician updates.</p>
        </div>
        {unread > 0 && (
          <div className="nf-sidebar-badge">
            <span className="nf-count">{unread}</span>
            <span className="nf-count-label">unread</span>
          </div>
        )}
        <div className="nf-sidebar-nav">
          <button
            className={`nf-nav-item ${filter === 'all' ? 'nf-nav-item--active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All <span className="nf-nav-count">{notifs.length}</span>
          </button>
          <button
            className={`nf-nav-item ${filter === 'unread' ? 'nf-nav-item--active' : ''}`}
            onClick={() => setFilter('unread')}
          >
            Unread <span className="nf-nav-count">{unread}</span>
          </button>
        </div>
        <div className="nf-sidebar-actions">
          {unread > 0 && (
            <button className="nf-mark-all-btn" onClick={markAll}>Mark all as read</button>
          )}
          <button className="nf-back-btn" onClick={() => navigate('/dashboard')}>← Dashboard</button>
        </div>
      </aside>

      <main className="nf-main">
        <div className="nf-main-top">
          <div>
            <h1 className="nf-main-heading">
              {filter === 'unread' ? 'Unread Notifications' : 'All Notifications'}
            </h1>
            <p className="nf-main-sub">
              {filtered.length === 0
                ? 'Nothing here yet.'
                : `${filtered.length} notification${filtered.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          {unread > 0 && (
            <button className="nf-mark-btn" onClick={markAll}>Mark all as read</button>
          )}
        </div>

        {loading ? (
          <div className="nf-loading">Loading notifications...</div>
        ) : filtered.length === 0 ? (
          <div className="nf-empty">
            <div className="nf-empty-icon">🔔</div>
            <p>{filter === 'unread' ? 'No unread notifications.' : 'No notifications yet.'}</p>
            <button className="nf-btn-primary" onClick={() => navigate('/dashboard')} style={{ marginTop: '1.5rem' }}>
              Back to Dashboard
            </button>
          </div>
        ) : (
          <div className="nf-list">
            {filtered.map(n => {
              const { icon, cls } = ICON_MAP[n.type] || ICON_MAP.info
              return (
                <div
                  key={n.id}
                  className={`nf-item${n.read ? '' : ' nf-item--unread'}`}
                  onClick={() => markRead(n.id)}
                >
                  <div className={`nf-item-icon ${cls}`}>{icon}</div>
                  <div className="nf-item-content">
                    <div className="nf-item-row">
                      <span className="nf-item-title">{n.title}</span>
                      <div className="nf-item-meta">
                        <span className="nf-item-time">{n.time}</span>
                        {!n.read && <span className="nf-dot" />}
                      </div>
                    </div>
                    <p className="nf-item-msg">{n.message}</p>
                    <div className="nf-item-actions">
                      <button className="nf-btn-dismiss" onClick={e => { e.stopPropagation(); dismiss(n.id) }}>
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
