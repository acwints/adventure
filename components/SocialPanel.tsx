import React, { useState } from 'react';
import type { GamePlayer } from '../types';
import { DUMMY_PLAYERS, MAP_REGIONS } from '../constants';

interface SocialPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  player: GamePlayer | null;
}

type TabType = 'leaderboard' | 'friends' | 'quest';

const SocialPanel: React.FC<SocialPanelProps> = ({ isOpen, onToggle, player }) => {
  const [activeTab, setActiveTab] = useState<TabType>('leaderboard');

  // Get sorted leaderboard (including current player)
  const getLeaderboard = () => {
    const allPlayers = [
      ...DUMMY_PLAYERS.map(p => ({
        id: p.id,
        displayName: p.displayName,
        avatar: p.avatar,
        color: p.color,
        level: p.level,
        totalXp: p.totalXp,
        isCurrentPlayer: false,
      })),
      ...(player ? [{
        id: player.uid,
        displayName: player.displayName,
        avatar: '🧑‍🚀',
        color: '#6366f1',
        level: player.level,
        totalXp: player.totalXp,
        isCurrentPlayer: true,
      }] : []),
    ];

    return allPlayers.sort((a, b) => b.totalXp - a.totalXp);
  };

  // Get friends (online first, then offline)
  const getFriends = () => {
    const friends = DUMMY_PLAYERS.filter(p => p.isFriend);
    return friends.sort((a, b) => {
      if (a.isOnline && !b.isOnline) return -1;
      if (!a.isOnline && b.isOnline) return 1;
      return 0;
    });
  };

  // Get region name from ID
  const getRegionName = (regionId: string) => {
    const region = MAP_REGIONS.find(r => r.id === regionId);
    return region?.name || 'Unknown';
  };

  // Get most recent adventure
  const getRecentAdventure = () => {
    if (!player?.completedAdventures.length) return null;
    const sorted = [...player.completedAdventures].sort((a, b) => b.completedAt - a.completedAt);
    return sorted[0];
  };

  const leaderboard = getLeaderboard();
  const friends = getFriends();
  const recentAdventure = getRecentAdventure();
  const onlineFriendsCount = friends.filter(f => f.isOnline).length;

  return (
    <>
      {/* Toggle button when closed */}
      {!isOpen && (
        <button onClick={onToggle} style={styles.toggleButton} title="Open Social Panel">
          <span style={styles.toggleIcon}>👥</span>
          {onlineFriendsCount > 0 && (
            <span style={styles.onlineBadge}>{onlineFriendsCount}</span>
          )}
        </button>
      )}

      {/* Social panel */}
      <div style={{
        ...styles.panel,
        transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
      }}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerTitle}>
            <span style={styles.headerIcon}>👥</span>
            <span>Social</span>
          </div>
          <button onClick={onToggle} style={styles.closeButton} title="Close">
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div style={styles.tabs}>
          <button
            onClick={() => setActiveTab('leaderboard')}
            style={{
              ...styles.tab,
              ...(activeTab === 'leaderboard' ? styles.tabActive : {}),
            }}
          >
            🏆 Leaderboard
          </button>
          <button
            onClick={() => setActiveTab('friends')}
            style={{
              ...styles.tab,
              ...(activeTab === 'friends' ? styles.tabActive : {}),
            }}
          >
            💚 Friends
            {onlineFriendsCount > 0 && (
              <span style={styles.tabBadge}>{onlineFriendsCount}</span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('quest')}
            style={{
              ...styles.tab,
              ...(activeTab === 'quest' ? styles.tabActive : {}),
            }}
          >
            📜 Quest
          </button>
        </div>

        {/* Content */}
        <div style={styles.content}>
          {activeTab === 'leaderboard' && (
            <div style={styles.leaderboard}>
              <div style={styles.sectionTitle}>Top Explorers</div>
              {leaderboard.map((p, index) => (
                <div
                  key={p.id}
                  style={{
                    ...styles.leaderboardItem,
                    ...(p.isCurrentPlayer ? styles.currentPlayerItem : {}),
                  }}
                >
                  <div style={styles.rank}>
                    {index === 0 && '🥇'}
                    {index === 1 && '🥈'}
                    {index === 2 && '🥉'}
                    {index > 2 && <span style={styles.rankNumber}>{index + 1}</span>}
                  </div>
                  <div 
                    style={{
                      ...styles.playerAvatar,
                      borderColor: p.color,
                    }}
                  >
                    {p.avatar}
                  </div>
                  <div style={styles.playerInfo}>
                    <div style={styles.playerName}>
                      {p.displayName}
                      {p.isCurrentPlayer && <span style={styles.youTag}>YOU</span>}
                    </div>
                    <div style={styles.playerStats}>
                      Lv.{p.level} • {p.totalXp.toLocaleString()} XP
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'friends' && (
            <div style={styles.friendsList}>
              <div style={styles.sectionTitle}>
                Friends ({onlineFriendsCount}/{friends.length} online)
              </div>
              {friends.map((friend) => (
                <div key={friend.id} style={styles.friendItem}>
                  <div style={styles.friendAvatarWrapper}>
                    <div 
                      style={{
                        ...styles.friendAvatar,
                        borderColor: friend.color,
                        opacity: friend.isOnline ? 1 : 0.5,
                      }}
                    >
                      {friend.avatar}
                    </div>
                    <div 
                      style={{
                        ...styles.onlineIndicator,
                        background: friend.isOnline ? '#10b981' : '#64748b',
                      }} 
                    />
                  </div>
                  <div style={styles.friendInfo}>
                    <div style={styles.friendName}>{friend.displayName}</div>
                    {friend.isOnline ? (
                      <div style={styles.friendStatus}>
                        <span style={styles.statusIcon}>📖</span>
                        Studying: {friend.currentQuest}
                      </div>
                    ) : (
                      <div style={styles.friendOffline}>Offline</div>
                    )}
                  </div>
                  {friend.isOnline && (
                    <div style={styles.friendLocation}>
                      📍 {getRegionName(friend.regionId)}
                    </div>
                  )}
                </div>
              ))}
              
              {friends.length === 0 && (
                <div style={styles.emptyState}>
                  <span style={styles.emptyIcon}>🤝</span>
                  <p>No friends yet</p>
                  <p style={styles.emptyHint}>Meet other explorers on the map!</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'quest' && (
            <div style={styles.questSection}>
              {/* Current Quest */}
              <div style={styles.questCard}>
                <div style={styles.questCardHeader}>
                  <span style={styles.questCardIcon}>⚔️</span>
                  <span>Current Quest</span>
                </div>
                <div style={styles.questCardContent}>
                  <div style={styles.questEmpty}>
                    <span style={styles.emptyIcon}>🗺️</span>
                    <p>No active quest</p>
                    <p style={styles.emptyHint}>Explore a region to start!</p>
                  </div>
                </div>
              </div>

              {/* Recent Adventure */}
              <div style={styles.questCard}>
                <div style={styles.questCardHeader}>
                  <span style={styles.questCardIcon}>📜</span>
                  <span>Recent Adventure</span>
                </div>
                <div style={styles.questCardContent}>
                  {recentAdventure ? (
                    <div style={styles.recentQuest}>
                      <div style={styles.recentTitle}>{recentAdventure.title}</div>
                      <div style={styles.recentTopic}>{recentAdventure.topic}</div>
                      <div style={styles.recentStats}>
                        <span>🎯 {recentAdventure.quizScore}/{recentAdventure.quizTotal}</span>
                        <span>✨ +{recentAdventure.xpEarned} XP</span>
                      </div>
                      <div style={styles.recentTime}>
                        {formatTimeAgo(recentAdventure.completedAt)}
                      </div>
                    </div>
                  ) : (
                    <div style={styles.questEmpty}>
                      <span style={styles.emptyIcon}>📚</span>
                      <p>No adventures yet</p>
                      <p style={styles.emptyHint}>Complete a quest to see it here!</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats Summary */}
              {player && (
                <div style={styles.statsCard}>
                  <div style={styles.statItem}>
                    <div style={styles.statValue}>{player.completedAdventures.length}</div>
                    <div style={styles.statLabel}>Quests Done</div>
                  </div>
                  <div style={styles.statDivider} />
                  <div style={styles.statItem}>
                    <div style={styles.statValue}>{player.totalXp.toLocaleString()}</div>
                    <div style={styles.statLabel}>Total XP</div>
                  </div>
                  <div style={styles.statDivider} />
                  <div style={styles.statItem}>
                    <div style={styles.statValue}>Lv.{player.level}</div>
                    <div style={styles.statLabel}>Level</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// Helper to format time ago
function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

const styles: Record<string, React.CSSProperties> = {
  toggleButton: {
    position: 'fixed',
    left: '1rem',
    bottom: '1rem',
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 20px rgba(16, 185, 129, 0.4)',
    zIndex: 100,
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  },
  toggleIcon: {
    fontSize: '1.5rem',
  },
  onlineBadge: {
    position: 'absolute',
    top: '-4px',
    right: '-4px',
    minWidth: '20px',
    height: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#ef4444',
    borderRadius: '10px',
    fontSize: '0.6875rem',
    fontWeight: 700,
    color: 'white',
    padding: '0 5px',
  },
  panel: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '300px',
    height: '100vh',
    background: 'var(--bg-secondary)',
    borderRight: '1px solid var(--border-color)',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 50,
    transition: 'transform 0.3s ease',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem 1.25rem',
    borderBottom: '1px solid var(--border-color)',
    background: 'var(--bg-tertiary)',
  },
  headerTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
  },
  headerIcon: {
    fontSize: '1.25rem',
  },
  closeButton: {
    width: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'transparent',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    borderRadius: 'var(--radius-sm)',
    fontSize: '0.875rem',
    transition: 'all 0.15s ease',
  },
  tabs: {
    display: 'flex',
    borderBottom: '1px solid var(--border-color)',
    background: 'var(--bg-tertiary)',
  },
  tab: {
    flex: 1,
    padding: '0.625rem 0.5rem',
    background: 'transparent',
    border: 'none',
    borderBottom: '2px solid transparent',
    color: 'var(--text-muted)',
    fontSize: '0.75rem',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.25rem',
  },
  tabActive: {
    color: 'var(--text-primary)',
    borderBottomColor: 'var(--accent-primary)',
  },
  tabBadge: {
    minWidth: '16px',
    height: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#10b981',
    borderRadius: '8px',
    fontSize: '0.625rem',
    fontWeight: 700,
    color: 'white',
    padding: '0 4px',
  },
  content: {
    flex: 1,
    overflowY: 'auto',
    padding: '1rem',
  },
  sectionTitle: {
    fontSize: '0.6875rem',
    fontWeight: 600,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '0.75rem',
  },
  leaderboard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  leaderboardItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.625rem',
    padding: '0.625rem',
    background: 'var(--bg-card)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
  },
  currentPlayerItem: {
    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(99, 102, 241, 0.05) 100%)',
    borderColor: 'var(--accent-primary)',
  },
  rank: {
    width: '24px',
    textAlign: 'center',
    fontSize: '1rem',
  },
  rankNumber: {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: 'var(--text-muted)',
  },
  playerAvatar: {
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg-tertiary)',
    borderRadius: '50%',
    border: '2px solid',
    fontSize: '0.875rem',
  },
  playerInfo: {
    flex: 1,
    minWidth: 0,
  },
  playerName: {
    fontWeight: 600,
    fontSize: '0.8125rem',
    color: 'var(--text-primary)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
  },
  youTag: {
    fontSize: '0.5625rem',
    fontWeight: 700,
    color: 'var(--accent-primary)',
    background: 'rgba(99, 102, 241, 0.2)',
    padding: '1px 4px',
    borderRadius: '2px',
  },
  playerStats: {
    fontSize: '0.6875rem',
    color: 'var(--text-muted)',
  },
  friendsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  friendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.625rem',
    padding: '0.625rem',
    background: 'var(--bg-card)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
  },
  friendAvatarWrapper: {
    position: 'relative',
  },
  friendAvatar: {
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg-tertiary)',
    borderRadius: '50%',
    border: '2px solid',
    fontSize: '1rem',
    transition: 'opacity 0.2s ease',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: '0',
    right: '0',
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    border: '2px solid var(--bg-card)',
  },
  friendInfo: {
    flex: 1,
    minWidth: 0,
  },
  friendName: {
    fontWeight: 600,
    fontSize: '0.8125rem',
    color: 'var(--text-primary)',
  },
  friendStatus: {
    fontSize: '0.6875rem',
    color: 'var(--accent-tertiary)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  statusIcon: {
    fontSize: '0.625rem',
  },
  friendOffline: {
    fontSize: '0.6875rem',
    color: 'var(--text-muted)',
  },
  friendLocation: {
    fontSize: '0.625rem',
    color: 'var(--text-muted)',
    whiteSpace: 'nowrap',
  },
  emptyState: {
    textAlign: 'center',
    padding: '2rem 1rem',
    color: 'var(--text-muted)',
  },
  emptyIcon: {
    fontSize: '2rem',
    display: 'block',
    marginBottom: '0.5rem',
  },
  emptyHint: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    marginTop: '0.25rem',
  },
  questSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  questCard: {
    background: 'var(--bg-card)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
    overflow: 'hidden',
  },
  questCardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.625rem 0.75rem',
    background: 'var(--bg-tertiary)',
    borderBottom: '1px solid var(--border-color)',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
  },
  questCardIcon: {
    fontSize: '0.875rem',
  },
  questCardContent: {
    padding: '0.75rem',
  },
  questEmpty: {
    textAlign: 'center',
    padding: '0.5rem',
    color: 'var(--text-muted)',
    fontSize: '0.8125rem',
  },
  recentQuest: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  recentTitle: {
    fontWeight: 600,
    fontSize: '0.875rem',
    color: 'var(--text-primary)',
  },
  recentTopic: {
    fontSize: '0.75rem',
    color: 'var(--accent-tertiary)',
  },
  recentStats: {
    display: 'flex',
    gap: '0.75rem',
    fontSize: '0.6875rem',
    color: 'var(--text-secondary)',
    marginTop: '0.25rem',
  },
  recentTime: {
    fontSize: '0.625rem',
    color: 'var(--text-muted)',
    marginTop: '0.25rem',
  },
  statsCard: {
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: '0.875rem',
    background: 'var(--bg-card)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
  },
  statItem: {
    textAlign: 'center',
  },
  statValue: {
    fontSize: '1rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
  },
  statLabel: {
    fontSize: '0.625rem',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.03em',
    marginTop: '0.125rem',
  },
  statDivider: {
    width: '1px',
    height: '30px',
    background: 'var(--border-color)',
  },
};

export default SocialPanel;

