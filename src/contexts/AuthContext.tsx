import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { UserAccount } from '../types';
import { authService, SignUpParams, SignInParams, AuthResponse } from '../services/authService';
import { getSupabaseClient } from '../lib/supabase';

interface AuthContextType {
  currentUser: UserAccount | null;
  isLoading: boolean;
  isConfigured: boolean;
  signIn: (params: SignInParams) => Promise<AuthResponse>;
  signUp: (params: SignUpParams) => Promise<AuthResponse>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  setCurrentUser: (user: UserAccount | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const isConfigured = authService.isConfigured();

  // Restore authenticated session on mount
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        if (isConfigured) {
          const user = await authService.restoreSession();
          if (isMounted) setCurrentUser(user);
        } else {
          // Fallback to existing local stored demo user if available
          const raw = localStorage.getItem('chittoorads_user');
          if (raw) {
            try {
              const parsed = JSON.parse(raw);
              if (isMounted && parsed && typeof parsed === 'object') {
                setCurrentUser(parsed);
              }
            } catch {
              // ignore invalid JSON
            }
          }
        }
      } catch (err) {
        console.warn('Authentication initialization error:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    initAuth();

    // Listen to real-time auth state changes if Supabase is connected
    const supabase = getSupabaseClient();
    let subscription: { unsubscribe: () => void } | null = null;

    if (supabase) {
      const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const res = await authService.fetchUserAccount(session.user.id, session.user.email || '');
          if (isMounted) setCurrentUser(res.user);
        } else if (event === 'SIGNED_OUT') {
          if (isMounted) setCurrentUser(null);
        }
      });
      subscription = listener.subscription;
    }

    return () => {
      isMounted = false;
      if (subscription) subscription.unsubscribe();
    };
  }, [isConfigured]);

  const signIn = useCallback(async (params: SignInParams): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const res = await authService.signIn(params);
      if (res.user) {
        setCurrentUser(res.user);
        if (!isConfigured) {
          localStorage.setItem('chittoorads_user', JSON.stringify(res.user));
        }
      }
      return res;
    } finally {
      setIsLoading(false);
    }
  }, [isConfigured]);

  const signUp = useCallback(async (params: SignUpParams): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const res = await authService.signUp(params);
      if (res.user) {
        setCurrentUser(res.user);
        if (!isConfigured) {
          localStorage.setItem('chittoorads_user', JSON.stringify(res.user));
        }
      }
      return res;
    } finally {
      setIsLoading(false);
    }
  }, [isConfigured]);

  const signOut = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      await authService.signOut();
      setCurrentUser(null);
      localStorage.removeItem('chittoorads_user');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    return authService.resetPassword(email);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoading,
        isConfigured,
        signIn,
        signUp,
        signOut,
        resetPassword,
        setCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

