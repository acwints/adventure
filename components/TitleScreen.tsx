import React, { useState, useEffect } from 'react';

interface TitleScreenProps {
  onStart: () => void;
}

const TitleScreen: React.FC<TitleScreenProps> = ({ onStart }) => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (ready && (e.key === 'Enter' || e.key === ' ')) {
        onStart();
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [ready, onStart]);

  return (
    <div style={styles.container}>
      {/* Animated background */}
      <div style={styles.bgGradient} />
      <div style={styles.bgOrbs}>
        <div style={{ ...styles.orb, ...styles.orb1 }} />
        <div style={{ ...styles.orb, ...styles.orb2 }} />
        <div style={{ ...styles.orb, ...styles.orb3 }} />
      </div>
      
      {/* Grid pattern overlay */}
      <div style={styles.gridPattern} />

      {/* Main content */}
      <div 
        style={{
          ...styles.content,
          opacity: ready ? 1 : 0,
          transform: ready ? 'translateY(0)' : 'translateY(20px)',
        }}
      >
        {/* Logo / Icon */}
        <div style={styles.logoContainer}>
          <div style={styles.logoIcon}>
            <span style={{ fontSize: '2.5rem' }}>🚀</span>
          </div>
          <div style={styles.logoRing} />
          <div style={styles.logoRingOuter} />
        </div>

        {/* Title */}
        <h1 style={styles.title}>
          Adventure AI
        </h1>
        
        {/* Subtitle */}
        <p style={styles.subtitle}>
          Explore the universe of knowledge through interactive quests
        </p>

        {/* CTA Button */}
        <button
          onClick={onStart}
          className="btn btn-primary"
          style={styles.ctaButton}
        >
          Start Exploring
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>

        {/* Keyboard hint */}
        <p style={styles.hint}>
          or press <kbd style={styles.kbd}>Enter</kbd> to continue
        </p>
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <span style={styles.footerText}>Powered by Gemini AI</span>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'fixed',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    background: 'var(--bg-primary)',
  },
  bgGradient: {
    position: 'absolute',
    inset: 0,
    background: `
      radial-gradient(ellipse at 50% 0%, rgba(99, 102, 241, 0.15) 0%, transparent 50%),
      radial-gradient(ellipse at 80% 50%, rgba(139, 92, 246, 0.1) 0%, transparent 40%),
      radial-gradient(ellipse at 20% 80%, rgba(6, 182, 212, 0.1) 0%, transparent 40%)
    `,
    pointerEvents: 'none',
  },
  bgOrbs: {
    position: 'absolute',
    inset: 0,
    overflow: 'hidden',
    pointerEvents: 'none',
  },
  orb: {
    position: 'absolute',
    borderRadius: '50%',
    filter: 'blur(60px)',
    opacity: 0.5,
    animation: 'float 8s ease-in-out infinite',
  },
  orb1: {
    width: '400px',
    height: '400px',
    background: 'var(--accent-primary)',
    top: '-10%',
    right: '-5%',
    animationDelay: '0s',
  },
  orb2: {
    width: '300px',
    height: '300px',
    background: 'var(--accent-secondary)',
    bottom: '10%',
    left: '-5%',
    animationDelay: '2s',
  },
  orb3: {
    width: '200px',
    height: '200px',
    background: 'var(--accent-tertiary)',
    top: '40%',
    right: '20%',
    animationDelay: '4s',
  },
  gridPattern: {
    position: 'absolute',
    inset: 0,
    backgroundImage: `
      linear-gradient(rgba(99, 102, 241, 0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(99, 102, 241, 0.03) 1px, transparent 1px)
    `,
    backgroundSize: '60px 60px',
    pointerEvents: 'none',
  },
  content: {
    position: 'relative',
    zIndex: 10,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    padding: '2rem',
    maxWidth: '600px',
    transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
  },
  logoContainer: {
    position: 'relative',
    width: '120px',
    height: '120px',
    marginBottom: '2rem',
  },
  logoIcon: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, var(--bg-tertiary) 0%, var(--bg-secondary) 100%)',
    borderRadius: '50%',
    border: '2px solid var(--border-color)',
    zIndex: 2,
  },
  logoRing: {
    position: 'absolute',
    inset: '-8px',
    borderRadius: '50%',
    border: '2px solid var(--accent-primary)',
    opacity: 0.3,
    animation: 'pulse 2s ease-in-out infinite',
  },
  logoRingOuter: {
    position: 'absolute',
    inset: '-16px',
    borderRadius: '50%',
    border: '1px solid var(--accent-primary)',
    opacity: 0.15,
    animation: 'pulse 2s ease-in-out infinite 0.5s',
  },
  title: {
    fontSize: '3.5rem',
    fontWeight: 700,
    letterSpacing: '-0.03em',
    marginBottom: '1rem',
    background: 'linear-gradient(135deg, #fff 0%, var(--text-secondary) 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  subtitle: {
    fontSize: '1.25rem',
    color: 'var(--text-secondary)',
    marginBottom: '2.5rem',
    lineHeight: 1.6,
    maxWidth: '400px',
  },
  ctaButton: {
    fontSize: '1rem',
    padding: '1rem 2rem',
    marginBottom: '1.5rem',
  },
  hint: {
    fontSize: '0.875rem',
    color: 'var(--text-muted)',
  },
  kbd: {
    display: 'inline-block',
    padding: '0.25rem 0.5rem',
    fontSize: '0.75rem',
    fontFamily: 'var(--font-mono)',
    color: 'var(--text-secondary)',
    background: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: '4px',
    marginLeft: '0.25rem',
    marginRight: '0.25rem',
  },
  footer: {
    position: 'absolute',
    bottom: '2rem',
    left: 0,
    right: 0,
    textAlign: 'center',
  },
  footerText: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
  },
};

export default TitleScreen;
