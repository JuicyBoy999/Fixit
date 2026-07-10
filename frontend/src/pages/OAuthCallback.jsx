import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export default function OAuthCallback() {
  const navigate = useNavigate();
  const ran = useRef(false);

  useEffect(() => {

    if (ran.current) return;
    ran.current = true;

    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (!token) {
      navigate('/login?error=google');
      return;
    }

    const user = {
      id: Number(params.get('id')),
      firstName: params.get('firstName'),
      lastName: params.get('lastName'),
      email: params.get('email'),
      role: params.get('role') || 'user',
    };

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    navigate(user.role === 'technician' ? '/technician-dashboard' : '/dashboard');
  }, [navigate]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#EAF7FC', color: '#16303D', fontFamily: 'system-ui, sans-serif' }}>
      Signing you in…
    </div>
  );
}
