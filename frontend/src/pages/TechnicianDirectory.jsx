import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './TechnicianProfile.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function formatRating(rating) {
  const value = Number(rating);
  return Number.isFinite(value) ? value.toFixed(1) : '0.0';
}

export default function TechnicianDirectory() {
  const navigate = useNavigate();
  const [technicians, setTechnicians] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchTechnicians() {
      const token = localStorage.getItem('token');

      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/technicians`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();

        if (!response.ok) {
          if (response.status === 401) navigate('/login');
          throw new Error(data.message || 'Failed to load technicians');
        }

        setTechnicians(data.technicians || []);
        setStatus('ready');
      } catch (err) {
        setError(err.message || 'Failed to load technicians');
        setStatus('error');
      }
    }

    fetchTechnicians();
  }, [navigate]);

  return (
    <main className="tp-page">
      <section className="tp-shell">
        <header className="tp-topbar">
          <button className="tp-brand" type="button" onClick={() => navigate('/dashboard')}>
            <span className="tp-brand-mark">F</span>
            <span>Fixit</span>
          </button>

          <button className="tp-secondary" type="button" onClick={() => navigate('/dashboard')}>
            Dashboard
          </button>
        </header>

        <div className="tp-heading-row">
          <div>
            <p className="tp-kicker">Certified technicians</p>
            <h1>Choose a technician</h1>
            <p>Review each technician's skills, certifications, customer rating, and service history before booking.</p>
          </div>
        </div>

        {status === 'loading' && <div className="tp-state">Loading technicians...</div>}
        {status === 'error' && <div className="tp-state tp-state-error">{error}</div>}

        {status === 'ready' && technicians.length === 0 && (
          <div className="tp-empty">
            <h2>No technicians available yet</h2>
            <p>Technician profiles will appear here after certified technicians are added.</p>
          </div>
        )}

        {status === 'ready' && technicians.length > 0 && (
          <div className="tp-grid">
            {technicians.map((technician) => (
              <article className="tp-card" key={technician.id}>
                <div className="tp-card-header">
                  <div className="tp-avatar">{technician.full_name.slice(0, 1)}</div>
                  <div>
                    <h2>{technician.full_name}</h2>
                    <p>{technician.title}</p>
                  </div>
                </div>

                <p className="tp-card-bio">{technician.bio}</p>

                <div className="tp-meta-row">
                  <span>{formatRating(technician.average_rating)} rating</span>
                  <span>{technician.review_count} reviews</span>
                  <span>{technician.certification_count} certs</span>
                </div>

                <div className="tp-chip-row">
                  {(technician.skills || []).slice(0, 3).map((skill) => (
                    <span className="tp-chip" key={skill}>{skill}</span>
                  ))}
                </div>

                <button
                  className="tp-primary"
                  type="button"
                  onClick={() => navigate(`/technicians/${technician.id}`)}
                >
                  View Full Profile
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
