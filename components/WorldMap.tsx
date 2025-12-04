import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { MapRegion, GamePlayer } from '../types';
import { MAP_REGIONS, RANDOM_PORTAL } from '../constants';
import { hasCompletedTopic, xpProgress, currentLevelXp, xpToNextLevel } from '../services/gameService';
import OnlinePlayers from './OnlinePlayers';

interface WorldMapProps {
  player: GamePlayer;
  onSelectRegion: (region: MapRegion) => void;
  onViewCollection: () => void;
  onLogout: () => void;
  onStartRandomQuest: () => void;
}

const CHAR_SIZE = 32;
const MOVE_SPEED = 4;
const INTERACTION_DISTANCE = 60;

// Region positions as percentages of map size
const REGION_POSITIONS: Record<string, { xPct: number; yPct: number; emoji: string; color: string }> = {
  'history_peaks': { xPct: 0.12, yPct: 0.18, emoji: '🏛️', color: '#f59e0b' },
  'nature_grove': { xPct: 0.85, yPct: 0.15, emoji: '🌿', color: '#10b981' },
  'cosmic_observatory': { xPct: 0.50, yPct: 0.10, emoji: '🔭', color: '#6366f1' },
  'tech_citadel': { xPct: 0.88, yPct: 0.55, emoji: '⚡', color: '#06b6d4' },
  'ancient_fossils': { xPct: 0.15, yPct: 0.60, emoji: '🦴', color: '#d97706' },
  'elemental_forge': { xPct: 0.50, yPct: 0.72, emoji: '🌋', color: '#ef4444' },
  'mystery_depths': { xPct: 0.32, yPct: 0.85, emoji: '🐙', color: '#8b5cf6' },
  'mind_sanctuary': { xPct: 0.78, yPct: 0.82, emoji: '🧠', color: '#ec4899' },
  'random_portal': { xPct: 0.50, yPct: 0.42, emoji: '🌀', color: '#a855f7' },
};

