import React from 'react';
import type { GamePlayer } from '../types';
import { xpProgress, currentLevelXp, xpToNextLevel, getPlayerRank } from '../services/gameService';

interface PlayerHUDProps {
  player: GamePlayer;
  showFull?: boolean;
}

const PlayerHUD: React.FC<PlayerHUDProps> = ({ player, showFull = false }) => {
  const progress = xpProgress(player.totalXp);
  const currentXp = currentLevelXp(player.totalXp);
  const nextLevelXp = xpToNextLevel(player.totalXp);
  const rank = getPlayerRank(player.level);

  if (!showFull) {
    // Compact HUD - not used in new design, but kept for compatibility
    return (
      <div style={styles.compactContainer}>
        <div style={styles.compactLevel}>
          <span style={styles.compactLevelNum}>{player.level}</span>
        </div>
        <div style={styles.compactInfo}>
          <span style={styles.compactName}>{player.displayName}</span>
          <div style={styles.compactXpBar}>
            <div style={{ ...styles.compactXpFill, width: `${progress * 100}%` }} />
          </div>
        </div>
      </div>
    );
  }

  // Full HUD for collection view
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.levelBadge}>
          {player.level}
        </div>
        <div style={styles.headerInfo}>
          <h2 style={styles.name}>{player.displayName}</h2>
          <p style={styles.rank}>{rank}</p>
          <p style={styles.xpTotal}>Level {player.level} • {player.totalXp} Total XP</p>
        </div>
      </div>

      {/* XP Progress */}
      <div style={styles.xpSection}>
        <div style={styles.xpHeader}>
          <span>Experience</span>
          <span style={{ color: 'var(--accent-primary)' }}>{currentXp} / {nextLevelXp} XP</span>
        </div>
        <div style={styles.xpTrack}>
          <div style={{ ...styles.xpFill, width: `${progress * 100}%` }} />
        </div>
        <p style={styles.xpToNext}>
          {nextLevelXp - currentXp} XP to Level {player.level + 1}
        </p>
      </div>

      {/* Stats */}
      <div style={styles.statsGrid}>
        <div style={{ ...styles.stat, background: 'rgba(99, 102, 241, 0.1)', borderColor: 'rgba(99, 102, 241, 0.3)' }}>
          <span style={{ ...styles.statValue, color: 'var(--accent-primary)' }}>
            {player.completedAdventures.length}
          </span>
          <span style={styles.statLabel}>Adventures</span>
        </div>
        <div style={{ ...styles.stat, background: 'rgba(245, 158, 11, 0.1)', borderColor: 'rgba(245, 158, 11, 0.3)' }}>
          <span style={{ ...styles.statValue, color: 'var(--accent-warning)' }}>
            {player.level}
          </span>
          <span style={styles.statLabel}>Level</span>
        </div>
        <div style={{ ...styles.stat, background: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
          <span style={{ ...styles.statValue, color: 'var(--accent-danger)' }}>
            {player.completedAdventures.filter(a => a.quizScore === a.quizTotal).length}
          </span>
          <span style={styles.statLabel}>Perfect</span>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  // Compact styles
  compactContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.5rem 1rem',
    background: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-lg)',
  },
  compactLevel: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, var(--accent-warning) 0%, #d97706 100%)',
    border: '2px solid #fcd34d',
  },
  compactLevelNum: {
    fontSize: '0.875rem',
    fontWeight: 700,
    color: 'white',
  },
  compactInfo: {
    flex: 1,
  },
  compactName: {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
    display: 'block',
    marginBottom: '0.25rem',
  },
  compactXpBar: {
    height: '4px',
    background: 'var(--bg-primary)',
    borderRadius: '2px',
    overflow: 'hidden',
  },
  compactXpFill: {
    height: '100%',
    background: 'var(--accent-primary)',
    borderRadius: '2px',
    transition: 'width 0.3s ease',
  },

  // Full HUD styles
  container: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-xl)',
    padding: '1.5rem',
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  levelBadge: {
    width: '64px',
    height: '64px',
    borderRadius: 'var(--radius-lg)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    fontWeight: 700,
    background: 'linear-gradient(135deg, var(--accent-warning) 0%, #d97706 100%)',
    color: 'white',
    border: '3px solid #fcd34d',
    boxShadow: '0 0 20px rgba(245, 158, 11, 0.3)',
    flexShrink: 0,
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    fontSize: '1rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
    marginBottom: '0.25rem',
  },
  rank: {
    fontSize: '0.875rem',
    color: 'var(--accent-warning)',
    marginBottom: '0.25rem',
  },
  xpTotal: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
  },
  xpSection: {
    marginBottom: '1.5rem',
  },
  xpHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.875rem',
    color: 'var(--text-muted)',
    marginBottom: '0.5rem',
  },
  xpTrack: {
    height: '10px',
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: '5px',
    overflow: 'hidden',
  },
  xpFill: {
    height: '100%',
    background: 'linear-gradient(90deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)',
    borderRadius: '5px',
    transition: 'width 1s ease',
  },
  xpToNext: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    textAlign: 'right',
    marginTop: '0.5rem',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '0.75rem',
  },
  stat: {
    textAlign: 'center',
    padding: '0.75rem',
    borderRadius: 'var(--radius-md)',
    border: '1px solid',
  },
  statValue: {
    display: 'block',
    fontSize: '1.25rem',
    fontWeight: 700,
  },
  statLabel: {
    fontSize: '0.6875rem',
    color: 'var(--text-muted)',
  },
};

export default PlayerHUD;
