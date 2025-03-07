"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Home() {
  const router = useRouter();
  const [keyToken, setKeyToken] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Hardcoded token for validation
  const hardcodedToken = "myPrivateKey";

  const handleLogin = () => {
    if (keyToken.trim() === hardcodedToken) {
      // Perform any token verification here
      router.push("/files");
    } else {
      setErrorMessage("Invalid key token! Please enter the correct token.");
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
          className="px-4 py-2 border rounded"
          value={keyToken}
          onChange={(e) => setKeyToken(e.target.value)}
        />
        
        <button
          onClick={handleLogin}
          className="ml-20 px-6 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600"
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
