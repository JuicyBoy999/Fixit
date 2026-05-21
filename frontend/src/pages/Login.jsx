function Login() {
  return (
    <div
      style={{
        width: '100vw',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#0f1f3d',
        margin: 0,
        padding: '20px',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          width: 360,
          padding: '2rem',
          background: '#152a4a',
          borderRadius: 16,
          boxShadow: '0 25px 50px rgba(0,0,0,0.4)',
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: '1.5rem',
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              background: '#38bdf8',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
            }}
          >
            ⚡
          </div>

          <span
            style={{
              color: '#fff',
              fontWeight: 700,
              fontSize: 18,
            }}
          >
            Fixit
          </span>
        </div>

        {/* Heading */}
        <h2
          style={{
            color: '#fff',
            fontSize: 22,
            fontWeight: 700,
            marginBottom: 4,
            marginTop: 0,
          }}
        >
          Welcome back
        </h2>

        <p
          style={{
            color: '#94a3b8',
            fontSize: 13,
            marginBottom: '1.5rem',
          }}
        >
          Sign in to book your next repair
        </p>

        {/* Email */}
        <label
          style={{
            color: '#94a3b8',
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: 1,
          }}
        >
          EMAIL
        </label>

        <div
          style={{
            position: 'relative',
            marginTop: 6,
            marginBottom: 12,
          }}
        >
          <span
            style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#64748b',
            }}
          >
            ✉
          </span>

          <input
            type="email"
            placeholder="you@example.com"
            style={{
              width: '100%',
              padding: '11px 11px 11px 36px',
              background: '#1e3a5f',
              border: '1px solid #2d4f7c',
              borderRadius: 8,
              color: '#fff',
              fontSize: 14,
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Password */}
        <label
          style={{
            color: '#94a3b8',
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: 1,
          }}
        >
          PASSWORD
        </label>

        <div
          style={{
            position: 'relative',
            marginTop: 6,
            marginBottom: 8,
          }}
        >
          <span
            style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#64748b',
            }}
          >
            🔒
          </span>

          <input
            type="password"
            placeholder="••••••••••••••"
            style={{
              width: '100%',
              padding: '11px 11px 11px 36px',
              background: '#1e3a5f',
              border: '1px solid #2d4f7c',
              borderRadius: 8,
              color: '#fff',
              fontSize: 14,
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Remember me & Forgot */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
          }}
        >
          <label
            style={{
              color: '#94a3b8',
              fontSize: 13,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <input type="checkbox" />
            Remember me
          </label>

          <a
            href="#"
            style={{
              color: '#38bdf8',
              fontSize: 13,
              textDecoration: 'none',
            }}
          >
            Forgot password?
          </a>
        </div>

        {/* Sign In Button */}
        <button
          style={{
            width: '100%',
            padding: '12px',
            background: '#38bdf8',
            color: '#0f1f3d',
            border: 'none',
            borderRadius: 8,
            fontWeight: 700,
            fontSize: 15,
            cursor: 'pointer',
            marginBottom: 12,
          }}
        >
          Sign In →
        </button>

        {/* Links */}
        <p
          style={{
            textAlign: 'center',
            color: '#94a3b8',
            fontSize: 13,
            marginBottom: '1.5rem',
          }}
        >
          Don't have an account?{' '}
          <a
            href="/signup"
            style={{
              color: '#38bdf8',
              textDecoration: 'none',
            }}
          >
            Sign up free
          </a>
        </p>

        {/* Divider */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: '1rem',
          }}
        >
          <div
            style={{
              flex: 1,
              height: 1,
              background: '#2d4f7c',
            }}
          />

          <span
            style={{
              color: '#64748b',
              fontSize: 12,
            }}
          >
            or continue with
          </span>

          <div
            style={{
              flex: 1,
              height: 1,
              background: '#2d4f7c',
            }}
          />
        </div>

        {/* Google Button */}
        <a
          href="http://localhost:5000/auth/google"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            width: '100%',
            padding: '11px 16px',
            background: '#fff',
            color: '#111',
            border: 'none',
            borderRadius: 8,
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: 14,
            boxSizing: 'border-box',
            cursor: 'pointer',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>

          Sign in with Google
        </a>

        {/* Trust badges */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 20,
            marginTop: '1.5rem',
          }}
        >
          <span
            style={{
              color: '#64748b',
              fontSize: 12,
            }}
          >
            🔒 Secure login
          </span>

          <span
            style={{
              color: '#64748b',
              fontSize: 12,
            }}
          >
            ✓ 90-day warranty
          </span>
        </div>
      </div>
    </div>
  );
}

export default Login;