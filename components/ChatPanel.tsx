import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage, GamePlayer } from '../types';
import { askQuestion } from '../services/geminiService';
import { CHAT_WELCOME_MESSAGE } from '../constants';
import { LoadingSpinner } from './Icons';

interface ChatPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  player: GamePlayer | null;
  currentTopic?: string | null;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ isOpen, onToggle, player, currentTopic }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      content: CHAT_WELCOME_MESSAGE,
      sender: 'assistant',
      timestamp: Date.now(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      content: inputValue.trim(),
      sender: 'user',
      timestamp: Date.now(),
    };

    const loadingMessage: ChatMessage = {
      id: `loading-${Date.now()}`,
      content: '',
      sender: 'assistant',
      timestamp: Date.now(),
      isLoading: true,
    };

    setMessages(prev => [...prev, userMessage, loadingMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const recentTopics = player?.completedAdventures
        .slice(-5)
        .map(a => a.topic) || [];

      const response = await askQuestion(userMessage.content, {
        currentTopic: currentTopic || undefined,
        recentTopics,
      });

      setMessages(prev => {
        const filtered = prev.filter(m => !m.isLoading);
        return [
          ...filtered,
          {
            id: `assistant-${Date.now()}`,
            content: response,
            sender: 'assistant',
            timestamp: Date.now(),
          },
        ];
      });
    } catch (error) {
      setMessages(prev => {
        const filtered = prev.filter(m => !m.isLoading);
        return [
          ...filtered,
          {
            id: `error-${Date.now()}`,
            content: 'Apologies, adventurer! The mystical connection was disrupted. Please try again.',
            sender: 'assistant',
            timestamp: Date.now(),
          },
        ];
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Toggle button when closed */}
      {!isOpen && (
        <button onClick={onToggle} style={styles.toggleButton} title="Open Chat">
          <span style={styles.toggleIcon}>💬</span>
        </button>
      )}

      {/* Chat panel */}
      <div style={{
        ...styles.panel,
        transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
      }}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerTitle}>
            <span style={styles.headerIcon}>🔮</span>
            <span>Guide Chat</span>
          </div>
          <button onClick={onToggle} style={styles.closeButton} title="Close">
            ✕
          </button>
        </div>

        {/* Messages */}
        <div style={styles.messagesContainer}>
          {messages.map((message) => (
            <div
              key={message.id}
              style={{
                ...styles.message,
                ...(message.sender === 'user' ? styles.userMessage : styles.assistantMessage),
              }}
            >
              {message.isLoading ? (
                <div style={styles.loadingContainer}>
                  <LoadingSpinner size={16} style={{ color: 'var(--accent-tertiary)' }} />
                  <span style={styles.loadingText}>Consulting the ancient scrolls...</span>
                </div>
              ) : (
                <>
                  <div style={styles.messageContent}>{message.content}</div>
                  <div style={styles.messageTime}>
                    {new Date(message.timestamp).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} style={styles.inputForm}>
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask me anything..."
            style={styles.input}
            disabled={isLoading}
          />
          <button
            type="submit"
            style={{
              ...styles.sendButton,
              opacity: isLoading || !inputValue.trim() ? 0.5 : 1,
            }}
            disabled={isLoading || !inputValue.trim()}
          >
            ⚡
          </button>
        </form>
      </div>
    </>
  );
};

const styles: Record<string, React.CSSProperties> = {
  toggleButton: {
    position: 'fixed',
    right: '1rem',
    bottom: '1rem',
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)',
    zIndex: 100,
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  },
  toggleIcon: {
    fontSize: '1.5rem',
  },
  panel: {
    position: 'fixed',
    top: 0,
    right: 0,
    width: '340px',
    height: '100vh',
    background: 'var(--bg-secondary)',
    borderLeft: '1px solid var(--border-color)',
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
  messagesContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  message: {
    maxWidth: '90%',
    padding: '0.75rem 1rem',
    borderRadius: 'var(--radius-md)',
    fontSize: '0.875rem',
    lineHeight: 1.5,
  },
  userMessage: {
    alignSelf: 'flex-end',
    background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)',
    color: 'white',
    borderBottomRightRadius: '4px',
  },
  assistantMessage: {
    alignSelf: 'flex-start',
    background: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-primary)',
    borderBottomLeftRadius: '4px',
  },
  messageContent: {
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
  messageTime: {
    fontSize: '0.6875rem',
    color: 'var(--text-muted)',
    marginTop: '0.375rem',
    opacity: 0.7,
  },
  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  loadingText: {
    fontSize: '0.8125rem',
    color: 'var(--text-muted)',
    fontStyle: 'italic',
  },
  inputForm: {
    display: 'flex',
    gap: '0.5rem',
    padding: '1rem',
    borderTop: '1px solid var(--border-color)',
    background: 'var(--bg-tertiary)',
  },
  input: {
    flex: 1,
    padding: '0.625rem 0.875rem',
    fontSize: '0.875rem',
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-primary)',
    outline: 'none',
    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
  },
  sendButton: {
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    fontSize: '1.125rem',
    transition: 'opacity 0.15s ease, transform 0.15s ease',
  },
};

export default ChatPanel;

