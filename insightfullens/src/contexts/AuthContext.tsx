// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, isAuthenticated, logoutUser, AuthResponse } from '../api/authservice';

interface AuthContextType {
  user: AuthResponse['user'] | null;
  loading: boolean;
  isLoggedIn: boolean;
  logout: () => void;
  setUser: (user: AuthResponse['user']) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthResponse['user'] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initAuth = async () => {
      if (isAuthenticated()) {
        try {
          const userData = await getCurrentUser();
          setUser(userData);
        } catch (error) {
          // Handle token validation failure
          logoutUser();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const logout = () => {
    logoutUser();
    setUser(null);
    navigate('/login');
  };

  const value = {
    user,
    loading,
    isLoggedIn: !!user,
    logout,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Protected Route component
export const ProtectedRoute: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isLoggedIn, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isLoggedIn) {
      navigate('/login');
    }
  }, [isLoggedIn, loading, navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return isLoggedIn ? <>{children}</> : null;
};