import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import useSessionTimeout from '../hooks/useSessionTimeout';
import AdminShell, { AdminEmpty, AdminIcon, AdminNotice } from '../components/admin/AdminShell';

function initials(name = '') {
  return name.split(' ').filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase() || '?';
}

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
    if (/^(https?|data):/i.test(rawUrl)) return rawUrl;

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    return `${API_URL}${rawUrl.startsWith('/') ? rawUrl : `/${rawUrl}`}`;
  };

  const getDocumentLabel = (document, index) => {
    if (typeof document === 'string') {
      return document.split('/').pop() || `Credential ${index + 1}`;
    }

    return document?.name || document?.filename || document?.label || `Credential ${index + 1}`;
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

  return (
    <AdminShell
      eyebrow="Live operations"
      title="Admin dashboard"
      description="Review flagged messages and manage customer or technician account access."
    >
      <section className="adm-card">
        <div className="adm-card-head">
          <div>
            <h2>Credential verification</h2>
            <p>{pendingTechnicians.length} pending technician{pendingTechnicians.length === 1 ? '' : 's'}</p>
          </div>
          <button className="adm-btn adm-btn-secondary" type="button" onClick={fetchPendingTechnicians}>
            <AdminIcon name="refresh" />Refresh
          </button>
        </div>

        {verificationLoading ? (
          <div className="adm-loading">Loading pending verifications…</div>
        ) : verificationError ? (
          <div style={{ padding: 20 }}><AdminNotice>{verificationError}</AdminNotice></div>
        ) : pendingTechnicians.length === 0 ? (
          <AdminEmpty title="No pending credentials" description="Technician credential submissions awaiting review will appear here." />
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr><th>Technician</th><th>Documents</th><th>Status</th><th>Submitted</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {pendingTechnicians.map((technician) => (
                  <tr key={technician.id}>
                    <td>
                      <div className="adm-person">
                        <span className="adm-avatar">{initials(technician.name)}</span>
                        <div><strong>{technician.name}</strong><span>{technician.title} · {technician.location}</span><span>{technician.email}</span></div>
                      </div>
                    </td>
                    <td>
                      {(technician.documents || []).length === 0 ? (
                        <span className="adm-muted">No documents attached</span>
                      ) : (
                        <div className="adm-docs">
                          {technician.documents.map((document, index) => (
                            <a
                              className="adm-doc"
                              href={getDocumentUrl(document)}
                              target="_blank"
                              rel="noreferrer"
                              key={`${technician.id}-${index}`}
                            >
                              <AdminIcon name="external" size={14} />{getDocumentLabel(document, index)}
                            </a>
                          ))}
                        </div>
                      )}
                    </td>
                    <td><span className={`adm-badge adm-badge-${technician.verificationStatus}`}>{technician.verificationStatus}</span></td>
                    <td>{new Date(technician.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="adm-row-actions">
                        <button className="adm-btn adm-btn-secondary" onClick={() => handleRejectTechnician(technician)}>Reject</button>
                        <button className="adm-btn adm-btn-primary" onClick={() => handleApproveTechnician(technician)}>Approve</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="adm-card adm-section-space">
        <div className="adm-card-head">
          <div>
            <h2>User management</h2>
            <p>{suspendedAccounts.length} suspended account{suspendedAccounts.length === 1 ? '' : 's'}</p>
          </div>
          <button className="adm-btn adm-btn-secondary" type="button" onClick={refreshAccounts}>
            <AdminIcon name="refresh" />Refresh
          </button>
        </div>

        {accountsLoading ? (
          <div className="adm-loading">Loading accounts…</div>
        ) : accountsError ? (
          <div style={{ padding: 20 }}><AdminNotice>{accountsError}</AdminNotice></div>
        ) : accounts.length === 0 ? (
          <AdminEmpty title="No accounts found" description="User and technician accounts will appear here after they are created." />
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr><th>Account</th><th>Type</th><th>Location</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {accounts.map((account) => (
                  <tr key={`${account.type}-${account.id}`}>
                    <td>
                      <div className="adm-person">
                        <span className="adm-avatar">{initials(account.name)}</span>
                        <div><strong>{account.name}</strong><span>{account.email}</span></div>
                      </div>
                    </td>
                    <td style={{ textTransform: 'capitalize' }}>{account.type}</td>
                    <td>{account.city}</td>
                    <td><span className={`adm-badge adm-badge-${account.status}`}>{account.status}</span></td>
                    <td>
                      <div className="adm-row-actions">
                        {account.status === 'active' ? (
                          <button className="adm-btn adm-btn-danger" onClick={() => handleSuspendAccount(account)}>Suspend</button>
                        ) : (
                          <button className="adm-btn adm-btn-primary" onClick={() => handleReinstateAccount(account)}>Reinstate</button>
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

      <section className="adm-card adm-section-space">
        <div className="adm-card-head">
          <div>
            <h2>Message moderation</h2>
            <p>User-reported conversations waiting for an administrator</p>
          </div>
          <span className="adm-badge adm-badge-pending">{messages.length} flagged</span>
        </div>

        {loading ? (
          <div className="adm-loading">Loading flagged messages…</div>
        ) : error ? (
          <div style={{ padding: 20 }}><AdminNotice>{error}</AdminNotice></div>
        ) : messages.length === 0 ? (
          <AdminEmpty title="Moderation queue is clear" description="Flagged messages will appear here with sender and repair context." />
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr><th>Sender</th><th>Flagged by</th><th>Message preview</th><th>Timestamp</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {messages.map((msg) => (
                  <tr key={msg.id}>
                    <td>
                      <div className="adm-person">
                        <span className="adm-avatar">{initials(msg.sender_name)}</span>
                        <div><strong>{msg.sender_name}</strong><span>{msg.sender_email}</span></div>
                      </div>
                    </td>
                    <td><span className="adm-cell-title">{msg.flagger_name || 'Anonymous'}</span><span className="adm-cell-sub">{msg.flagger_email || 'N/A'}</span></td>
                    <td><div className="adm-message">{msg.content}</div></td>
                    <td>{new Date(msg.created_at).toLocaleDateString()}</td>
                    <td>
                      <div className="adm-row-actions">
                        <button className="adm-btn adm-btn-secondary" onClick={() => handleOpenWarningModal(msg)}>Warn</button>
                        <button className="adm-btn adm-btn-danger" onClick={() => handleDeleteMessage(msg.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {warningModalOpen && selectedMessage && (
        <div className="adm-dialog-backdrop" role="presentation" onMouseDown={event => event.target === event.currentTarget && handleCloseWarningModal()}>
          <form className="adm-dialog" role="dialog" aria-modal="true" aria-labelledby="warning-title" onSubmit={handleIssueWarning}>
            <div className="adm-dialog-head">
              <div>
                <h2 id="warning-title">Issue guidelines warning</h2>
                <p>Send an official warning to <strong>{selectedMessage.sender_name}</strong>. They will be notified via email of the guidelines violation.</p>
              </div>
              <button type="button" onClick={handleCloseWarningModal} aria-label="Close"><AdminIcon name="close" /></button>
            </div>
            <div className="adm-dialog-body">
              <div className="adm-field">
                <label htmlFor="warning-reason">Reason for warning</label>
                <textarea
                  id="warning-reason"
                  className="adm-input adm-textarea"
                  placeholder="Describe why this message violates the guidelines..."
                  value={warningReason}
                  onChange={(e) => setWarningReason(e.target.value)}
                  autoFocus
                  required
                />
              </div>
            </div>
            <div className="adm-dialog-actions">
              <button type="button" className="adm-btn adm-btn-secondary" onClick={handleCloseWarningModal} disabled={warningSubmitting}>Cancel</button>
              <button type="submit" className="adm-btn adm-btn-primary" disabled={warningSubmitting || !warningReason.trim()}>
                {warningSubmitting ? 'Sending…' : 'Send warning'}
              </button>
            </div>
          </form>
        </div>
      )}
    </AdminShell>
  );
};

export default AdminPanel;
