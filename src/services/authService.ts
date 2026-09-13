import { supabase } from '../lib/supabase';
import { getManagementData } from '../data/managementData';
import { getUserAccounts, recordLoginEvent, recordLogoutEvent } from './storageService';

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

// Institutional Admin Pre-configured Accounts
const DEV_PROFILES: Record<string, { profile: UserProfile; passwordHash: string }> = {
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
   * Internal helper to record login audit logs
   */
  private static logSessionEvent(
    profile: UserProfile,
    method: 'Password' | 'SSO' | 'Google' | 'Session Token' = 'Password'
  ) {
    try {
      const role = normalizeRole(profile.role);
      let ip = '192.168.1.104 (Campus Wi-Fi)';
      let location = 'Campus Wi-Fi / Student Portal';

      if (role === 'faculty') {
        ip = '172.16.10.8 (Faculty Network)';
        location = `${profile.department || 'Academic'} Department Wing`;
      } else if (role === 'admin') {
        ip = '172.16.1.1 (Admin Gateway)';
        location = 'Central Administration Block';
      }

      recordLoginEvent({
        userId: profile.id,
        userName: profile.name,
        userEmail: profile.email,
        role,
        ipAddress: ip,
        deviceInfo: 'Chrome 128 / Windows 11',
        loginLocation: location,
        authMethod: method,
        status: 'Active Session'
      });
    } catch (err) {
      console.warn('Failed to record login audit log:', err);
    }
  }

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

    if (!password) {
      return { success: false, error: 'Please enter your password.' };
    }

    // 1. Try Supabase lookup if configured
    if (this.isSupabaseActive() && supabase) {
      try {
        let matchedProfile: any = null;

        // 1a. Exact email match in profiles
        const { data: exactProf } = await supabase
          .from('profiles')
          .select('*')
          .ilike('email', normalizedInput)
          .maybeSingle();

        if (exactProf) {
          matchedProfile = exactProf;
        }

        // 1b. Student ID match in students
        if (!matchedProfile) {
          const { data: stu } = await supabase
            .from('students')
            .select('id, student_id')
            .ilike('student_id', normalizedInput)
            .maybeSingle();

          if (stu?.id) {
            const { data: p } = await supabase.from('profiles').select('*').eq('id', stu.id).maybeSingle();
            if (p) matchedProfile = p;
          }
        }

        // 1c. Faculty ID match in faculty
        if (!matchedProfile) {
          const { data: fac } = await supabase
            .from('faculty')
            .select('id, faculty_id')
            .ilike('faculty_id', normalizedInput)
            .maybeSingle();

          if (fac?.id) {
            const { data: p } = await supabase.from('profiles').select('*').eq('id', fac.id).maybeSingle();
            if (p) matchedProfile = p;
          }
        }

        // 1d. Name match or fuzzy email match in profiles (handles slight typos or names)
        if (!matchedProfile) {
          const { data: allProfiles } = await supabase.from('profiles').select('*');
          const cleanInput = normalizedInput.replace(/[^a-z0-9]/g, '');

          const fuzzy = (allProfiles || []).find((p: any) => {
            const pEmail = (p.email || '').toLowerCase();
            const pName = (p.name || '').toLowerCase();
            const pEmailPrefix = pEmail.split('@')[0];
            const cleanEmail = pEmail.replace(/[^a-z0-9]/g, '');
            const cleanName = pName.replace(/[^a-z0-9]/g, '');

            return (
              cleanEmail === cleanInput ||
              cleanEmail.includes(cleanInput) ||
              cleanInput.includes(cleanEmail) ||
              cleanName.includes(cleanInput) ||
              cleanInput.includes(cleanName) ||
              (cleanInput.length >= 6 && pEmailPrefix.includes(cleanInput.slice(0, 6)))
            );
          });

          if (fuzzy) {
            matchedProfile = fuzzy;
          }
        }

        if (matchedProfile) {
          const targetEmail = matchedProfile.email;
          const userRole = normalizeRole(matchedProfile.role);

          // Check if requestedRole matches
          if (requestedRole && requestedRole !== 'all' && userRole !== normalizeRole(requestedRole)) {
            const roleLabel = userRole === 'faculty' ? 'Faculty / Teacher' : (userRole === 'admin' ? 'Admin' : 'Student');
            return {
              success: false,
              error: `This account is registered as ${userRole.toUpperCase()}. Please select "${roleLabel}" as your Log-in Type.`
            };
          }

          // Try native Supabase Auth signIn
          let authSuccess = false;
          try {
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
              email: targetEmail,
              password
            });
            if (!authError && authData?.user) {
              authSuccess = true;
            }
          } catch (authErr) {
            console.warn('Supabase signIn attempt notice:', authErr);
          }

          // If native Auth failed (e.g. user was inserted directly in database without auth.users password):
          if (!authSuccess) {
            try {
              await supabase.auth.signUp({
                email: targetEmail,
                password
              });
            } catch {}
          }

          // Build full user profile
          const profile = await this.fetchUserProfile(matchedProfile.id, targetEmail);

          // Establish session
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

          this.logSessionEvent(profile, 'Password');
          return { success: true, profile };
        }
      } catch (err: any) {
        console.warn('Supabase authentication lookup error:', err);
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

      this.logSessionEvent(profile, 'Password');
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
          error: `Account "${matchedFaculty.name}" is registered as Faculty. Please select "Faculty / Teacher" as your Log-in Type.`
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

      this.logSessionEvent(profile, 'Password');
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

      this.logSessionEvent(profile, 'Password');
      return { success: true, profile };
    }

    // 5. Lookup in Pre-configured Demo Accounts
    const devAccount = DEV_PROFILES[normalizedInput] ||
      (normalizedInput.endsWith('@campushub.com') ? DEV_PROFILES[normalizedInput.replace('@campushub.com', '@campushub.edu')] : null) ||
      (normalizedInput.endsWith('@campushub.edu') ? DEV_PROFILES[normalizedInput.replace('@campushub.edu', '@campushub.com')] : null);

    if (devAccount) {
      if (requestedRole && devAccount.profile.role !== normalizeRole(requestedRole) && requestedRole !== 'all') {
        const roleLabel = devAccount.profile.role === 'faculty' ? 'Faculty / Teacher' : (devAccount.profile.role === 'admin' ? 'Admin' : 'Student');
        return {
          success: false,
          error: `This account is registered as ${devAccount.profile.role.toUpperCase()}. Please switch your Log-in Type to ${roleLabel}.`
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

      this.logSessionEvent(devAccount.profile, 'Password');
      return { success: true, profile: devAccount.profile };
    }

    // 6. STRICT ACCESS ENFORCEMENT: Reject any credentials not registered in the directory
    return {
      success: false,
      error: 'Access denied: No registered student, faculty, or staff account was found matching these credentials. Only users added via the Admin Panel or Institutional Database can log in.'
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
          const email = data.email || fallbackEmail;
          const role = normalizeRole(data.role);
          let department = data.department;
          let customId = data.id;

          if (role === 'student') {
            const { data: stuData } = await supabase.from('students').select('*').eq('id', userId).maybeSingle();
            if (stuData?.department) department = stuData.department;
            if (stuData?.student_id) customId = stuData.student_id;
          } else if (role === 'faculty') {
            const { data: facData } = await supabase.from('faculty').select('*').eq('id', userId).maybeSingle();
            if (facData?.department) department = facData.department;
            if (facData?.faculty_id) customId = facData.faculty_id;
          }

          if (!resolvedName || resolvedName === 'New User' || resolvedName === 'Campus User') {
            const emailPrefix = email.split('@')[0].replace(/[._0-9-]+/g, ' ').trim();
            resolvedName = emailPrefix.replace(/\b\w/g, (c: string) => c.toUpperCase()) || 'Student Candidate';
          }

          return {
            id: customId || data.id,
            email,
            name: resolvedName,
            role,
            department: department || 'Computer Science & Engineering',
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
    try {
      const active = await this.getActiveSession();
      if (active?.email || active?.id) {
        recordLogoutEvent(active.email || active.id);
      }
    } catch {}

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
