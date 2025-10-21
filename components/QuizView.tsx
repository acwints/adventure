
import React, { useState } from 'react';
import type { QuizQuestion } from '../types';

interface QuizViewProps {
  quiz: QuizQuestion[];
  topic: string;
  onRestart: () => void;
}

const QuizView: React.FC<QuizViewProps> = ({ quiz, topic, onRestart }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<(string | null)[]>(Array(quiz.length).fill(null));
  const [showResults, setShowResults] = useState(false);

  const handleAnswerSelect = (option: string) => {
    if (showResults) return;
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = option;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestionIndex < quiz.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setShowResults(true);
    }
  };
  
  const getScore = () => {
    return selectedAnswers.reduce((score, answer, index) => {
      return answer === quiz[index].correctAnswer ? score + 1 : score;
    }, 0);
  };

  if (showResults) {
    const score = getScore();
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-xl shadow-2xl border border-slate-700 text-center animate-fade-in">
        <h2 className="text-3xl font-bold text-cyan-400 mb-4">Quiz Results!</h2>
        <p className="text-xl text-slate-300 mb-6">You scored <span className="font-bold text-orange-400">{score}</span> out of <span className="font-bold text-orange-400">{quiz.length}</span>.</p>
        <div className="space-y-4 text-left my-8">
            {quiz.map((q, index) => (
                <div key={index} className="p-4 rounded-lg bg-slate-900 border border-slate-700">
                    <p className="font-semibold text-slate-200">{index + 1}. {q.question}</p>
                    <p className={`mt-2 ${selectedAnswers[index] === q.correctAnswer ? 'text-green-400' : 'text-red-400'}`}>
                        Your answer: {selectedAnswers[index] ?? "Not answered"}
                    </p>
                    {selectedAnswers[index] !== q.correctAnswer && (
                       <p className="text-green-500">Correct answer: {q.correctAnswer}</p>
                    )}
                </div>
            ))}
        </div>
        <button
          onClick={onRestart}
          className="bg-cyan-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-cyan-500 transition duration-300"
        >
          Try Another Topic
        </button>
      </div>
    );
  }

  const currentQuestion = quiz[currentQuestionIndex];
  const selectedAnswer = selectedAnswers[currentQuestionIndex];

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-xl shadow-2xl border border-slate-700 animate-fade-in">
      <h2 className="text-2xl font-bold text-cyan-400 mb-2">Knowledge Check: {topic}</h2>
      <p className="text-slate-400 mb-6">Question {currentQuestionIndex + 1} of {quiz.length}</p>

      <div className="mb-8">
        <p className="text-xl text-slate-200">{currentQuestion.question}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {currentQuestion.options.map((option, index) => {
          const isSelected = selectedAnswer === option;
          return (
            <button
              key={index}
              onClick={() => handleAnswerSelect(option)}
              className={`p-4 rounded-lg text-left transition duration-300 border-2 ${
                isSelected 
                  ? 'bg-cyan-500/20 border-cyan-500 text-white' 
                  : 'bg-slate-700/50 border-slate-600 hover:bg-slate-700 hover:border-slate-500 text-slate-300'
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>

      <div className="text-right">
        <button
          onClick={handleNext}
          disabled={!selectedAnswer}
          className="bg-orange-600 text-white font-bold py-2 px-8 rounded-lg hover:bg-orange-500 transition duration-300 disabled:bg-slate-600 disabled:cursor-not-allowed"
        >
          {currentQuestionIndex < quiz.length - 1 ? 'Next' : 'Finish'}
        </button>
      </div>
    </div>
  );
};

export default QuizView;
