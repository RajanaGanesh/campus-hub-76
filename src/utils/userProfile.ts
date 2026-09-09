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
  if (!nameStr) return 'RG';
  const parts = nameStr.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return nameStr.slice(0, 2).toUpperCase();
};

export const getSavedStudentProfile = () => {
  try {
    const raw = localStorage.getItem('campushub_student_profile_data');
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {}
  return null;
};

export const resolveEffectiveProfile = (authUser: any): EffectiveProfile => {
  const saved = getSavedStudentProfile();

  let name = saved?.name;
  if (!name || name === 'New User' || name === 'Campus User' || name === 'User' || name === 'Student') {
    if (authUser?.name && authUser.name !== 'New User' && authUser.name !== 'Campus User') {
      name = authUser.name;
    } else {
      name = 'Rajana Ganesh';
    }
  }

  const email = saved?.email || authUser?.email || 'rajanaganesh143143@gmail.com';
  const role: UserRole = normalizeRole(authUser?.role);
  const photoUrl = saved?.photoUrl || authUser?.avatar_url || null;
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
