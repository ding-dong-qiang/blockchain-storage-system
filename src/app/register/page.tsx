'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import CryptoJS from 'crypto-js';
import Register from '../components/Register';

export default function RegisterPage() {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const router = useRouter();

  const handleRegister = () => {
    if (!username || !password) {
      setMessage('Please enter both username and password.');
      return;
    }

    if (password.length < 6) {
      setMessage('Password must be at least 6 characters long.');
      return;
    }

    try {
      // Check if username already exists
      if (localStorage.getItem(username)) {
        setMessage('Username already exists. Please choose another one.');
        return;
      }

      // Generate a random AES key
      const aesKey = CryptoJS.lib.WordArray.random(16).toString();

      // Encrypt the AES key with the password
      const encryptedKey = CryptoJS.AES.encrypt(aesKey, password).toString();

      // Store the encrypted AES key in localStorage
      localStorage.setItem(username, encryptedKey);

      setMessage(`User ${username} registered successfully!`);

      // Redirect to login page after a short delay
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } catch (error) {
      setMessage('An error occurred during registration. Please try again.');
    }
  };

  return (
    <Register
      username={username}
      password={password}
      message={message}
      onUsernameChange={setUsername}
      onPasswordChange={setPassword}
      onRegister={handleRegister}
    />
  );
}