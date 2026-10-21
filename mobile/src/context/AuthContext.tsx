import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { storage } from '../services/storage';
import { apiClient } from '../services/apiClient';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, confirmPassword?: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Set up unauthorized callback from API client
  useEffect(() => {
    apiClient.onUnauthorized(() => {
      setUser(null);
      setToken(null);
    });
  }, []);

  // Restore session securely on initial mount
  useEffect(() => {
    const restoreSession = async () => {
      try {
        setIsLoading(true);
        const storedToken = await storage.getToken();
        const storedUser = await storage.getUser();

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(storedUser);

          // Verify token validity with server
          try {
            const freshUser = await apiClient.auth.getMe();
            setUser(freshUser);
            await storage.setUser(freshUser);
          } catch (serverErr) {
            // Token is expired or revoked
            console.log('[Auth] Token validation failed, clearing session');
            await storage.clearSession();
            setToken(null);
            setUser(null);
          }
        }
      } catch (err) {
        console.error('[Auth] Failed to restore session:', err);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiClient.auth.login({ email, password });
      await storage.setToken(data.token);
      await storage.setUser(data.user);
      setToken(data.token);
      setUser(data.user);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, confirmPassword?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiClient.auth.register({ name, email, password, confirmPassword });
      await storage.setToken(data.token);
      await storage.setUser(data.user);
      setToken(data.token);
      setUser(data.user);
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await apiClient.auth.logout();
    } finally {
      setUser(null);
      setToken(null);
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: Boolean(token && user),
        error,
        login,
        register,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
