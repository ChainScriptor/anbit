import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserData } from '../types';
import { api, loginResponseToUserData } from '../services/api';

interface AuthContextType {
  user: UserData | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (usernameOrEmail: string, password: string, options?: { skipGlobalLoader?: boolean }) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<UserData>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('anbit_token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      if (token) {
        try {
          const savedUser = localStorage.getItem('anbit_user');
          if (savedUser) {
            setUser(JSON.parse(savedUser));
          }
        } catch {
          logout();
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, [token]);

  const login = async (usernameOrEmail: string, password: string, options?: { skipGlobalLoader?: boolean }) => {
    if (!options?.skipGlobalLoader) setIsLoading(true);
    try {
      const response = await api.login({
        username: usernameOrEmail,
        password,
      });

      const hasUserRole = response.roles?.includes('User');
      if (!hasUserRole) {
        logout();
        throw new Error(
          'Αυτός ο λογαριασμός δεν είναι λογαριασμός πελάτη. Παρακαλώ συνδεθείτε στο Dashboard.'
        );
      }

      setToken(response.token);
      const userData = loginResponseToUserData(response);
      setUser(userData);
      localStorage.setItem('anbit_token', response.token);
      localStorage.setItem('anbit_user', JSON.stringify(userData));
    } catch (error: unknown) {
      console.error('Login failed', error);
      const apiMessage =
        error && typeof error === 'object' && 'response' in error
          ? (error as { response?: { data?: { error?: string; message?: string } } }).response?.data?.error ||
            (error as { response?: { data?: { error?: string; message?: string } } }).response?.data?.message
          : null;
      const userMessage = apiMessage?.toLowerCase().includes('invalid')
        ? 'Λάθος username ή κωδικός. Δοκιμάστε ξανά.'
        : apiMessage || (error instanceof Error ? error.message : 'Σφάλμα σύνδεσης. Ελέγξτε το username και τον κωδικό.');
      throw new Error(userMessage);
    } finally {
      if (!options?.skipGlobalLoader) setIsLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      await api.register({ username, email, password });
      // Login αμέσως μετά (χωρίς setIsLoading ώστε να μην εμφανιστεί full-screen loader και να μην ξε-mountάρει το modal)
      const response = await api.login({ username, password });
      const hasUserRole = response.roles?.includes('User');
      if (!hasUserRole) {
        throw new Error('Αυτός ο λογαριασμός δεν είναι λογαριασμός πελάτη.');
      }
      const userData = loginResponseToUserData(response);
      setToken(response.token);
      setUser(userData);
      localStorage.setItem('anbit_token', response.token);
      localStorage.setItem('anbit_user', JSON.stringify(userData));
    } catch (error: unknown) {
      const res = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: Record<string, unknown> } }).response?.data
        : null;
      const apiMessage = res
        ? (typeof res.error === 'string' ? res.error : typeof res.message === 'string' ? res.message : (res as { Error?: string }).Error) ?? null
        : null;
      const msg = (apiMessage ?? (error instanceof Error ? error.message : '')).toLowerCase();
      const userMessage = msg.includes('username already exists')
        ? 'Αυτό το username χρησιμοποιείται ήδη. Συνδεθείτε αν έχετε λογαριασμό ή δοκιμάστε άλλο username.'
        : msg.includes('email already exists')
          ? 'Αυτό το email χρησιμοποιείται ήδη. Συνδεθείτε ή δοκιμάστε άλλο email.'
          : apiMessage || (error instanceof Error ? error.message : 'Σφάλμα εγγραφής. Δοκιμάστε ξανά.');
      throw new Error(userMessage);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('anbit_token');
    localStorage.removeItem('anbit_user');
  };

  const updateUser = (updates: Partial<UserData>) => {
    setUser((prev) => {
      if (!prev) return null;
      const next = { ...prev, ...updates };
      localStorage.setItem('anbit_user', JSON.stringify(next));
      return next;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
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
