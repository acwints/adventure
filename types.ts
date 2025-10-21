
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

export type AppStatus = 'idle' | 'loading' | 'error' | 'success';
export type AudioStatus = 'idle' | 'loading' | 'playing' | 'error';
export type View = 'learn' | 'quiz';