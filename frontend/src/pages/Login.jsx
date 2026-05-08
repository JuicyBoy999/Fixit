function Login() {
  return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'100vh', background:'#f9fafb' }}>
      <div style={{ width:360, padding:'2rem', background:'#fff', border:'1px solid #e5e7eb', borderRadius:12 }}>
        
        <h2 style={{ textAlign:'center', marginBottom:'0.5rem' }}>Sign in to Fixit</h2>
        <p style={{ textAlign:'center', color:'#6b7280', fontSize:14, marginBottom:'1.5rem' }}>
          Choose a quick sign-in option
        </p>

        <a href="http://localhost:5000/auth/google" style={btn('#fff','#111','#d1d5db')}>
          🔵 Continue with Google
        </a>

        <button 
          onClick={() => window.location.href = 'http://localhost:5000/auth/facebook'}
          style={btn('#1877F2','#fff','#1877F2')}
        >
          Continue with Facebook
        </button>

      </div>
    </div>
  );
}

const btn = (bg, color, border) => ({
  display:'flex', alignItems:'center', justifyContent:'center',
  gap:10, width:'100%', padding:'11px 16px', marginBottom:12,
  background:bg, color, border:`1.5px solid ${border}`,
  borderRadius:8, textDecoration:'none', fontWeight:500, fontSize:14,
  boxSizing:'border-box', cursor:'pointer'
});

export default Login;