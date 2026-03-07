import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserData } from '../types';
import { api, loginResponseToUserData } from '../services/api';

interface AuthContextType {
  user: UserData | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (usernameOrEmail: string, password: string) => Promise<void>;
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

  const login = async (usernameOrEmail: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await api.login({
        username: usernameOrEmail,
        password,
      });
      setToken(response.token);
      const userData = loginResponseToUserData(response);
      setUser(userData);
      localStorage.setItem('anbit_token', response.token);
      localStorage.setItem('anbit_user', JSON.stringify(userData));
    } catch (error) {
      console.error('Login failed', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string) => {
    await api.register({ username, email, password });
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
