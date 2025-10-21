import React, { useState } from 'react';
import { signInWithGoogle } from '../services/firebase';
import { GoogleIcon, LoadingSpinner } from './Icons';

const LoginView: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
      // The onAuthStateChanged listener in App.tsx will handle the UI update upon success.
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred during sign-in.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-slate-800/50 backdrop-blur-sm p-8 rounded-xl shadow-2xl border border-slate-700 text-center animate-fade-in">
      <h2 className="text-2xl font-bold text-cyan-400 mb-2">Welcome, Adventurer!</h2>
      <p className="text-slate-300 mb-8">Sign in to begin your quest for knowledge.</p>
      <button
        onClick={handleSignIn}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-3 bg-white text-slate-800 font-semibold py-3 px-6 rounded-lg hover:bg-slate-200 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <LoadingSpinner className="w-6 h-6" />
            <span>Signing in...</span>
          </>
        ) : (
          <>
            <GoogleIcon className="w-6 h-6" />
            <span>Sign in with Google</span>
          </>
        )}
      </button>
      {error && (
        <p className="mt-4 text-red-400">{error}</p>
      )}
    </div>
  );
};

export default LoginView;