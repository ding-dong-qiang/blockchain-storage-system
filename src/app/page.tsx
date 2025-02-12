'use client'

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check localStorage on the client side only
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('currentUser');
      setCurrentUser(user);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="max-w-2xl w-full space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to the File Manager App
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Securely manage and encrypt your files with ease
          </p>
        </div>

        <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 justify-center">
          <button
            onClick={() => router.push('/register')}
            className="px-8 py-3 text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            Register
          </button>
          
          <button
            onClick={() => router.push('/login')}
            className="px-8 py-3 text-base font-medium rounded-md text-blue-600 bg-white border border-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            Login
          </button>

          {/* Only show if user is logged in */}
          {currentUser && (
            <button
              onClick={() => router.push('/file-manager')}
              className="px-8 py-3 text-base font-medium rounded-md text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              File Manager
            </button>
          )}
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Your files are encrypted using AES encryption</p>
          <p>No data is stored on our servers - everything stays in your browser</p>
        </div>
      </div>
    </div>
  );
}
