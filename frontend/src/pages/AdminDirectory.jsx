import { useEffect, useMemo, useState } from 'react';
import AdminShell, { AdminEmpty, AdminIcon, AdminNotice } from '../components/admin/AdminShell';
import { adminFetch, downloadAdminCsv } from '../components/admin/adminApi';

const ROLE_LABELS = { user: 'Customer', technician: 'Technician', admin: 'Admin' };

function initials(name = '') {
  return name.split(' ').filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase() || '?';
}

function date(value, includeTime = false) {
  if (!value) return 'No activity';
  return new Date(value).toLocaleString(undefined, includeTime
    ? { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }
    : { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function AdminDirectory() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('all');
  const [status, setStatus] = useState('all');
  const [dialog, setDialog] = useState(null);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await adminFetch('/api/directory');
      setUsers(data.users || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initial = window.setTimeout(() => load(), 0);
    return () => window.clearTimeout(initial);
  }, []);

  const filtered = useMemo(() => users.filter(user => {
    const query = search.trim().toLowerCase();
    if (role !== 'all' && user.role !== role) return false;
    if (status !== 'all' && user.status !== status) return false;
    if (!query) return true;
    return [user.name, user.email, user.city, user.phone].some(value => String(value || '').toLowerCase().includes(query));
  }), [users, search, role, status]);

  const counts = useMemo(() => users.reduce((result, user) => {
    result[user.role] = (result[user.role] || 0) + 1;
    return result;
  }, {}), [users]);

  const openStatusDialog = (user, nextStatus) => {
    setDialog({ user, nextStatus });
    setReason('');
  };

  const updateStatus = async () => {
    if (!dialog || (dialog.nextStatus !== 'active' && !reason.trim())) return;
    setBusy(true);
    setError('');
    try {
      await adminFetch(`/api/directory/${dialog.user.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: dialog.nextStatus, reason: reason.trim() }),
      });
      setUsers(current => current.map(user => user.id === dialog.user.id ? { ...user, status: dialog.nextStatus } : user));
      setSuccess(`${dialog.user.name}'s account is now ${dialog.nextStatus}.`);
      setDialog(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AdminShell
      eyebrow="Account governance"
      title="People directory"
      description="Search every registered customer, technician, and administrator. Review recent activity and control account access from one place."
      actions={<button className="adm-btn adm-btn-secondary" onClick={() => downloadAdminCsv('/api/directory/export', 'fixit-people.csv')} disabled={!users.length}><AdminIcon name="download" />Export CSV</button>}
    >
      {error && <AdminNotice>{error}</AdminNotice>}
      {success && <AdminNotice type="success">{success}</AdminNotice>}

      <section className="adm-stats">
        <DirectoryStat label="All accounts" value={users.length} />
        <DirectoryStat label="Customers" value={counts.user || 0} />
        <DirectoryStat label="Technicians" value={counts.technician || 0} />
        <DirectoryStat label="Restricted" value={users.filter(user => user.status !== 'active').length} />
      </section>

      <section className="adm-card">
        <div className="adm-toolbar">
          <div className="adm-search"><AdminIcon name="search" /><input className="adm-input" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search name, email, phone, or city…" aria-label="Search accounts" /></div>
          <select className="adm-select" value={role} onChange={event => setRole(event.target.value)} aria-label="Filter by role"><option value="all">All roles</option><option value="user">Customers</option><option value="technician">Technicians</option><option value="admin">Admins</option></select>
          <select className="adm-select" value={status} onChange={event => setStatus(event.target.value)} aria-label="Filter by status"><option value="all">All statuses</option><option value="active">Active</option><option value="suspended">Suspended</option><option value="deactivated">Deactivated</option></select>
          <span className="adm-muted">{filtered.length} shown</span>
        </div>

        {loading ? <div className="adm-loading">Loading registered accounts…</div> : filtered.length === 0 ? (
          <AdminEmpty title="No matching accounts" description="Try a broader search or reset one of the filters." />
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead><tr><th>Account</th><th>Role</th><th>Status</th><th>Joined</th><th>Activity summary</th><th>Access</th></tr></thead>
              <tbody>{filtered.map(user => (
                <tr key={user.id}>
                  <td><div className="adm-person"><span className="adm-avatar">{initials(user.name)}</span><div><strong>{user.name}</strong><span>{user.email}</span><span>{user.city || 'Location not set'}</span></div></div></td>
                  <td><span className={`adm-badge adm-badge-${user.role}`}>{ROLE_LABELS[user.role] || user.role}</span></td>
                  <td><span className={`adm-badge adm-badge-${user.status}`}>{user.status}</span></td>
                  <td>{date(user.joined_at)}</td>
                  <td><span className="adm-cell-title">{activitySummary(user)}</span><span className="adm-cell-sub">Last activity: {date(user.activity?.last_activity, true)}</span></td>
                  <td>{user.status === 'active' ? <div className="adm-row-actions"><button className="adm-btn adm-btn-secondary" onClick={() => openStatusDialog(user, 'suspended')}>Suspend</button><button className="adm-btn adm-btn-danger" onClick={() => openStatusDialog(user, 'deactivated')}>Deactivate</button></div> : <div className="adm-row-actions"><button className="adm-btn adm-btn-primary" onClick={() => openStatusDialog(user, 'active')}>Restore access</button></div>}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </section>

      {dialog && <StatusDialog dialog={dialog} reason={reason} setReason={setReason} busy={busy} onClose={() => setDialog(null)} onConfirm={updateStatus} />}
    </AdminShell>
  );
}

function DirectoryStat({ label, value }) {
  return <div className="adm-stat"><div className="adm-stat-top"><span>{label}</span><span className="adm-stat-icon"><AdminIcon name="users" /></span></div><strong>{value}</strong><small>Registered platform accounts</small></div>;
}

function activitySummary(user) {
  if (user.role === 'technician') return `${user.activity?.jobs_completed || 0} of ${user.activity?.jobs_assigned || 0} assigned jobs completed`;
  if (user.role === 'user') return `${user.activity?.bookings_made || 0} repair booking${user.activity?.bookings_made === 1 ? '' : 's'}`;
  return 'Platform administration';
}

function StatusDialog({ dialog, reason, setReason, busy, onClose, onConfirm }) {
  const restoring = dialog.nextStatus === 'active';
  const action = dialog.nextStatus === 'suspended' ? 'Suspend' : dialog.nextStatus === 'deactivated' ? 'Deactivate' : 'Restore';
  return <div className="adm-dialog-backdrop" role="presentation" onMouseDown={event => event.target === event.currentTarget && onClose()}>
    <section className="adm-dialog" role="dialog" aria-modal="true" aria-labelledby="status-title">
      <div className="adm-dialog-head"><div><h2 id="status-title">{action} {dialog.user.name}?</h2><p>{restoring ? 'This account will be able to sign in and the profile may become visible again.' : `Login will be blocked immediately. ${dialog.user.role === 'technician' ? 'Their technician profile will also be hidden.' : ''} The account holder will be notified by email.`}</p></div><button onClick={onClose} aria-label="Close"><AdminIcon name="close" /></button></div>
      {!restoring && <div className="adm-dialog-body"><div className="adm-field"><label htmlFor="status-reason">Reason sent to account holder</label><textarea id="status-reason" className="adm-input adm-textarea" value={reason} onChange={event => setReason(event.target.value)} placeholder="Explain why access is being restricted…" autoFocus /></div></div>}
      <div className="adm-dialog-actions"><button className="adm-btn adm-btn-secondary" onClick={onClose}>Cancel</button><button className={`adm-btn ${restoring ? 'adm-btn-primary' : 'adm-btn-danger'}`} disabled={busy || (!restoring && !reason.trim())} onClick={onConfirm}>{busy ? 'Updating…' : `${action} account`}</button></div>
    </section>
  </div>;
}
