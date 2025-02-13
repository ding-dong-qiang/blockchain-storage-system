"use client";

import { useState, useEffect } from "react";
import { saveFile, loadFile, deleteFile } from "../utils/fileStorage";

export default function FileManager() {
  const [fileName, setFileName] = useState("");
  const [fileContent, setFileContent] = useState("");
  const [message, setMessage] = useState("");
  const [fileList, setFileList] = useState<string[]>([]);

  useEffect(() => {
    const keys = Object.keys(localStorage);
    const sortedFiles = keys
      .map((key) => ({
        name: key,
        createdAt: JSON.parse(localStorage.getItem(key) || "{}").createdAt || 0,
      }))
      .sort((a, b) => a.createdAt - b.createdAt)
      .map((file) => file.name);
    setFileList(sortedFiles);
  }, [fileName]);

  const handleLoad = async (name: string) => {
    setFileName(name);
    const storedData = await loadFile(name);
    try {
      const parsedData = JSON.parse(storedData || "{}");
      setFileContent(parsedData.content || "");
      setMessage(
        parsedData.content ? "File loaded successfully." : "File not found."
      );
    } catch (error) {
      setFileContent(storedData || "");
      setMessage(storedData ? "File loaded successfully." : "File not found.");
    }
  };

  const handleSave = async () => {
    if (!fileName) {
      setMessage("Please enter a file name.");
      return;
    }
    const timestamp = Date.now();
    await saveFile(
      fileName,
      JSON.stringify({ content: fileContent, createdAt: timestamp })
    );
    setFileList([...new Set([...fileList, fileName])]);
    setMessage("File saved successfully.");
  };

  const handleDelete = async () => {
    if (!fileName) {
      setMessage("File must be selected in order to delete.");
      return;
    }
    await deleteFile(fileName);
    setFileList(fileList.filter((f) => f !== fileName));
    setFileContent("");
    setMessage("File deleted successfully.");
  };

  const handleCreateFile = async () => {
    const newFileName = prompt("Enter a new file name:");
    if (newFileName) {
      const timestamp = Date.now();
      await saveFile(
        newFileName,
        JSON.stringify({ content: "", createdAt: timestamp })
      );
      const updatedFiles = Object.keys(localStorage)
        .map((key) => ({
          name: key,
          createdAt:
            JSON.parse(localStorage.getItem(key) || "{}").createdAt || 0,
        }))
        .sort((a, b) => a.createdAt - b.createdAt)
        .map((file) => file.name);
      setFileList(updatedFiles);
      setFileName(newFileName);
      setFileContent("");
      setMessage(`File '${newFileName}' created.`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen p-6 bg-gray-100 text-black max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-4">File Manager</h1>

      <div className="flex space-x-4 mb-4">
        <div className="w-1/4 bg-white p-4 rounded shadow text-black border border-gray-400 max-h-64 flex flex-col overflow-hidden">
          <h2 className="text-sm font-semibold bg-white p-1 text-left mb-1">
            Files
          </h2>
          <ul className="overflow-y-auto max-h-56 pl-1">
            {fileList.map((file) => (
              <li
                key={file}
                className="cursor-pointer text-blue-600 hover:underline break-words overflow-hidden w-full text-sm"
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
          onClick={handleCreateFile}
          className="px-4 py-1 bg-violet-700 text-black rounded hover:bg-violet-800"
        >
          Create File
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-1 bg-violet-700 text-black rounded hover:bg-violet-800"
        >
          Save
        </button>
        <button
          onClick={handleDelete}
          className="px-4 py-1 bg-violet-700 text-black rounded hover:bg-violet-800"
        >
          Delete
        </button>
      </div>
      {message && <p className="mt-4 text-black">{message}</p>}
    </div>
  );
}
