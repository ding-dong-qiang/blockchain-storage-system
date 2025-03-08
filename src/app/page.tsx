"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/authContext";

export default function Home() {
  const router = useRouter();
  const { login } = useAuth(); // Access the login function from AuthContext
  const [keyToken, setKeyToken] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = () => {
    // Attempt to log in with the entered token
    if (keyToken.trim()) {
      login(keyToken); // Use the login function from context

      // If login is successful, navigate to the /files route
      router.push("/files");
    } else {
      setErrorMessage("Please enter a valid token!");
    }
  };

  return (
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
          placeholder="Enter your key token"
          className="px-4 py-2 border rounded text-gray-800"
          value={keyToken}
          onChange={(e) => setKeyToken(e.target.value)}
        />
        
        <button
          onClick={handleLogin}
          className="ml-4 px-6 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600"
        >
          Login
        </button>
      </div>

      {errorMessage && (
        <p className="text-red-500 text-sm mt-4 text-center">{errorMessage}</p>
      )}
    </div>
  );
}
