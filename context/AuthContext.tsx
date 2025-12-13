import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('lifeos_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      // Auto-login for demo purposes
      const demoUser = {
        id: '1',
        name: 'Ali Developer',
        email: 'ali@hayatos.com',
        avatar: 'https://ui-avatars.com/api/?name=Ali+Developer&background=0D8ABC&color=fff'
      };
      localStorage.setItem('lifeos_user', JSON.stringify(demoUser));
      setUser(demoUser);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        // Mock validation
        if (password.length < 6) {
          reject(new Error('Password must be at least 6 characters'));
          return;
        }
        
        const mockUser = {
          id: '1',
          name: 'Ali Developer',
          email: email,
          avatar: 'https://ui-avatars.com/api/?name=Ali+Developer&background=0D8ABC&color=fff'
        };
        
        localStorage.setItem('lifeos_user', JSON.stringify(mockUser));
        setUser(mockUser);
        resolve();
      }, 1000); // Simulate API delay
    });
  };

  const signup = async (name: string, email: string, password: string) => {
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        if (!name || !email || !password) {
           reject(new Error('All fields are required'));
           return;
        }

        const mockUser = {
          id: Date.now().toString(),
          name: name,
          email: email,
        };
        
        localStorage.setItem('lifeos_user', JSON.stringify(mockUser));
        setUser(mockUser);
        resolve();
      }, 1000);
    });
  };

  const logout = () => {
    localStorage.removeItem('lifeos_user');
    setUser(null);
  };

  const value = {
    user,
    isAuthenticated: !!user,
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