const WorldMap: React.FC<WorldMapProps> = ({ 
  player, 
  onSelectRegion, 
  onViewCollection, 
  onLogout,
  onStartRandomQuest,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapSize, setMapSize] = useState({ width: 0, height: 0 });
  const [charPos, setCharPos] = useState({ x: 0.5, y: 0.5 }); // Position as percentage
  const [charDirection, setCharDirection] = useState<'down' | 'up' | 'left' | 'right'>('down');
  const [isMoving, setIsMoving] = useState(false);
  const [nearbyRegion, setNearbyRegion] = useState<MapRegion | null>(null);
  const [nearRandomPortal, setNearRandomPortal] = useState(false);
  const keysPressed = useRef<Set<string>>(new Set());
  const animationFrame = useRef<number>();

  // Handle resize
  useEffect(() => {
    const updateSize = () => {
      if (mapContainerRef.current) {
        const rect = mapContainerRef.current.getBoundingClientRect();
        setMapSize({ width: rect.width, height: rect.height });
      }
    };

    updateSize();
    const resizeObserver = new ResizeObserver(updateSize);
    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  // Get actual pixel position from percentage
  const getPixelPos = useCallback((xPct: number, yPct: number) => ({
    x: xPct * mapSize.width,
    y: yPct * mapSize.height,
  }), [mapSize]);

  // Check proximity to regions
  const checkNearbyRegion = useCallback((xPct: number, yPct: number) => {
    const charPixel = getPixelPos(xPct, yPct);
    
    // Check random portal first
    const portalPos = REGION_POSITIONS['random_portal'];
    const portalPixel = getPixelPos(portalPos.xPct, portalPos.yPct);
    const portalDistance = Math.sqrt(
      Math.pow(charPixel.x - portalPixel.x, 2) + Math.pow(charPixel.y - portalPixel.y, 2)
    );
    
    if (portalDistance < INTERACTION_DISTANCE) {
      setNearRandomPortal(true);
      setNearbyRegion(null);
      return null;
    }
    setNearRandomPortal(false);

    // Check regular regions
    for (const region of MAP_REGIONS) {
      const pos = REGION_POSITIONS[region.id];
      if (!pos) continue;
      
      const regionPixel = getPixelPos(pos.xPct, pos.yPct);
      const distance = Math.sqrt(
        Math.pow(charPixel.x - regionPixel.x, 2) + Math.pow(charPixel.y - regionPixel.y, 2)
      );
      
      if (distance < INTERACTION_DISTANCE) {
        return region;
      }
    }
    return null;
  }, [getPixelPos]);

  // Game loop
  useEffect(() => {
    if (mapSize.width === 0) return;

    const gameLoop = () => {
      const keys = keysPressed.current;
      let dxPct = 0;
      let dyPct = 0;
      let moving = false;

      // Scale movement speed based on map size
      const moveSpeedX = MOVE_SPEED / mapSize.width;
      const moveSpeedY = MOVE_SPEED / mapSize.height;

      if (keys.has('ArrowUp') || keys.has('w') || keys.has('W')) {
        dyPct -= moveSpeedY;
        setCharDirection('up');
        moving = true;
      }
      if (keys.has('ArrowDown') || keys.has('s') || keys.has('S')) {
        dyPct += moveSpeedY;
        setCharDirection('down');
        moving = true;
      }
      if (keys.has('ArrowLeft') || keys.has('a') || keys.has('A')) {
        dxPct -= moveSpeedX;
        setCharDirection('left');
        moving = true;
      }
      if (keys.has('ArrowRight') || keys.has('d') || keys.has('D')) {
        dxPct += moveSpeedX;
        setCharDirection('right');
        moving = true;
      }

      setIsMoving(moving);

      if (dxPct !== 0 || dyPct !== 0) {
        setCharPos(prev => {
          const newX = Math.max(0.02, Math.min(0.98, prev.x + dxPct));
          const newY = Math.max(0.02, Math.min(0.98, prev.y + dyPct));
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
  }, [mapSize, checkNearbyRegion]);

  // Keyboard handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }
      keysPressed.current.add(e.key);
      
      if (e.key === ' ' || e.key === 'Enter') {
        if (nearRandomPortal) {
          onStartRandomQuest();
        } else if (nearbyRegion) {
          onSelectRegion(nearbyRegion);
        }
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
  }, [nearbyRegion, nearRandomPortal, onSelectRegion, onStartRandomQuest]);

  const getRegionCompletion = (region: MapRegion): number => {
    return region.topics.filter(topic => hasCompletedTopic(player, topic)).length;
  };

  const charPixelPos = getPixelPos(charPos.x, charPos.y);

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
          <div style={styles.xpLabel}>XP {currentLevelXp(player.totalXp)} / {xpToNextLevel(player.totalXp)}</div>
          <div style={styles.xpTrack}>
            <div 
              style={{ 
                ...styles.xpFill, 
                width: `${xpProgress(player.totalXp) * 100}%` 
              }} 
            />
          </div>
        </div>

        {/* Online players count */}
        <div style={styles.onlineCount}>
          <span style={styles.onlineDot} />
          <span>7 explorers online</span>
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

      {/* Map area - now fills available space */}
      <div style={styles.mapContainer} ref={mapContainerRef}>
        <div style={styles.map}>
          {/* Stars background */}
          <div style={styles.stars} />
          
          {/* Nebula effects */}
          <div style={styles.nebula1} />
          <div style={styles.nebula2} />
          <div style={styles.nebula3} />
          
          {/* Connection lines between regions */}
          {mapSize.width > 0 && (
            <svg style={styles.connectionsSvg}>
              {MAP_REGIONS.map((region, i) => {
                const next = MAP_REGIONS[(i + 1) % MAP_REGIONS.length];
                const pos1 = REGION_POSITIONS[region.id];
                const pos2 = REGION_POSITIONS[next.id];
                if (!pos1 || !pos2) return null;
                
                return (
                  <line
                    key={`line-${i}`}
                    x1={pos1.xPct * mapSize.width}
                    y1={pos1.yPct * mapSize.height}
                    x2={pos2.xPct * mapSize.width}
                    y2={pos2.yPct * mapSize.height}
                    stroke="rgba(99, 102, 241, 0.15)"
                    strokeWidth="2"
                    strokeDasharray="8 8"
                  />
                );
              })}
              {/* Lines to random portal */}
              {[0, 2, 4, 6].map((i) => {
                const region = MAP_REGIONS[i];
                const pos1 = REGION_POSITIONS[region.id];
                const portalPos = REGION_POSITIONS['random_portal'];
                if (!pos1 || !portalPos) return null;
                
                return (
                  <line
                    key={`portal-line-${i}`}
                    x1={pos1.xPct * mapSize.width}
                    y1={pos1.yPct * mapSize.height}
                    x2={portalPos.xPct * mapSize.width}
                    y2={portalPos.yPct * mapSize.height}
                    stroke="rgba(168, 85, 247, 0.1)"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                );
              })}
            </svg>
          )}

          {/* Random Portal */}
          {mapSize.width > 0 && (
            <div
              style={{
                ...styles.randomPortal,
                left: REGION_POSITIONS['random_portal'].xPct * mapSize.width - 40,
                top: REGION_POSITIONS['random_portal'].yPct * mapSize.height - 40,
                transform: nearRandomPortal ? 'scale(1.15)' : 'scale(1)',
              }}
              onClick={onStartRandomQuest}
            >
              <div style={styles.portalGlow} />
              <div style={styles.portalIcon}>
                <span style={{ fontSize: '2rem' }}>{RANDOM_PORTAL.emoji}</span>
              </div>
              <div style={styles.portalName}>{RANDOM_PORTAL.name}</div>
              <div style={styles.portalSubtext}>Random Adventure</div>
            </div>
          )}

          {/* Regions */}
          {mapSize.width > 0 && MAP_REGIONS.map((region) => {
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
                  left: pos.xPct * mapSize.width - 30,
                  top: pos.yPct * mapSize.height - 30,
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

          {/* Online Players */}
          {mapSize.width > 0 && (
            <OnlinePlayers mapWidth={mapSize.width} mapHeight={mapSize.height} />
          )}

          {/* Player character */}
          {mapSize.width > 0 && (
            <div
              style={{
                ...styles.character,
                left: charPixelPos.x - CHAR_SIZE / 2,
                top: charPixelPos.y - CHAR_SIZE / 2,
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
              <div style={styles.youIndicator}>YOU</div>
            </div>
          )}
        </div>

        {/* Interaction prompt */}
        {(nearbyRegion || nearRandomPortal) && (
          <div style={styles.prompt}>
            <span>Press</span>
            <kbd style={styles.promptKbd}>SPACE</kbd>
            <span>to explore</span>
            <strong style={{ 
              color: nearRandomPortal 
                ? RANDOM_PORTAL.color 
                : REGION_POSITIONS[nearbyRegion?.id || '']?.color 
            }}>
              {nearRandomPortal ? RANDOM_PORTAL.name : nearbyRegion?.name}
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
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--bg-primary)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.75rem 1.25rem',
    background: 'var(--bg-secondary)',
    borderBottom: '1px solid var(--border-color)',
    zIndex: 20,
    flexShrink: 0,
  },
  playerInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  avatar: {
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg-tertiary)',
    borderRadius: '50%',
    border: '2px solid var(--accent-primary)',
    fontSize: '1.125rem',
  },
  playerName: {
    fontWeight: 600,
    color: 'var(--text-primary)',
    fontSize: '0.9375rem',
  },
  playerLevel: {
    fontSize: '0.6875rem',
    color: 'var(--text-muted)',
  },
  xpBar: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    minWidth: '180px',
  },
  xpLabel: {
    fontSize: '0.625rem',
    color: 'var(--text-muted)',
    textAlign: 'center',
  },
  xpTrack: {
    height: '5px',
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
  onlineCount: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.8125rem',
    color: 'var(--text-secondary)',
    padding: '0.375rem 0.75rem',
    background: 'var(--bg-tertiary)',
    borderRadius: 'var(--radius-md)',
  },
  onlineDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#10b981',
    boxShadow: '0 0 8px #10b98180',
  },
  headerActions: {
    display: 'flex',
    gap: '0.5rem',
  },
  headerBtn: {
    padding: '0.375rem 0.875rem',
    fontSize: '0.8125rem',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  map: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(180deg, #0c1222 0%, #1a1a2e 50%, #16213e 100%)',
    overflow: 'hidden',
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
    width: '40%',
    height: '40%',
    top: '5%',
    left: '5%',
    background: 'radial-gradient(ellipse, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
    borderRadius: '50%',
    filter: 'blur(60px)',
  },
  nebula2: {
    position: 'absolute',
    width: '35%',
    height: '35%',
    bottom: '10%',
    right: '10%',
    background: 'radial-gradient(ellipse, rgba(139, 92, 246, 0.12) 0%, transparent 70%)',
    borderRadius: '50%',
    filter: 'blur(60px)',
  },
  nebula3: {
    position: 'absolute',
    width: '30%',
    height: '30%',
    top: '40%',
    left: '40%',
    background: 'radial-gradient(ellipse, rgba(168, 85, 247, 0.1) 0%, transparent 70%)',
    borderRadius: '50%',
    filter: 'blur(50px)',
    animation: 'pulse 4s ease-in-out infinite',
  },
  connectionsSvg: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
  },
  randomPortal: {
    position: 'absolute',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.25rem',
    cursor: 'pointer',
    transition: 'transform 0.2s ease',
    zIndex: 8,
  },
  portalGlow: {
    position: 'absolute',
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(168, 85, 247, 0.3) 0%, transparent 70%)',
    animation: 'pulse 2s ease-in-out infinite',
    top: '-10px',
    left: '-10px',
  },
  portalIcon: {
    width: '80px',
    height: '80px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.3) 0%, rgba(139, 92, 246, 0.2) 100%)',
    borderRadius: '50%',
    border: '3px solid #a855f7',
    boxShadow: '0 0 30px rgba(168, 85, 247, 0.5), inset 0 0 20px rgba(168, 85, 247, 0.3)',
    animation: 'glow 2s ease-in-out infinite, spin 20s linear infinite',
  },
  portalName: {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#a855f7',
    textAlign: 'center',
    textShadow: '0 2px 4px rgba(0,0,0,0.8)',
    marginTop: '0.25rem',
  },
  portalSubtext: {
    fontSize: '0.625rem',
    color: 'var(--text-muted)',
    textAlign: 'center',
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
  youIndicator: {
    position: 'absolute',
    bottom: 'calc(100% + 4px)',
    left: '50%',
    transform: 'translateX(-50%)',
    fontSize: '0.5rem',
    fontWeight: 700,
    color: 'var(--accent-primary)',
    background: 'var(--bg-card)',
    padding: '1px 4px',
    borderRadius: '2px',
    border: '1px solid var(--accent-primary)',
  },
  prompt: {
    position: 'absolute',
    bottom: '1.5rem',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.625rem 1rem',
    background: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-lg)',
    fontSize: '0.8125rem',
    color: 'var(--text-secondary)',
    boxShadow: 'var(--shadow-lg)',
    animation: 'slideUp 0.3s ease-out',
    zIndex: 15,
  },
  promptKbd: {
    padding: '0.2rem 0.4rem',
    fontSize: '0.7rem',
    fontFamily: 'var(--font-mono)',
    fontWeight: 600,
    color: 'var(--text-primary)',
    background: 'var(--bg-tertiary)',
    border: '1px solid var(--border-light)',
    borderRadius: '4px',
  },
  controls: {
    padding: '0.75rem',
    textAlign: 'center',
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    background: 'var(--bg-secondary)',
    borderTop: '1px solid var(--border-color)',
    flexShrink: 0,
  },
  controlKey: {
    padding: '0.125rem 0.375rem',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.6875rem',
    color: 'var(--text-secondary)',
    background: 'var(--bg-card)',
    borderRadius: '4px',
    marginLeft: '0.25rem',
    marginRight: '0.25rem',
  },
  controlDivider: {
    margin: '0 0.5rem',
    color: 'var(--border-light)',
  },
};

export default WorldMap;
