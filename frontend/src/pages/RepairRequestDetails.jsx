import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './RepairRequestDetails.css';

export default function RepairRequestDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [repair, setRepair] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
            <div className="rd-logo">⚡</div>
            <div>
              <div className="rd-title">Repair Request</div>
              <div className="rd-subtitle">Details for ID: #{repair.id}</div>
            </div>
          </div>
          <button className="rd-close" onClick={() => navigate(-1)}>✕</button>
        </div>

        <div className="rd-body">
          <div className="rd-status-bar">
            <span className={`rd-status rd-status-${repair.status}`}>
              {repair.status.replace('_', ' ').toUpperCase()}
            </span>
            <span className="rd-date">
              Created on {new Date(repair.created_at).toLocaleDateString()}
            </span>
          </div>

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

          <div className="rd-actions">
            <button className="rd-btn rd-btn-primary" onClick={() => alert('Feature coming soon: Accept this job')}>
              Claim This Request
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
