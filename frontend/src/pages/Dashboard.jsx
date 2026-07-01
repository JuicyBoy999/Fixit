import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      return;
    }

    fetch('http://localhost:5000/auth/user', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (!data) navigate('/login');
        else setUser(data);
      });
  }, [navigate, user]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'http://localhost:5000/auth/logout';
  };

  if (!user) return <p style={{ textAlign: 'center', marginTop: '2rem' }}>Loading...</p>;

  return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'100vh', background:'#0d1117', fontFamily: "'Segoe UI', sans-serif" }}>
      <div style={{ width:380, padding:'2.5rem 2rem', background:'#111827', border:'1px solid #1e2a3a', borderRadius:16, textAlign:'center' }}>
        
        {user.photo ? (
          <img
            src={user.photo}
            alt="Profile"
            style={{ width:90, height:90, borderRadius:'50%', marginBottom:'1rem', border:'3px solid #1e2a3a' }}
          />
        ) : (
          <div style={{ width:90, height:90, borderRadius:'50%', margin:'0 auto 1.5rem', border:'3px solid #1e2a3a', display:'grid', placeItems:'center', background:'#38bdf8', color:'#0d1117', fontWeight:800, fontSize:28 }}>
            {(user.firstName?.[0] || user.email?.[0] || 'F').toUpperCase()}
          </div>
        )}

        <h2 style={{ fontSize:22, fontWeight:600, marginBottom:6, color: '#fff' }}>
          Welcome, {user.name || user.firstName || 'Fixit user'}!
        </h2>

        <p style={{ color:'#6b7a8d', fontSize:14, marginBottom:'2rem' }}>
          {user.email}
        </p>

        <div style={{ background:'rgba(34, 197, 94, 0.1)', border:'1px solid rgba(34, 197, 94, 0.2)', borderRadius:12, padding:'12px', marginBottom:'2rem' }}>
          <p style={{ color:'#4ade80', fontSize:13, margin:0, fontWeight: 500 }}>
            Successfully signed in
          </p>
        </div>

        <div style={{ display:'grid', gap:12, marginBottom:'2rem' }}>
          <button
            onClick={() => navigate('/book-repair')}
            style={{ width:'100%', height: 46, background:'#38bdf8', color:'#0d1117', border:'none', borderRadius:8, fontWeight:700, fontSize:15, cursor:'pointer', transition: 'background 0.2s' }}
          >
            Book a Repair
          </button>

          <button
            onClick={() => navigate('/repair-history')}
            style={{ width:'100%', height: 46, background:'transparent', color:'#38bdf8', border:'1px solid #38bdf8', borderRadius:8, fontWeight:700, fontSize:15, cursor:'pointer' }}
          >
            View Repair History
          </button>

          <button
            onClick={() => navigate('/technicians')}
            style={{ width:'100%', height: 46, background:'#1e2d45', color:'#fff', border:'1px solid #2a3a52', borderRadius:8, fontWeight:700, fontSize:15, cursor:'pointer' }}
          >
            Choose a Technician
          </button>
        </div>

        <button
          onClick={handleLogout}
          style={{ width:'100%', padding:'10px', background:'transparent', color:'#f87171', border:'none', fontWeight:500, fontSize:14, cursor:'pointer', opacity: 0.8 }}
        >
          Sign Out
        </button>

      </div>
    </div>
  );
}

export default Dashboard;
