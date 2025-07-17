// src/contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

// Create the context
const AuthContext = createContext(null);

// JWT token utilities
const getStoredToken = () => localStorage.getItem('token');
const setStoredToken = (token) => localStorage.setItem('token', token);
const removeStoredToken = () => localStorage.removeItem('token');

// Check if token is valid/not expired
const isTokenValid = (token) => {
  if (!token) return false;
  
  try {
    // Decode the JWT payload
    const payload = JSON.parse(atob(token.split('.')[1]));
    // Check expiration
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return false;
    }
    return true;
  } catch (e) {
    return false;
  }
};

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(getStoredToken());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state from stored token
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = getStoredToken();
        
        if (storedToken && isTokenValid(storedToken)) {
          setToken(storedToken);
          
          // Decode user info from token
          const payload = JSON.parse(atob(storedToken.split('.')[1]));
          setUser({
            id: payload.id,
            email: payload.email,
            // Other user data from token
          });
        } else {
          // Clear invalid token
          setToken(null);
          setUser(null);
          removeStoredToken();
        }
      } catch (err) {
        console.error("Auth initialization error:", err);
        setError("Failed to restore authentication");
        setToken(null);
        setUser(null);
        removeStoredToken();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = (newToken) => {
    try {
      if (newToken && isTokenValid(newToken)) {
        setStoredToken(newToken);
        setToken(newToken);
        
        // Decode user info from token
        const payload = JSON.parse(atob(newToken.split('.')[1]));
        setUser({
          id: payload.id,
          email: payload.email,
          // Other user data from token
        });
        
        setError(null);
        return true;
      }
      return false;
    } catch (err) {
      console.error("Login error:", err);
      setError("Authentication failed");
      return false;
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setToken(null);
    removeStoredToken();
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    console.log(token);
    return !!user && !!token && isTokenValid(token);
  };

  // Auth context value
  const value = {
    user,
    token,
    login,
    logout,
    isAuthenticated,
    loading,
    error
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook for using the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};




