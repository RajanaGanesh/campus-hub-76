import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthService, UserProfile, UserRole, AuthResponse, normalizeRole } from '../services/authService';
import { supabase } from '../lib/supabase';

// Re-export types for use throughout the application
export type { UserProfile, UserRole, AuthResponse };
export type User = UserProfile; // Backwards compatibility alias

interface AuthContextType {
  user: UserProfile | null;
  profile: UserProfile | null;
  role: UserRole | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize and load session on mount
  const refreshSession = useCallback(async () => {
    try {
      setLoading(true);
      const activeProfile = await AuthService.getActiveSession();
      setUser(activeProfile);
    } catch (err) {
      console.error('Failed to restore authentication session:', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSession();

    // Listen for Supabase authentication state changes if active
    if (AuthService.isSupabaseActive() && supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const profile = await AuthService.fetchUserProfile(session.user.id, session.user.email || '');
          setUser(profile);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [refreshSession]);

  const login = async (email: string, password: string, rememberMe: boolean = false): Promise<AuthResponse> => {
    try {
      const result = await AuthService.signIn(email, password, rememberMe);
      if (result.success && result.profile) {
        setUser(result.profile);
      }
      return result;
    } catch (err: any) {
      const errorMsg = err?.message || 'Login failed unexpectedly. Please try again.';
      return { success: false, error: errorMsg };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await AuthService.signOut();
    } finally {
      setUser(null);
    }
  };

  const sendPasswordReset = async (email: string) => {
    return await AuthService.sendPasswordResetEmail(email);
  };

  const resetPassword = async (newPassword: string) => {
    return await AuthService.updatePassword(newPassword);
  };

  const isAuthenticated = !!user;
  const role = user ? user.role : null;
  const profile = user;

  const value: AuthContextType = {
    user,
    profile,
    role,
    loading,
    isAuthenticated,
    login,
    logout,
    refreshSession,
    sendPasswordReset,
    resetPassword
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { normalizeRole };
