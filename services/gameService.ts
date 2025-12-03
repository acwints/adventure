import type { GamePlayer, CompletedAdventure } from '../types';

// XP rewards
export const XP_REWARDS = {
  ADVENTURE_COMPLETE: 50,
  QUIZ_CORRECT_ANSWER: 10,
  PERFECT_QUIZ_BONUS: 25,
};

// Calculate XP needed for a given level
export function xpForLevel(level: number): number {
  return level * 100;
}

// Calculate total XP needed to reach a level from level 1
export function totalXpForLevel(level: number): number {
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += xpForLevel(i);
  }
  return total;
}

// Calculate level from total XP
export function calculateLevel(totalXp: number): number {
  let level = 1;
  let xpRemaining = totalXp;
  
  while (xpRemaining >= xpForLevel(level)) {
    xpRemaining -= xpForLevel(level);
    level++;
  }
  
  return level;
}

// Calculate XP progress within current level (0-1)
export function xpProgress(totalXp: number): number {
  const level = calculateLevel(totalXp);
  const xpAtLevelStart = totalXpForLevel(level);
  const xpInCurrentLevel = totalXp - xpAtLevelStart;
  const xpNeededForNextLevel = xpForLevel(level);
  
  return xpInCurrentLevel / xpNeededForNextLevel;
}

// Calculate current XP within level
export function currentLevelXp(totalXp: number): number {
  const level = calculateLevel(totalXp);
  const xpAtLevelStart = totalXpForLevel(level);
  return totalXp - xpAtLevelStart;
}

// Calculate XP needed to next level
export function xpToNextLevel(totalXp: number): number {
  const level = calculateLevel(totalXp);
  return xpForLevel(level);
}

// Calculate XP earned from quiz
export function calculateQuizXp(correctAnswers: number, totalQuestions: number): number {
  const baseXp = correctAnswers * XP_REWARDS.QUIZ_CORRECT_ANSWER;
  const perfectBonus = correctAnswers === totalQuestions ? XP_REWARDS.PERFECT_QUIZ_BONUS : 0;
  return baseXp + perfectBonus;
}

// Calculate total XP for completing an adventure
export function calculateAdventureXp(quizCorrect: number, quizTotal: number): number {
  return XP_REWARDS.ADVENTURE_COMPLETE + calculateQuizXp(quizCorrect, quizTotal);
}

// Apply XP to player and return updated player
export function applyXpToPlayer(player: GamePlayer, xpGained: number): GamePlayer {
  const newTotalXp = player.totalXp + xpGained;
  const newLevel = calculateLevel(newTotalXp);
  const newXp = currentLevelXp(newTotalXp);
  
  return {
    ...player,
    level: newLevel,
    xp: newXp,
    totalXp: newTotalXp,
  };
}

// Generate unique adventure ID
export function generateAdventureId(topic: string): string {
  const timestamp = Date.now();
  const sanitizedTopic = topic.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 30);
  return `adv_${sanitizedTopic}_${timestamp}`;
}

// Create completed adventure record
export function createCompletedAdventure(
  topic: string,
  title: string,
  quizScore: number,
  quizTotal: number
): CompletedAdventure {
  const xpEarned = calculateAdventureXp(quizScore, quizTotal);
  
  return {
    id: generateAdventureId(topic),
    topic,
    title,
    completedAt: Date.now(),
    quizScore,
    quizTotal,
    xpEarned,
  };
}

// Check if player has completed a topic
export function hasCompletedTopic(player: GamePlayer, topic: string): boolean {
  return player.completedAdventures.some(
    adv => adv.topic.toLowerCase() === topic.toLowerCase()
  );
}

// Get best score for a topic
export function getBestScoreForTopic(player: GamePlayer, topic: string): CompletedAdventure | null {
  const topicAdventures = player.completedAdventures.filter(
    adv => adv.topic.toLowerCase() === topic.toLowerCase()
  );
  
  if (topicAdventures.length === 0) return null;
  
  return topicAdventures.reduce((best, current) => 
    current.quizScore > best.quizScore ? current : best
  );
}

// Format XP display
export function formatXp(xp: number): string {
  if (xp >= 1000) {
    return `${(xp / 1000).toFixed(1)}k`;
  }
  return xp.toString();
}

// Get player rank based on level
export function getPlayerRank(level: number): string {
  if (level >= 50) return 'Legendary Scholar';
  if (level >= 40) return 'Master Explorer';
  if (level >= 30) return 'Grand Adventurer';
  if (level >= 20) return 'Seasoned Traveler';
  if (level >= 15) return 'Skilled Seeker';
  if (level >= 10) return 'Proven Pathfinder';
  if (level >= 5) return 'Eager Apprentice';
  return 'Novice Adventurer';
}

