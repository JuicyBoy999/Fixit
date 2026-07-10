import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import logo from '../assets/image.png';

const styles = {
  page: {
    minHeight: '100vh',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#123247',
    color: '#ffffff',
    fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    padding: '24px',
    boxSizing: 'border-box',
  },
  card: {
    width: '100%',
    maxWidth: '450px',
    background: '#2E86AB',
    borderRadius: '18px',
    padding: '40px',
    boxSizing: 'border-box',
    boxShadow: '0 22px 55px rgba(18, 50, 71, 0.35)',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '34px',
  },
  brandMark: {
    width: '46px',
    height: '46px',
    borderRadius: '9px',
    display: 'grid',
    placeItems: 'center',
    background: '#38bdf8',
    color: '#07172c',
    fontSize: '23px',
    fontWeight: 900,
  },
  brandName: {
    fontSize: '23px',
    fontWeight: 800,
  },
  heading: {
    margin: '0 0 8px',
    fontSize: '28px',
    lineHeight: 1.15,
    fontWeight: 800,
  },
  copy: {
    margin: '0 0 30px',
    color: '#4E7182',
    fontSize: '16px',
    lineHeight: 1.5,
  },
  label: {
    display: 'block',
    marginBottom: '10px',
    color: '#4E7182',
    fontSize: '13px',
    fontWeight: 800,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  input: {
    width: '100%',
    minHeight: '52px',
    border: '1px solid #8FCBE3',
    borderRadius: '9px',
    background: '#123247',
    color: '#ffffff',
    padding: '0 16px',
    boxSizing: 'border-box',
    outline: 'none',
    fontSize: '16px',
    marginBottom: '18px',
  },
  button: {
    width: '100%',
    minHeight: '52px',
    border: 'none',
    borderRadius: '9px',
    background: '#38bdf8',
    color: '#06172c',
    cursor: 'pointer',
    fontSize: '17px',
    fontWeight: 800,
    marginTop: '4px',
  },
  alert: {
    borderRadius: '9px',
    padding: '12px 14px',
    marginTop: '18px',
    fontSize: '14px',
    lineHeight: 1.45,
  },
  success: {
    background: 'rgba(34, 197, 94, 0.13)',
    border: '1px solid rgba(34, 197, 94, 0.3)',
    color: '#86efac',
  },
  error: {
    background: 'rgba(248, 113, 113, 0.13)',
    border: '1px solid rgba(248, 113, 113, 0.32)',
    color: '#fca5a5',
  },
  footer: {
    marginTop: '24px',
    textAlign: 'center',
    color: '#4E7182',
    fontSize: '15px',
  },
  link: {
    color: '#38bdf8',
    textDecoration: 'none',
    fontWeight: 700,
  },
};

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token.');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/auth/reset-password', {
        token,
        newPassword,
      });
      setMessage(response.data.message);
      setTimeout(() => navigate('/login'), 1800);
    } catch (err) {
      setError(err.response?.data?.message || 'Error resetting password.');
    }
  };

  return (
    <main style={styles.page}>
      <section style={styles.card} aria-labelledby="reset-password-title">
        <div style={styles.brand}>
          <div style={styles.brandMark}>
            <img src={logo} alt="Fixit" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />
          </div>
          <div style={styles.brandName}>Fixit</div>
        </div>

        <h1 id="reset-password-title" style={styles.heading}>
          Create a new password
        </h1>
        <p style={styles.copy}>Choose a strong password and then sign in again.</p>

        {!message && (
          <form onSubmit={handleSubmit}>
            <label htmlFor="new-password" style={styles.label}>
              New password
            </label>
            <input
              id="new-password"
              type="password"
              placeholder="Min. 8 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              style={styles.input}
              disabled={!token}
            />

            <label htmlFor="confirm-password" style={styles.label}>
              Confirm password
            </label>
            <input
              id="confirm-password"
              type="password"
              placeholder="Repeat password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              style={styles.input}
              disabled={!token}
            />

            <button type="submit" style={styles.button} disabled={!token}>
              Reset password
            </button>
          </form>
        )}

        {message && <p style={{ ...styles.alert, ...styles.success }}>{message}</p>}
        {error && <p style={{ ...styles.alert, ...styles.error }}>{error}</p>}

        <div style={styles.footer}>
          <a href="/login" style={styles.link}>
            Back to login
          </a>
        </div>
      </section>
    </main>
  );
};

export default ResetPassword;
