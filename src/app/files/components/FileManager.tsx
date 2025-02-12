"use client";

import { useState } from "react";
import { saveFile, loadFile, deleteFile, generateAccessKey } from "../utils/fileStorage";

export default function FileManager({ accessKey, autoGenerate, onBack }: { accessKey: string; autoGenerate: boolean; onBack: () => void }) {
  const [fileName, setFileName] = useState("");
  const [fileContent, setFileContent] = useState("");
  const [message, setMessage] = useState("");
  const [generatedAccessKey, setGeneratedAccessKey] = useState(accessKey);

  const handleSave = async () => {
    if (!fileName.trim() || !fileContent.trim()) {
      return alert("Please enter file name and content");
    }

    let finalAccessKey = generatedAccessKey;
    if (!generatedAccessKey && autoGenerate) {
      finalAccessKey = generateAccessKey(); 
      setGeneratedAccessKey(finalAccessKey);
      alert(`Your new Access Key: ${finalAccessKey}\nPlease save this key, as it cannot be recovered!`);
    }

    await saveFile(fileName, fileContent, finalAccessKey);
    setMessage(`File "${fileName}" saved successfully!`);
  };

  const handleLoad = async () => {
    if (!fileName.trim()) {
      return alert("Please enter file name");
    }
    if (!generatedAccessKey) {
      return alert("Missing access key.");
    }

    const content = await loadFile(fileName, generatedAccessKey);
    if (content === null) {
      return setMessage(`File "${fileName}" not found or access key is incorrect`);
    }

    setFileContent(content);
    setMessage(`File "${fileName}" loaded successfully`);
  };

  const handleDelete = async () => {
    await deleteFile(fileName, generatedAccessKey);
    setMessage(`File "${fileName}" deleted`);
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-xl font-bold text-center text-gray-800 mb-4">File Manager</h2>

      {generatedAccessKey && (
        <div className="mb-4 p-3 bg-gray-100 rounded-md text-center">
          <p className="text-sm text-gray-700 font-semibold">Your Access Key:</p>
          <p className="text-sm text-blue-500 font-mono break-all">{generatedAccessKey}</p>
          <p className="text-xs text-gray-500">Save this key for future access!</p>
        </div>
      )}

      <div className="space-y-4">
        <input
          type="text"
          placeholder="File name"
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:outline-none"
        />

        <textarea
          placeholder="File content"
          value={fileContent}
          onChange={(e) => setFileContent(e.target.value)}
          className="w-full px-4 py-2 h-32 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:outline-none"
        />

        <div className="flex justify-between space-x-2">
          <button
            className="w-1/3 bg-green-500 hover:bg-green-600 text-white py-2 rounded-md transition duration-200"
            onClick={handleSave}
          >
            Save File
          </button>
          <button
            className="w-1/3 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md transition duration-200"
            onClick={handleLoad}
          >
            Load File
          </button>
          <button
            className="w-1/3 bg-red-500 hover:bg-red-600 text-white py-2 rounded-md transition duration-200"
            onClick={handleDelete}
          >
            Delete File
          </button>
        </div>
      </div>

      {message && <p className="mt-4 text-center text-sm text-gray-700">{message}</p>}

      <button
        className="mt-6 w-full bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-md transition duration-200"
        onClick={onBack}
      >
        Back to Key Input
      </button>
    </div>
  );
}