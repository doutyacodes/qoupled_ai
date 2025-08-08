"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import GlobalApi from '@/app/_services/GlobalApi';

// Create Authentication Context
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in on component mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Get token from localStorage
        const token = localStorage.getItem('token');
        
        // If no token, user is not logged in
        if (!token) {
          setIsLoading(false);
          return;
        }

        // Validate token with your API using the existing VerifyAuth function
        const response = await GlobalApi.VerifyAuth(token);
        
        // If token is valid, set user data
        if (response.status === 200) {
          // Get user data after verifying token
          const userDataResponse = await GlobalApi.GetUserData(token);
          setUser(userDataResponse.data);
        } else {
          // If token is invalid, remove it
          localStorage.removeItem('token');
        }
      } catch (err) {
        setError(err.message);
        localStorage.removeItem('token');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Login function
  const login = async (credentials) => {
    setIsLoading(true);
    try {
      const response = await GlobalApi.LoginUser(credentials);
      
      if (response.status === 200) {
        localStorage.setItem('token', response.data.token);
        setUser(response.data.user);
        return response;
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    router.push('/login');
  };

  // Context value
  const value = {
    user,
    isLoading,
    error,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};