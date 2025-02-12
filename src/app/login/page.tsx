'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import CryptoJS from 'crypto-js';
import Login from '../components/Login';

export default function LoginPage() {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const router = useRouter();

  const handleLogin = () => {
    if (!username || !password) {
      setMessage('Please enter both username and password.');
      return;
    }

    try {
      // Retrieve AES key for the user
      const storedKey = localStorage.getItem(username);
      if (!storedKey) {
        setMessage('User not found. Please register first.');
        return;
      }

      try {
        // Decrypt the AES key using the entered password
        const bytes = CryptoJS.AES.decrypt(storedKey, password);
        const decryptedKey = bytes.toString(CryptoJS.enc.Utf8);

        if (!decryptedKey) {
          setMessage('Invalid password.');
          return;
        }

        // Store the AES key in localStorage under currentUser
        localStorage.setItem('currentAESKey', decryptedKey);
        localStorage.setItem('currentUser', username);

        // Navigate to file manager
        router.push('/file-manager');
      } catch (error) {
        setMessage('Invalid password.');
        return;
      }
    } catch (error) {
      setMessage('An error occurred during login. Please try again.');
    }
  };

  return (
    <Login
      username={username}
      password={password}
      message={message}
      onUsernameChange={setUsername}
      onPasswordChange={setPassword}
      onLogin={handleLogin}
    />
  );
}