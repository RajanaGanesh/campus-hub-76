import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  email: string;
  name: string;
  role: 'student' | 'faculty' | 'admin' | 'parent';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, role: string, name: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const normalizeRole = (role: string): 'student' | 'faculty' | 'admin' | 'parent' => {
  if (!role) return 'student';
  const lower = role.toLowerCase().trim();
  if (lower === 'student') return 'student';
  if (lower === 'faculty') return 'faculty';
  if (lower === 'admin' || lower === 'administrator') return 'admin';
  if (lower === 'parent') return 'parent';
  return 'student'; // safe fallback
};

const loadInitialSession = (): { user: User | null; isAuthenticated: boolean } => {
  // Support standard browser environments (checking for SSR window window.localStorage availability)
  if (typeof window === 'undefined') {
    return { user: null, isAuthenticated: false };
  }

  const keys = ['campushub_user', 'campusoneUser', 'user', 'currentUser', 'authUser', 'auth'];
  let rawSession: string | null = null;

  // 1. Scan localStorage
  for (const key of keys) {
    try {
      const val = localStorage.getItem(key);
      if (val) {
        rawSession = val;
        break;
      }
    } catch {}
  }

  // 2. Scan sessionStorage if not found in localStorage
  if (!rawSession) {
    for (const key of keys) {
      try {
        const val = sessionStorage.getItem(key);
        if (val) {
          rawSession = val;
          break;
        }
      } catch {}
    }
  }

  if (rawSession) {
    try {
      let parsed: any = null;
      try {
        parsed = JSON.parse(rawSession);
      } catch {
        parsed = rawSession.trim();
      }

      let email = 'student@campushub.com';
      let role: 'student' | 'faculty' | 'admin' | 'parent' = 'student';
      let name = 'Aditya Sharma';

      if (parsed && typeof parsed === 'object') {
        const rawRole = parsed.role || parsed.userRole || parsed.type || parsed.accountType || parsed.userType || '';
        role = normalizeRole(rawRole);
        email = parsed.email || parsed.emailAddress || parsed.username || `${role}@campushub.com`;
        name = parsed.name || parsed.displayName || parsed.fullName || (role.charAt(0).toUpperCase() + role.slice(1) + ' User');
      } else if (typeof parsed === 'string') {
        role = normalizeRole(parsed);
        email = `${role}@campushub.com`;
        name = role.charAt(0).toUpperCase() + role.slice(1) + ' User';
      }

      return { user: { email, role, name }, isAuthenticated: true };
    } catch {
      return { user: null, isAuthenticated: false };
    }
  }

  return { user: null, isAuthenticated: false };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initial = loadInitialSession();
  const [user, setUser] = useState<User | null>(initial.user);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(initial.isAuthenticated);

  const performLogoutAndClear = () => {
    setUser(null);
    setIsAuthenticated(false);
    const keys = ['campushub_user', 'campusoneUser', 'user', 'currentUser', 'authUser', 'auth'];
    keys.forEach((key) => {
      try {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      } catch {}
    });
  };

  useEffect(() => {
    // Synchronize keys in background on startup or role updates
    if (user) {
      try {
        localStorage.setItem('campushub_user', JSON.stringify(user));
        localStorage.setItem('campusoneUser', JSON.stringify(user));
      } catch {}
    }
  }, [user]);

  const login = (email: string, role: string, name: string) => {
    const normalized = normalizeRole(role);
    const userData: User = { email, role: normalized, name };
    setUser(userData);
    setIsAuthenticated(true);
    
    try {
      localStorage.setItem('campushub_user', JSON.stringify(userData));
      localStorage.setItem('campusoneUser', JSON.stringify(userData));
    } catch {}
  };

  const logout = () => {
    performLogoutAndClear();
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
