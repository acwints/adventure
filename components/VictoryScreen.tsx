import React, { useState, useEffect } from 'react';
import type { GamePlayer } from '../types';
import { xpProgress, currentLevelXp, xpToNextLevel } from '../services/gameService';

interface VictoryScreenProps {
  player: GamePlayer;
  topic: string;
  lessonTitle: string;
  quizScore: number;
  quizTotal: number;
  xpEarned: number;
  leveledUp: boolean;
  previousLevel: number;
  onContinue: () => void;
}

const VictoryScreen: React.FC<VictoryScreenProps> = ({
  player,
  topic,
  lessonTitle,
  quizScore,
  quizTotal,
  xpEarned,
  leveledUp,
  previousLevel,
  onContinue,
}) => {
  const [phase, setPhase] = useState(0);
  const [showXpGain, setShowXpGain] = useState(false);
  const [xpAnimated, setXpAnimated] = useState(0);
  const [showLevelUp, setShowLevelUp] = useState(false);

  const isPerfect = quizScore === quizTotal;
  const progress = xpProgress(player.totalXp);
  const currentXp = currentLevelXp(player.totalXp);
  const nextLevelXp = xpToNextLevel(player.totalXp);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 1200),
      setTimeout(() => setPhase(3), 2000),
      setTimeout(() => {
        setShowXpGain(true);
        const xpInterval = setInterval(() => {
          setXpAnimated(prev => {
            if (prev >= xpEarned) {
              clearInterval(xpInterval);
              return xpEarned;
            }
            return prev + Math.ceil(xpEarned / 20);
          });
        }, 50);
      }, 2800),
      setTimeout(() => {
        if (leveledUp) {
          setShowLevelUp(true);
        }
      }, 3500),
      setTimeout(() => setPhase(4), 4000),
    ];

    return () => timers.forEach(clearTimeout);
  }, [xpEarned, leveledUp]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (phase >= 4 && (e.key === 'Enter' || e.key === ' ')) {
        onContinue();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, onContinue]);

  return (
    <div style={styles.container}>
      {/* Particles */}
      <div style={styles.particles}>
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            style={{
              ...styles.particle,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
              width: `${4 + Math.random() * 8}px`,
              height: `${4 + Math.random() * 8}px`,
              background: isPerfect ? 'var(--accent-warning)' : 'var(--accent-primary)',
            }}
          />
        ))}
      </div>

      <div style={styles.content}>
        {/* Victory text */}
        <div 
          style={{
            ...styles.victorySection,
            opacity: phase >= 1 ? 1 : 0,
            transform: phase >= 1 ? 'translateY(0)' : 'translateY(-20px)',
          }}
        >
          <h1 style={{
            ...styles.victoryTitle,
            color: isPerfect ? 'var(--accent-warning)' : 'var(--accent-primary)',
          }}>
            {isPerfect ? '🌟 PERFECT! 🌟' : '✨ VICTORY! ✨'}
          </h1>
          <p style={styles.victorySubtitle}>Adventure Complete</p>
        </div>

        {/* Adventure card */}
        <div 
          style={{
            ...styles.card,
            opacity: phase >= 2 ? 1 : 0,
            transform: phase >= 2 ? 'scale(1)' : 'scale(0.9)',
          }}
        >
          <div style={styles.cardIcon}>📖</div>
          <span style={styles.cardLabel}>ADVENTURE CAPTURED</span>
          <h2 style={styles.cardTitle}>{lessonTitle}</h2>
          <p style={styles.cardTopic}>{topic}</p>
        </div>

        {/* Score */}
        <div 
          style={{
            ...styles.scoreSection,
            opacity: phase >= 3 ? 1 : 0,
            transform: phase >= 3 ? 'translateY(0)' : 'translateY(10px)',
          }}
        >
          <div style={styles.scoreBox}>
            <div style={styles.scoreItem}>
              <span style={{
                ...styles.scoreValue,
                color: isPerfect ? 'var(--accent-warning)' : 'var(--accent-primary)',
              }}>
                {quizScore}/{quizTotal}
              </span>
              <span style={styles.scoreLabel}>Score</span>
            </div>
            <div style={styles.scoreDivider} />
            <div style={styles.scoreItem}>
              <span style={{ ...styles.scoreValue, color: 'var(--accent-warning)' }}>
                {isPerfect ? '★★★' : quizScore >= quizTotal / 2 ? '★★☆' : '★☆☆'}
              </span>
              <span style={styles.scoreLabel}>Rating</span>
            </div>
          </div>
        </div>

        {/* XP gain */}
        {showXpGain && (
          <div style={styles.xpSection}>
            <div style={styles.xpBadge}>
              <span style={styles.xpValue}>+{Math.min(xpAnimated, xpEarned)} XP</span>
            </div>

            <div style={styles.xpBar}>
              <div style={styles.xpBarHeader}>
                <span>Level {player.level}</span>
                <span style={{ color: 'var(--accent-primary)' }}>{currentXp}/{nextLevelXp}</span>
              </div>
              <div style={styles.xpTrack}>
                <div style={{ ...styles.xpFill, width: `${progress * 100}%` }} />
              </div>
            </div>
          </div>
        )}

        {/* Level up */}
        {showLevelUp && (
          <div style={styles.levelUp}>
            <span style={styles.levelUpTitle}>🎉 LEVEL UP!</span>
            <span style={styles.levelUpText}>
              Level {previousLevel} → Level {player.level}
            </span>
          </div>
        )}

        {/* Continue */}
        <div 
          style={{
            ...styles.continueSection,
            opacity: phase >= 4 ? 1 : 0,
            transform: phase >= 4 ? 'translateY(0)' : 'translateY(10px)',
          }}
        >
          <button onClick={onContinue} className="btn btn-primary" style={styles.continueBtn}>
            Continue
          </button>
          <p style={styles.hint}>Press Enter to continue</p>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'fixed',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    background: `
      radial-gradient(ellipse at 50% 30%, rgba(99, 102, 241, 0.15) 0%, transparent 50%),
      radial-gradient(ellipse at 50% 70%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
      var(--bg-primary)
    `,
  },
  particles: {
    position: 'absolute',
    inset: 0,
    overflow: 'hidden',
    pointerEvents: 'none',
  },
  particle: {
    position: 'absolute',
    bottom: '-10%',
    borderRadius: '50%',
    opacity: 0.6,
    animation: 'float 3s ease-out infinite',
  },
  content: {
    position: 'relative',
    zIndex: 10,
    textAlign: 'center',
    maxWidth: '500px',
    padding: '0 1rem',
  },
  victorySection: {
    marginBottom: '2rem',
    transition: 'all 0.7s ease',
  },
  victoryTitle: {
    fontSize: '2.5rem',
    fontWeight: 700,
    marginBottom: '0.5rem',
  },
  victorySubtitle: {
    fontSize: '1.125rem',
    color: 'var(--text-muted)',
  },
  card: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-xl)',
    padding: '1.5rem',
    marginBottom: '1.5rem',
    transition: 'all 0.7s ease',
  },
  cardIcon: {
    fontSize: '2.5rem',
    marginBottom: '0.75rem',
  },
  cardLabel: {
    display: 'block',
    fontSize: '0.6875rem',
    fontWeight: 600,
    letterSpacing: '0.1em',
    color: 'var(--text-muted)',
    marginBottom: '0.5rem',
  },
  cardTitle: {
    fontSize: '1.25rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
    marginBottom: '0.25rem',
  },
  cardTopic: {
    fontSize: '0.875rem',
    color: 'var(--accent-primary)',
  },
  scoreSection: {
    marginBottom: '1.5rem',
    transition: 'all 0.5s ease',
  },
  scoreBox: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '1.5rem',
    padding: '1rem 1.5rem',
    background: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-lg)',
  },
  scoreItem: {
    textAlign: 'center',
  },
  scoreValue: {
    display: 'block',
    fontSize: '1.5rem',
    fontWeight: 700,
  },
  scoreLabel: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
  },
  scoreDivider: {
    width: '1px',
    height: '40px',
    background: 'var(--border-color)',
  },
  xpSection: {
    marginBottom: '1.5rem',
    animation: 'fadeIn 0.5s ease',
  },
  xpBadge: {
    display: 'inline-block',
    padding: '0.75rem 1.5rem',
    background: 'rgba(99, 102, 241, 0.15)',
    border: '2px solid var(--accent-primary)',
    borderRadius: 'var(--radius-lg)',
    marginBottom: '1rem',
  },
  xpValue: {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: 'var(--accent-primary)',
  },
  xpBar: {
    maxWidth: '280px',
    margin: '0 auto',
  },
  xpBarHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    marginBottom: '0.5rem',
  },
  xpTrack: {
    height: '8px',
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  xpFill: {
    height: '100%',
    background: 'linear-gradient(90deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)',
    borderRadius: '4px',
    transition: 'width 1s ease',
  },
  levelUp: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '1rem 2rem',
    background: 'rgba(245, 158, 11, 0.15)',
    border: '2px solid var(--accent-warning)',
    borderRadius: 'var(--radius-lg)',
    marginBottom: '1.5rem',
    animation: 'slideUp 0.5s ease, pulse 2s ease-in-out infinite 0.5s',
  },
  levelUpTitle: {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: 'var(--accent-warning)',
  },
  levelUpText: {
    fontSize: '0.875rem',
    color: 'var(--text-secondary)',
  },
  continueSection: {
    transition: 'all 0.5s ease',
  },
  continueBtn: {
    padding: '1rem 2.5rem',
    fontSize: '1rem',
  },
  hint: {
    marginTop: '1rem',
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
  },
};

export default VictoryScreen;
