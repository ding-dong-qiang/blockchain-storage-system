"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import {
  encryptWithKey,
  decryptWithKey,
  generateKeyPair,
} from "../files/utils/encryption";
import axios from "axios";
import CryptoJS from "crypto-js";

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

  // 通过私钥计算公钥
  const calculatePublicKey = (privateKey: string) => {
    // 使用CryptoJS.SHA256计算公钥
    return CryptoJS.SHA256(privateKey).toString();
  };

  // 检查远程服务器上是否存在公钥文件
  const checkPublicKeyOnServer = async (
    publicKey: string
  ): Promise<boolean> => {
    try {
      // 这里我们需要一个API端点来检查公钥是否存在
      // 假设我们有一个API端点 /api/ipfs/check-key 可以检查公钥
      const response = await axios.get(
        `/api/ipfs/check-key?publicKey=${publicKey}`
      );

      // 如果API返回成功，表示找到了公钥
      return response.data.exists === true;
    } catch (error) {
      console.error("检查公钥失败:", error);
      return false;
    }
  };

  const login = async (key: string): Promise<boolean> => {
    setLoading(true);
    setErrorMessage("");

    try {
      // 1. 计算输入私钥对应的公钥
      const publicKey = calculatePublicKey(key);

      // 2. 检查远程服务器上是否存在该公钥的JSON文件
      const keyExists = await checkPublicKeyOnServer(publicKey);

      if (keyExists) {
        // 公钥存在，验证成功
        setUserKey(key);
        setIsAuthenticated(true);
        // 存储密钥到localStorage
        localStorage.setItem("authToken", key);
        setLoading(false);
        return true;
      }

      // 如果远程验证失败，尝试使用测试逻辑（保留原有逻辑作为备选）
      const testEncrypted = TEST_ENCRYPTED_VALUES[key];

      if (testEncrypted) {
        try {
          const decrypted = decryptWithKey(testEncrypted, key);

          if (decrypted === "valid_user") {
            setUserKey(key);
            setIsAuthenticated(true);
            localStorage.setItem("authToken", key);
            setLoading(false);
            return true;
          }
        } catch (e) {
          // 解密失败 - 无效密钥
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
