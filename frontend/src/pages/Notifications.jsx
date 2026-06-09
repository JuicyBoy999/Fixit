import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Notifications.css'

const NOTIFICATIONS = [
  {
    id: 1,
    type: 'confirmed',
    title: 'Booking confirmed by technician',
    message: 'Ram Kumar has accepted your laptop repair booking. Your appointment is confirmed for Jun 3, 2026 at 10:00 AM.',
    time: 'Just now',
    read: false,
    device: 'Laptop',
    tech: 'Ram Kumar',
    date: 'Jun 3, 2026',
    slot: '10:00 AM',
  },
  {
    id: 2,
    type: 'onway',
    title: 'Technician on the way',
    message: 'Ram Kumar is confirmed for your appointment tomorrow. You will receive a reminder 1 hour before.',
    time: '2 min ago',
    read: false,
  },
  {
    id: 3,
    type: 'reminder',
    title: 'Booking reminder',
    message: 'Reminder: Your smartphone repair with Sita Maharjan is in 1 hour — Jun 5 at 2:00 PM.',
    time: 'Yesterday',
    read: true,
  },
  {
    id: 4,
    type: 'cancelled',
    title: 'Booking cancelled',
    message: 'Your TV repair booking with Bikash Pradhan on Jun 8 has been cancelled.',
    time: '2 days ago',
    read: true,
  },
]

const ICON_MAP = {
  confirmed: { icon: '✓', cls: 'notif-icon-success' },
  onway: { icon: '→', cls: 'notif-icon-info' },
  reminder: { icon: '⏰', cls: 'notif-icon-warning' },
  cancelled: { icon: '✕', cls: 'notif-icon-danger' },
}

export default function Notifications() {
  const navigate = useNavigate()
  const [notifs, setNotifs] = useState(NOTIFICATIONS)
  const [filter, setFilter] = useState('all')

  const unread = notifs.filter(n => !n.read).length

  function markAll() {
    setNotifs(notifs.map(n => ({ ...n, read: true })))
  }

  function dismiss(id) {
    setNotifs(notifs.filter(n => n.id !== id))
  }

  function markRead(id) {
    setNotifs(notifs.map(n => n.id === id ? { ...n, read: true } : n))
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
