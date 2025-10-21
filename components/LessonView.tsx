
import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Lesson } from '../types';
import type { AudioStatus } from '../types';
import { generateSpeech } from '../services/geminiService';
import { PlayIcon, StopIcon, LoadingSpinner } from './Icons';

interface LessonViewProps {
  lesson: Lesson;
  onSelectTopic: (topic: string) => void;
}

const LessonView: React.FC<LessonViewProps> = ({ lesson, onSelectTopic }) => {
  const [audioStatus, setAudioStatus] = useState<AudioStatus>('idle');
  const audioContextRef = useRef<AudioContext | null>(null);
  const activeSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const isCancelledRef = useRef<boolean>(false);

  // Stop all playing/scheduled audio and cancel any pending generation
  const stopAudio = useCallback(() => {
    isCancelledRef.current = true;
    activeSourcesRef.current.forEach(source => {
      try {
        source.stop();
      } catch (e) {
        // Ignore errors if the source was already stopped
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
  
  // Cleanup audio on component unmount or when the lesson changes
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

      // Split content into sentences for streaming
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
          // If it's the last source, reset status
          if (activeSourcesRef.current.size === 0 && !isCancelledRef.current) {
            setAudioStatus('idle');
          }
        };

        source.start(nextStartTime);
        activeSourcesRef.current.add(source);
        nextStartTime += buffer.duration;
      }

      // If cancelled during generation, the status might still be loading
      if(isCancelledRef.current) {
        setAudioStatus('idle');
      }

    } catch (error) {
      console.error("Error generating or playing speech:", error);
      setAudioStatus('error');
    }
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-xl shadow-2xl border border-slate-700 animate-fade-in">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-3xl font-bold text-cyan-400">{lesson.title}</h2>
        <button
          onClick={handlePlayAudio}
          className="flex items-center gap-2 bg-slate-700 px-4 py-2 rounded-lg hover:bg-slate-600 transition-colors duration-300 disabled:opacity-50"
          aria-label={audioStatus === 'playing' ? 'Stop audio' : 'Listen to lesson'}
        >
          {audioStatus === 'loading' && <LoadingSpinner className="w-5 h-5" />}
          {audioStatus === 'playing' && <StopIcon className="w-5 h-5 text-red-400" />}
          {audioStatus !== 'playing' && audioStatus !== 'loading' && <PlayIcon className="w-5 h-5 text-green-400" />}
          <span>{audioStatus === 'playing' || audioStatus === 'loading' ? 'Stop' : 'Listen'}</span>
        </button>
      </div>
      
      <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed whitespace-pre-wrap">
        {lesson.content}
      </div>

      <div className="mt-8 pt-6 border-t border-slate-700">
        <h3 className="text-xl font-semibold text-orange-400 mb-4">Continue Your Adventure...</h3>
        <div className="flex flex-wrap gap-3">
          {lesson.relatedTopics.map((topic) => (
            <button
              key={topic}
              onClick={() => onSelectTopic(topic)}
              className="bg-slate-700 text-slate-200 py-2 px-4 rounded-lg hover:bg-orange-600 transition duration-300"
            >
              {topic}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LessonView;
