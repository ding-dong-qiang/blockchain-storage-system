"use client";

import { useState, useEffect, MouseEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./context/authContext";
import Link from "next/link";

export default function Home() {
  const router = useRouter();
  const { login, isAuthenticated, errorMessage, loading, clearError } = useAuth();
  const [encryptionKey, setEncryptionKey] = useState("");

  // Redirect to files page if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/files");
    }
  }, [isAuthenticated, router]);

  // Event handler with proper type annotation
  const handleLogin = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    login(encryptionKey.trim());
  };

  // Event handler with proper type annotation
  const handleKeyChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEncryptionKey(e.target.value);
    if (errorMessage) clearError();
  };

  return (
    <div>
      <div className="flex flex-col min-h-screen bg-gray-100 p-6">
        <h1 className="text-3xl font-bold text-black text-center">
          Welcome to Blockchain Cloud Storage
        </h1>
        <p className="text-gray-600 text-lg mt-6 mb-24 text-center">
          Manage your files securely on the blockchain.
        </p>

        <div className="flex mt-4 text-center justify-center">
          <input
            type="text"
            placeholder="Enter your key"
            className="px-4 py-2 border rounded text-gray-800"
            value={encryptionKey}
            onChange={handleKeyChange}
          />

          <button
            onClick={handleLogin}
            className="ml-4 px-6 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 active:scale-95"
            disabled={loading}
          >
            {loading ? "Verifying..." : "Login"}
          </button>
        </div>

        {errorMessage && (
          <p className="text-red-500 text-sm mt-4 text-center">{errorMessage}</p>
        )}
        
      </div>
      <div className="mt-4">
      <Link href="context/testKey" className="text-blue-500 hover:underline text-sm">
        Generate key - testing purpose
      </Link>
    </div>
  </div>
  );
}