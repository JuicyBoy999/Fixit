import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import useSessionTimeout from '../hooks/useSessionTimeout';
import './AdminPanel.css';

const AdminPanel = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Warning Modal State
  const [warningModalOpen, setWarningModalOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [warningReason, setWarningReason] = useState('');
  const [warningSubmitting, setWarningSubmitting] = useState(false);

  // Session Timeout
  useSessionTimeout(15 * 60 * 1000);

  // Protect Admin route
  useEffect(() => {
    const storedUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
    const activeUser = user || storedUser;

    if (!activeUser || activeUser.role !== 'admin') {
      logout();
      navigate('/admin-login');
    } else {
      fetchFlaggedMessages();
    }
  }, [user, navigate, logout]);

  const fetchFlaggedMessages = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API_URL}/api/admin/flagged-messages`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to fetch flagged messages');
      }
      setMessages(data.messages || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Are you sure you want to delete this message? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API_URL}/api/admin/messages/${messageId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to delete message');
      }

      // Remove from list
      setMessages(prev => prev.filter(m => m.id !== messageId));
      alert('Message deleted successfully.');
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleOpenWarningModal = (msg) => {
    setSelectedMessage(msg);
    setWarningReason('');
    setWarningModalOpen(true);
  };

  const handleCloseWarningModal = () => {
    setWarningModalOpen(false);
    setSelectedMessage(null);
    setWarningReason('');
  };

  const handleIssueWarning = async (e) => {
    e.preventDefault();
    if (!warningReason.trim() || !selectedMessage) return;

    setWarningSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API_URL}/api/admin/users/${selectedMessage.sender_id}/warn`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: warningReason }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to issue warning');
      }

      alert(`Warning issued to sender via email.`);
      handleCloseWarningModal();
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setWarningSubmitting(false);
    }
  };

  const handleLogoutClick = () => {
    logout();
    navigate('/admin-login');
  };

  return (
    <div className="ap-page">
      <div className="ap-shell">
        <header className="ap-topbar">
          <div className="ap-brand">
            <span className="ap-brand-mark">⚡</span>
            <span>Fixit Admin</span>
          </div>
          <button className="ap-btn ap-btn-secondary" onClick={handleLogoutClick}>
            Sign Out
          </button>
        </header>

        <section className="ap-heading-row">
          <h1>Flagged Messages Queue</h1>
          <p>Review and moderate messages flagged as inappropriate by users.</p>
        </section>

        {loading ? (
          <div className="ap-state">Loading flagged messages...</div>
        ) : error ? (
          <div className="ap-state ap-state-error">Error: {error}</div>
        ) : messages.length === 0 ? (
          <div className="ap-empty">
            <h2>Queue is Empty</h2>
            <p>There are no flagged messages in the moderation queue at this time.</p>
          </div>
        ) : (
          <div className="ap-table-wrap">
            <table className="ap-table">
              <thead>
                <tr>
                  <th>Sender</th>
                  <th>Flagged By</th>
                  <th>Message Preview</th>
                  <th>Timestamp</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {messages.map((msg) => (
                  <tr key={msg.id}>
                    <td>
                      <div className="sender-info">{msg.sender_name}</div>
                      <div className="sender-email">{msg.sender_email}</div>
                    </td>
                    <td>
                      <div className="sender-info">{msg.flagger_name || 'Anonymous'}</div>
                      <div className="sender-email">{msg.flagger_email || 'N/A'}</div>
                    </td>
                    <td>
                      <p className="msg-content">"{msg.content}"</p>
                    </td>
                    <td>
                      {new Date(msg.created_at).toLocaleString()}
                    </td>
                    <td>
                      <div className="ap-btn-row">
                        <button
                          className="ap-btn ap-btn-primary"
                          onClick={() => handleOpenWarningModal(msg)}
                        >
                          Warn Sender
                        </button>
                        <button
                          className="ap-btn ap-btn-danger"
                          onClick={() => handleDeleteMessage(msg.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Warning Modal */}
      {warningModalOpen && selectedMessage && (
        <div className="ap-modal-backdrop" onClick={handleCloseWarningModal}>
          <div className="ap-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Issue Guidelines Warning</h2>
            <p>
              Send an official warning to <strong>{selectedMessage.sender_name}</strong>. They will be notified via email of the guidelines violation.
            </p>
            <form onSubmit={handleIssueWarning}>
              <label htmlFor="warning-reason">Reason for Warning</label>
              <textarea
                id="warning-reason"
                placeholder="Describe why this message violates the guidelines..."
                value={warningReason}
                onChange={(e) => setWarningReason(e.target.value)}
                required
              />
              <div className="ap-modal-actions">
                <button
                  type="button"
                  className="ap-btn ap-btn-secondary"
                  onClick={handleCloseWarningModal}
                  disabled={warningSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="ap-btn ap-btn-primary"
                  disabled={warningSubmitting}
                >
                  {warningSubmitting ? 'Sending...' : 'Send Warning'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
