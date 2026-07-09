import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import logo from '../../assets/image.png';

const styles = {
  page: {
    minHeight: '100vh',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#EAF7FC',
    color: '#16303D',
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    padding: '24px',
    boxSizing: 'border-box',
  },
  card: {
    width: '100%',
    maxWidth: '450px',
    background: '#CFEEF8',
    borderRadius: '18px',
    padding: '40px',
    boxSizing: 'border-box',
    boxShadow: '0 22px 55px rgba(18, 50, 71, 0.2)',
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
    margin: '0 0 12px',
    fontSize: '28px',
    lineHeight: 1.15,
    fontWeight: 800,
  },
  subCopy: {
    margin: '0 0 38px',
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
    background: '#A3D8EC',
    color: '#16303D',
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
  error: {
    background: 'rgba(248, 113, 113, 0.13)',
    border: '1px solid rgba(248, 113, 113, 0.32)',
    color: '#fca5a5',
  },
};

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password, 'admin');
      navigate('/admin-panel');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed');
    }
  };

  return (
    <main style={styles.page}>
      <section style={styles.card} aria-labelledby="admin-login-title">
        <div style={styles.brand}>
          <div style={styles.brandMark}>
            <img src={logo} alt="Fixit" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />
          </div>
          <div style={styles.brandName}>Fixit</div>
        </div>

        <h1 id="admin-login-title" style={styles.heading}>
          Welcome back
        </h1>
        <p style={styles.subCopy}>Sign in to manage the admin dashboard</p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="admin-email" style={styles.label}>
            Email
          </label>
          <input
            id="admin-email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
          />

          <label htmlFor="admin-password" style={styles.label}>
            Password
          </label>
          <input
            id="admin-password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
          />

          {error && <p style={{ ...styles.alert, ...styles.error }}>{error}</p>}

          <button type="submit" style={styles.button}>
            Sign In →
          </button>
        </form>
      </section>
    </main>
  );
};

export default AdminLogin;