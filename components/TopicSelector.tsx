
import React, { useState } from 'react';
import { PREDEFINED_TOPICS } from '../constants';
import { MagicWandIcon } from './Icons';

interface TopicSelectorProps {
  onTopicSelect: (topic: string) => void;
  isLoading: boolean;
}

const TopicSelector: React.FC<TopicSelectorProps> = ({ onTopicSelect, isLoading }) => {
  const [customTopic, setCustomTopic] = useState('');

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customTopic.trim() && !isLoading) {
      onTopicSelect(customTopic.trim());
    }
  };

  const handleRandomize = () => {
    if (!isLoading) {
      const randomTopic = PREDEFINED_TOPICS[Math.floor(Math.random() * PREDEFINED_TOPICS.length)];
      setCustomTopic(randomTopic);
      onTopicSelect(randomTopic);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-slate-800/50 backdrop-blur-sm p-6 rounded-xl shadow-2xl border border-slate-700">
      <h2 className="text-2xl font-bold text-cyan-400 mb-4 text-center">Start Your Adventure!</h2>
      <p className="text-center text-slate-300 mb-6">What wonders will you explore today?</p>
      
      <form onSubmit={handleCustomSubmit} className="flex flex-col sm:flex-row gap-2 mb-4">
        <input
          type="text"
          value={customTopic}
          onChange={(e) => setCustomTopic(e.target.value)}
          placeholder="e.g., 'The Mysteries of the Deep Sea'"
          className="flex-grow bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition duration-300"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !customTopic.trim()}
          className="bg-cyan-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-cyan-500 transition duration-300 disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          Explore
        </button>
      </form>

      <div className="flex items-center gap-4 my-6">
        <div className="flex-grow h-px bg-slate-700"></div>
        <span className="text-slate-400">OR</span>
        <div className="flex-grow h-px bg-slate-700"></div>
      </div>
      
      <div className="flex flex-wrap gap-3 justify-center">
        {PREDEFINED_TOPICS.slice(0, 4).map((topic) => (
          <button
            key={topic}
            onClick={() => { setCustomTopic(topic); onTopicSelect(topic); }}
            disabled={isLoading}
            className="bg-slate-700 text-slate-200 py-2 px-4 rounded-lg hover:bg-slate-600 transition duration-300 disabled:opacity-50"
          >
            {topic}
          </button>
        ))}
        <button
          onClick={handleRandomize}
          disabled={isLoading}
          className="bg-orange-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-orange-500 transition duration-300 disabled:opacity-50 flex items-center gap-2"
        >
          <MagicWandIcon className="w-5 h-5" />
          Randomize
        </button>
      </div>
    </div>
  );
};

export default TopicSelector;
