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
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'100vh', background:'#f9fafb' }}>
      <div style={{ width:380, padding:'2rem', background:'#fff', border:'1px solid #e5e7eb', borderRadius:16, textAlign:'center' }}>
        
        {user.photo ? (
          <img
            src={user.photo}
            alt="Profile"
            style={{ width:90, height:90, borderRadius:'50%', marginBottom:'1rem', border:'3px solid #e5e7eb' }}
          />
        ) : (
          <div style={{ width:90, height:90, borderRadius:'50%', margin:'0 auto 1rem', border:'3px solid #e5e7eb', display:'grid', placeItems:'center', background:'#38bdf8', color:'#0f1f3d', fontWeight:800, fontSize:28 }}>
            {(user.firstName?.[0] || user.email?.[0] || 'F').toUpperCase()}
          </div>
        )}

        <h2 style={{ fontSize:22, fontWeight:600, marginBottom:4 }}>
          Welcome, {user.name || user.firstName || 'Fixit user'}!
        </h2>

        <p style={{ color:'#6b7280', fontSize:14, marginBottom:'1.5rem' }}>
          {user.email}
        </p>

        <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:8, padding:'12px', marginBottom:'1.5rem' }}>
          <p style={{ color:'#15803d', fontSize:13, margin:0 }}>
            Successfully signed in
          </p>
        </div>

        <div style={{ display:'grid', gap:10, marginBottom:'1.5rem' }}>
          <button
            onClick={() => navigate('/book-repair')}
            style={{ width:'100%', padding:'11px', background:'#38bdf8', color:'#0f1f3d', border:'none', borderRadius:8, fontWeight:700, fontSize:14, cursor:'pointer' }}
          >
            Book a Repair
          </button>

          <button
            onClick={() => navigate('/repair-history')}
            style={{ width:'100%', padding:'11px', background:'#fff', color:'#0f1f3d', border:'1px solid #dbeafe', borderRadius:8, fontWeight:700, fontSize:14, cursor:'pointer' }}
          >
            View Repair History
          </button>

          <button
            onClick={() => navigate('/technicians')}
            style={{ width:'100%', padding:'11px', background:'#152a4a', color:'#e0f2fe', border:'1px solid #24456e', borderRadius:8, fontWeight:700, fontSize:14, cursor:'pointer' }}
          >
            Choose a Technician
          </button>
        </div>

        <button
          onClick={handleLogout}
          style={{ width:'100%', padding:'10px', background:'#fff', color:'#ef4444', border:'1.5px solid #ef4444', borderRadius:8, fontWeight:500, fontSize:14, cursor:'pointer' }}
        >
          Sign Out
        </button>

      </div>
    </div>
  );
}

export default Dashboard;
