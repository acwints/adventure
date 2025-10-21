import React, { useState, useCallback, useEffect } from 'react';
import TopicSelector from './components/TopicSelector';
import LessonView from './components/LessonView';
import QuizView from './components/QuizView';
import { CompassIcon, LoadingSpinner } from './components/Icons';
import { generateLesson, generateQuiz } from './services/geminiService';
import type { Lesson, QuizQuestion, AppStatus, View } from './types';

const App: React.FC = () => {
  const [topic, setTopic] = useState<string | null>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [quiz, setQuiz] = useState<QuizQuestion[] | null>(null);
  const [status, setStatus] = useState<AppStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<View>('learn');
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  
  const handleTopicSelect = useCallback((selectedTopic: string) => {
    setTopic(selectedTopic);
    setLesson(null);
    setQuiz(null);
    setCurrentView('learn');
    setStatus('loading');
    setError(null);
    setLoadingMessage('');
  }, []);

  useEffect(() => {
    if (!topic || status !== 'loading') return;

    const fetchContent = async () => {
      try {
        setLoadingMessage(`Summoning knowledge about ${topic}...`);
        const lessonData = await generateLesson(topic);
        
        setLoadingMessage('Forging a challenge from the lesson...');
        const quizData = await generateQuiz(lessonData.content);

        setLesson(lessonData);
        setQuiz(quizData);
        setStatus('success');
      } catch (err) {
        console.error(err);
        let errorMessage = 'An unknown error occurred.';
        if (err instanceof Error) {
            errorMessage = `Failed to generate adventure. ${err.message}`;
        }
        setError(errorMessage);
        setStatus('error');
      }
    };

    fetchContent();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topic, status]);

  const handleRestart = () => {
    setTopic(null);
    setLesson(null);
    setQuiz(null);
    setStatus('idle');
    setError(null);
    setLoadingMessage('');
  };
  
  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="text-center p-8 bg-slate-800/50 rounded-xl">
            <LoadingSpinner className="w-12 h-12 mx-auto text-cyan-400" />
            <p className="mt-4 text-xl">{loadingMessage || `Charting a course for ${topic}...`}</p>
          </div>
        );
      case 'error':
        return (
          <div className="text-center p-8 bg-red-900/50 border border-red-700 rounded-xl">
            <h2 className="text-2xl font-bold text-red-400">Adventure Halted!</h2>
            <p className="mt-2 text-red-300">{error}</p>
            <button
              onClick={handleRestart}
              className="mt-6 bg-cyan-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-cyan-500 transition duration-300"
            >
              Try Again
            </button>
          </div>
        );
      case 'success':
        if (lesson && quiz) {
            return (
              <div>
                <div className="flex justify-center mb-6 gap-2 p-1 bg-slate-900/50 rounded-lg border border-slate-700 w-min mx-auto">
                    <button onClick={() => setCurrentView('learn')} className={`px-6 py-2 rounded-md transition-colors text-sm font-semibold ${currentView === 'learn' ? 'bg-cyan-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}>Learn</button>
                    <button onClick={() => setCurrentView('quiz')} className={`px-6 py-2 rounded-md transition-colors text-sm font-semibold ${currentView === 'quiz' ? 'bg-cyan-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}>Quiz</button>
                </div>

                {currentView === 'learn' && <LessonView lesson={lesson} onSelectTopic={handleTopicSelect} />}
                {currentView === 'quiz' && topic && <QuizView quiz={quiz} topic={topic} onRestart={handleRestart} />}
              </div>
            );
        }
        return null;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 font-sans p-4 sm:p-8 flex flex-col items-center">
      <header className="w-full max-w-4xl text-center mb-8">
        <div className="flex items-center justify-center gap-4">
          <CompassIcon className="w-12 h-12 text-cyan-400"/>
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-orange-400 text-transparent bg-clip-text">
            Adventure AI
          </h1>
        </div>
        <p className="text-slate-400 mt-2">Your personal AI guide to the wonders of knowledge.</p>
      </header>
      
      <main className="w-full max-w-4xl">
        {/* FIX: The TopicSelector is only rendered when status is 'idle', so `isLoading` should be false.
            The comparison `status === 'loading'` would always be false here, causing a TypeScript error. */}
        {status === 'idle' ? <TopicSelector onTopicSelect={handleTopicSelect} isLoading={false} /> : renderContent()}
      </main>
    </div>
  );
};

export default App;