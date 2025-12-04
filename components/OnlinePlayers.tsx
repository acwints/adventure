import React, { useState, useEffect, useRef } from 'react';
import { DUMMY_PLAYERS } from '../constants';

interface OnlinePlayersProps {
  mapWidth: number;
  mapHeight: number;
  regionPositions: Record<string, { xPct: number; yPct: number }>;
}

const CHAR_SIZE = 26;

// Players do small idle movements around their region
const IDLE_RADIUS = 25;
const IDLE_SPEED = 0.3;

interface PlayerState {
  id: string;
  displayName: string;
  avatar: string;
  color: string;
  level: number;
  title: string;
  regionId: string;
  currentQuest: string;
  isOnline: boolean;
  // Position offset from region center
  offsetX: number;
  offsetY: number;
  targetOffsetX: number;
  targetOffsetY: number;
}

const OnlinePlayers: React.FC<OnlinePlayersProps> = ({ mapWidth, mapHeight, regionPositions }) => {
  const [players, setPlayers] = useState<PlayerState[]>([]);
  const [hoveredPlayer, setHoveredPlayer] = useState<string | null>(null);
  const animationFrame = useRef<number>();

  // Initialize players at their assigned regions
  useEffect(() => {
    const initialPlayers: PlayerState[] = DUMMY_PLAYERS
      .filter(p => p.isOnline) // Only show online players on the map
      .map((p) => ({
        ...p,
        offsetX: (Math.random() - 0.5) * IDLE_RADIUS * 2,
        offsetY: (Math.random() - 0.5) * IDLE_RADIUS * 2,
        targetOffsetX: (Math.random() - 0.5) * IDLE_RADIUS * 2,
        targetOffsetY: (Math.random() - 0.5) * IDLE_RADIUS * 2,
      }));
    setPlayers(initialPlayers);
  }, []);

  // Periodically set new target positions for idle movement
  useEffect(() => {
    const updateTargets = () => {
      setPlayers(prev => prev.map(player => ({
        ...player,
        targetOffsetX: (Math.random() - 0.5) * IDLE_RADIUS * 2,
        targetOffsetY: (Math.random() - 0.5) * IDLE_RADIUS * 2,
      })));
    };

    const interval = setInterval(updateTargets, 3000);
    return () => clearInterval(interval);
  }, []);

  // Smooth movement animation toward target
  useEffect(() => {
    const gameLoop = () => {
      setPlayers(prev => prev.map(player => {
        const dx = player.targetOffsetX - player.offsetX;
        const dy = player.targetOffsetY - player.offsetY;
        
        return {
          ...player,
          offsetX: player.offsetX + dx * IDLE_SPEED * 0.05,
          offsetY: player.offsetY + dy * IDLE_SPEED * 0.05,
        };
      }));

      animationFrame.current = requestAnimationFrame(gameLoop);
    };

    animationFrame.current = requestAnimationFrame(gameLoop);
    return () => {
      if (animationFrame.current) cancelAnimationFrame(animationFrame.current);
    };
  }, []);

  if (mapWidth === 0 || mapHeight === 0) return null;

  return (
    <>
      {players.map((player) => {
        const regionPos = regionPositions[player.regionId];
        if (!regionPos) return null;

        const baseX = regionPos.xPct * mapWidth;
        const baseY = regionPos.yPct * mapHeight;

        return (
          <div
            key={player.id}
            style={{
              ...styles.playerContainer,
              left: baseX + player.offsetX - CHAR_SIZE / 2,
              top: baseY + player.offsetY - CHAR_SIZE / 2 + 45, // Offset below region icon
            }}
            onMouseEnter={() => setHoveredPlayer(player.id)}
            onMouseLeave={() => setHoveredPlayer(null)}
          >
            {/* Player avatar */}
            <div 
              style={{
                ...styles.avatar,
                borderColor: player.color,
                boxShadow: `0 0 12px ${player.color}50`,
              }}
            >
              <span style={styles.avatarEmoji}>{player.avatar}</span>
            </div>

            {/* Shadow */}
            <div style={styles.shadow} />

            {/* Name label (always visible) */}
            <div style={styles.nameLabel}>{player.displayName}</div>

            {/* Detailed tooltip on hover */}
            {hoveredPlayer === player.id && (
              <div style={styles.tooltip}>
                <div style={styles.tooltipHeader}>
                  <span style={{ ...styles.tooltipAvatar, borderColor: player.color }}>
                    {player.avatar}
                  </span>
                  <div>
                    <div style={styles.tooltipName}>{player.displayName}</div>
                    <div style={styles.tooltipLevel}>Lv.{player.level} • {player.title}</div>
                  </div>
                </div>
                <div style={styles.tooltipDivider} />
                <div style={styles.tooltipQuest}>
                  <span style={styles.questLabel}>Studying:</span>
                  <span style={styles.questName}>{player.currentQuest}</span>
                </div>
              </div>
            )}

            {/* "In class" indicator */}
            <div style={styles.studyingIndicator}>
              <span style={styles.bookIcon}>📖</span>
            </div>
          </div>
        );
      })}
    </>
  );
};

