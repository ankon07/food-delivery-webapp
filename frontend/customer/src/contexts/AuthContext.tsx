import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types/models';
import * as authService from '../services/authService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (universityId: string, password: string) => Promise<void>;
  register: (universityId: string, email: string, name: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(authService.getCurrentUser());
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    // If user is authenticated but we don't have user data, fetch it
    const fetchUser = async () => {
      if (authService.isAuthenticated() && !user) {
        setIsLoading(true);
        try {
          const userData = await authService.fetchCurrentUser();
          setUser(userData);
        } catch (error) {
          console.error('Failed to fetch user data:', error);
          // If we can't fetch user data, log out
          authService.logout();
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchUser();
  }, [user]);

  const login = async (universityId: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authService.login({ universityId, password });
      setUser(response.user);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (universityId: string, email: string, name: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authService.register({ universityId, email, name, password });
      setUser(response.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
