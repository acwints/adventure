import React, { useState, useEffect, useRef } from 'react';
import type { OnlinePlayer } from '../types';
import { DUMMY_PLAYERS } from '../constants';

interface OnlinePlayersProps {
  mapWidth: number;
  mapHeight: number;
}

const CHAR_SIZE = 28;
const MOVE_SPEED = 1.5;
const DIRECTION_CHANGE_INTERVAL = 2000; // ms
const IDLE_CHANCE = 0.3; // 30% chance to idle

const OnlinePlayers: React.FC<OnlinePlayersProps> = ({ mapWidth, mapHeight }) => {
  const [players, setPlayers] = useState<OnlinePlayer[]>([]);
  const [hoveredPlayer, setHoveredPlayer] = useState<string | null>(null);
  const animationFrame = useRef<number>();
  const directionTimers = useRef<Map<string, number>>(new Map());

  // Initialize players with random positions
  useEffect(() => {
    const initialPlayers: OnlinePlayer[] = DUMMY_PLAYERS.map((p, index) => ({
      ...p,
      x: 100 + (index * (mapWidth - 200) / DUMMY_PLAYERS.length) + Math.random() * 50,
      y: 100 + Math.random() * (mapHeight - 200),
      direction: (['up', 'down', 'left', 'right'] as const)[Math.floor(Math.random() * 4)],
      isMoving: Math.random() > IDLE_CHANCE,
    }));
    setPlayers(initialPlayers);
  }, [mapWidth, mapHeight]);

  // Random direction changes
  useEffect(() => {
    const changeDirections = () => {
      setPlayers(prev => prev.map(player => {
        const now = Date.now();
        const lastChange = directionTimers.current.get(player.id) || 0;
        
        if (now - lastChange > DIRECTION_CHANGE_INTERVAL) {
          directionTimers.current.set(player.id, now);
          const newDirection = (['up', 'down', 'left', 'right'] as const)[
            Math.floor(Math.random() * 4)
          ];
          const willMove = Math.random() > IDLE_CHANCE;
          return { ...player, direction: newDirection, isMoving: willMove };
        }
        return player;
      }));
    };

    const interval = setInterval(changeDirections, 500);
    return () => clearInterval(interval);
  }, []);

  // Movement animation loop
  useEffect(() => {
    const gameLoop = () => {
      setPlayers(prev => prev.map(player => {
        if (!player.isMoving) return player;

        let dx = 0;
        let dy = 0;

        switch (player.direction) {
          case 'up': dy = -MOVE_SPEED; break;
          case 'down': dy = MOVE_SPEED; break;
          case 'left': dx = -MOVE_SPEED; break;
          case 'right': dx = MOVE_SPEED; break;
        }

        // Calculate new position with bounds
        const newX = Math.max(30, Math.min(mapWidth - 30, player.x + dx));
        const newY = Math.max(30, Math.min(mapHeight - 30, player.y + dy));

        // If hitting boundary, change direction
        if (newX === player.x && dx !== 0) {
          const newDir = dx > 0 ? 'left' : 'right';
          return { ...player, direction: newDir as OnlinePlayer['direction'] };
        }
        if (newY === player.y && dy !== 0) {
          const newDir = dy > 0 ? 'up' : 'down';
          return { ...player, direction: newDir as OnlinePlayer['direction'] };
        }

        return { ...player, x: newX, y: newY };
      }));

      animationFrame.current = requestAnimationFrame(gameLoop);
    };

    animationFrame.current = requestAnimationFrame(gameLoop);
    return () => {
      if (animationFrame.current) cancelAnimationFrame(animationFrame.current);
    };
  }, [mapWidth, mapHeight]);

  if (mapWidth === 0 || mapHeight === 0) return null;

  return (
    <>
      {players.map((player) => (
        <div
          key={player.id}
          style={{
            ...styles.playerContainer,
            left: player.x - CHAR_SIZE / 2,
            top: player.y - CHAR_SIZE / 2,
            transform: player.isMoving ? 'translateY(-1px)' : 'translateY(0)',
          }}
          onMouseEnter={() => setHoveredPlayer(player.id)}
          onMouseLeave={() => setHoveredPlayer(null)}
        >
          {/* Player avatar */}
          <div 
            style={{
              ...styles.avatar,
              borderColor: player.color,
              boxShadow: `0 0 10px ${player.color}40`,
            }}
          >
            <span style={styles.avatarEmoji}>{player.avatar}</span>
          </div>

          {/* Shadow */}
          <div style={styles.shadow} />

          {/* Name tooltip on hover */}
          {hoveredPlayer === player.id && (
            <div style={styles.tooltip}>
              <div style={styles.tooltipName}>{player.displayName}</div>
              <div style={styles.tooltipInfo}>
                Lv.{player.level} • {player.title}
              </div>
            </div>
          )}

          {/* Moving indicator */}
          {player.isMoving && (
            <div 
              style={{
                ...styles.movingDot,
                background: player.color,
              }} 
            />
          )}
        </div>
      ))}
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
    transition: 'box-shadow 0.2s ease',
  },
  avatarEmoji: {
    fontSize: '1rem',
    lineHeight: 1,
  },
  shadow: {
    position: 'absolute',
    bottom: '-3px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '16px',
    height: '4px',
    background: 'rgba(0,0,0,0.25)',
    borderRadius: '50%',
    filter: 'blur(1px)',
  },
  tooltip: {
    position: 'absolute',
    bottom: 'calc(100% + 8px)',
    left: '50%',
    transform: 'translateX(-50%)',
    padding: '0.5rem 0.75rem',
    background: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    whiteSpace: 'nowrap',
    zIndex: 20,
    animation: 'fadeIn 0.15s ease-out',
    boxShadow: 'var(--shadow-lg)',
  },
  tooltipName: {
    fontWeight: 600,
    fontSize: '0.8125rem',
    color: 'var(--text-primary)',
    textAlign: 'center',
  },
  tooltipInfo: {
    fontSize: '0.6875rem',
    color: 'var(--text-muted)',
    textAlign: 'center',
    marginTop: '0.125rem',
  },
  movingDot: {
    position: 'absolute',
    top: '-2px',
    right: '-2px',
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    animation: 'pulse 1s ease-in-out infinite',
  },
};

export default OnlinePlayers;

