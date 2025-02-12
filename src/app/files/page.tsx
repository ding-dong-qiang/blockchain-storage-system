"use client";

import { useState } from "react";
import FileManager from "./components/FileManager";

export default function Page() {
  const [accessKey, setAccessKey] = useState("");
  const [useGeneratedKey, setUseGeneratedKey] = useState(false);
  const [showFileManager, setShowFileManager] = useState(false);

  const handleEnter = () => {
    if (!accessKey.trim()) {
      alert("Please enter a valid access key or generate a new one.");
      return;
    }
    setShowFileManager(true);
  };

  const handleGenerateKey = () => {
    setUseGeneratedKey(true);
    setShowFileManager(true);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-900">
      {!showFileManager ? (
        <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md text-center">
          <h1 className="text-2xl font-bold mb-4">Decentralized File Storage</h1>
          <p className="text-sm text-gray-600 mb-4">
            Enter your access key to manage your files, or create a new one.
          </p>

          <input
            type="text"
            placeholder="Enter access key"
            value={accessKey}
            onChange={(e) => setAccessKey(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <div className="flex justify-between mt-4 space-x-2">
            <button
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition duration-200 w-1/2"
              onClick={handleEnter}
            >
              Enter
            </button>
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition duration-200 w-1/2"
              onClick={handleGenerateKey}
            >
              Create New Key
            </button>
          </div>
        </div>
      ) : (
        <FileManager accessKey={accessKey} autoGenerate={useGeneratedKey} onBack={() => setShowFileManager(false)} />
      )}
    </div>
  );
}