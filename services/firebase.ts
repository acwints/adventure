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
import type { User } from '../types';

// IMPORTANT: Replace with your own Firebase project configuration.
// You can get this from the Firebase console for your web app.
// It is recommended to use environment variables for this in a real project.
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
let provider: GoogleAuthProvider | null = null;

if (isFirebaseEnabled) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    provider = new GoogleAuthProvider();
  } catch (error) {
    console.error("Firebase initialization failed:", error);
    auth = null; // Ensure auth is null if init fails
  }
} else {
  console.warn("Firebase configuration is missing or incomplete. Authentication features will be disabled.");
}

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
    // If Firebase is disabled or failed to initialize, immediately report that there is no user.
    // This prevents the app from getting stuck in a loading state.
    callback(null);
    // Return a no-op unsubscribe function
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