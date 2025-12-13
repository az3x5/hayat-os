import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface User {
  id: string;
  name: string | null;
  email: string;
  avatarUrl?: string | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create axios instance with auth header
const createAuthApi = (token: string | null) => {
  const api = axios.create({
    baseURL: API_URL,
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  return api;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('hayatos_token');

      if (storedToken) {
        try {
          const api = createAuthApi(storedToken);
          const response = await api.get('/api/auth/me');
          setUser(response.data);
          setToken(storedToken);
        } catch (error) {
          // Token invalid or expired
          localStorage.removeItem('hayatos_token');
          localStorage.removeItem('hayatos_user');
        }
      }

      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password
      });

      const { user: userData, token: authToken } = response.data;

      localStorage.setItem('hayatos_token', authToken);
      localStorage.setItem('hayatos_user', JSON.stringify(userData));

      setToken(authToken);
      setUser(userData);
    } catch (error: any) {
      const message = error.response?.data?.error || 'Login failed';
      throw new Error(message);
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/register`, {
        name,
        email,
        password
      });

      const { user: userData, token: authToken } = response.data;

      localStorage.setItem('hayatos_token', authToken);
      localStorage.setItem('hayatos_user', JSON.stringify(userData));

      setToken(authToken);
      setUser(userData);
    } catch (error: any) {
      const message = error.response?.data?.error || 'Registration failed';
      throw new Error(message);
    }
  };

  const logout = () => {
    localStorage.removeItem('hayatos_token');
    localStorage.removeItem('hayatos_user');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    signup,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Export helper to get auth headers for API calls
export const getAuthHeaders = () => {
  const token = localStorage.getItem('hayatos_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};