import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole, normalizeRole } from '../services/authService';

export interface EffectiveProfile {
  name: string;
  email: string;
  role: UserRole;
  photoUrl: string | null;
  initials: string;
}

export const getEffectiveInitials = (nameStr: string): string => {
  if (!nameStr) return 'ST';
  const parts = nameStr.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return nameStr.slice(0, 2).toUpperCase();
};

export const getSavedStudentProfile = (userId?: string) => {
  try {
    if (userId) {
      const scopedRaw = localStorage.getItem(`campushub_student_profile_data_${userId}`);
      if (scopedRaw) return JSON.parse(scopedRaw);
    }
  } catch {}
  return null;
};

export const resolveEffectiveProfile = (authUser: any): EffectiveProfile => {
  if (!authUser) {
    return {
      name: 'Student User',
      email: 'student@campushub.edu',
      role: 'student',
      photoUrl: null,
      initials: 'SU'
    };
  }

  const saved = getSavedStudentProfile(authUser.id);

  // Derive student details directly from active authUser
  let name = authUser.name;
  if (!name || name === 'New User' || name === 'Campus User' || name === 'User' || name === 'Student') {
    if (saved?.name && saved.name !== 'New User' && saved.name !== 'Campus User') {
      name = saved.name;
    } else if (authUser.email) {
      name = authUser.email.split('@')[0].replace(/[._0-9-]+/g, ' ').trim().replace(/\b\w/g, (c: string) => c.toUpperCase());
    } else {
      name = 'Student';
    }
  }

  const email = authUser.email || saved?.email || 'student@campushub.edu';
  const role: UserRole = normalizeRole(authUser.role);
  const photoUrl = saved?.photoUrl || authUser.avatar_url || null;
  const initials = getEffectiveInitials(name);

  return {
    name,
    email,
    role,
    photoUrl,
    initials
  };
};

export const notifyProfileUpdated = () => {
  try {
    window.dispatchEvent(new Event('campushub_profile_updated'));
    window.dispatchEvent(new Event('storage'));
  } catch {}
};

export const useEffectiveUserProfile = (): EffectiveProfile => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<EffectiveProfile>(() => resolveEffectiveProfile(user));

  useEffect(() => {
    const update = () => {
      setProfile(resolveEffectiveProfile(user));
    };

    update();

    window.addEventListener('storage', update);
    window.addEventListener('campushub_profile_updated', update);

    return () => {
      window.removeEventListener('storage', update);
      window.removeEventListener('campushub_profile_updated', update);
    };
  }, [user]);

  return profile;
};
