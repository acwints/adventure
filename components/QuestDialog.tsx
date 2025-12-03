import React, { useState, useEffect, useCallback } from 'react';
import type { MapRegion, GamePlayer } from '../types';
import { hasCompletedTopic } from '../services/gameService';

interface QuestDialogProps {
  region: MapRegion;
  player: GamePlayer;
  onStartQuest: (topic: string) => void;
  onClose: () => void;
}

const QuestDialog: React.FC<QuestDialogProps> = ({ region, player, onStartQuest, onClose }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  const fullText = region.description;

  useEffect(() => {
    setDisplayedText('');
    setIsTyping(true);
    let index = 0;

    const typeInterval = setInterval(() => {
      if (index < fullText.length) {
        setDisplayedText(fullText.slice(0, index + 1));
        index++;
      } else {
        setIsTyping(false);
        clearInterval(typeInterval);
      }
    }, 30);

    return () => clearInterval(typeInterval);
  }, [fullText]);

  const handleSkipTyping = useCallback(() => {
    if (isTyping) {
      setDisplayedText(fullText);
      setIsTyping(false);
    }
  }, [isTyping, fullText]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'Enter' || e.key === ' ') {
        if (isTyping) {
          handleSkipTyping();
        } else if (selectedTopic) {
          onStartQuest(selectedTopic);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTyping, selectedTopic, handleSkipTyping, onClose, onStartQuest]);

  return (
    <div style={styles.overlay} onClick={handleSkipTyping}>
      {/* Close button */}
      <button
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        style={styles.closeBtn}
      >
        ×
      </button>

      {/* Region icon */}
      <div style={styles.iconWrapper}>
        <div 
          style={{
            ...styles.icon,
            borderColor: region.color,
            boxShadow: `0 0 30px ${region.color}50`,
          }}
        >
          <span style={{ fontSize: '2.5rem' }}>{region.icon}</span>
        </div>
      </div>

      {/* Dialog box */}
      <div style={styles.dialog} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <h2 style={{ ...styles.title, color: region.color }}>
            {region.name}
          </h2>
        </div>

        {/* Description */}
        <div style={styles.description}>
          <p style={styles.descriptionText}>
            {displayedText}
            {isTyping && <span style={{ ...styles.cursor, background: region.color }} />}
          </p>
        </div>

        {/* Topic selection */}
        {!isTyping && (
          <div style={styles.topicsSection}>
            <span style={styles.topicsLabel}>SELECT YOUR QUEST:</span>
            <div style={styles.topicsGrid}>
              {region.topics.map((topic) => {
                const completed = hasCompletedTopic(player, topic);
                const isSelected = selectedTopic === topic;

                return (
                  <button
                    key={topic}
                    onClick={() => setSelectedTopic(topic)}
                    style={{
                      ...styles.topicBtn,
                      background: isSelected 
                        ? `linear-gradient(135deg, ${region.color}20 0%, transparent 100%)`
                        : 'var(--bg-tertiary)',
                      borderColor: isSelected ? region.color : 'var(--border-color)',
                      transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                    }}
                  >
                    <span style={styles.topicIcon}>
                      {completed ? '✓' : '○'}
                    </span>
                    <div>
                      <span style={{
                        ...styles.topicName,
                        color: isSelected ? region.color : 'var(--text-primary)',
                      }}>
                        {topic}
                      </span>
                      {completed && (
                        <span style={styles.topicCompleted}>Previously explored</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Actions */}
        {!isTyping && (
          <div style={styles.actions}>
            <button onClick={onClose} className="btn btn-secondary">
              Close
            </button>
            <button
              onClick={() => selectedTopic && onStartQuest(selectedTopic)}
              disabled={!selectedTopic}
              className="btn btn-primary"
              style={{
                opacity: selectedTopic ? 1 : 0.5,
                cursor: selectedTopic ? 'pointer' : 'not-allowed',
              }}
            >
              Begin Quest
            </button>
          </div>
        )}

        {/* Hint */}
        <div style={styles.hint}>
          {isTyping ? 'Click to skip • ESC to close' : 'Press ENTER to confirm • ESC to close'}
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 50,
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    padding: '2rem 1rem',
    background: 'radial-gradient(ellipse at 50% 100%, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.95) 100%)',
  },
  closeBtn: {
    position: 'absolute',
    top: '1rem',
    right: '1rem',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    background: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  iconWrapper: {
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
    bottom: 'calc(100% - 280px)',
    animation: 'float 3s ease-in-out infinite',
  },
  icon: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg-card)',
    border: '3px solid',
  },
  dialog: {
    width: '100%',
    maxWidth: '600px',
    background: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-xl)',
    animation: 'slideUp 0.3s ease',
  },
  header: {
    padding: '1rem 1.5rem',
    borderBottom: '1px solid var(--border-color)',
    textAlign: 'center',
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: 700,
  },
  description: {
    padding: '1.5rem',
    minHeight: '80px',
  },
  descriptionText: {
    fontSize: '1.0625rem',
    lineHeight: 1.7,
    color: 'var(--text-primary)',
  },
  cursor: {
    display: 'inline-block',
    width: '2px',
    height: '1.2em',
    marginLeft: '2px',
    verticalAlign: 'text-bottom',
    animation: 'blink 0.7s infinite',
  },
  topicsSection: {
    padding: '0 1.5rem 1rem',
    animation: 'fadeIn 0.3s ease',
  },
  topicsLabel: {
    display: 'block',
    fontSize: '0.6875rem',
    fontWeight: 600,
    letterSpacing: '0.1em',
    color: 'var(--text-muted)',
    marginBottom: '0.75rem',
  },
  topicsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '0.75rem',
  },
  topicBtn: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
    padding: '1rem',
    borderRadius: 'var(--radius-md)',
    border: '2px solid',
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    fontFamily: 'inherit',
  },
  topicIcon: {
    fontSize: '1.125rem',
    opacity: 0.7,
  },
  topicName: {
    display: 'block',
    fontWeight: 500,
  },
  topicCompleted: {
    display: 'block',
    fontSize: '0.75rem',
    color: 'var(--accent-success)',
    marginTop: '0.25rem',
  },
  actions: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '1rem 1.5rem',
    borderTop: '1px solid var(--border-color)',
    animation: 'fadeIn 0.3s ease',
  },
  hint: {
    padding: '0.5rem 1.5rem 1rem',
    textAlign: 'center',
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
  },
};

export default QuestDialog;
