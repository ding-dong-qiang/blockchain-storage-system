"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Home() {
  const router = useRouter();
  const [keyToken, setKeyToken] = useState("");

  const handleLogin = () => {
    if (keyToken.trim()) {
      // Perform any token verification here
      router.push("/files");
    } else {
      alert("Please enter a valid key token!");
    }
  };
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold text-black text-center">
        Welcome to Blockchain Cloud Storage
      </h1>
      <p className="text-gray-600 text-lg mt-2">
        Manage your files securely on the blockchain.
      </p>

      <input
        type="text"
        placeholder="Enter your key token"
        className="mt-4 px-4 py-2 border rounded"
        value={keyToken}
        onChange={(e) => setKeyToken(e.target.value)}
      />
      <button
        onClick={handleLogin}
        className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600"
      >
        Login
      </button>
    </div>
  );
}
