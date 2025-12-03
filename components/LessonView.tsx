import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Lesson } from '../types';
import type { AudioStatus } from '../types';
import { generateSpeech } from '../services/geminiService';
import { PlayIcon, StopIcon, LoadingSpinner } from './Icons';

interface LessonViewProps {
  lesson: Lesson;
  topic: string;
  onStartTrial: () => void;
  onRetreat: () => void;
}

const LessonView: React.FC<LessonViewProps> = ({ lesson, topic, onStartTrial, onRetreat }) => {
  const [audioStatus, setAudioStatus] = useState<AudioStatus>('idle');
  const [showContent, setShowContent] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const activeSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const isCancelledRef = useRef<boolean>(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const stopAudio = useCallback(() => {
    isCancelledRef.current = true;
    activeSourcesRef.current.forEach(source => {
      try {
        source.stop();
      } catch (e) {
        // Ignore errors if source was already stopped
      }
    });
    activeSourcesRef.current.clear();
    
    if (audioContextRef.current && audioContextRef.current.state === 'running') {
      audioContextRef.current.close().then(() => {
        audioContextRef.current = null;
      });
    }

    setAudioStatus('idle');
  }, []);
  
  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, [lesson, stopAudio]);

  const handlePlayAudio = async () => {
    if (audioStatus === 'playing' || audioStatus === 'loading') {
      stopAudio();
      return;
    }
    
    isCancelledRef.current = false;
    setAudioStatus('loading');

    try {
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = context;
      let nextStartTime = context.currentTime;

      const sentences = lesson.content.match(/[^.!?]+[.!?]+/g) || [lesson.content];
      let hasStartedPlaying = false;

      for (const sentence of sentences) {
        if (isCancelledRef.current) break;

        const buffer = await generateSpeech(sentence.trim());
        
        if (isCancelledRef.current) break;

        if (!hasStartedPlaying) {
          setAudioStatus('playing');
          hasStartedPlaying = true;
        }

        const source = context.createBufferSource();
        source.buffer = buffer;
        source.connect(context.destination);
        
        source.onended = () => {
          activeSourcesRef.current.delete(source);
          if (activeSourcesRef.current.size === 0 && !isCancelledRef.current) {
            setAudioStatus('idle');
          }
        };

        source.start(nextStartTime);
        activeSourcesRef.current.add(source);
        nextStartTime += buffer.duration;
      }

      if(isCancelledRef.current) {
        setAudioStatus('idle');
      }

    } catch (error) {
      console.error("Error generating or playing speech:", error);
      setAudioStatus('error');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.inner}>
        {/* Header */}
        <div style={styles.header}>
          <button onClick={onRetreat} className="btn btn-secondary" style={styles.backBtn}>
            ← Return to Map
          </button>
        </div>

        {/* Main content */}
        <div 
          style={{
            ...styles.content,
            opacity: showContent ? 1 : 0,
            transform: showContent ? 'translateY(0)' : 'translateY(20px)',
          }}
        >
          {/* Topic banner */}
          <div style={styles.banner}>
            <span style={styles.bannerLabel}>ADVENTURE LOG</span>
            <h1 style={styles.topicTitle}>{topic}</h1>
          </div>

          {/* Content card */}
          <div style={styles.card}>
            {/* Title with audio */}
            <div style={styles.cardHeader}>
              <div>
                <h2 style={styles.lessonTitle}>{lesson.title}</h2>
                <div style={styles.statusBadge}>
                  <span style={styles.statusDot} />
                  <span style={styles.statusText}>Knowledge discovered</span>
                </div>
              </div>
              
              <button
                onClick={handlePlayAudio}
                style={styles.audioBtn}
                aria-label={audioStatus === 'playing' ? 'Stop audio' : 'Listen to lesson'}
              >
                {audioStatus === 'loading' && <LoadingSpinner size={20} style={{ color: 'var(--accent-tertiary)' }} />}
                {audioStatus === 'playing' && <StopIcon size={20} style={{ color: 'var(--accent-danger)' }} />}
                {audioStatus !== 'playing' && audioStatus !== 'loading' && <PlayIcon size={20} style={{ color: 'var(--accent-success)' }} />}
                <span>{audioStatus === 'playing' || audioStatus === 'loading' ? 'Stop' : 'Listen'}</span>
              </button>
            </div>

            {/* Lesson content */}
            <div style={styles.lessonContent}>
              {lesson.content}
            </div>

            {/* Divider */}
            <div style={styles.divider}>
              <div style={styles.dividerLine} />
              <div style={styles.dividerDot} />
              <div style={styles.dividerLine} />
            </div>

            {/* Related topics */}
            {lesson.relatedTopics.length > 0 && (
              <div style={styles.relatedSection}>
                <span style={styles.relatedLabel}>PATHS AHEAD:</span>
                <div style={styles.relatedTags}>
                  {lesson.relatedTopics.map((relatedTopic) => (
                    <span key={relatedTopic} style={styles.relatedTag}>
                      {relatedTopic}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* CTA */}
            <div style={styles.ctaWrapper}>
              <button onClick={onStartTrial} className="btn btn-primary" style={styles.ctaBtn}>
                🗝️ Take the Quiz
              </button>
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
      radial-gradient(ellipse at 50% 0%, rgba(99, 102, 241, 0.1) 0%, transparent 50%),
      var(--bg-primary)
    `,
  },
  inner: {
    minHeight: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '2rem 1rem',
  },
  header: {
    width: '100%',
    maxWidth: '800px',
    marginBottom: '1.5rem',
  },
  backBtn: {
    padding: '0.5rem 1rem',
    fontSize: '0.875rem',
  },
  content: {
    width: '100%',
    maxWidth: '800px',
    transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
  },
  banner: {
    textAlign: 'center',
    padding: '1rem 0',
    marginBottom: '1.5rem',
    background: 'linear-gradient(90deg, transparent 0%, rgba(99, 102, 241, 0.15) 50%, transparent 100%)',
  },
  bannerLabel: {
    fontSize: '0.6875rem',
    fontWeight: 600,
    letterSpacing: '0.1em',
    color: 'var(--text-muted)',
    marginBottom: '0.5rem',
    display: 'block',
  },
  topicTitle: {
    fontSize: '1.25rem',
    fontWeight: 600,
    color: 'var(--accent-primary)',
  },
  card: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-xl)',
    padding: '2rem',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '1rem',
    marginBottom: '1.5rem',
    paddingBottom: '1.5rem',
    borderBottom: '1px solid var(--border-color)',
  },
  lessonTitle: {
    fontSize: '1.75rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
    marginBottom: '0.5rem',
  },
  statusBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: 'var(--accent-success)',
  },
  statusText: {
    fontSize: '0.875rem',
    color: 'var(--text-muted)',
  },
  audioBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    background: 'var(--bg-tertiary)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-primary)',
    fontSize: '0.875rem',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  lessonContent: {
    fontSize: '1.125rem',
    lineHeight: 1.8,
    color: 'var(--text-secondary)',
    whiteSpace: 'pre-wrap',
    marginBottom: '2rem',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    margin: '2rem 0',
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    background: 'var(--border-color)',
  },
  dividerDot: {
    width: '8px',
    height: '8px',
    transform: 'rotate(45deg)',
    background: 'var(--accent-primary)',
  },
  relatedSection: {
    marginBottom: '2rem',
  },
  relatedLabel: {
    fontSize: '0.6875rem',
    fontWeight: 600,
    letterSpacing: '0.1em',
    color: 'var(--text-muted)',
    marginBottom: '0.75rem',
    display: 'block',
  },
  relatedTags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  relatedTag: {
    padding: '0.375rem 0.75rem',
    fontSize: '0.875rem',
    background: 'rgba(99, 102, 241, 0.1)',
    border: '1px solid rgba(99, 102, 241, 0.3)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--accent-primary)',
  },
  ctaWrapper: {
    display: 'flex',
    justifyContent: 'center',
    paddingTop: '1rem',
  },
  ctaBtn: {
    padding: '1rem 2rem',
    fontSize: '1rem',
  },
};

export default LessonView;
