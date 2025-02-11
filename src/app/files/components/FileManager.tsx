"use client";

import { useState, useEffect } from "react";
import { saveFile, loadFile, deleteFile } from "../utils/fileStorage";

export default function FileManager() {
  const [fileName, setFileName] = useState("");
  const [fileContent, setFileContent] = useState("");
  const [message, setMessage] = useState("");
  const [fileList, setFileList] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const keys = Object.keys(localStorage);
    setFileList(keys);
  }, [fileName]);

  const handleLoad = async (name: string) => {
    setFileName(name);
    const content = await loadFile(name);
    setFileContent(content || "");
    setMessage(content ? "File loaded successfully." : "File not found.");
  };

  const handleSave = async () => {
    if (!fileName) {
      setMessage("Please enter a file name.");
      return;
    }
    await saveFile(fileName, fileContent);
    setFileList([...new Set([...fileList, fileName])]);
    setMessage("File saved successfully.");
  };

  const handleDelete = async () => {
    if (!fileName) {
      setMessage("Please enter a file name.");
      return;
    }
    await deleteFile(fileName);
    setFileList(fileList.filter((f) => f !== fileName));
    setFileContent("");
    setMessage("File deleted successfully.");
  };

  const handleExport = () => {
    const blob = new Blob([fileContent], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${fileName || "untitled"}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col min-h-screen p-6 bg-gray-100 text-black max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-4">File Manager</h1>

      <div className="flex flex-col mb-4 w-full">
        <div className="flex flex-col w-full mb-2">
          <label className="font-semibold">Search files:</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border p-2 rounded w-full text-black border-gray-400"
          />
        </div>
        <div className="flex flex-col w-full">
          <label className="font-semibold">Enter file name:</label>
          <input
            type="text"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            className="border p-2 rounded w-full text-black border-gray-400"
          />
        </div>
      </div>
      <div className="flex space-x-4 mb-4">
        <div className="w-1/4 bg-white p-4 rounded shadow text-black border border-gray-400 overflow-y-auto max-h-64">
          <h2 className="text-lg font-bold">Saved Files</h2>
          <ul>
            {fileList
              .filter((file: string) => file.includes(searchTerm))
              .map((file) => (
                <li
                  key={file}
                  className="cursor-pointer text-blue-600 hover:underline"
                  onClick={() => handleLoad(file)}
                >
                  {file}
                </li>
              ))}
          </ul>
        </div>

        <textarea
          className="w-3/4 p-2 border rounded h-64 text-black border-gray-400 overflow-y-auto resize-none"
          value={fileContent}
          onChange={(e) => setFileContent(e.target.value)}
          placeholder="File content..."
        />
      </div>
      <div className="flex space-x-2 mt-4 justify-center">
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 border border-gray-400"
        >
          Save
        </button>
        <button
          onClick={handleDelete}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 border border-gray-400"
        >
          Delete
        </button>
        <button
          onClick={handleExport}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 border border-gray-400"
        >
          Export
        </button>
      </div>
      {message && <p className="mt-4 text-red-500">{message}</p>}
    </div>
  );
}
