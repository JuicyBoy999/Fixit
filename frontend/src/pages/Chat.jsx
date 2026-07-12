import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import './Chat.css'

const API = 'http://localhost:5000'

export default function Chat() {
  const { repairId } = useParams()
  const navigate = useNavigate()
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [repair, setRepair] = useState(null)
  const bottomRef = useRef(null)

  const token = localStorage.getItem('token')
  const user  = JSON.parse(localStorage.getItem('user') || '{}')

  useEffect(() => {
    if (!token) { navigate('/login'); return }
    fetchMessages()
    fetchRepair()
    const interval = setInterval(fetchMessages, 5000)
    return () => clearInterval(interval)
  }, [repairId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function fetchMessages() {
    try {
      const res = await fetch(`${API}/api/repair-requests/${repairId}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Could not load messages.')
        return
      }
      if (data.messages) setMessages(data.messages)
    } catch {
      setError('Could not load messages.')
    } finally {
      setLoading(false)
    }
  }

  async function fetchRepair() {
    try {
      const res = await fetch(`${API}/api/repair-requests/list`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      const found = (data.requests || []).find(r => String(r.id) === String(repairId))
      if (found) setRepair(found)
    } catch {}
  }

  async function handleFlag(messageId) {
    try {
      const res = await fetch(`${API}/api/messages/${messageId}/flag`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        setMessages(prev => prev.map(m => m.id === messageId ? { ...m, flagged: true } : m))
      }
    } catch {
      setError('Failed to flag message.')
    }
  }

  async function handleSend(e) {
    e.preventDefault()
    const msg = text.trim()
    if (!msg) return
    setSending(true)
    try {
      const res = await fetch(`${API}/api/repair-requests/${repairId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: msg }),
      })
      if (res.ok) {
        setText('')
        await fetchMessages()
      }
    } catch {
      setError('Failed to send message.')
    }
    setSending(false)
  }

  const fmt = ts => {
    const d = new Date(ts)
    return d.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' }) +
      ' · ' + d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })
  }

  const dashPath = user.role === 'technician' ? '/technician-dashboard' : '/dashboard'

  return (
    <div className="ch-page">
      <div className="ch-header">
        <button className="ch-back" onClick={() => navigate(dashPath)}>← Back</button>
        <div className="ch-header-info">
          <span className="ch-title">
            {repair ? `Repair #${repairId} — ${repair.device_type}` : `Repair #${repairId}`}
          </span>
          {repair && (
            <span className="ch-subtitle">{repair.fault_description?.slice(0, 60)}</span>
          )}
        </div>
        {repair && (
          <span className={`ch-status-badge ch-status-badge--${repair.status}`}>
            {repair.status.replace('_', ' ')}
          </span>
        )}
      </div>

      <div className="ch-body">
        {loading && <p className="ch-hint">Loading messages…</p>}
        {error && <p className="ch-error">{error}</p>}
        {!loading && messages.length === 0 && (
          <div className="ch-empty">
            <span className="ch-empty-icon">💬</span>
            <p>No messages yet. Start the conversation!</p>
          </div>
        )}

        <div className="ch-messages">
          {messages.map(m => {
            const isMe = m.sender_id === user.id
            return (
              <div key={m.id} className={`ch-msg ${isMe ? 'ch-msg--me' : 'ch-msg--them'}`}>
                {!isMe && (
                  <div className="ch-msg-avatar">
                    {(m.sender_name || '?').charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="ch-msg-bubble-wrap">
                  {!isMe && <span className="ch-msg-name">{m.sender_name || 'Other party'}</span>}
                  <div className="ch-msg-bubble">{m.content}</div>
                  <span className="ch-msg-time">
                    {fmt(m.created_at)}
                    {isMe && <> · {m.read_at ? '✓✓ Read' : '✓ Sent'}</>}
                    {m.flagged ? (
                      <> · 🚩 Flagged</>
                    ) : (
                      !isMe && <> · <button type="button" className="ch-flag-btn" onClick={() => handleFlag(m.id)}>Flag</button></>
                    )}
                  </span>
                </div>
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>
      </div>

      <form className="ch-compose" onSubmit={handleSend}>
        <input
          className="ch-input"
          placeholder="Type a message…"
          value={text}
          onChange={e => setText(e.target.value)}
          disabled={sending}
        />
        <button className="ch-send-btn" type="submit" disabled={sending || !text.trim()}>
          {sending ? '…' : '➤'}
        </button>
      </form>
    </div>
  )
}
