import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import './AdminLogin.css'; // Import the CSS file

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const { login } = useContext(AuthContext);

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    console.log('Calling login with:', email, password);
    await login(email, password, 'admin');
    console.log('Login successful');
  } catch (err) {
    console.error('Full error object:', err);
    setError(err.response?.data?.message || err.message || 'Login failed');
  }
};

  return (
    <div className="admin-login">
      <div className="admin-login-container">
        <h2>Welcome back</h2>
        <p>Sign in to manage the admin dashboard</p>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="error">{error}</p>}
          <button type="submit">Sign In →</button>
        </form>
        <p className="extra-info">
          Don’t have an account? <a href="/signup">Sign up free</a>
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;