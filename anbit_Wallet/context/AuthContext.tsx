
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserData } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: UserData | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
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
          // In a real app, verify the token or fetch profile
          // const userData = await api.getUserProfile();
          // setUser(userData);
          
          // For now, we'll keep the mock logic if the token exists
          const mockUser = JSON.parse(localStorage.getItem('anbit_user') || 'null');
          if (mockUser) setUser(mockUser);
        } catch (error) {
          logout();
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, [token]);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const response: any = await api.login({ email, password: pass });
      setToken(response.token);
      setUser(response.user);
      localStorage.setItem('anbit_token', response.token);
      localStorage.setItem('anbit_user', JSON.stringify(response.user));
    } catch (error) {
      console.error('Login failed', error);
      throw error;
    } finally {
      setIsLoading(false);
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
    <AuthContext.Provider value={{ 
      user, 
      token, 
      isAuthenticated: !!token, 
      isLoading, 
      login, 
      logout,
      updateUser,
    }}>
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
