"use client";

import { useState, useEffect, MouseEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./context/authContext";
import Link from "next/link";

export default function Home() {
  const router = useRouter();
  const { login, isAuthenticated, errorMessage, loading, clearError } =
    useAuth();
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
            id="key"
            name="key"
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

          <Link href="context/testKey">
            <button className="ml-4 px-6 py-2 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 active:scale-95">
              Create Key
            </button>
          </Link>
        </div>

        {errorMessage && (
          <p className="text-red-500 text-sm mt-4 text-center">
            {errorMessage}
          </p>
        )}

        <div className="mt-32 text-center">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-xl shadow-sm max-w-3xl mx-auto">
            <p className="text-gray-700 text-lg mb-6">
              This is a group project for the INTP-302-A course.
            </p>
            <div className="space-y-4">
              <div>
                <h3 className="text-gray-700 font-semibold mb-3">
                  Development Team
                </h3>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div className="p-2 bg-white bg-opacity-50 rounded">
                    Dong Chen
                  </div>
                  <div className="p-2 bg-white bg-opacity-50 rounded">
                    Christin Racicot
                  </div>
                  <div className="p-2 bg-white bg-opacity-50 rounded">
                    Kun Zheng
                  </div>
                  <div className="p-2 bg-white bg-opacity-50 rounded">
                    Jiaping Liu
                  </div>
                  <div className="p-2 bg-white bg-opacity-50 rounded">
                    Ruili Hu
                  </div>
                  <div className="p-2 bg-white bg-opacity-50 rounded">
                    James Romar Tuling
                  </div>
                  <div className="p-2 bg-white bg-opacity-50 rounded">
                    Yifang Wu
                  </div>
                  <div className="p-2 bg-white bg-opacity-50 rounded">
                    Yan Ling Lok
                  </div>
                  <div className="p-2 bg-white bg-opacity-50 rounded">
                    Yuan Lyu
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-gray-700 font-medium">
                  Advisor: <span className="text-blue-600">Iles W. Wade</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
