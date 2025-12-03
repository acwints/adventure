import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { MapRegion, GamePlayer } from '../types';
import { MAP_REGIONS } from '../constants';
import { hasCompletedTopic } from '../services/gameService';

interface WorldMapProps {
  player: GamePlayer;
  onSelectRegion: (region: MapRegion) => void;
  onViewCollection: () => void;
  onLogout: () => void;
}

const MAP_WIDTH = 900;
const MAP_HEIGHT = 600;
const CHAR_SIZE = 32;
const MOVE_SPEED = 4;
const INTERACTION_DISTANCE = 50;

// Region positions on the map
const REGION_POSITIONS: Record<string, { x: number; y: number; emoji: string; color: string }> = {
  'history_peaks': { x: 120, y: 120, emoji: '🏛️', color: '#f59e0b' },
  'nature_grove': { x: 750, y: 100, emoji: '🌿', color: '#10b981' },
  'cosmic_observatory': { x: 450, y: 80, emoji: '🔭', color: '#6366f1' },
  'tech_citadel': { x: 780, y: 350, emoji: '⚡', color: '#06b6d4' },
  'ancient_fossils': { x: 150, y: 400, emoji: '🦴', color: '#d97706' },
  'elemental_forge': { x: 450, y: 450, emoji: '🌋', color: '#ef4444' },
  'mystery_depths': { x: 300, y: 520, emoji: '🐙', color: '#8b5cf6' },
  'mind_sanctuary': { x: 700, y: 500, emoji: '🧠', color: '#ec4899' },
};

