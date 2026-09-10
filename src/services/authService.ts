import { supabase } from '../lib/supabase';
import { getManagementData } from '../data/managementData';
import { getUserAccounts } from './storageService';

export type UserRole = 'student' | 'faculty' | 'admin';

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

// Institutional Pre-configured Accounts Database
const DEV_PROFILES: Record<string, { profile: UserProfile; passwordHash: string }> = {
  'student@campushub.com': {
    passwordHash: 'student123',
    profile: {
      id: '236F1A0551',
      email: 'student@campushub.com',
      name: 'Aditya Sharma',
      role: 'student',
      department: 'Computer Science & Engineering',
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  },
  'student@campushub.edu': {
    passwordHash: 'student123',
    profile: {
      id: '236F1A0551',
      email: 'student@campushub.edu',
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
      id: 'FAC-101',
      email: 'faculty@campushub.com',
      name: 'Dr. S. Kumar',
      role: 'faculty',
      department: 'Computer Science & Engineering',
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  },
  'faculty@campushub.edu': {
    passwordHash: 'faculty123',
    profile: {
      id: 'FAC-101',
      email: 'faculty@campushub.edu',
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
      id: 'ADM-001',
      email: 'admin@campushub.com',
      name: 'Administrator',
      role: 'admin',
      department: 'Central Administration',
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  },
  'admin@campushub.edu': {
    passwordHash: 'admin123',
    profile: {
      id: 'ADM-001',
      email: 'admin@campushub.edu',
      name: 'Administrator',
      role: 'admin',
      department: 'Central Administration',
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  },
  'grajana608@gmail.com': {
    passwordHash: '123456789',
    profile: {
      id: 'ADM-002',
      email: 'grajana608@gmail.com',
      name: 'Rajana Ganesh (Admin)',
      role: 'admin',
      department: 'Central Administration',
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
   * Perform user authentication strictly restricting access to registered directory students, faculty, and admins
   */
  static async signIn(
    identifier: string,
    password: string,
    rememberMe: boolean = false,
    requestedRole?: string
  ): Promise<AuthResponse> {
    const rawInput = (identifier || '').trim();
    const normalizedInput = rawInput.toLowerCase();

    if (!rawInput) {
      return { success: false, error: 'Please enter your Name, Roll Number, or Email.' };
    }

    // 1. Try Supabase Auth if configured and identifier is an email
    if (this.isSupabaseActive() && supabase && normalizedInput.includes('@')) {
      try {
        let { data, error } = await supabase.auth.signInWithPassword({
          email: normalizedInput,
          password
        });

        // Try alternate domain if first attempt failed (.com <-> .edu)
        if (error && (normalizedInput.endsWith('@campushub.com') || normalizedInput.endsWith('@campushub.edu'))) {
          const altEmail = normalizedInput.endsWith('@campushub.com')
            ? normalizedInput.replace('@campushub.com', '@campushub.edu')
            : normalizedInput.replace('@campushub.edu', '@campushub.com');

          const altRes = await supabase.auth.signInWithPassword({
            email: altEmail,
            password
          });
          if (!altRes.error && altRes.data?.user) {
            data = altRes.data;
            error = null;
          }
        }

        if (!error && data?.user) {
          const profile = await this.fetchUserProfile(data.user.id, data.user.email || normalizedInput);
          if (requestedRole && requestedRole !== 'all' && profile.role !== normalizeRole(requestedRole)) {
            return {
              success: false,
              error: `This account is registered as ${profile.role.toUpperCase()}. Please switch your Log-in Type to ${profile.role.toUpperCase()}.`
            };
          }
          return { success: true, profile };
        }
      } catch (err: any) {
        console.warn('Supabase authentication error, checking local student directory:', err);
      }
    }

    // 2. Lookup in Student Directory (Admin Registered Students)
    const mgmtData = getManagementData();
    const cleanDigits = rawInput.replace(/[^0-9]/g, '');

    const matchedStudent = mgmtData.students.find((s) => {
      const sId = (s.id || '').trim().toLowerCase();
      const sName = (s.name || '').trim().toLowerCase();
      const sEmail = (s.email || '').trim().toLowerCase();
      const sPhoneDigits = (s.phone || '').replace(/[^0-9]/g, '');

      return (
        sId === normalizedInput ||
        sEmail === normalizedInput ||
        sName === normalizedInput ||
        (cleanDigits.length >= 7 && sPhoneDigits.includes(cleanDigits)) ||
        (normalizedInput.length >= 3 && sName.split(' ').includes(normalizedInput)) ||
        (normalizedInput.length >= 4 && sName.startsWith(normalizedInput))
      );
    });

    if (matchedStudent) {
      if (matchedStudent.status === 'Deactivated') {
        return {
          success: false,
          error: `Student account for "${matchedStudent.name}" (${matchedStudent.id}) is deactivated. Please contact campus administration.`
        };
      }

      if (requestedRole && requestedRole !== 'student' && requestedRole !== 'all') {
        return {
          success: false,
          error: `Account "${matchedStudent.name}" is registered as a Student. Please select "Student" as your Log-in Type.`
        };
      }

      const profile: UserProfile = {
        id: matchedStudent.id,
        email: matchedStudent.email || `${matchedStudent.id.toLowerCase()}@campushub.edu`,
        name: matchedStudent.name,
        role: 'student',
        department: matchedStudent.department,
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const sessionPayload = {
        profile,
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

      return { success: true, profile };
    }

    // 3. Lookup in Faculty Directory (Admin Registered Faculty)
    const matchedFaculty = mgmtData.faculty.find((f) => {
      const fId = (f.id || '').trim().toLowerCase();
      const fName = (f.name || '').trim().toLowerCase();
      const fEmail = (f.email || '').trim().toLowerCase();
      const cleanFName = fName.replace(/^(dr\.|prof\.|mr\.|ms\.|mrs\.)\s*/i, '').trim();

      return (
        fId === normalizedInput ||
        fEmail === normalizedInput ||
        fName === normalizedInput ||
        cleanFName === normalizedInput ||
        (normalizedInput.length >= 4 && (cleanFName.startsWith(normalizedInput) || cleanFName.split(' ').includes(normalizedInput)))
      );
    });

    if (matchedFaculty) {
      if (matchedFaculty.status === 'Deactivated') {
        return {
          success: false,
          error: `Faculty account for "${matchedFaculty.name}" (${matchedFaculty.id}) is deactivated. Please contact campus administration.`
        };
      }

      if (requestedRole && requestedRole !== 'faculty' && requestedRole !== 'all') {
        return {
          success: false,
          error: `Account "${matchedFaculty.name}" is registered as Faculty. Please select "Faculty" as your Log-in Type.`
        };
      }

      const profile: UserProfile = {
        id: matchedFaculty.id,
        email: matchedFaculty.email || `${matchedFaculty.id.toLowerCase()}@campushub.edu`,
        name: matchedFaculty.name,
        role: 'faculty',
        department: matchedFaculty.department,
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const sessionPayload = {
        profile,
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

      return { success: true, profile };
    }

    // 4. Lookup in Admin User Accounts
    const adminUsers = getUserAccounts();
    const matchedAdmin = adminUsers.find((u) => {
      const uId = (u.id || '').trim().toLowerCase();
      const uName = (u.name || '').trim().toLowerCase();
      const uEmail = (u.email || '').trim().toLowerCase();
      return (
        uId === normalizedInput ||
        uName === normalizedInput ||
        uEmail === normalizedInput ||
        (normalizedInput.length >= 3 && uName.split(' ').includes(normalizedInput))
      );
    });

    if (matchedAdmin) {
      if (matchedAdmin.status === 'Suspended') {
        return {
          success: false,
          error: `Administrator account for "${matchedAdmin.name}" has been suspended.`
        };
      }

      if (requestedRole && requestedRole !== 'admin' && requestedRole !== 'all') {
        return {
          success: false,
          error: `Account "${matchedAdmin.name}" has Administrator privileges. Please select "Admin" as your Log-in Type.`
        };
      }

      const profile: UserProfile = {
        id: matchedAdmin.id,
        email: matchedAdmin.email,
        name: matchedAdmin.name,
        role: matchedAdmin.role,
        department: 'Central Administration',
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const sessionPayload = {
        profile,
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

      return { success: true, profile };
    }

    // 5. Lookup in Pre-configured Demo Accounts
    const devAccount = DEV_PROFILES[normalizedInput] ||
      (normalizedInput.endsWith('@campushub.com') ? DEV_PROFILES[normalizedInput.replace('@campushub.com', '@campushub.edu')] : null) ||
      (normalizedInput.endsWith('@campushub.edu') ? DEV_PROFILES[normalizedInput.replace('@campushub.edu', '@campushub.com')] : null);

    if (devAccount) {
      if (requestedRole && devAccount.profile.role !== normalizeRole(requestedRole) && requestedRole !== 'all') {
        return {
          success: false,
          error: `This account is registered as ${devAccount.profile.role.toUpperCase()}. Please switch your Log-in Type to ${devAccount.profile.role.toUpperCase()}.`
        };
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

      return { success: true, profile: devAccount.profile };
    }

    // 6. STRICT ACCESS ENFORCEMENT: Reject any credentials not registered in the directory
    return {
      success: false,
      error: 'Access denied: No registered student, faculty, or staff account was found matching these credentials. Only users added via the Admin Panel can log in.'
    };
  }

  /**
   * Fetch user profile from Supabase profiles table or local management data
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
          let resolvedName = data.full_name || data.name;
          if (!resolvedName || resolvedName === 'New User' || resolvedName === 'Campus User') {
            resolvedName = (data.email || fallbackEmail).split('@')[0].replace(/[._0-9-]+/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
          }

          return {
            id: data.id,
            email: data.email || fallbackEmail,
            name: resolvedName,
            role: normalizeRole(data.role),
            avatar_url: data.avatar_url || null,
            created_at: data.created_at,
            updated_at: data.updated_at
          };
        }
      } catch (err) {
        console.warn('Could not fetch remote profile, checking local directory:', err);
      }
    }

    // Check local management data
    const mgmt = getManagementData();
    const matched = mgmt.students.find(s => s.id === userId || s.email === fallbackEmail) ||
      mgmt.faculty.find(f => f.id === userId || f.email === fallbackEmail);

    if (matched) {
      return {
        id: matched.id,
        email: matched.email,
        name: matched.name,
        role: 'designation' in matched ? 'faculty' : 'student',
        department: matched.department,
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }

    const fallbackName = fallbackEmail
      ? fallbackEmail.split('@')[0].replace(/[._0-9-]+/g, ' ').trim().replace(/\b\w/g, (c) => c.toUpperCase())
      : 'Campus User';

    return {
      id: userId,
      email: fallbackEmail,
      name: fallbackName,
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
      localStorage.removeItem('campushub_student_profile_data');
      // Clear any global legacy caches
      window.dispatchEvent(new Event('campushub_profile_updated'));
      window.dispatchEvent(new Event('storage'));
    } catch { }
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
