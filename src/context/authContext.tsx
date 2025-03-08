'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  errorMessage: string | null;
  loading: boolean;
  login: (token: string) => void;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const login = (token: string) => {
    setLoading(true); 

    setTimeout(() => {
      if (token === "MyPrivateKey") {
        setIsAuthenticated(true);
        setErrorMessage(null);
        localStorage.setItem("authToken", token);
      } else {
        setErrorMessage("Invalid key token! Please enter the correct token.");
      }
      setLoading(false); 
    }, 500);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setErrorMessage(null);
    localStorage.removeItem("authToken");
  };

  const clearError = () => {
    setErrorMessage(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, errorMessage, loading, login, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
};
