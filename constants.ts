import type { MapRegion } from './types';

export const PREDEFINED_TOPICS = [
  'The Roman Empire',
  'Photosynthesis',
  'The Solar System',
  'Black Holes',
  'The Great Wall of China',
  'Artificial Intelligence',
  'Dinosaurs',
  'Volcanoes',
];

// Map regions for the world map
export const MAP_REGIONS: MapRegion[] = [
  {
    id: 'history_peaks',
    name: 'History Peaks',
    description: 'Ancient civilizations and legendary empires await in these misty mountains.',
    topics: ['The Roman Empire', 'The Great Wall of China', 'Ancient Egypt', 'The Vikings'],
    x: 15,
    y: 25,
    icon: '🏛️',
    color: '#C9A227',
  },
  {
    id: 'nature_grove',
    name: 'Nature Grove',
    description: 'A verdant forest where the secrets of life and biology flourish.',
    topics: ['Photosynthesis', 'Rainforest Ecosystems', 'The Water Cycle', 'Animal Migration'],
    x: 70,
    y: 20,
    icon: '🌿',
    color: '#2D5A27',
  },
  {
    id: 'cosmic_observatory',
    name: 'Cosmic Observatory',
    description: 'Gaze into the infinite cosmos and unravel celestial mysteries.',
    topics: ['The Solar System', 'Black Holes', 'The Big Bang', 'Constellations'],
    x: 50,
    y: 10,
    icon: '🔭',
    color: '#1E3A5F',
  },
  {
    id: 'tech_citadel',
    name: 'Tech Citadel',
    description: 'A gleaming fortress of innovation where technology shapes the future.',
    topics: ['Artificial Intelligence', 'Quantum Computing', 'Robotics', 'The Internet'],
    x: 80,
    y: 55,
    icon: '⚡',
    color: '#00CED1',
  },
  {
    id: 'ancient_fossils',
    name: 'Fossil Badlands',
    description: 'Windswept canyons hold the bones of creatures from ages past.',
    topics: ['Dinosaurs', 'Ice Age Mammals', 'Evolution', 'Prehistoric Ocean Life'],
    x: 25,
    y: 60,
    icon: '🦴',
    color: '#8B4513',
  },
  {
    id: 'elemental_forge',
    name: 'Elemental Forge',
    description: 'Where Earth\'s raw power shapes mountains and ignites the sky.',
    topics: ['Volcanoes', 'Earthquakes', 'Weather Patterns', 'Plate Tectonics'],
    x: 55,
    y: 70,
    icon: '🌋',
    color: '#DC143C',
  },
  {
    id: 'mystery_depths',
    name: 'Mystery Depths',
    description: 'Descend into the unknown waters where strange wonders lurk.',
    topics: ['Deep Sea Creatures', 'Ocean Trenches', 'Bioluminescence', 'Coral Reefs'],
    x: 40,
    y: 85,
    icon: '🐙',
    color: '#4169E1',
  },
  {
    id: 'mind_sanctuary',
    name: 'Mind Sanctuary',
    description: 'A tranquil temple dedicated to understanding the human experience.',
    topics: ['The Human Brain', 'Psychology of Dreams', 'Memory', 'Emotions'],
    x: 85,
    y: 30,
    icon: '🧠',
    color: '#9932CC',
  },
];

// XP thresholds for levels
export const LEVEL_TITLES: Record<number, string> = {
  1: 'Novice Adventurer',
  5: 'Eager Apprentice',
  10: 'Proven Pathfinder',
  15: 'Skilled Seeker',
  20: 'Seasoned Traveler',
  30: 'Grand Adventurer',
  40: 'Master Explorer',
  50: 'Legendary Scholar',
};

// Random Portal configuration
export const RANDOM_PORTAL = {
  id: 'random_portal',
  name: 'Mystery Portal',
  description: 'Step through the swirling vortex to embark on a random adventure across any realm.',
  emoji: '🌀',
  color: '#a855f7',
};

// Dummy online players for MMO feel - each assigned to a classroom/region
export const DUMMY_PLAYERS = [
  {
    id: 'player_luna',
    displayName: 'Luna',
    avatar: '🧙‍♀️',
    color: '#ec4899',
    level: 12,
    title: 'Arcane Scholar',
    regionId: 'history_peaks',
    currentQuest: 'The Roman Empire',
    isOnline: true,
    isFriend: true,
    totalXp: 2450,
  },
  {
    id: 'player_atlas',
    displayName: 'Atlas',
    avatar: '🤖',
    color: '#06b6d4',
    level: 8,
    title: 'Tech Pioneer',
    regionId: 'tech_citadel',
    currentQuest: 'Artificial Intelligence',
    isOnline: true,
    isFriend: true,
    totalXp: 1580,
  },
  {
    id: 'player_ember',
    displayName: 'Ember',
    avatar: '🐉',
    color: '#f97316',
    level: 15,
    title: 'Dragon Sage',
    regionId: 'elemental_forge',
    currentQuest: 'Volcanoes',
    isOnline: true,
    isFriend: false,
    totalXp: 3200,
  },
  {
    id: 'player_sage',
    displayName: 'Sage',
    avatar: '🧝',
    color: '#10b981',
    level: 22,
    title: 'Nature Warden',
    regionId: 'nature_grove',
    currentQuest: 'Rainforest Ecosystems',
    isOnline: true,
    isFriend: true,
    totalXp: 5100,
  },
  {
    id: 'player_nova',
    displayName: 'Nova',
    avatar: '👨‍🚀',
    color: '#6366f1',
    level: 18,
    title: 'Star Navigator',
    regionId: 'cosmic_observatory',
    currentQuest: 'Black Holes',
    isOnline: true,
    isFriend: false,
    totalXp: 4200,
  },
  {
    id: 'player_rex',
    displayName: 'Rex',
    avatar: '🦖',
    color: '#d97706',
    level: 5,
    title: 'Fossil Hunter',
    regionId: 'ancient_fossils',
    currentQuest: 'Dinosaurs',
    isOnline: false,
    isFriend: true,
    totalXp: 890,
  },
  {
    id: 'player_coral',
    displayName: 'Coral',
    avatar: '🧜‍♀️',
    color: '#14b8a6',
    level: 11,
    title: 'Ocean Explorer',
    regionId: 'mystery_depths',
    currentQuest: 'Bioluminescence',
    isOnline: true,
    isFriend: false,
    totalXp: 2100,
  },
  {
    id: 'player_mind',
    displayName: 'Aria',
    avatar: '🔮',
    color: '#a855f7',
    level: 14,
    title: 'Mind Reader',
    regionId: 'mind_sanctuary',
    currentQuest: 'Psychology of Dreams',
    isOnline: true,
    isFriend: true,
    totalXp: 2900,
  },
];

// Chat system prompts
export const CHAT_SYSTEM_PROMPT = `You are a friendly and knowledgeable guide in the Adventure AI learning game. 
You help players learn about various topics in an engaging, fantasy-themed way.
Keep responses concise (2-3 paragraphs max) and educational.
Use adventure/fantasy metaphors when explaining concepts.
If asked about something unrelated to learning, gently redirect to educational topics.`;

export const CHAT_WELCOME_MESSAGE = `Welcome, brave adventurer! 🗺️

I'm your guide through the realms of knowledge. Ask me anything about:
• The topics you're exploring
• How to navigate the world
• Questions about your current quest

What would you like to learn about?`;
