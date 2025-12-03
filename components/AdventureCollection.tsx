import React, { useState } from 'react';
import type { GamePlayer, CompletedAdventure } from '../types';
import PlayerHUD from './PlayerHUD';

interface AdventureCollectionProps {
  player: GamePlayer;
  onBack: () => void;
}

const AdventureCollection: React.FC<AdventureCollectionProps> = ({ player, onBack }) => {
  const [selectedAdventure, setSelectedAdventure] = useState<CompletedAdventure | null>(null);
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'score'>('recent');

  const sortedAdventures = [...player.completedAdventures].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.topic.localeCompare(b.topic);
      case 'score':
        return (b.quizScore / b.quizTotal) - (a.quizScore / a.quizTotal);
      case 'recent':
      default:
        return b.completedAt - a.completedAt;
    }
  });

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getScoreStars = (score: number, total: number) => {
    const ratio = score / total;
    if (ratio === 1) return '★★★';
    if (ratio >= 0.66) return '★★☆';
    if (ratio >= 0.33) return '★☆☆';
    return '☆☆☆';
  };

  return (
    <div style={styles.container}>
      <div style={styles.inner}>
        {/* Header */}
        <div style={styles.headerSection}>
          <div style={styles.headerRow}>
            <button onClick={onBack} className="btn btn-secondary">
              ← Back to Map
            </button>

            <div style={styles.sortControls}>
              <span style={styles.sortLabel}>Sort:</span>
              {(['recent', 'name', 'score'] as const).map((option) => (
                <button
                  key={option}
                  onClick={() => setSortBy(option)}
                  style={{
                    ...styles.sortBtn,
                    background: sortBy === option 
                      ? 'var(--accent-primary)'
                      : 'transparent',
                    borderColor: sortBy === option ? 'var(--accent-primary)' : 'var(--border-color)',
                    color: sortBy === option ? 'white' : 'var(--text-muted)',
                  }}
                >
                  {option.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Banner */}
          <div style={styles.banner}>
            <h1 style={styles.bannerTitle}>📖 ADVENTURE COLLECTION</h1>
            <p style={styles.bannerSubtitle}>
              {player.completedAdventures.length} Adventures Captured
            </p>
          </div>
        </div>

        <div style={styles.mainGrid}>
          {/* Player stats */}
          <div>
            <PlayerHUD player={player} showFull />
          </div>

          {/* Adventures grid */}
          <div>
            {sortedAdventures.length === 0 ? (
              <div style={styles.emptyState}>
                <span style={styles.emptyIcon}>🗺️</span>
                <h3 style={styles.emptyTitle}>NO ADVENTURES YET</h3>
                <p style={styles.emptyText}>
                  Explore the world map to begin your journey!
                </p>
              </div>
            ) : (
              <div style={styles.adventuresGrid}>
                {sortedAdventures.map((adventure) => {
                  const isSelected = selectedAdventure?.id === adventure.id;
                  const isPerfect = adventure.quizScore === adventure.quizTotal;

                  return (
                    <button
                      key={adventure.id}
                      onClick={() => setSelectedAdventure(isSelected ? null : adventure)}
                      style={{
                        ...styles.adventureCard,
                        borderColor: isSelected ? 'var(--accent-primary)' : isPerfect ? 'var(--accent-warning)' : 'var(--border-color)',
                        boxShadow: isSelected 
                          ? '0 0 20px rgba(99, 102, 241, 0.3)'
                          : isPerfect 
                            ? '0 0 10px rgba(245, 158, 11, 0.2)'
                            : 'none',
                      }}
                    >
                      <div style={styles.cardHeader}>
                        <div style={{
                          ...styles.cardIcon,
                          borderColor: isPerfect ? 'var(--accent-warning)' : 'var(--accent-primary)',
                        }}>
                          📖
                        </div>
                        <span style={{
                          ...styles.cardStars,
                          color: isPerfect ? 'var(--accent-warning)' : 'var(--text-muted)',
                        }}>
                          {getScoreStars(adventure.quizScore, adventure.quizTotal)}
                        </span>
                      </div>

                      <h3 style={styles.cardTitle}>{adventure.title}</h3>
                      <p style={styles.cardTopic}>{adventure.topic}</p>

                      <div style={styles.cardFooter}>
                        <span>{formatDate(adventure.completedAt)}</span>
                        <span>+{adventure.xpEarned} XP</span>
                      </div>

                      {isSelected && (
                        <div style={styles.cardExpanded}>
                          <div style={styles.expandedStats}>
                            <div style={styles.expandedStat}>
                              <span style={{ ...styles.expandedValue, color: 'var(--accent-primary)' }}>
                                {adventure.quizScore}/{adventure.quizTotal}
                              </span>
                              <span style={styles.expandedLabel}>Score</span>
                            </div>
                            <div style={styles.expandedStat}>
                              <span style={{ ...styles.expandedValue, color: 'var(--accent-warning)' }}>
                                {adventure.xpEarned}
                              </span>
                              <span style={styles.expandedLabel}>XP</span>
                            </div>
                          </div>
                          {isPerfect && (
                            <div style={styles.perfectBadge}>
                              ✨ PERFECT CLEAR ✨
                            </div>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Stats footer */}
        <div style={styles.statsFooter}>
          <div style={styles.statsGrid}>
            <div style={styles.statItem}>
              <span style={{ ...styles.statValue, color: 'var(--accent-primary)' }}>
                {player.completedAdventures.length}
              </span>
              <span style={styles.statLabel}>Total Adventures</span>
            </div>
            <div style={styles.statItem}>
              <span style={{ ...styles.statValue, color: 'var(--accent-warning)' }}>
                {player.completedAdventures.filter(a => a.quizScore === a.quizTotal).length}
              </span>
              <span style={styles.statLabel}>Perfect Clears</span>
            </div>
            <div style={styles.statItem}>
              <span style={{ ...styles.statValue, color: 'var(--accent-danger)' }}>
                {player.totalXp}
              </span>
              <span style={styles.statLabel}>Total XP</span>
            </div>
            <div style={styles.statItem}>
              <span style={{ ...styles.statValue, color: 'var(--accent-secondary)' }}>
                {new Set(player.completedAdventures.map(a => a.topic)).size}
              </span>
              <span style={styles.statLabel}>Unique Topics</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'fixed',
    inset: 0,
    overflow: 'auto',
    background: `
      radial-gradient(ellipse at 20% 20%, rgba(99, 102, 241, 0.1) 0%, transparent 50%),
      radial-gradient(ellipse at 80% 80%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
      var(--bg-primary)
    `,
  },
  inner: {
    minHeight: '100%',
    padding: '2rem 1rem',
  },
  headerSection: {
    maxWidth: '1100px',
    margin: '0 auto 1.5rem',
  },
  headerRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  sortControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  sortLabel: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
  },
  sortBtn: {
    padding: '0.375rem 0.75rem',
    fontSize: '0.6875rem',
    fontWeight: 600,
    border: '1px solid',
    borderRadius: 'var(--radius-sm)',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    fontFamily: 'inherit',
  },
  banner: {
    textAlign: 'center',
    padding: '1.5rem 0',
    background: 'linear-gradient(90deg, transparent 0%, rgba(99, 102, 241, 0.15) 50%, transparent 100%)',
  },
  bannerTitle: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: 'var(--accent-primary)',
    marginBottom: '0.5rem',
  },
  bannerSubtitle: {
    fontSize: '1.125rem',
    color: 'var(--accent-warning)',
  },
  mainGrid: {
    maxWidth: '1100px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '1.5rem',
  },
  emptyState: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-xl)',
    padding: '3rem',
    textAlign: 'center',
  },
  emptyIcon: {
    fontSize: '3rem',
    display: 'block',
    marginBottom: '1rem',
  },
  emptyTitle: {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: 'var(--text-muted)',
    marginBottom: '0.5rem',
  },
  emptyText: {
    color: 'var(--text-muted)',
  },
  adventuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '1rem',
  },
  adventureCard: {
    background: 'var(--bg-card)',
    border: '1px solid',
    borderRadius: 'var(--radius-lg)',
    padding: '1rem',
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    fontFamily: 'inherit',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: '0.75rem',
  },
  cardIcon: {
    width: '40px',
    height: '40px',
    borderRadius: 'var(--radius-md)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.25rem',
    background: 'rgba(99, 102, 241, 0.1)',
    border: '2px solid',
  },
  cardStars: {
    fontWeight: 600,
  },
  cardTitle: {
    fontSize: '1rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
    marginBottom: '0.25rem',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
  },
  cardTopic: {
    fontSize: '0.875rem',
    color: 'var(--accent-primary)',
    marginBottom: '0.75rem',
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
  },
  cardExpanded: {
    marginTop: '1rem',
    paddingTop: '1rem',
    borderTop: '1px solid var(--border-color)',
    animation: 'fadeIn 0.3s ease',
  },
  expandedStats: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
    marginBottom: '0.75rem',
  },
  expandedStat: {
    textAlign: 'center',
    padding: '0.5rem',
    background: 'rgba(99, 102, 241, 0.05)',
    borderRadius: 'var(--radius-sm)',
  },
  expandedValue: {
    display: 'block',
    fontSize: '1.25rem',
    fontWeight: 700,
  },
  expandedLabel: {
    fontSize: '0.6875rem',
    color: 'var(--text-muted)',
  },
  perfectBadge: {
    textAlign: 'center',
    padding: '0.5rem',
    background: 'rgba(245, 158, 11, 0.1)',
    border: '1px solid var(--accent-warning)',
    borderRadius: 'var(--radius-sm)',
    fontSize: '0.6875rem',
    fontWeight: 600,
    color: 'var(--accent-warning)',
  },
  statsFooter: {
    maxWidth: '1100px',
    margin: '2rem auto 0',
    paddingTop: '1.5rem',
    borderTop: '1px solid var(--border-color)',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1rem',
    textAlign: 'center',
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  statValue: {
    fontSize: '1.5rem',
    fontWeight: 700,
  },
  statLabel: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
  },
};

// Add media query styles via CSS-in-JS
if (typeof window !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    @media (min-width: 1024px) {
      .collection-main-grid {
        grid-template-columns: 350px 1fr !important;
      }
    }
    @media (min-width: 768px) {
      .collection-stats-grid {
        grid-template-columns: repeat(4, 1fr) !important;
      }
    }
  `;
  document.head.appendChild(styleSheet);
}

export default AdventureCollection;
