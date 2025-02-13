"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { generateAccessKey } from "./files/utils/fileStorage";

export default function Home() {
  const [accessKey, setAccessKey] = useState("");
  const router = useRouter();
  const isValidAccessKey = (key: string) => 
    /^[A-Za-z0-9]{32}$/.test(key) && /[A-Za-z]/.test(key) && /[0-9]/.test(key);

  // Handle enter FileManager
  const handleEnter = () => {
    if (!accessKey.trim()) {
      alert("Please enter or generate an access key.");
      return;
    }

    if (!isValidAccessKey(accessKey)) {
      alert("Invalid access key! Please put valid key or generate a new one.");
      return;
    }

    // Save access key to sessionStorage
    console.log("Storing Key:", accessKey);
    sessionStorage.setItem("accessKey", accessKey);

    // Redirect to FileManager
    console.log("Navigating to /files");
    router.push("/files");
  };

  // Generate new Access Key
  const handleGenerateKey = () => {
    const newKey = generateAccessKey();
    setAccessKey(newKey);
    alert(`Your new Access Key: ${newKey}\nPlease save this key securely!`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="bg-gray-900 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-4">Blockchain Cloud Storage</h1>
        <p className="text-gray-400 text-sm text-center">Securely store and manage your files with encryption.</p>

        {/* User input Key */}
        <input
          type="text"
          className="mt-6 w-full px-4 py-2 border border-gray-700 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-gray-500 focus:outline-none"
          placeholder="Enter your Access Key"
          value={accessKey}
          onChange={(e) => setAccessKey(e.target.value)}
        />

        <div className="mt-6 flex space-x-4">
          {/* Enter button */}
          <button
            className="w-1/2 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all duration-300 transform hover:scale-105"
            onClick={handleEnter}
          >
            Enter
          </button>

          {/* Generate Key button */}
          <button
            className="w-1/2 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-all duration-300 transform hover:scale-105"
            onClick={handleGenerateKey}
          >
            Generate Key
          </button>
        </div>
      </div>
    </div>
  );
}