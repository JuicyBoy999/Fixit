import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './Notifications.css'

const API = 'http://localhost:8000/api/notifications'

const ICON_MAP = {
  confirmed: { icon: '✓', cls: 'notif-icon-success' },
  success: { icon: '✓', cls: 'notif-icon-success' },
  onway: { icon: '→', cls: 'notif-icon-info' },
  info: { icon: '→', cls: 'notif-icon-info' },
  reminder: { icon: '⏰', cls: 'notif-icon-warning' },
  warning: { icon: '⏰', cls: 'notif-icon-warning' },
  cancelled: { icon: '✕', cls: 'notif-icon-danger' },
  danger: { icon: '✕', cls: 'notif-icon-danger' },
  completed: { icon: '✓', cls: 'notif-icon-success' },
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

  const user = JSON.parse(localStorage.getItem('user') || '{}')

  useEffect(() => {
    if (!user.id) return
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
          invoice: n.invoice || null,
        }))
        setNotifs(list)
      })
      .catch(() => {})
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

  const filtered = notifs.filter(n => {
    if (filter === 'unread') return !n.read
    return true
  })

  return (
    <div className="nf-page">
      <div className="nf-modal">

        <div className="nf-header">
          <div className="nf-header-left">
            <div className="nf-logo">⚡</div>
            <div>
              <div className="nf-title">Notifications</div>
              <div className="nf-subtitle">Stay up to date with your repairs</div>
            </div>
          </div>
          {unread > 0 && <span className="nf-badge">{unread} new</span>}
        </div>

        <div className="nf-body">
          <div className="nf-toolbar">
            <div className="nf-filters">
              <button className={`nf-filter ${filter === 'all' ? 'on' : ''}`} onClick={() => setFilter('all')}>All</button>
              <button className={`nf-filter ${filter === 'unread' ? 'on' : ''}`} onClick={() => setFilter('unread')}>Unread</button>
            </div>
            {unread > 0 && (
              <button className="nf-mark-all" onClick={markAll}>Mark all as read</button>
            )}
          </div>

          {filtered.length === 0 ? (
            <div className="nf-empty">
              <div className="nf-empty-icon">🔔</div>
              <p>No notifications</p>
            </div>
          ) : (
            <div className="nf-list">
              {filtered.map(n => {
                const { icon, cls } = ICON_MAP[n.type] || ICON_MAP.reminder
                return (
                  <div key={n.id} className={`nf-item ${n.read ? '' : 'nf-item-unread'}`} onClick={() => markRead(n.id)}>
                    <div className={`nf-item-icon ${cls}`}>{icon}</div>
                    <div className="nf-item-content">
                      <div className="nf-item-row">
                        <span className="nf-item-title">{n.title}</span>
                        <span className="nf-item-time">{n.time}</span>
                      </div>
                      <p className="nf-item-msg">{n.message}</p>
                      {n.device && (
                        <div className="nf-detail-box">
                          <div className="nf-detail-row"><span>Device</span><span>{n.device}</span></div>
                          <div className="nf-detail-row"><span>Technician</span><span>{n.tech}</span></div>
                          <div className="nf-detail-row"><span>Date</span><span>{n.date}</span></div>
                          <div className="nf-detail-row"><span>Time</span><span>{n.slot}</span></div>
                        </div>
                      )}
                      <div className="nf-item-actions">
                        {n.type === 'confirmed' && (
                          <button className="nf-btn nf-btn-primary" onClick={e => { e.stopPropagation(); navigate('/book') }}>
                            View booking
                          </button>
                        )}
                        {n.invoice && (
                          <button className="nf-btn nf-btn-primary" onClick={e => { e.stopPropagation(); navigate('/invoice', { state: n.invoice }) }}>
                            View invoice
                          </button>
                        )}
                        <button className="nf-btn" onClick={e => { e.stopPropagation(); dismiss(n.id) }}>
                          Dismiss
                        </button>
                      </div>
                    </div>
                    {!n.read && <div className="nf-unread-dot" />}
                  </div>
                )
              })}
            </div>
          )}

          <div className="nf-footer">
            <button className="nf-done-btn" onClick={() => navigate('/dashboard')}>
              Done
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}