import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './RepairRequestDetails.css';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import logo from '../assets/image.png';

export default function RepairRequestDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [repair, setRepair] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useContext(AuthContext);

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [messageError, setMessageError] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const eventSource = new EventSource(`${API_URL}/api/repair/${id}/updates`);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.status) {
        setRepair(prev => prev ? { ...prev, status: data.status } : null);
      }
    };

    eventSource.onerror = (err) => {
      console.error('SSE Error:', err);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [id]);

  useEffect(() => {
    async function fetchMessages() {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await fetch(`${API_URL}/api/messages/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (res.ok) {
          setMessages(data.messages || []);
        }
      } catch (err) {
        console.error('Error fetching messages:', err);
      }
    }

    if (id) {
      fetchMessages();
    }
  }, [id]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSendingMessage(true);
    setMessageError('');
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API_URL}/api/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ repairId: id, content: newMessage }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to send message');
      }

      setMessages(prev => [...prev, data.message]);
      setNewMessage('');
    } catch (err) {
      setMessageError(err.message);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleFlagMessage = async (messageId) => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API_URL}/api/messages/${messageId}/flag`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to flag message');
      }

      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, flagged: true } : m));
      alert('Message has been flagged for admin review.');
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  useEffect(() => {
    async function fetchRepairDetails() {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await fetch(`${API_URL}/api/repair/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || 'Failed to fetch repair details');
        }

        setRepair(data.repair);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchRepairDetails();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="rd-page">
        <div className="rd-state">Loading request details...</div>
      </div>
    );
  }

  if (error || !repair) {
    return (
      <div className="rd-page">
        <div className="rd-modal rd-error-modal">
          <div className="rd-error-icon">!</div>
          <h2>Error Loading Request</h2>
          <p>{error || 'This repair request could not be found.'}</p>
          <button className="rd-btn" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rd-page">
      <div className="rd-modal">
        <div className="rd-header">
          <div className="rd-header-left">
            <div className="rd-logo"><img src={logo} alt="Fixit" className="brand-logo-img" /></div>
            <div>
              <div className="rd-title">Repair Request</div>
              <div className="rd-subtitle">Details for ID: #{repair.id}</div>
            </div>
          </div>
          <button className="rd-close" onClick={() => navigate(-1)}>✕</button>
        </div>

        <div className="rd-body">
          <div className="rd-timeline">
            {[
              { id: 'pending', label: 'Requested', icon: '📝' },
              { id: 'confirmed', label: 'Confirmed', icon: '✅' },
              { id: 'in_progress', label: 'In Progress', icon: '🛠️' },
              { id: 'completed', label: 'Completed', icon: '🎉' }
            ].map((step, index, array) => {
              const statusOrder = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];
              const currentIdx = statusOrder.indexOf(repair.status);
              const stepIdx = statusOrder.indexOf(step.id);
              const isCompleted = currentIdx >= stepIdx && repair.status !== 'cancelled';
              const isActive = repair.status === step.id;

              return (
                <div key={step.id} className={`rd-timeline-step ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}>
                  <div className="rd-step-icon">{isCompleted ? '✓' : step.icon}</div>
                  <div className="rd-step-label">{step.label}</div>
                  {index < array.length - 1 && <div className="rd-step-line" />}
                </div>
              );
            })}
          </div>

          {repair.status === 'cancelled' && (
            <div className="rd-cancelled-notice">
              This request has been cancelled.
            </div>
          )}

          <div className="rd-section">
            <h3>Device Information</h3>
            <div className="rd-info-grid">
              <div className="rd-info-item">
                <label>Device Type</label>
                <p>{repair.device_name}</p>
              </div>
              <div className="rd-info-item">
                <label>City</label>
                <p>{repair.city}</p>
              </div>
            </div>
            <div className="rd-info-item full">
              <label>Issue Description</label>
              <p className="rd-desc">{repair.issue_description}</p>
            </div>
          </div>

          <div className="rd-section">
            <h3>Schedule & Contact</h3>
            <div className="rd-info-grid">
              <div className="rd-info-item">
                <label>Preferred Date</label>
                <p>{new Date(repair.preferred_date).toLocaleDateString()}</p>
              </div>
              <div className="rd-info-item">
                <label>Contact Name</label>
                <p>{repair.contact_name}</p>
              </div>
              <div className="rd-info-item">
                <label>Phone</label>
                <p>{repair.contact_phone}</p>
              </div>
              <div className="rd-info-item">
                <label>Email</label>
                <p>{repair.contact_email}</p>
              </div>
            </div> 
            <div className="rd-info-item full">
              <label>Service Address</label>
              <p>{repair.address || 'No specific address provided'}</p>
            </div>
          </div>

          <div className="rd-section">
            <h3>Repair Discussion</h3>
            <div className="rd-chat-box">
              <div className="rd-chat-messages">
                {messages.length === 0 ? (
                  <p className="rd-chat-empty">No messages yet. Start the conversation!</p>
                ) : (
                  messages.map(msg => {
                    const isSelf = msg.sender_id === user?.id || msg.sender_email === user?.email;
                    return (
                      <div key={msg.id} className={`rd-chat-message ${isSelf ? 'self' : 'other'}`}>
                        <div className="rd-msg-meta">
                          <span className="rd-msg-sender">{msg.sender_name} ({msg.sender_role})</span>
                          <span className="rd-msg-time">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className="rd-msg-bubble">
                          <p>{msg.content}</p>
                          {msg.flagged ? (
                            <span className="rd-flag-indicator" title="This message has been flagged for moderation">🚩 Flagged</span>
                          ) : (
                            !isSelf && (
                              <button
                                type="button"
                                className="rd-btn-flag"
                                onClick={() => handleFlagMessage(msg.id)}
                                title="Flag as inappropriate"
                              >
                                🏳️ Flag
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              <form onSubmit={handleSendMessage} className="rd-chat-form">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  disabled={sendingMessage}
                  required
                />
                <button type="submit" className="rd-btn-send" disabled={sendingMessage}>
                  {sendingMessage ? 'Sending...' : 'Send'}
                </button>
              </form>
              {messageError && <p className="rd-chat-error">{messageError}</p>}
            </div>
          </div>

          <div className="rd-actions">
            {(user?.role === 'technician' || user?.role === 'admin') && (
              <div className="rd-tech-controls">
              <label>Update Status (Technician View)</label>
              <select 
                value={repair.status} 
                onChange={async (e) => {
                  const newStatus = e.target.value;
                  const token = localStorage.getItem('token');
                  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                  try {
                    const res = await fetch(`${API_URL}/api/repair/${id}/status`, {
                      method: 'PATCH',
                      headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                      },
                      body: JSON.stringify({ status: newStatus }),
                    });
                    if (!res.ok) throw new Error('Failed to update status');
                    setRepair(prev => ({ ...prev, status: newStatus }));
                  } catch (err) {
                    alert(err.message);
                  }
                }}
                className="rd-status-select"
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}