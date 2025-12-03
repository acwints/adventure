
export interface Lesson {
  title: string;
  content: string;
  relatedTopics: string[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface User {
  uid: string;
  displayName: string | null;
  photoURL: string | null;
}

// Game-specific types
export interface GamePlayer {
  uid: string;
  email: string;
  displayName: string;
  level: number;
  xp: number;
  totalXp: number;
  completedAdventures: CompletedAdventure[];
  createdAt: number;
}

export interface CompletedAdventure {
  id: string;
  topic: string;
  title: string;
  completedAt: number;
  quizScore: number;
  quizTotal: number;
  xpEarned: number;
}

export interface MapRegion {
  id: string;
  name: string;
  description: string;
  topics: string[];
  x: number;
  y: number;
  icon: string;
  color: string;
}

export interface QuestState {
  topic: string;
  region: MapRegion;
  status: 'intro' | 'adventure' | 'trial' | 'victory';
}

// Game view states
export type GameView = 
  | 'title'
  | 'login'
  | 'world_map'
  | 'collection'
  | 'quest_intro'
  | 'adventure'
  | 'trial'
  | 'victory';

export type AppStatus = 'idle' | 'loading' | 'error' | 'success';
export type AudioStatus = 'idle' | 'loading' | 'playing' | 'error';
export type View = 'learn' | 'quiz';
