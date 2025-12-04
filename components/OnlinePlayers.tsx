import React, { useState, useEffect, useRef } from 'react';
import { DUMMY_PLAYERS } from '../constants';

interface OnlinePlayersProps {
  mapWidth: number;
  mapHeight: number;
  regionPositions: Record<string, { xPct: number; yPct: number }>;
}

const CHAR_SIZE = 26;
const ORBIT_RADIUS = 50; // Distance from region center
const ORBIT_SPEED = 0.0024; // Radians per frame (3x speed)

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
  // Orbit state
  orbitAngle: number;
  orbitSpeed: number;
}

const OnlinePlayers: React.FC<OnlinePlayersProps> = ({ mapWidth, mapHeight, regionPositions }) => {
  const [players, setPlayers] = useState<PlayerState[]>([]);
  const [hoveredPlayer, setHoveredPlayer] = useState<string | null>(null);
  const animationFrame = useRef<number>();

  // Initialize players at their assigned regions with random starting orbit positions
  useEffect(() => {
    const initialPlayers: PlayerState[] = DUMMY_PLAYERS
      .filter(p => p.isOnline) // Only show online players on the map
      .map((p, index) => ({
        ...p,
        // Start at different positions around the orbit
        orbitAngle: (index / DUMMY_PLAYERS.filter(pl => pl.isOnline).length) * Math.PI * 2,
        // Slightly varied orbit speeds for visual interest
        orbitSpeed: ORBIT_SPEED * (0.8 + Math.random() * 0.4),
      }));
    setPlayers(initialPlayers);
  }, []);

  // Orbit animation loop
  useEffect(() => {
    const animate = () => {
      setPlayers(prev => prev.map(player => ({
        ...player,
        orbitAngle: player.orbitAngle + player.orbitSpeed,
      })));

      animationFrame.current = requestAnimationFrame(animate);
    };

    animationFrame.current = requestAnimationFrame(animate);
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

        // Calculate orbit position
        const centerX = regionPos.xPct * mapWidth;
        const centerY = regionPos.yPct * mapHeight;
        const orbitX = centerX + Math.cos(player.orbitAngle) * ORBIT_RADIUS;
        const orbitY = centerY + Math.sin(player.orbitAngle) * ORBIT_RADIUS;

        return (
          <div
            key={player.id}
            style={{
              ...styles.playerContainer,
              left: orbitX - CHAR_SIZE / 2,
              top: orbitY - CHAR_SIZE / 2,
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
