import React, { useEffect, useCallback, useRef } from 'react';
import TitleScreen from './components/TitleScreen';
import LoginView from './components/LoginView';
import WorldMap from './components/WorldMap';
import QuestDialog from './components/QuestDialog';
import LessonView from './components/LessonView';
import QuizView from './components/QuizView';
import VictoryScreen from './components/VictoryScreen';
import AdventureCollection from './components/AdventureCollection';
import { LoadingSpinner } from './components/Icons';
import { useGameState } from './hooks/useGameState';
import { generateLesson, generateQuiz } from './services/geminiService';

const App: React.FC = () => {
  const { state, actions } = useGameState();
  
  // Track if we're currently fetching to prevent duplicate requests
  const isFetchingRef = useRef(false);
  const lastTopicRef = useRef<string | null>(null);

  // Generate lesson content when quest starts
  useEffect(() => {
    // Guard: only fetch if we have a topic and are in generating state
    if (!state.activeTopic || !state.isGeneratingContent) return;
    
    // Guard: don't fetch if we already have content
    if (state.activeLesson && state.activeQuiz) return;
    
    // Guard: don't fetch if already fetching or if we already fetched this topic
    if (isFetchingRef.current) return;
    if (lastTopicRef.current === state.activeTopic) return;

    const fetchContent = async () => {
      isFetchingRef.current = true;
      lastTopicRef.current = state.activeTopic;
      
      try {
        actions.setLoadingMessage(`Summoning knowledge about ${state.activeTopic}...`);
        const lessonData = await generateLesson(state.activeTopic!);
        
        actions.setLoadingMessage('Forging a trial from the knowledge...');
        const quizData = await generateQuiz(lessonData.content);

        actions.setLessonContent(lessonData, quizData);
      } catch (err) {
        console.error(err);
        let errorMessage = 'An unknown error occurred.';
        if (err instanceof Error) {
          if (err.message.includes('took too long')) {
            errorMessage = "The ancient scrolls are taking a while to appear. Please try again, brave adventurer!";
          } else {
            errorMessage = `Failed to generate adventure. ${err.message}`;
          }
        }
        actions.setContentError(errorMessage);
      } finally {
        isFetchingRef.current = false;
      }
    };

    fetchContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.activeTopic, state.isGeneratingContent]);

  // Reset the topic ref when returning to map (so user can retry same topic)
  useEffect(() => {
    if (state.currentView === 'world_map') {
      lastTopicRef.current = null;
    }
  }, [state.currentView]);

  // Handle login
  const handleLogin = useCallback(async (email: string, password: string) => {
    await actions.login(email, password);
  }, [actions]);

  // Render loading state
  if (state.authLoading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingContent}>
          <LoadingSpinner size={48} style={{ color: 'var(--accent-primary)', marginBottom: '1rem' }} />
          <p style={styles.loadingText}>Loading...</p>
        </div>
      </div>
    );
  }

  // Render based on current game view
  const renderGameView = () => {
    switch (state.currentView) {
      case 'title':
        return <TitleScreen onStart={actions.startFromTitle} />;

      case 'login':
        return (
          <LoginView
            onLogin={handleLogin}
            isLoading={state.authLoading}
            error={state.authError}
            onBack={() => actions.setView('title')}
          />
        );

      case 'world_map':
        if (!state.player) return null;
        return (
          <WorldMap
            player={state.player}
            onSelectRegion={actions.selectRegion}
            onViewCollection={actions.viewCollection}
            onLogout={actions.logout}
          />
        );

      case 'quest_intro':
        if (!state.player || !state.activeRegion) return null;
        return (
          <QuestDialog
            region={state.activeRegion}
            player={state.player}
            onStartQuest={actions.startQuest}
            onClose={actions.returnToMap}
          />
        );

      case 'adventure':
        if (!state.activeTopic) return null;

        // Show loading state while generating content
        if (state.isGeneratingContent || !state.activeLesson || !state.activeQuiz) {
          return (
            <div style={styles.adventureLoading}>
              <div style={styles.adventureLoadingContent}>
                {/* Animated icon */}
                <div style={styles.loadingIconWrapper}>
                  <span style={{ fontSize: '2rem' }}>📜</span>
                </div>

                {/* Spinner */}
                <LoadingSpinner size={32} style={{ color: 'var(--accent-tertiary)', marginBottom: '1rem' }} />
                
                {/* Message */}
                <p style={styles.loadingMessage}>
                  {state.loadingMessage || 'Preparing your adventure...'}
                </p>
                <p style={styles.loadingTopic}>{state.activeTopic}</p>

                {/* Error state */}
                {state.contentError && (
                  <div style={styles.errorContainer}>
                    <div style={styles.errorBox}>
                      <p style={styles.errorText}>{state.contentError}</p>
                    </div>
                    <button
                      onClick={actions.returnToMap}
                      className="btn btn-secondary"
                    >
                      Return to Map
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        }

        return (
          <LessonView
            lesson={state.activeLesson}
            topic={state.activeTopic}
            onStartTrial={actions.startTrial}
            onRetreat={actions.returnToMap}
          />
        );

      case 'trial':
        if (!state.activeTopic || !state.activeQuiz) return null;
        return (
          <QuizView
            quiz={state.activeQuiz}
            topic={state.activeTopic}
            onComplete={actions.completeTrial}
            onRetreat={actions.returnToMap}
          />
        );

      case 'victory':
        if (!state.player || !state.activeTopic || !state.activeLesson) return null;
        return (
          <VictoryScreen
            player={state.player}
            topic={state.activeTopic}
            lessonTitle={state.activeLesson.title}
            quizScore={state.quizScore}
            quizTotal={state.activeQuiz?.length || 0}
            xpEarned={state.xpEarned}
            leveledUp={state.leveledUp}
            previousLevel={state.previousLevel}
            onContinue={actions.returnToMap}
          />
        );

      case 'collection':
        if (!state.player) return null;
        return (
          <AdventureCollection
            player={state.player}
            onBack={actions.returnToMap}
          />
        );

      default:
        return <TitleScreen onStart={actions.startFromTitle} />;
    }
  };

  return (
    <div style={styles.app}>
      {renderGameView()}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  app: {
    minHeight: '100vh',
    overflow: 'hidden',
    background: 'var(--bg-primary)',
  },
  loadingContainer: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg-primary)',
  },
  loadingContent: {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: '0.875rem',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
  },
  adventureLoading: {
    position: 'fixed',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: `
      radial-gradient(ellipse at 50% 50%, rgba(99, 102, 241, 0.1) 0%, transparent 50%),
      var(--bg-primary)
    `,
  },
  adventureLoadingContent: {
    textAlign: 'center',
    maxWidth: '400px',
    padding: '0 1rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  loadingIconWrapper: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1.5rem',
    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(99, 102, 241, 0.05) 100%)',
    border: '2px solid var(--accent-primary)',
    animation: 'pulse 2s ease-in-out infinite',
  },
  loadingMessage: {
    fontSize: '1.125rem',
    color: 'var(--text-primary)',
    marginBottom: '0.5rem',
  },
  loadingTopic: {
    fontSize: '0.875rem',
    color: 'var(--text-muted)',
  },
  errorContainer: {
    marginTop: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
  },
  errorBox: {
    padding: '1rem',
    borderRadius: 'var(--radius-md)',
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
  },
  errorText: {
    color: 'var(--accent-danger)',
    fontSize: '0.875rem',
  },
};

export default App;
