import { initializeApp, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged as onFirebaseAuthStateChanged,
  type User as FirebaseUser,
  type Auth,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  Timestamp,
  type Firestore,
} from 'firebase/firestore';
import type { User, GamePlayer, CompletedAdventure } from '../types';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

// Check if all necessary Firebase environment variables are set.
export const isFirebaseEnabled = Object.values(firebaseConfig).every(val => val && val.trim() !== '');

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let provider: GoogleAuthProvider | null = null;

if (isFirebaseEnabled) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    provider = new GoogleAuthProvider();
  } catch (error) {
    console.error("Firebase initialization failed:", error);
    auth = null;
    db = null;
  }
} else {
  console.warn("Firebase configuration is missing or incomplete. Authentication features will be disabled.");
}

// Hardcoded credentials for fake auth
const VALID_EMAIL = 'andrew_winter@berkeley.edu';
const VALID_PASSWORD = 'adventure';

// Generate a consistent UID from email
function generateUid(email: string): string {
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    const char = email.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `fake_${Math.abs(hash).toString(16)}`;
}

// Fake sign in with email and password
export const fakeSignIn = async (email: string, password: string): Promise<GamePlayer | null> => {
  if (email.toLowerCase() !== VALID_EMAIL || password !== VALID_PASSWORD) {
    throw new Error("Invalid credentials. The realm rejects your entry.");
  }

  const uid = generateUid(email);
  
  if (!db) {
    // If no Firestore, return a default player object (localStorage fallback)
    const savedPlayer = localStorage.getItem(`player_${uid}`);
    if (savedPlayer) {
      return JSON.parse(savedPlayer) as GamePlayer;
    }
    
    const newPlayer: GamePlayer = {
      uid,
      email,
      displayName: email.split('@')[0].replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      level: 1,
      xp: 0,
      totalXp: 0,
      completedAdventures: [],
      createdAt: Date.now(),
    };
    localStorage.setItem(`player_${uid}`, JSON.stringify(newPlayer));
    return newPlayer;
  }

  // Check if user exists in Firestore
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    const data = userSnap.data();
    return {
      uid,
      email: data.email,
      displayName: data.displayName,
      level: data.level,
      xp: data.xp,
      totalXp: data.totalXp,
      completedAdventures: data.completedAdventures || [],
      createdAt: data.createdAt?.toMillis?.() || data.createdAt,
    } as GamePlayer;
  }

  // Create new user document
  const newPlayer: GamePlayer = {
    uid,
    email,
    displayName: email.split('@')[0].replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    level: 1,
    xp: 0,
    totalXp: 0,
    completedAdventures: [],
    createdAt: Date.now(),
  };

  await setDoc(userRef, {
    ...newPlayer,
    createdAt: Timestamp.now(),
  });

  return newPlayer;
};

// Update player data in Firestore
export const updatePlayerData = async (player: GamePlayer): Promise<void> => {
  if (!db) {
    // Fallback to localStorage
    localStorage.setItem(`player_${player.uid}`, JSON.stringify(player));
    return;
  }

  const userRef = doc(db, 'users', player.uid);
  await updateDoc(userRef, {
    level: player.level,
    xp: player.xp,
    totalXp: player.totalXp,
    completedAdventures: player.completedAdventures,
  });
};

// Add completed adventure
export const saveCompletedAdventure = async (
  player: GamePlayer,
  adventure: CompletedAdventure
): Promise<GamePlayer> => {
  const updatedAdventures = [...player.completedAdventures, adventure];
  const updatedPlayer = {
    ...player,
    completedAdventures: updatedAdventures,
  };
  
  await updatePlayerData(updatedPlayer);
  return updatedPlayer;
};

// Get player data
export const getPlayerData = async (uid: string): Promise<GamePlayer | null> => {
  if (!db) {
    const savedPlayer = localStorage.getItem(`player_${uid}`);
    return savedPlayer ? JSON.parse(savedPlayer) : null;
  }

  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) return null;

  const data = userSnap.data();
  return {
    uid,
    email: data.email,
    displayName: data.displayName,
    level: data.level,
    xp: data.xp,
    totalXp: data.totalXp,
    completedAdventures: data.completedAdventures || [],
    createdAt: data.createdAt?.toMillis?.() || data.createdAt,
  } as GamePlayer;
};

// Fake sign out
export const fakeSignOut = (): void => {
  // Just clear the session - actual clearing handled by app state
};

// Legacy Google sign in (kept for future OAuth implementation)
export const signInWithGoogle = async (): Promise<User | null> => {
  if (!auth || !provider) {
    console.error("Authentication is not configured. Please ensure Firebase environment variables are set.");
    throw new Error("Authentication is not configured for this application.");
  }
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    return {
      uid: user.uid,
      displayName: user.displayName,
      photoURL: user.photoURL,
    };
  } catch (error) {
    console.error("Error during Google sign-in:", error);
    return null;
  }
};

export const signOutUser = async (): Promise<void> => {
  if (!auth) return;
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
  }
};

export const onAuthStateChanged = (callback: (user: User | null) => void) => {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onFirebaseAuthStateChanged(auth, (user: FirebaseUser | null) => {
    if (user) {
      callback({
        uid: user.uid,
        displayName: user.displayName,
        photoURL: user.photoURL,
      });
    } else {
      callback(null);
    }
  });
};

export { db };
