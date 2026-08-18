import { supabase } from '../lib/supabase';

export type UserRole = 'student' | 'faculty' | 'admin' | 'parent';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar_url?: string | null;
  department?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AuthResponse {
  success: boolean;
  profile?: UserProfile;
  error?: string;
}

// Development Demo Accounts Database with proper profile structures
// Used in development mode when Supabase is in local/mock configuration
const DEV_PROFILES: Record<string, { profile: UserProfile; passwordHash: string }> = {
  'student@campushub.com': {
    passwordHash: 'student123',
    profile: {
      id: 'd0000000-0000-0000-0000-000000000001',
      email: 'student@campushub.com',
      name: 'Aditya Sharma',
      role: 'student',
      department: 'Computer Science & Engineering',
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  },
  'faculty@campushub.com': {
    passwordHash: 'faculty123',
    profile: {
      id: 'd0000000-0000-0000-0000-000000000002',
      email: 'faculty@campushub.com',
      name: 'Dr. S. Kumar',
      role: 'faculty',
      department: 'Computer Science & Engineering',
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  },
  'admin@campushub.com': {
    passwordHash: 'admin123',
    profile: {
      id: 'd0000000-0000-0000-0000-000000000003',
      email: 'admin@campushub.com',
      name: 'Administrator',
      role: 'admin',
      department: 'Central Administration',
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  },
  'parent@campushub.com': {
    passwordHash: 'parent123',
    profile: {
      id: 'd0000000-0000-0000-0000-000000000004',
      email: 'parent@campushub.com',
      name: 'Rajesh Sharma',
      role: 'parent',
      department: 'Parent Portal',
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  }
};

const DEV_SESSION_KEY = 'campusone_auth_session';

export const normalizeRole = (rawRole: string | undefined | null): UserRole => {
  if (!rawRole) return 'student';
  const lower = rawRole.toLowerCase().trim();
  if (lower === 'faculty') return 'faculty';
  if (lower === 'admin' || lower === 'administrator') return 'admin';
  if (lower === 'parent') return 'parent';
  return 'student';
};

export class AuthService {
  /**
   * Check if real Supabase authentication backend is available
   */
  static isSupabaseActive(): boolean {
    return supabase !== null;
  }

  /**
   * Perform user authentication using Supabase Auth or Development Provider
   */
  static async signIn(email: string, password: string, rememberMe: boolean = false): Promise<AuthResponse> {
    const normalizedEmail = email.trim().toLowerCase();

    // 1. Try Supabase Auth if configured
    if (this.isSupabaseActive() && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password
        });

        if (error) {
          return { success: false, error: error.message };
        }

        if (!data.user) {
          return { success: false, error: 'Authentication failed. Please try again.' };
        }

        // Fetch User Profile Record
        const profile = await this.fetchUserProfile(data.user.id, data.user.email || normalizedEmail);
        return { success: true, profile };
      } catch (err: any) {
        console.error('Supabase authentication error:', err);
        return { success: false, error: err?.message || 'Authentication service unavailable.' };
      }
    }

    // 2. Fallback to Development Auth Provider with Role Verification
    const devAccount = DEV_PROFILES[normalizedEmail];
    if (!devAccount) {
      return { success: false, error: 'Invalid email or password.' };
    }

    if (devAccount.passwordHash !== password) {
      return { success: false, error: 'Invalid email or password.' };
    }

    const sessionPayload = {
      profile: devAccount.profile,
      expiresAt: rememberMe ? Date.now() + 30 * 24 * 60 * 60 * 1000 : Date.now() + 24 * 60 * 60 * 1000
    };

    try {
      if (rememberMe) {
        localStorage.setItem(DEV_SESSION_KEY, JSON.stringify(sessionPayload));
        sessionStorage.removeItem(DEV_SESSION_KEY);
      } else {
        sessionStorage.setItem(DEV_SESSION_KEY, JSON.stringify(sessionPayload));
        localStorage.removeItem(DEV_SESSION_KEY);
      }
    } catch {}

    return {
      success: true,
      profile: devAccount.profile
    };
  }

  /**
   * Fetch user profile from Supabase profiles table
   */
  static async fetchUserProfile(userId: string, fallbackEmail: string): Promise<UserProfile> {
    if (this.isSupabaseActive() && supabase) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (data && !error) {
          return {
            id: data.id,
            email: data.email || fallbackEmail,
            name: data.full_name || data.name || 'Campus User',
            role: normalizeRole(data.role),
            avatar_url: data.avatar_url || null,
            created_at: data.created_at,
            updated_at: data.updated_at
          };
        }
      } catch (err) {
        console.warn('Could not fetch remote profile, falling back to local metadata:', err);
      }
    }

    // Fallback profile
    return {
      id: userId,
      email: fallbackEmail,
      name: 'Campus User',
      role: 'student',
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  /**
   * Load active session on application startup / page refresh
   */
  static async getActiveSession(): Promise<UserProfile | null> {
    // 1. Check Supabase session
    if (this.isSupabaseActive() && supabase) {
      try {
        const { data } = await supabase.auth.getSession();
        if (data?.session?.user) {
          return await this.fetchUserProfile(data.session.user.id, data.session.user.email || '');
        }
      } catch (err) {
        console.warn('Error reading Supabase session:', err);
      }
    }

    // 2. Check local dev session
    try {
      const rawSession = localStorage.getItem(DEV_SESSION_KEY) || sessionStorage.getItem(DEV_SESSION_KEY);
      if (rawSession) {
        const parsed = JSON.parse(rawSession);
        if (parsed?.expiresAt && parsed.expiresAt > Date.now() && parsed?.profile) {
          return parsed.profile;
        } else {
          // Expired session
          localStorage.removeItem(DEV_SESSION_KEY);
          sessionStorage.removeItem(DEV_SESSION_KEY);
        }
      }
    } catch {}

    return null;
  }

  /**
   * End user session across storage and backend
   */
  static async signOut(): Promise<void> {
    if (this.isSupabaseActive() && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Error during Supabase signout:', err);
      }
    }

    try {
      localStorage.removeItem(DEV_SESSION_KEY);
      sessionStorage.removeItem(DEV_SESSION_KEY);
      localStorage.removeItem('campushub_user');
      localStorage.removeItem('campusoneUser');
      sessionStorage.removeItem('campushub_user');
      sessionStorage.removeItem('campusoneUser');
    } catch {}
  }

  /**
   * Trigger password reset email
   */
  static async sendPasswordResetEmail(email: string): Promise<{ success: boolean; error?: string }> {
    const normalizedEmail = email.trim().toLowerCase();

    if (this.isSupabaseActive() && supabase) {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
          redirectTo: `${window.location.origin}/reset-password`
        });

        if (error) {
          return { success: false, error: error.message };
        }
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err?.message || 'Password reset request failed.' };
      }
    }

    // Development mode simulated password reset (always returns success to prevent user enumeration)
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true });
      }, 700);
    });
  }

  /**
   * Update password for the currently authenticated or reset-token user
   */
  static async updatePassword(newPassword: string): Promise<{ success: boolean; error?: string }> {
    if (this.isSupabaseActive() && supabase) {
      try {
        const { error } = await supabase.auth.updateUser({
          password: newPassword
        });

        if (error) {
          return { success: false, error: error.message };
        }
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err?.message || 'Failed to update password.' };
      }
    }

    // Simulated password update in development mode
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true });
      }, 800);
    });
  }
}
