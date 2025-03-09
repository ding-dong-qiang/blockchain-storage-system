"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { encryptWithKey, decryptWithKey } from "../files/utils/encryption";

// For testing, this would be in memory or temporary storage
const TEST_ENCRYPTED_VALUES: Record<string, string> = {};

interface AuthContextType {
  isAuthenticated: boolean;
  loading: boolean;
  errorMessage: string;
  userKey: string;
  login: (key: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
  storeTestKey: (key: string) => void; // For testing only
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [userKey, setUserKey] = useState("");

  // Check localStorage on initial load
  useEffect(() => {
    const storedKey = localStorage.getItem("authToken");
    if (storedKey) {
      setUserKey(storedKey);
      setIsAuthenticated(true);
    }
  }, []);

  // This function would only exist in the test environment
  const storeTestKey = (key: string) => {
    // Create a test encrypted value
    const testEncrypted = encryptWithKey("valid_user", key);
    // Store it - in a real app this would go to a database
    TEST_ENCRYPTED_VALUES[key] = testEncrypted;
  };

  const login = async (key: string): Promise<boolean> => {
    setLoading(true);
    setErrorMessage("");
    
    try {
      // For testing: check if we have a stored test value for this key
      const testEncrypted = TEST_ENCRYPTED_VALUES[key];
      
      if (testEncrypted) {
        // Try to decrypt the test value using the provided key
        try {
          const decrypted = decryptWithKey(testEncrypted, key);
          
          if (decrypted === "valid_user") {
            setUserKey(key);
            setIsAuthenticated(true);
            // Store the key in localStorage
            localStorage.setItem("authToken", key);
            setLoading(false);
            return true;
          }
        } catch (e) {
          // Decryption failed - invalid key
        }
      }
      
      setErrorMessage("Invalid key. Please try again.");
      setLoading(false);
      return false;
    } catch (error) {
      setErrorMessage("An error occurred during login");
      setLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUserKey("");
    setIsAuthenticated(false);
    // Clear the key from localStorage
    localStorage.removeItem("authToken");
  };

  const clearError = () => {
    setErrorMessage("");
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        loading,
        errorMessage,
        userKey,
        login,
        logout,
        clearError,
        storeTestKey, // For testing only
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};