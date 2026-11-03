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
  updateProfile: (updates: { displayName?: string; phone?: string }) => Promise<{ success: boolean; error?: string }>;
  setCurrentUser: (user: UserAccount | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const isConfigured = authService.isConfigured();

  // When Supabase is configured:
  // - Never trust a locally stored user object as an authenticated session.
  // - Never use localStorage roles to grant dashboard access.
  // - Show a loading state until verification is complete.
  // - Identity is cryptographically verified via Supabase Auth & PostgreSQL user_roles.
  // In unconfigured offline mode (no backend credentials), fallback to local demo user.
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    if (isConfigured) {
      try {
        localStorage.removeItem('chittoorads_user');
      } catch {}
      return null;
    }
    try {
      const raw = localStorage.getItem('chittoorads_user');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch {}
    return null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restore authenticated session on mount
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        if (isConfigured) {
          // Cryptographically verify server identity via auth.getUser() and load trusted roles from user_roles table
          const user = await authService.restoreSession();
          if (isMounted) {
            if (user) {
              setCurrentUser(user);
            } else {
              // When Supabase is configured, an invalid or missing session MUST clear currentUser and storage.
              // Never trust any locally stored user object!
              setCurrentUser(null);
              try {
                localStorage.removeItem('chittoorads_user');
              } catch {}
            }
          }
        } else {
          // Fallback to existing local stored demo user ONLY in unconfigured offline mode
          const raw = localStorage.getItem('chittoorads_user');
          if (raw && isMounted) {
            try {
              const parsed = JSON.parse(raw);
              if (parsed && typeof parsed === 'object') {
                setCurrentUser(parsed);
              }
            } catch {
              // ignore invalid JSON
            }
          }
        }
      } catch (err) {
        console.warn('Authentication verification error:', err);
        if (isMounted && isConfigured) {
          setCurrentUser(null);
          try {
            localStorage.removeItem('chittoorads_user');
          } catch {}
        }
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
        if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') && session?.user) {
          // Cryptographically verify server identity via auth.getUser() on token events
          const { data: { user: verifiedUser }, error: userError } = await supabase.auth.getUser();
          if (!userError && verifiedUser) {
            const res = await authService.fetchUserAccount(verifiedUser.id, verifiedUser.email || session.user.email || '');
            if (isMounted) setCurrentUser(res.user);
          } else {
            if (isMounted) {
              setCurrentUser(null);
              try {
                localStorage.removeItem('chittoorads_user');
              } catch {}
            }
          }
        } else if (event === 'SIGNED_OUT') {
          if (isMounted) {
            setCurrentUser(null);
            try {
              localStorage.removeItem('chittoorads_user');
            } catch {}
          }
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
      try {
        localStorage.removeItem('chittoorads_user');
      } catch {}
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    return authService.resetPassword(email);
  }, []);

  const updateProfile = useCallback(
    async (updates: { displayName?: string; phone?: string }) => {
      if (!currentUser) return { success: false, error: 'No active session.' };
      const res = await authService.updateUserProfile(currentUser.id, updates);
      if (res.success) {
        setCurrentUser((prev) =>
          prev
            ? {
                ...prev,
                name: updates.displayName?.trim() || prev.name,
                username: updates.displayName?.trim() || prev.username,
                mobile: updates.phone !== undefined ? updates.phone.trim() : prev.mobile,
              }
            : null
        );
      }
      return res;
    },
    [currentUser]
  );

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
        updateProfile,
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

