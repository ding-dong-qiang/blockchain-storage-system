'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";

// Auth context interface
interface AuthContextType {
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to access the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Auth provider to manage authentication state
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    // Check if there is a token in localStorage on app load
    const token = localStorage.getItem("authToken");
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const login = (token: string) => {
    // You can replace this with a real token check logic
    if (token === "MyPrivateKey") {
      setIsAuthenticated(true);
      localStorage.setItem("authToken", token); // Store token in localStorage
    } else {
      alert("Invalid token!");
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("authToken"); // Clear the token from localStorage
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
