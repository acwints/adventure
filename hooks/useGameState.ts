import { useState, useCallback, useEffect } from 'react';
import type { GamePlayer, GameView, Lesson, QuizQuestion, MapRegion, CompletedAdventure } from '../types';
import { fakeSignIn, fakeSignOut, updatePlayerData, saveCompletedAdventure } from '../services/firebase';
import { applyXpToPlayer, createCompletedAdventure, calculateAdventureXp } from '../services/gameService';

interface GameState {
  // Auth state
  player: GamePlayer | null;
  isAuthenticated: boolean;
  authLoading: boolean;
  authError: string | null;
  
  // Game view state
  currentView: GameView;
  
  // Quest state
  activeRegion: MapRegion | null;
  activeTopic: string | null;
  activeLesson: Lesson | null;
  activeQuiz: QuizQuestion[] | null;
  quizScore: number;
  
  // Loading states
  isGeneratingContent: boolean;
  loadingMessage: string;
  contentError: string | null;
  
  // Victory state
  xpEarned: number;
  leveledUp: boolean;
  previousLevel: number;
}

const STORAGE_KEY = 'adventure_ai_session';

export function useGameState() {
  const [state, setState] = useState<GameState>({
    player: null,
    isAuthenticated: false,
    authLoading: true,
    authError: null,
    currentView: 'title',
    activeRegion: null,
    activeTopic: null,
    activeLesson: null,
    activeQuiz: null,
    quizScore: 0,
    isGeneratingContent: false,
    loadingMessage: '',
    contentError: null,
    xpEarned: 0,
    leveledUp: false,
    previousLevel: 1,
  });

  // Check for existing session on mount
  useEffect(() => {
    const savedSession = localStorage.getItem(STORAGE_KEY);
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession);
        if (session.player) {
          setState(prev => ({
            ...prev,
            player: session.player,
            isAuthenticated: true,
            authLoading: false,
            currentView: 'world_map',
          }));
          return;
        }
      } catch (e) {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setState(prev => ({ ...prev, authLoading: false }));
  }, []);

  // Save session when player changes
  useEffect(() => {
    if (state.player) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ player: state.player }));
    }
  }, [state.player]);

  // Auth actions
  const login = useCallback(async (email: string, password: string) => {
    setState(prev => ({ ...prev, authLoading: true, authError: null }));
    
    try {
      const player = await fakeSignIn(email, password);
      if (player) {
        setState(prev => ({
          ...prev,
          player,
          isAuthenticated: true,
          authLoading: false,
          currentView: 'world_map',
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        authLoading: false,
        authError: error instanceof Error ? error.message : 'Login failed',
      }));
    }
  }, []);

  const logout = useCallback(() => {
    fakeSignOut();
    localStorage.removeItem(STORAGE_KEY);
    setState(prev => ({
      ...prev,
      player: null,
      isAuthenticated: false,
      currentView: 'title',
      activeRegion: null,
      activeTopic: null,
      activeLesson: null,
      activeQuiz: null,
    }));
  }, []);

  // Navigation actions
  const setView = useCallback((view: GameView) => {
    setState(prev => ({ ...prev, currentView: view }));
  }, []);

  const startFromTitle = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentView: prev.isAuthenticated ? 'world_map' : 'login',
    }));
  }, []);

  // Quest actions
  const selectRegion = useCallback((region: MapRegion) => {
    setState(prev => ({
      ...prev,
      activeRegion: region,
      currentView: 'quest_intro',
    }));
  }, []);

  const startQuest = useCallback((topic: string) => {
    setState(prev => ({
      ...prev,
      activeTopic: topic,
      activeLesson: null,
      activeQuiz: null,
      isGeneratingContent: true,
      loadingMessage: `Summoning knowledge about ${topic}...`,
      contentError: null,
      currentView: 'adventure',
    }));
  }, []);

  const setLessonContent = useCallback((lesson: Lesson, quiz: QuizQuestion[]) => {
    setState(prev => ({
      ...prev,
      activeLesson: lesson,
      activeQuiz: quiz,
      isGeneratingContent: false,
      loadingMessage: '',
    }));
  }, []);

  const setContentError = useCallback((error: string) => {
    setState(prev => ({
      ...prev,
      isGeneratingContent: false,
      contentError: error,
    }));
  }, []);

  const setLoadingMessage = useCallback((message: string) => {
    setState(prev => ({ ...prev, loadingMessage: message }));
  }, []);

  const startTrial = useCallback(() => {
    setState(prev => ({ ...prev, currentView: 'trial', quizScore: 0 }));
  }, []);

  const completeTrial = useCallback(async (score: number, total: number) => {
    if (!state.player || !state.activeTopic || !state.activeLesson) return;

    const previousLevel = state.player.level;
    const adventure = createCompletedAdventure(
      state.activeTopic,
      state.activeLesson.title,
      score,
      total
    );
    
    const playerWithXp = applyXpToPlayer(state.player, adventure.xpEarned);
    const updatedPlayer = {
      ...playerWithXp,
      completedAdventures: [...playerWithXp.completedAdventures, adventure],
    };

    // Save to database
    try {
      await updatePlayerData(updatedPlayer);
    } catch (e) {
      console.error('Failed to save progress:', e);
    }

    setState(prev => ({
      ...prev,
      player: updatedPlayer,
      quizScore: score,
      xpEarned: adventure.xpEarned,
      leveledUp: updatedPlayer.level > previousLevel,
      previousLevel,
      currentView: 'victory',
    }));
  }, [state.player, state.activeTopic, state.activeLesson]);

  const returnToMap = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentView: 'world_map',
      activeRegion: null,
      activeTopic: null,
      activeLesson: null,
      activeQuiz: null,
      xpEarned: 0,
      leveledUp: false,
    }));
  }, []);

  const viewCollection = useCallback(() => {
    setState(prev => ({ ...prev, currentView: 'collection' }));
  }, []);

  return {
    state,
    actions: {
      login,
      logout,
      setView,
      startFromTitle,
      selectRegion,
      startQuest,
      setLessonContent,
      setContentError,
      setLoadingMessage,
      startTrial,
      completeTrial,
      returnToMap,
      viewCollection,
    },
  };
}

