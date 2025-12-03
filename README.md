<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

# Adventure AI

*Quest for Knowledge*

A retro-inspired RPG learning game where every topic is an adventure waiting to be captured.

</div>

---

## Overview

Adventure AI transforms educational content into an engaging game experience inspired by Pokemon and Skyrim. Explore a fantasy world map, embark on knowledge quests, face trials, and build your collection of captured adventures—all while leveling up your character.

### Core Concept

- **Topics become Quests** - Each learning topic is a quest on the world map
- **Lessons become Adventures** - AI-generated content styled as adventure journal entries
- **Quizzes become Trials** - Test your knowledge in RPG-style challenges
- **Progress becomes Collection** - Completed adventures are captured like Pokemon

---

## Game Flow

```
TITLE SCREEN → LOGIN → WORLD MAP → QUEST INTRO → ADVENTURE → TRIAL → VICTORY
                            ↓
                      COLLECTION VIEW
```

| State | Description |
|-------|-------------|
| **Title Screen** | Retro boot sequence with animated compass and "Press Start" |
| **Login** | Email/password authentication to enter the realm |
| **World Map** | Visual map with 8 clickable regions representing topic categories |
| **Quest Intro** | RPG dialog with typewriter text, select your topic |
| **Adventure** | AI-generated lesson styled as an adventure journal |
| **Trial** | Quiz challenge with immediate feedback |
| **Victory** | XP gain animation, level-up celebration, adventure captured |
| **Collection** | Pokedex-style view of all captured adventures |

---

## Map Regions

| Region | Icon | Topics |
|--------|------|--------|
| History Peaks | 🏛️ | Roman Empire, Great Wall of China, Ancient Egypt, Vikings |
| Nature Grove | 🌿 | Photosynthesis, Rainforest Ecosystems, Water Cycle, Animal Migration |
| Cosmic Observatory | 🔭 | Solar System, Black Holes, Big Bang, Constellations |
| Tech Citadel | ⚡ | Artificial Intelligence, Quantum Computing, Robotics, The Internet |
| Fossil Badlands | 🦴 | Dinosaurs, Ice Age Mammals, Evolution, Prehistoric Ocean Life |
| Elemental Forge | 🌋 | Volcanoes, Earthquakes, Weather Patterns, Plate Tectonics |
| Mystery Depths | 🐙 | Deep Sea Creatures, Ocean Trenches, Bioluminescence, Coral Reefs |
| Mind Sanctuary | 🧠 | Human Brain, Psychology of Dreams, Memory, Emotions |

---

## Game Mechanics

### XP System

| Action | XP Reward |
|--------|-----------|
| Complete adventure (lesson) | +50 XP |
| Correct quiz answer | +10 XP each |
| Perfect trial score | +25 XP bonus |

### Leveling

- **Level threshold**: `level × 100` XP to reach next level
- Example: Level 1 → 2 requires 100 XP, Level 5 → 6 requires 500 XP

### Player Ranks

| Level | Rank |
|-------|------|
| 1-4 | Novice Adventurer |
| 5-9 | Eager Apprentice |
| 10-14 | Proven Pathfinder |
| 15-19 | Skilled Seeker |
| 20-29 | Seasoned Traveler |
| 30-39 | Grand Adventurer |
| 40-49 | Master Explorer |
| 50+ | Legendary Scholar |

### Adventure Collection

Each completed topic becomes a collectible **Adventure Card** showing:
- Title and topic
- Completion date
- Quiz score and star rating (★★★ for perfect)
- XP earned

---

## Visual Design

### Typography
- **Headers**: Press Start 2P (pixel font)
- **Body**: Crimson Pro (readable serif)
- **Code/UI**: JetBrains Mono

### Color Palette (Octopath Traveler inspired)

| Element | Color |
|---------|-------|
| Background Dark | `#0a0e14` |
| Background Light | `#1e2a38` |
| Gold Accent | `#c9a227` |
| Cyan Glow | `#00ced1` |
| Crimson | `#dc143c` |
| Parchment | `#f4e4bc` |
| Text | `#e8e0d0` |
| Text Dim | `#8a8272` |

### Visual Effects
- Subtle CRT scanlines on title screen
- Typewriter text animation in dialogs
- Floating particles and glow effects
- XP bar fill animations with shimmer
- Level-up pulse animations

---

## Tech Stack

- **Frontend**: React 19 + TypeScript
- **Build**: Vite
- **AI**: Google Gemini API (lesson/quiz generation, text-to-speech)
- **Database**: Firebase Firestore
- **Styling**: Tailwind CSS + Custom CSS variables

---

## Run Locally

**Prerequisites:** Node.js 18+

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set environment variables in `.env.local`:
   ```env
   API_KEY=your_gemini_api_key
   
   # Optional: Firebase (falls back to localStorage if not set)
   FIREBASE_API_KEY=your_firebase_api_key
   FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   FIREBASE_APP_ID=your_app_id
   ```

3. Run the app:
   ```bash
   npm run dev
   ```

4. Login with test credentials:
   - **Email**: `andrew_winter@berkeley.edu`
   - **Password**: `adventure`

---

## Project Structure

```
adventure/
├── App.tsx                    # Main game state machine
├── components/
│   ├── TitleScreen.tsx        # Boot sequence + Press Start
│   ├── LoginView.tsx          # Authentication screen
│   ├── WorldMap.tsx           # Region selection map
│   ├── QuestDialog.tsx        # RPG dialog with typewriter
│   ├── LessonView.tsx         # Adventure journal
│   ├── QuizView.tsx           # Trial challenge
│   ├── VictoryScreen.tsx      # XP + level-up animations
│   ├── AdventureCollection.tsx # Pokedex-style collection
│   ├── PlayerHUD.tsx          # Level/XP display
│   └── Icons.tsx              # SVG icons
├── hooks/
│   └── useGameState.ts        # Game state management
├── services/
│   ├── firebase.ts            # Auth + Firestore
│   ├── geminiService.ts       # AI content generation
│   └── gameService.ts         # XP/level calculations
├── constants.ts               # Map regions + topics
├── types.ts                   # TypeScript definitions
└── index.html                 # Fonts + CSS variables
```

---

## Future Enhancements

- [ ] OAuth integration (Google Sign-In)
- [ ] Achievement/badge system
- [ ] Skill trees and unlockable regions
- [ ] Multiplayer leaderboards
- [ ] Custom avatar creation
- [ ] Sound effects and background music
- [ ] Mobile-responsive touch controls

---

<div align="center">

*Powered by Gemini AI*

</div>