const WorldMap: React.FC<WorldMapProps> = ({ player, onSelectRegion, onViewCollection, onLogout }) => {
  const [charPos, setCharPos] = useState({ x: MAP_WIDTH / 2, y: MAP_HEIGHT / 2 });
  const [charDirection, setCharDirection] = useState<'down' | 'up' | 'left' | 'right'>('down');
  const [isMoving, setIsMoving] = useState(false);
  const [nearbyRegion, setNearbyRegion] = useState<MapRegion | null>(null);
  const keysPressed = useRef<Set<string>>(new Set());
  const animationFrame = useRef<number>();

  // Check proximity to regions
  const checkNearbyRegion = useCallback((x: number, y: number) => {
    for (const region of MAP_REGIONS) {
      const pos = REGION_POSITIONS[region.id];
      if (!pos) continue;
      
      const distance = Math.sqrt(
        Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2)
      );
      
      if (distance < INTERACTION_DISTANCE) {
        return region;
      }
    }
    return null;
  }, []);

  // Game loop
  useEffect(() => {
    const gameLoop = () => {
      const keys = keysPressed.current;
      let dx = 0;
      let dy = 0;
      let moving = false;

      if (keys.has('ArrowUp') || keys.has('w') || keys.has('W')) {
        dy -= MOVE_SPEED;
        setCharDirection('up');
        moving = true;
      }
      if (keys.has('ArrowDown') || keys.has('s') || keys.has('S')) {
        dy += MOVE_SPEED;
        setCharDirection('down');
        moving = true;
      }
      if (keys.has('ArrowLeft') || keys.has('a') || keys.has('A')) {
        dx -= MOVE_SPEED;
        setCharDirection('left');
        moving = true;
      }
      if (keys.has('ArrowRight') || keys.has('d') || keys.has('D')) {
        dx += MOVE_SPEED;
        setCharDirection('right');
        moving = true;
      }

      setIsMoving(moving);

      if (dx !== 0 || dy !== 0) {
        setCharPos(prev => {
          const newX = Math.max(20, Math.min(MAP_WIDTH - 20, prev.x + dx));
          const newY = Math.max(20, Math.min(MAP_HEIGHT - 20, prev.y + dy));
          setNearbyRegion(checkNearbyRegion(newX, newY));
          return { x: newX, y: newY };
        });
      }

      animationFrame.current = requestAnimationFrame(gameLoop);
    };

    animationFrame.current = requestAnimationFrame(gameLoop);
    return () => {
      if (animationFrame.current) cancelAnimationFrame(animationFrame.current);
    };
  }, [checkNearbyRegion]);

  // Keyboard handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }
      keysPressed.current.add(e.key);
      
      if ((e.key === ' ' || e.key === 'Enter') && nearbyRegion) {
        onSelectRegion(nearbyRegion);
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key);
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [nearbyRegion, onSelectRegion]);

  const getRegionCompletion = (region: MapRegion): number => {
    return region.topics.filter(topic => hasCompletedTopic(player, topic)).length;
  };

  return (
    <div style={styles.container}>
      {/* Header bar */}
      <div style={styles.header}>
        <div style={styles.playerInfo}>
          <div style={styles.avatar}>
            <span>🧑‍🚀</span>
          </div>
          <div>
            <div style={styles.playerName}>{player.displayName}</div>
            <div style={styles.playerLevel}>Level {player.level} Explorer</div>
          </div>
        </div>
        
        <div style={styles.xpBar}>
          <div style={styles.xpLabel}>XP {player.xp} / {player.level * 100}</div>
          <div style={styles.xpTrack}>
            <div 
              style={{ 
                ...styles.xpFill, 
                width: `${(player.xp / (player.level * 100)) * 100}%` 
              }} 
            />
          </div>
        </div>

        <div style={styles.headerActions}>
          <button onClick={onViewCollection} className="btn btn-secondary" style={styles.headerBtn}>
            📚 Collection
          </button>
          <button onClick={onLogout} className="btn btn-ghost" style={styles.headerBtn}>
            Exit
          </button>
        </div>
      </div>

      {/* Map area */}
      <div style={styles.mapContainer}>
        <div style={styles.map}>
          {/* Stars background */}
          <div style={styles.stars} />
          
          {/* Nebula effects */}
          <div style={styles.nebula1} />
          <div style={styles.nebula2} />
          
          {/* Connection lines between regions */}
          <svg style={styles.connectionsSvg}>
            {MAP_REGIONS.map((region, i) => {
              const next = MAP_REGIONS[(i + 1) % MAP_REGIONS.length];
              const pos1 = REGION_POSITIONS[region.id];
              const pos2 = REGION_POSITIONS[next.id];
              if (!pos1 || !pos2) return null;
              
              return (
                <line
                  key={`line-${i}`}
                  x1={pos1.x}
                  y1={pos1.y}
                  x2={pos2.x}
                  y2={pos2.y}
                  stroke="rgba(99, 102, 241, 0.15)"
                  strokeWidth="2"
                  strokeDasharray="8 8"
                />
              );
            })}
          </svg>

          {/* Regions */}
          {MAP_REGIONS.map((region) => {
            const pos = REGION_POSITIONS[region.id];
            if (!pos) return null;
            
            const completion = getRegionCompletion(region);
            const isNearby = nearbyRegion?.id === region.id;
            const isComplete = completion === region.topics.length;
            
            return (
              <div
                key={region.id}
                style={{
                  ...styles.region,
                  left: pos.x - 30,
                  top: pos.y - 30,
                  transform: isNearby ? 'scale(1.15)' : 'scale(1)',
                  boxShadow: isNearby 
                    ? `0 0 30px ${pos.color}80, 0 0 60px ${pos.color}40`
                    : `0 0 20px ${pos.color}30`,
                }}
                onClick={() => onSelectRegion(region)}
              >
                <div 
                  style={{ 
                    ...styles.regionIcon,
                    borderColor: pos.color,
                    background: `linear-gradient(135deg, ${pos.color}20 0%, transparent 100%)`,
                  }}
                >
                  <span style={{ fontSize: '1.5rem' }}>{pos.emoji}</span>
                </div>
                
                <div style={styles.regionName}>{region.name}</div>
                
                {/* Progress dots */}
                <div style={styles.progressDots}>
                  {region.topics.map((_, i) => (
                    <div
                      key={i}
                      style={{
                        ...styles.dot,
                        background: i < completion ? pos.color : 'var(--border-color)',
                      }}
                    />
                  ))}
                </div>
                
                {isComplete && (
                  <div style={styles.completeBadge}>✓</div>
                )}
              </div>
            );
          })}

          {/* Player character */}
          <div
            style={{
              ...styles.character,
              left: charPos.x - CHAR_SIZE / 2,
              top: charPos.y - CHAR_SIZE / 2,
              transform: isMoving ? 'translateY(-2px)' : 'translateY(0)',
            }}
          >
            <div style={styles.characterBody}>
              {charDirection === 'up' && '🚀'}
              {charDirection === 'down' && '🧑‍🚀'}
              {charDirection === 'left' && '🧑‍🚀'}
              {charDirection === 'right' && '🧑‍🚀'}
            </div>
            <div style={styles.characterShadow} />
          </div>
        </div>

        {/* Interaction prompt */}
        {nearbyRegion && (
          <div style={styles.prompt}>
            <span>Press</span>
            <kbd style={styles.promptKbd}>SPACE</kbd>
            <span>to explore</span>
            <strong style={{ color: REGION_POSITIONS[nearbyRegion.id]?.color }}>
              {nearbyRegion.name}
            </strong>
          </div>
        )}
      </div>

      {/* Controls hint */}
      <div style={styles.controls}>
        <span style={styles.controlKey}>WASD</span> or <span style={styles.controlKey}>↑↓←→</span> to move
        <span style={styles.controlDivider}>•</span>
        <span style={styles.controlKey}>SPACE</span> to interact
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
    background: 'var(--bg-primary)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem 1.5rem',
    background: 'var(--bg-secondary)',
    borderBottom: '1px solid var(--border-color)',
    zIndex: 20,
  },
  playerInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  avatar: {
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg-tertiary)',
    borderRadius: '50%',
    border: '2px solid var(--accent-primary)',
    fontSize: '1.25rem',
  },
  playerName: {
    fontWeight: 600,
    color: 'var(--text-primary)',
  },
  playerLevel: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
  },
  xpBar: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    minWidth: '200px',
  },
  xpLabel: {
    fontSize: '0.6875rem',
    color: 'var(--text-muted)',
    textAlign: 'center',
  },
  xpTrack: {
    height: '6px',
    background: 'var(--bg-primary)',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  xpFill: {
    height: '100%',
    background: 'linear-gradient(90deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)',
    borderRadius: '3px',
    transition: 'width 0.3s ease',
  },
  headerActions: {
    display: 'flex',
    gap: '0.5rem',
  },
  headerBtn: {
    padding: '0.5rem 1rem',
    fontSize: '0.875rem',
  },
  mapContainer: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  map: {
    position: 'relative',
    width: MAP_WIDTH,
    height: MAP_HEIGHT,
    background: 'linear-gradient(180deg, #0c1222 0%, #1a1a2e 50%, #16213e 100%)',
    borderRadius: 'var(--radius-lg)',
    border: '2px solid var(--border-color)',
    overflow: 'hidden',
    boxShadow: 'var(--shadow-lg)',
  },
  stars: {
    position: 'absolute',
    inset: 0,
    backgroundImage: `
      radial-gradient(1px 1px at 20px 30px, white, transparent),
      radial-gradient(1px 1px at 40px 70px, rgba(255,255,255,0.8), transparent),
      radial-gradient(1px 1px at 50px 160px, rgba(255,255,255,0.6), transparent),
      radial-gradient(1px 1px at 90px 40px, white, transparent),
      radial-gradient(1px 1px at 130px 80px, rgba(255,255,255,0.7), transparent),
      radial-gradient(1px 1px at 160px 120px, white, transparent),
      radial-gradient(1px 1px at 200px 50px, rgba(255,255,255,0.5), transparent),
      radial-gradient(1px 1px at 250px 180px, white, transparent),
      radial-gradient(1px 1px at 300px 90px, rgba(255,255,255,0.8), transparent),
      radial-gradient(1px 1px at 350px 140px, white, transparent),
      radial-gradient(1px 1px at 400px 60px, rgba(255,255,255,0.6), transparent),
      radial-gradient(1px 1px at 450px 200px, white, transparent),
      radial-gradient(1px 1px at 500px 100px, rgba(255,255,255,0.7), transparent),
      radial-gradient(1px 1px at 550px 150px, white, transparent),
      radial-gradient(1px 1px at 600px 80px, rgba(255,255,255,0.5), transparent),
      radial-gradient(1px 1px at 650px 170px, white, transparent),
      radial-gradient(1px 1px at 700px 50px, rgba(255,255,255,0.8), transparent),
      radial-gradient(1px 1px at 750px 130px, white, transparent),
      radial-gradient(1px 1px at 800px 90px, rgba(255,255,255,0.6), transparent),
      radial-gradient(1px 1px at 850px 160px, white, transparent)
    `,
    backgroundRepeat: 'repeat',
    backgroundSize: '200px 200px',
    opacity: 0.8,
  },
  nebula1: {
    position: 'absolute',
    width: '300px',
    height: '300px',
    top: '10%',
    left: '10%',
    background: 'radial-gradient(ellipse, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
    borderRadius: '50%',
    filter: 'blur(40px)',
  },
  nebula2: {
    position: 'absolute',
    width: '250px',
    height: '250px',
    bottom: '15%',
    right: '15%',
    background: 'radial-gradient(ellipse, rgba(139, 92, 246, 0.12) 0%, transparent 70%)',
    borderRadius: '50%',
    filter: 'blur(40px)',
  },
  connectionsSvg: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
  },
  region: {
    position: 'absolute',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.25rem',
    cursor: 'pointer',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    borderRadius: 'var(--radius-lg)',
    padding: '0.5rem',
  },
  regionIcon: {
    width: '60px',
    height: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    border: '2px solid',
    background: 'var(--bg-card)',
  },
  regionName: {
    fontSize: '0.6875rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
    textAlign: 'center',
    textShadow: '0 2px 4px rgba(0,0,0,0.8)',
    whiteSpace: 'nowrap',
  },
  progressDots: {
    display: 'flex',
    gap: '3px',
  },
  dot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    transition: 'background 0.2s ease',
  },
  completeBadge: {
    position: 'absolute',
    top: '-4px',
    right: '-4px',
    width: '20px',
    height: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--accent-success)',
    borderRadius: '50%',
    fontSize: '0.625rem',
    fontWeight: 700,
    color: 'white',
  },
  character: {
    position: 'absolute',
    width: CHAR_SIZE,
    height: CHAR_SIZE,
    zIndex: 10,
    transition: 'transform 0.1s ease',
    pointerEvents: 'none',
  },
  characterBody: {
    fontSize: '1.75rem',
    lineHeight: 1,
    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
  },
  characterShadow: {
    position: 'absolute',
    bottom: '-4px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '20px',
    height: '6px',
    background: 'rgba(0,0,0,0.3)',
    borderRadius: '50%',
    filter: 'blur(2px)',
  },
  prompt: {
    position: 'absolute',
    bottom: '2rem',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1.25rem',
    background: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-lg)',
    fontSize: '0.875rem',
    color: 'var(--text-secondary)',
    boxShadow: 'var(--shadow-lg)',
    animation: 'slideUp 0.3s ease-out',
  },
  promptKbd: {
    padding: '0.25rem 0.5rem',
    fontSize: '0.75rem',
    fontFamily: 'var(--font-mono)',
    fontWeight: 600,
    color: 'var(--text-primary)',
    background: 'var(--bg-tertiary)',
    border: '1px solid var(--border-light)',
    borderRadius: '4px',
  },
  controls: {
    padding: '1rem',
    textAlign: 'center',
    fontSize: '0.8125rem',
    color: 'var(--text-muted)',
    background: 'var(--bg-secondary)',
    borderTop: '1px solid var(--border-color)',
  },
  controlKey: {
    padding: '0.125rem 0.375rem',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    background: 'var(--bg-card)',
    borderRadius: '4px',
    marginLeft: '0.25rem',
    marginRight: '0.25rem',
  },
  controlDivider: {
    margin: '0 0.75rem',
    color: 'var(--border-light)',
  },
};

export default WorldMap;
