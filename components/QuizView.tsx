import React, { useState, useEffect } from 'react';
import type { QuizQuestion } from '../types';

interface QuizViewProps {
  quiz: QuizQuestion[];
  topic: string;
  onComplete: (score: number, total: number) => void;
  onRetreat: () => void;
}

const QuizView: React.FC<QuizViewProps> = ({ quiz, topic, onComplete, onRetreat }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<(string | null)[]>(Array(quiz.length).fill(null));
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [animateQuestion, setAnimateQuestion] = useState(true);

  const currentQuestion = quiz[currentQuestionIndex];
  const selectedAnswer = selectedAnswers[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.length) * 100;

  useEffect(() => {
    setAnimateQuestion(true);
  }, [currentQuestionIndex]);

  const handleAnswerSelect = (option: string) => {
    if (showFeedback) return;
    
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = option;
    setSelectedAnswers(newAnswers);

    const correct = option === currentQuestion.correctAnswer;
    setIsCorrect(correct);
    setShowFeedback(true);

    setTimeout(() => {
      setShowFeedback(false);
      setAnimateQuestion(false);
      
      setTimeout(() => {
        if (currentQuestionIndex < quiz.length - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
          const finalScore = newAnswers.reduce((score, answer, index) => {
            return answer === quiz[index].correctAnswer ? score + 1 : score;
          }, 0);
          onComplete(finalScore, quiz.length);
        }
      }, 100);
    }, 1500);
  };

  const getOptionStyle = (option: string): React.CSSProperties => {
    const isSelected = selectedAnswer === option;
    const isCorrectAnswer = option === currentQuestion.correctAnswer;

    if (showFeedback) {
      if (isCorrectAnswer) {
        return {
          background: 'rgba(16, 185, 129, 0.15)',
          border: '2px solid var(--accent-success)',
          color: 'var(--accent-success)',
          boxShadow: '0 0 20px rgba(16, 185, 129, 0.2)',
        };
      }
      if (isSelected && !isCorrectAnswer) {
        return {
          background: 'rgba(239, 68, 68, 0.15)',
          border: '2px solid var(--accent-danger)',
          color: 'var(--accent-danger)',
          boxShadow: '0 0 20px rgba(239, 68, 68, 0.2)',
        };
      }
    }

    if (isSelected) {
      return {
        background: 'rgba(99, 102, 241, 0.15)',
        border: '2px solid var(--accent-primary)',
        color: 'var(--accent-primary)',
      };
    }

    return {
      background: 'var(--bg-tertiary)',
      border: '2px solid var(--border-color)',
      color: 'var(--text-primary)',
    };
  };

  return (
    <div style={styles.container}>
      <div style={styles.inner}>
        {/* Header */}
        <div style={styles.header}>
          <button onClick={onRetreat} className="btn btn-secondary" style={styles.backBtn}>
            ← Return to Map
          </button>

          <div style={styles.progressSection}>
            <span style={styles.progressText}>
              {currentQuestionIndex + 1} / {quiz.length}
            </span>
            <div style={styles.progressTrack}>
              <div style={{ ...styles.progressFill, width: `${progress}%` }} />
            </div>
          </div>
        </div>

        {/* Banner */}
        <div style={styles.banner}>
          <span style={styles.bannerLabel}>🗝️ KNOWLEDGE GATE 🗝️</span>
          <h1 style={styles.topicTitle}>{topic}</h1>
        </div>

        {/* Question card */}
        <div 
          style={{
            ...styles.card,
            opacity: animateQuestion ? 1 : 0,
            transform: animateQuestion ? 'translateY(0)' : 'translateY(10px)',
          }}
        >
          {/* Question number */}
          <div style={styles.questionHeader}>
            <div style={styles.questionNumber}>
              {currentQuestionIndex + 1}
            </div>
            <div style={styles.questionLine} />
          </div>

          {/* Question text */}
          <h2 style={styles.questionText}>
            {currentQuestion.question}
          </h2>

          {/* Options */}
          <div style={styles.options}>
            {currentQuestion.options.map((option, index) => {
              const optionLetter = String.fromCharCode(65 + index);

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(option)}
                  disabled={showFeedback}
                  style={{
                    ...styles.optionBtn,
                    ...getOptionStyle(option),
                    cursor: showFeedback ? 'default' : 'pointer',
                  }}
                >
                  <span style={styles.optionLetter}>{optionLetter}</span>
                  <span style={styles.optionText}>{option}</span>
                </button>
              );
            })}
          </div>

          {/* Feedback */}
          {showFeedback && (
            <div 
              style={{
                ...styles.feedback,
                background: isCorrect 
                  ? 'rgba(16, 185, 129, 0.1)'
                  : 'rgba(239, 68, 68, 0.1)',
                borderColor: isCorrect ? 'var(--accent-success)' : 'var(--accent-danger)',
              }}
            >
              <p style={{ 
                ...styles.feedbackText,
                color: isCorrect ? 'var(--accent-success)' : 'var(--accent-danger)',
              }}>
                {isCorrect ? '✓ Correct!' : '✗ Incorrect'}
              </p>
              {!isCorrect && (
                <p style={styles.feedbackAnswer}>
                  The answer was: {currentQuestion.correctAnswer}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Progress dots */}
        <div style={styles.dots}>
          {quiz.map((_, i) => {
            const answered = i < currentQuestionIndex || (i === currentQuestionIndex && showFeedback);
            const correct = answered && selectedAnswers[i] === quiz[i].correctAnswer;
            
            return (
              <div
                key={i}
                style={{
                  ...styles.dot,
                  background: !answered 
                    ? 'var(--border-color)'
                    : correct 
                      ? 'var(--accent-success)'
                      : 'var(--accent-danger)',
                  boxShadow: answered 
                    ? `0 0 8px ${correct ? 'rgba(16, 185, 129, 0.5)' : 'rgba(239, 68, 68, 0.5)'}`
                    : 'none',
                }}
              />
            );
          })}
        </div>

        <p style={styles.hint}>Select an answer to continue</p>
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
    maxWidth: '700px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1.5rem',
  },
  backBtn: {
    padding: '0.5rem 1rem',
    fontSize: '0.875rem',
  },
  progressSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  progressText: {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: 'var(--text-muted)',
  },
  progressTrack: {
    width: '100px',
    height: '6px',
    background: 'var(--bg-primary)',
    borderRadius: '3px',
    border: '1px solid var(--border-color)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)',
    borderRadius: '3px',
    transition: 'width 0.3s ease',
  },
  banner: {
    textAlign: 'center',
    padding: '1rem 0',
    marginBottom: '1.5rem',
    width: '100%',
    maxWidth: '700px',
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
    fontSize: '1rem',
    fontWeight: 600,
    color: 'var(--accent-primary)',
  },
  card: {
    width: '100%',
    maxWidth: '700px',
    background: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-xl)',
    padding: '2rem',
    transition: 'all 0.3s ease',
  },
  questionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  questionNumber: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.25rem',
    fontWeight: 700,
    background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)',
    color: 'white',
    boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)',
    flexShrink: 0,
  },
  questionLine: {
    flex: 1,
    height: '2px',
    background: 'linear-gradient(90deg, var(--accent-primary) 0%, transparent 100%)',
  },
  questionText: {
    fontSize: '1.375rem',
    lineHeight: 1.5,
    color: 'var(--text-primary)',
    marginBottom: '2rem',
  },
  options: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  optionBtn: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '1rem',
    padding: '1rem',
    borderRadius: 'var(--radius-md)',
    textAlign: 'left',
    transition: 'all 0.15s ease',
    fontFamily: 'inherit',
    fontSize: '1rem',
  },
  optionLetter: {
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 'var(--radius-sm)',
    fontWeight: 600,
    fontSize: '0.875rem',
    flexShrink: 0,
  },
  optionText: {
    flex: 1,
    paddingTop: '4px',
  },
  feedback: {
    marginTop: '1.5rem',
    padding: '1rem',
    borderRadius: 'var(--radius-md)',
    border: '1px solid',
    textAlign: 'center',
    animation: 'fadeIn 0.3s ease',
  },
  feedbackText: {
    fontWeight: 600,
    fontSize: '1rem',
  },
  feedbackAnswer: {
    marginTop: '0.5rem',
    fontSize: '0.875rem',
    color: 'var(--text-muted)',
  },
  dots: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginTop: '1.5rem',
  },
  dot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    transition: 'all 0.3s ease',
  },
  hint: {
    marginTop: '1rem',
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
  },
};

export default QuizView;
