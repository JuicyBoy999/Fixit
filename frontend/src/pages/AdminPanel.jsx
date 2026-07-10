import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import useSessionTimeout from '../hooks/useSessionTimeout';
import logo from '../assets/image.png';
import './AdminPanel.css';

const AdminPanel = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [suspendedAccounts, setSuspendedAccounts] = useState([]);
  const [pendingTechnicians, setPendingTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accountsLoading, setAccountsLoading] = useState(true);
  const [verificationLoading, setVerificationLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accountsError, setAccountsError] = useState(null);
  const [verificationError, setVerificationError] = useState(null);

  const [warningModalOpen, setWarningModalOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [warningReason, setWarningReason] = useState('');
  const [warningSubmitting, setWarningSubmitting] = useState(false);

  useSessionTimeout(15 * 60 * 1000);

  useEffect(() => {
    const storedUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
    const activeUser = user || storedUser;

    if (!activeUser || activeUser.role !== 'admin') {
      logout();
      navigate('/admin-login');
    } else {
      fetchFlaggedMessages();
      fetchAccounts();
      fetchSuspendedAccounts();
      fetchPendingTechnicians();
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

  const fetchAccounts = async () => {
    setAccountsLoading(true);
    setAccountsError(null);
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API_URL}/api/admin/accounts`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to fetch accounts');
      }
      setAccounts(data.accounts || []);
    } catch (err) {
      setAccountsError(err.message);
    } finally {
      setAccountsLoading(false);
    }
  };

  const fetchSuspendedAccounts = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API_URL}/api/admin/accounts/suspended`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to fetch suspended accounts');
      }
      setSuspendedAccounts(data.accounts || []);
    } catch (err) {
      setAccountsError(err.message);
    }
  };

  const fetchPendingTechnicians = async () => {
    setVerificationLoading(true);
    setVerificationError(null);
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API_URL}/api/admin/technician-verifications/pending`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to fetch pending technicians');
      }
      setPendingTechnicians(data.technicians || []);
    } catch (err) {
      setVerificationError(err.message);
    } finally {
      setVerificationLoading(false);
    }
  };

  const refreshAccounts = async () => {
    await Promise.all([fetchAccounts(), fetchSuspendedAccounts()]);
  };

  const handleSuspendAccount = async (account) => {
    const reason = window.prompt(`Reason for suspending ${account.name}:`);
    if (reason === null) return;

    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API_URL}/api/admin/accounts/${account.type}/${account.id}/suspend`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to suspend account');
      }

      await refreshAccounts();
      alert('Account suspended and notification sent.');
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleReinstateAccount = async (account) => {
    if (!window.confirm(`Reinstate ${account.name}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API_URL}/api/admin/accounts/${account.type}/${account.id}/reinstate`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to reinstate account');
      }

      await refreshAccounts();
      alert('Account reinstated successfully.');
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleApproveTechnician = async (technician) => {
    if (!window.confirm(`Approve credentials for ${technician.name}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API_URL}/api/admin/technician-verifications/${technician.id}/approve`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to approve technician');
      }

      await fetchPendingTechnicians();
      alert('Technician approved and notified.');
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleRejectTechnician = async (technician) => {
    const reason = window.prompt(`Reason for rejecting ${technician.name}:`);
    if (reason === null) return;

    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API_URL}/api/admin/technician-verifications/${technician.id}/reject`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to reject technician');
      }

      await fetchPendingTechnicians();
      alert('Technician rejected and notified.');
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const getDocumentUrl = (document) => {
    const rawUrl = typeof document === 'string'
      ? document
      : document?.url || document?.href || document?.path || '';

    if (!rawUrl) return '';
    if (/^https?:\/\//i.test(rawUrl)) return rawUrl;

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    return `${API_URL}${rawUrl.startsWith('/') ? rawUrl : `/${rawUrl}`}`;
  };

  const getDocumentLabel = (document, index) => {
    if (typeof document === 'string') {
      return document.split('/').pop() || `Credential ${index + 1}`;
    }

    return document?.name || document?.filename || document?.label || `Credential ${index + 1}`;
  };

  const isImageDocument = (url) => /\.(png|jpe?g|webp|gif)$/i.test(url.split('?')[0]);

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
            <span className="ap-brand-mark"><img src={logo} alt="Fixit" className="brand-logo-img" /></span>
            <span>Fixit Admin</span>
          </div>
          <button className="ap-btn ap-btn-secondary" onClick={handleLogoutClick}>
            Sign Out
          </button>
        </header>

        <section className="ap-heading-row">
          <h1>Admin Dashboard</h1>
          <p>Review flagged messages and manage customer or technician account access.</p>
        </section>

        <section className="ap-section">
          <div className="ap-section-head">
            <div>
              <h2>Credential Verification Queue</h2>
              <p>{pendingTechnicians.length} pending technician{pendingTechnicians.length === 1 ? '' : 's'}</p>
            </div>
            <button className="ap-btn ap-btn-secondary" type="button" onClick={fetchPendingTechnicians}>
              Refresh
            </button>
          </div>

          {verificationLoading ? (
            <div className="ap-state">Loading pending verifications...</div>
          ) : verificationError ? (
            <div className="ap-state ap-state-error">Error: {verificationError}</div>
          ) : pendingTechnicians.length === 0 ? (
            <div className="ap-empty">
              <h2>No Pending Credentials</h2>
              <p>Technician credential submissions awaiting review will appear here.</p>
            </div>
          ) : (
            <div className="ap-table-wrap">
              <table className="ap-table">
                <thead>
                  <tr>
                    <th>Technician</th>
                    <th>Documents</th>
                    <th>Status</th>
                    <th>Submitted</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingTechnicians.map((technician) => (
                    <tr key={technician.id}>
                      <td>
                        <div className="sender-info">{technician.name}</div>
                        <div className="sender-email">{technician.email}</div>
                        <div className="sender-email">{technician.title} - {technician.location}</div>
                      </td>
                      <td>
                        {(technician.documents || []).length === 0 ? (
                          <span className="ap-muted">No documents attached</span>
                        ) : (
                          <div className="ap-doc-list">
                            {technician.documents.map((document, index) => {
                              const documentUrl = getDocumentUrl(document);
                              return (
                                <a
                                  className="ap-doc-link"
                                  href={documentUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  key={`${technician.id}-${index}`}
                                >
                                  {isImageDocument(documentUrl) && (
                                    <img src={documentUrl} alt="" className="ap-doc-preview" />
                                  )}
                                  <span>{getDocumentLabel(document, index)}</span>
                                </a>
                              );
                            })}
                          </div>
                        )}
                      </td>
                      <td>
                        <span className={`ap-status ap-status-${technician.verificationStatus}`}>
                          {technician.verificationStatus}
                        </span>
                      </td>
                      <td>{new Date(technician.createdAt).toLocaleString()}</td>
                      <td>
                        <div className="ap-btn-row">
                          <button
                            className="ap-btn ap-btn-primary"
                            onClick={() => handleApproveTechnician(technician)}
                          >
                            Approve
                          </button>
                          <button
                            className="ap-btn ap-btn-danger"
                            onClick={() => handleRejectTechnician(technician)}
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="ap-section">
          <div className="ap-section-head">
            <div>
              <h2>User Management</h2>
              <p>{suspendedAccounts.length} suspended account{suspendedAccounts.length === 1 ? '' : 's'}</p>
            </div>
            <button className="ap-btn ap-btn-secondary" type="button" onClick={refreshAccounts}>
              Refresh
            </button>
          </div>

          {accountsLoading ? (
            <div className="ap-state">Loading accounts...</div>
          ) : accountsError ? (
            <div className="ap-state ap-state-error">Error: {accountsError}</div>
          ) : accounts.length === 0 ? (
            <div className="ap-empty">
              <h2>No Accounts Found</h2>
              <p>User and technician accounts will appear here after they are created.</p>
            </div>
          ) : (
            <div className="ap-table-wrap">
              <table className="ap-table">
                <thead>
                  <tr>
                    <th>Account</th>
                    <th>Type</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map((account) => (
                    <tr key={`${account.type}-${account.id}`}>
                      <td>
                        <div className="sender-info">{account.name}</div>
                        <div className="sender-email">{account.email}</div>
                      </td>
                      <td className="ap-capitalize">{account.type}</td>
                      <td>{account.city}</td>
                      <td>
                        <span className={`ap-status ap-status-${account.status}`}>
                          {account.status}
                        </span>
                      </td>
                      <td>
                        <div className="ap-btn-row">
                          {account.status === 'active' ? (
                            <button
                              className="ap-btn ap-btn-danger"
                              onClick={() => handleSuspendAccount(account)}
                            >
                              Suspend
                            </button>
                          ) : (
                            <button
                              className="ap-btn ap-btn-primary"
                              onClick={() => handleReinstateAccount(account)}
                            >
                              Reinstate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="ap-heading-row ap-moderation-heading">
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
