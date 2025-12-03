import React, { useState, useEffect } from 'react';

interface LoginViewProps {
  onLogin: (email: string, password: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  onBack: () => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin, isLoading, error, onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password && !isLoading) {
      await onLogin(email, password);
    }
  };

  return (
    <div style={styles.container}>
      {/* Background */}
      <div style={styles.bgGradient} />
      
      {/* Back button */}
      <button onClick={onBack} className="btn btn-ghost" style={styles.backButton}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      {/* Login card */}
      <div 
        style={{
          ...styles.card,
          opacity: ready ? 1 : 0,
          transform: ready ? 'translateY(0)' : 'translateY(20px)',
        }}
      >
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.iconWrapper}>
            <span style={{ fontSize: '1.5rem' }}>👋</span>
          </div>
          <h1 style={styles.title}>Welcome back</h1>
          <p style={styles.subtitle}>Sign in to continue your adventure</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="explorer@universe.ai"
              disabled={isLoading}
              className="input"
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={isLoading}
              className="input"
              style={styles.input}
            />
          </div>

          {error && (
            <div style={styles.error}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4M12 16h.01" />
              </svg>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !email || !password}
            className="btn btn-primary"
            style={styles.submitButton}
          >
            {isLoading ? (
              <>
                <LoadingSpinner />
                Signing in...
              </>
            ) : (
              <>
                Sign In
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <p style={styles.footerText}>
          Demo credentials: <code style={styles.code}>andrew_winter@berkeley.edu</code> / <code style={styles.code}>adventure</code>
        </p>
      </div>
    </div>
  );
};

const LoadingSpinner: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
    <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    <path d="M21 12a9 9 0 11-6.219-8.56" />
  </svg>
);

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'fixed',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg-primary)',
  },
  bgGradient: {
    position: 'absolute',
    inset: 0,
    background: `
      radial-gradient(ellipse at 50% 0%, rgba(99, 102, 241, 0.1) 0%, transparent 50%),
      radial-gradient(ellipse at 0% 100%, rgba(6, 182, 212, 0.08) 0%, transparent 40%)
    `,
    pointerEvents: 'none',
  },
  backButton: {
    position: 'absolute',
    top: '1.5rem',
    left: '1.5rem',
    zIndex: 20,
  },
  card: {
    position: 'relative',
    width: '100%',
    maxWidth: '400px',
    margin: '0 1rem',
    padding: '2.5rem',
    background: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-xl)',
    boxShadow: 'var(--shadow-lg)',
    transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
  },
  header: {
    textAlign: 'center',
    marginBottom: '2rem',
  },
  iconWrapper: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '56px',
    height: '56px',
    marginBottom: '1rem',
    background: 'var(--bg-tertiary)',
    borderRadius: '50%',
    border: '1px solid var(--border-color)',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
    marginBottom: '0.5rem',
  },
  subtitle: {
    fontSize: '0.9375rem',
    color: 'var(--text-secondary)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: 'var(--text-secondary)',
  },
  input: {
    fontSize: '1rem',
  },
  error: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1rem',
    fontSize: '0.875rem',
    color: 'var(--accent-danger)',
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    borderRadius: 'var(--radius-md)',
  },
  submitButton: {
    width: '100%',
    marginTop: '0.5rem',
  },
  footerText: {
    marginTop: '1.5rem',
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    textAlign: 'center',
  },
  code: {
    padding: '0.125rem 0.375rem',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.6875rem',
    background: 'var(--bg-tertiary)',
    borderRadius: '4px',
  },
};

export default LoginView;
