import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './RepairHistory.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const statusLabels = {
  pending: 'Pending',
  in_progress: 'In progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

function formatDate(repair) {
  const rawDate = repair.preferred_date || repair.created_at;

  if (!rawDate) return 'Not scheduled';

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(rawDate));
}

function formatCost(cost) {
  const amount = Number(cost);

  if (!Number.isFinite(amount) || amount <= 0) {
    return 'To be confirmed';
  }

  return new Intl.NumberFormat('en-NP', {
    style: 'currency',
    currency: 'NPR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function RepairHistory() {
  const navigate = useNavigate();
  const [repairs, setRepairs] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  const userName = useMemo(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) return 'Customer';

    const user = JSON.parse(storedUser);
    return user.firstName || user.email || 'Customer';
  }, []);

  useEffect(() => {
    async function fetchHistory() {
      const token = localStorage.getItem('token');

      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/repair/history`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();

        if (!response.ok) {
          if (response.status === 401) navigate('/login');
          throw new Error(data.message || 'Failed to load repair history');
        }

        setRepairs(data.repairs || []);
        setStatus('ready');
      } catch (err) {
        setError(err.message || 'Failed to load repair history');
        setStatus('error');
      }
    }

    fetchHistory();
  }, [navigate]);

  return (
    <main className="rh-page">
      <section className="rh-shell">
        <header className="rh-topbar">
          <button className="rh-brand" type="button" onClick={() => navigate('/dashboard')}>
            <span className="rh-brand-mark">F</span>
            <span>Fixit</span>
          </button>

          <button className="rh-secondary" type="button" onClick={() => navigate('/dashboard')}>
            Dashboard
          </button>
        </header>

        <div className="rh-heading-row">
          <div>
            <p className="rh-kicker">{userName}'s repairs</p>
            <h1>Repair History</h1>
            <p>Track every previous service request, assigned technician, status, and final cost.</p>
          </div>

          <button className="rh-primary" type="button" onClick={() => navigate('/book-repair')}>
            Book Repair
          </button>
        </div>

        {status === 'loading' && (
          <div className="rh-state">Loading repair history...</div>
        )}

        {status === 'error' && (
          <div className="rh-state rh-state-error">{error}</div>
        )}

        {status === 'ready' && repairs.length === 0 && (
          <div className="rh-empty">
            <h2>No repair history yet</h2>
            <p>Your completed and requested repairs will appear here after you book a service.</p>
            <button className="rh-primary" type="button" onClick={() => navigate('/book-repair')}>
              Book Your First Repair
            </button>
          </div>
        )}

        {status === 'ready' && repairs.length > 0 && (
          <div className="rh-table-wrap">
            <table className="rh-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Device</th>
                  <th>Technician</th>
                  <th>Status</th>
                  <th>Cost</th>
                </tr>
              </thead>
              <tbody>
                {repairs.map((repair) => (
                  <tr key={repair.id}>
                    <td data-label="Date">{formatDate(repair)}</td>
                    <td data-label="Device">
                      <strong>{repair.device_name}</strong>
                      <span>{repair.issue_description || 'No issue details provided'}</span>
                    </td>
                    <td data-label="Technician">{repair.technician_name || 'Awaiting assignment'}</td>
                    <td data-label="Status">
                      <span className={`rh-status rh-status-${repair.status}`}>
                        {statusLabels[repair.status] || repair.status}
                      </span>
                    </td>
                    <td data-label="Cost">{formatCost(repair.cost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
