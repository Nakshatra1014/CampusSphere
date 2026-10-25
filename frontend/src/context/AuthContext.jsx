import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { ROLES } from '../utils/constants';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('campussphere_token') || localStorage.getItem('campushub_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('campussphere_token') || localStorage.getItem('campushub_token');
      if (savedToken) {
        try {
          const profile = await authService.getCurrentUser();
          setUser(profile);
        } catch (error) {
          console.error('Failed to restore user session:', error);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    localStorage.setItem('campussphere_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (userData) => {
    const data = await authService.register(userData);
    localStorage.setItem('campussphere_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('campussphere_token');
    localStorage.removeItem('campushub_token');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (updatedData) => {
    const updated = await authService.updateProfile(updatedData);
    setUser(updated);
    return updated;
  };

  const uploadProfilePhoto = async (file, onProgress) => {
    const updated = await authService.uploadProfilePhoto(file, onProgress);
    setUser(updated);
    return updated;
  };

  const isStudent = user?.role === ROLES.STUDENT;
  const isFaculty = user?.role === ROLES.FACULTY;
  const isAdmin = user?.role === ROLES.ADMIN;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateProfile,
        uploadProfilePhoto,
        isAuthenticated: !!user,
        isStudent,
        isFaculty,
        isAdmin,
      }}
    >
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