const styles: Record<string, React.CSSProperties> = {
  playerContainer: {
    position: 'absolute',
    width: CHAR_SIZE,
    height: CHAR_SIZE,
    zIndex: 5,
    cursor: 'pointer',
    transition: 'transform 0.1s ease',
  },
  avatar: {
    width: CHAR_SIZE,
    height: CHAR_SIZE,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg-card)',
    borderRadius: '50%',
    border: '2px solid',
    transition: 'box-shadow 0.2s ease, transform 0.2s ease',
  },
  avatarEmoji: {
    fontSize: '0.875rem',
    lineHeight: 1,
  },
  shadow: {
    position: 'absolute',
    bottom: '-3px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '14px',
    height: '4px',
    background: 'rgba(0,0,0,0.25)',
    borderRadius: '50%',
    filter: 'blur(1px)',
  },
  nameLabel: {
    position: 'absolute',
    top: 'calc(100% + 2px)',
    left: '50%',
    transform: 'translateX(-50%)',
    fontSize: '0.5625rem',
    fontWeight: 600,
    color: 'var(--text-secondary)',
    whiteSpace: 'nowrap',
    textShadow: '0 1px 2px rgba(0,0,0,0.8)',
  },
  tooltip: {
    position: 'absolute',
    bottom: 'calc(100% + 12px)',
    left: '50%',
    transform: 'translateX(-50%)',
    padding: '0.75rem',
    background: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    whiteSpace: 'nowrap',
    zIndex: 30,
    animation: 'fadeIn 0.15s ease-out',
    boxShadow: 'var(--shadow-lg)',
    minWidth: '160px',
  },
  tooltipHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  tooltipAvatar: {
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg-tertiary)',
    borderRadius: '50%',
    border: '2px solid',
    fontSize: '1rem',
  },
  tooltipName: {
    fontWeight: 600,
    fontSize: '0.8125rem',
    color: 'var(--text-primary)',
  },
  tooltipLevel: {
    fontSize: '0.6875rem',
    color: 'var(--text-muted)',
  },
  tooltipDivider: {
    height: '1px',
    background: 'var(--border-color)',
    margin: '0.5rem 0',
  },
  tooltipQuest: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.125rem',
  },
  questLabel: {
    fontSize: '0.625rem',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  questName: {
    fontSize: '0.75rem',
    color: 'var(--accent-tertiary)',
    fontWeight: 500,
  },
  studyingIndicator: {
    position: 'absolute',
    top: '-4px',
    right: '-4px',
    width: '14px',
    height: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg-card)',
    borderRadius: '50%',
    border: '1px solid var(--border-color)',
  },
  bookIcon: {
    fontSize: '0.5rem',
  },
};

export default OnlinePlayers;
