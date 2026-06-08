import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './TechnicianProfile.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function formatRating(rating) {
  const value = Number(rating);
  return Number.isFinite(value) ? value.toFixed(1) : '0.0';
}

function formatDate(date) {
  if (!date) return 'Verified';

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}

export default function TechnicianProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [technician, setTechnician] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchProfile() {
      const token = localStorage.getItem('token');

      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/technicians/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();

        if (!response.ok) {
          if (response.status === 401) navigate('/login');
          throw new Error(data.message || 'Failed to load technician profile');
        }

        setTechnician(data.technician);
        setStatus('ready');
      } catch (err) {
        setError(err.message || 'Failed to load technician profile');
        setStatus('error');
      }
    }

    fetchProfile();
  }, [id, navigate]);

  return (
    <main className="tp-page">
      <section className="tp-shell">
        <header className="tp-topbar">
          <button className="tp-brand" type="button" onClick={() => navigate('/technicians')}>
            <span className="tp-brand-mark">F</span>
            <span>Fixit</span>
          </button>

          <button className="tp-secondary" type="button" onClick={() => navigate('/technicians')}>
            All Technicians
          </button>
        </header>

        {status === 'loading' && <div className="tp-state">Loading technician profile...</div>}
        {status === 'error' && <div className="tp-state tp-state-error">{error}</div>}

        {status === 'ready' && technician && (
          <>
            <section className="tp-profile-hero">
              <div className="tp-avatar tp-avatar-large">{technician.full_name.slice(0, 1)}</div>
              <div>
                <p className="tp-kicker">{technician.location} technician</p>
                <h1>{technician.full_name}</h1>
                <p className="tp-title">{technician.title}</p>
                <p className="tp-bio">{technician.bio}</p>
              </div>
            </section>

            <section className="tp-stats">
              <div>
                <strong>{formatRating(technician.average_rating)}</strong>
                <span>Average rating</span>
              </div>
              <div>
                <strong>{technician.review_count}</strong>
                <span>Customer reviews</span>
              </div>
              <div>
                <strong>{technician.years_experience} yrs</strong>
                <span>Experience</span>
              </div>
            </section>

            <div className="tp-profile-grid">
              <section className="tp-panel">
                <h2>Skills</h2>
                <div className="tp-chip-row">
                  {(technician.skills || []).map((skill) => (
                    <span className="tp-chip" key={skill}>{skill}</span>
                  ))}
                </div>
              </section>

              <section className="tp-panel">
                <h2>Certification Badges</h2>
                <div className="tp-cert-list">
                  {technician.certifications.map((certification) => (
                    <div className="tp-cert" key={certification.id}>
                      <span className="tp-cert-badge">CERT</span>
                      <div>
                        <strong>{certification.name}</strong>
                        <span>{certification.issuer || 'Verified provider'} - {formatDate(certification.issued_on)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <section className="tp-panel">
              <h2>Customer Reviews</h2>
              <div className="tp-review-list">
                {technician.reviews.length === 0 && (
                  <p className="tp-muted">No reviews yet.</p>
                )}

                {technician.reviews.map((review) => (
                  <article className="tp-review" key={review.id}>
                    <div className="tp-review-head">
                      <strong>{review.reviewer_name}</strong>
                      <span>{review.rating}/5 rating</span>
                    </div>
                    <p>{review.comment}</p>
                  </article>
                ))}
              </div>
            </section>
          </>
        )}
      </section>
    </main>
  );
}
