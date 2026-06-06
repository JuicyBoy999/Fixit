import React, { useState } from 'react';
import axios from 'axios';

const styles = {
  page: {
    minHeight: '100vh',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0f2140',
    color: '#ffffff',
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    padding: '24px',
    boxSizing: 'border-box',
  },
  card: {
    width: '100%',
    maxWidth: '450px',
    background: '#172d4f',
    borderRadius: '18px',
    padding: '40px',
    boxSizing: 'border-box',
    boxShadow: '0 22px 55px rgba(4, 12, 28, 0.22)',
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
    letterSpacing: 0,
  },
  heading: {
    margin: '0 0 8px',
    fontSize: '28px',
    lineHeight: 1.15,
    fontWeight: 800,
  },
  copy: {
    margin: '0 0 34px',
    color: '#a7c0df',
    fontSize: '16px',
    lineHeight: 1.5,
  },
  label: {
    display: 'block',
    marginBottom: '10px',
    color: '#9fb5d1',
    fontSize: '13px',
    fontWeight: 800,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  inputWrap: {
    position: 'relative',
    marginBottom: '18px',
  },
  inputIcon: {
    position: 'absolute',
    left: '16px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#819aba',
    fontSize: '16px',
    lineHeight: 1,
  },
  input: {
    width: '100%',
    minHeight: '52px',
    border: '1px solid #34577f',
    borderRadius: '9px',
    background: '#24456e',
    color: '#ffffff',
    padding: '0 16px 0 46px',
    boxSizing: 'border-box',
    outline: 'none',
    fontSize: '16px',
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
    marginTop: '10px',
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
    color: '#a7c0df',
    fontSize: '15px',
  },
  link: {
    color: '#38bdf8',
    textDecoration: 'none',
    fontWeight: 700,
  },
};

const RequestPasswordReset = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
      setMessage(response.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Error sending reset email');
    }
  };

  return (
    <main style={styles.page}>
      <section style={styles.card} aria-labelledby="reset-request-title">
        <div style={styles.brand}>
          <div style={styles.brandMark}>⚡</div>
          <div style={styles.brandName}>Fixit</div>
        </div>

        <h1 id="reset-request-title" style={styles.heading}>
          Reset your password
        </h1>
        <p style={styles.copy}>Enter your email and we&apos;ll send you a link to get back in.</p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="reset-email" style={styles.label}>
            Email
          </label>
          <div style={styles.inputWrap}>
            <span style={styles.inputIcon} aria-hidden="true">
              @
            </span>
            <input
              id="reset-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <button type="submit" style={styles.button}>
            Send reset email
          </button>
        </form>

        {message && <p style={{ ...styles.alert, ...styles.success }}>{message}</p>}
        {error && <p style={{ ...styles.alert, ...styles.error }}>{error}</p>}

        <div style={styles.footer}>
          Remembered it?{' '}
          <a href="/" style={styles.link}>
            Back to login
          </a>
        </div>
      </section>
    </main>
  );
};

export default RequestPasswordReset;
