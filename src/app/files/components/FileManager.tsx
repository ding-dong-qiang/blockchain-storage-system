"use client";

import { useState, useEffect, useRef } from "react";
import { saveFile, loadFile, deleteFile } from "../utils/fileStorage";

export default function FileManager() {
  const [fileName, setFileName] = useState("");
  const [fileContent, setFileContent] = useState("");
  const [message, setMessage] = useState("");
  const [fileList, setFileList] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [newFileAdded, setNewFileAdded] = useState(false); // Tracks new file creation
  const fileListRef = useRef<HTMLUListElement>(null);

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

  useEffect(() => {
    // Scroll to bottom ONLY when a new file is added
    if (newFileAdded && fileListRef.current) {
      fileListRef.current.scrollTop = fileListRef.current.scrollHeight;
      setNewFileAdded(false); // Reset flag after scrolling
    }
  }, [fileList]);

  const handleLoad = async (name: string) => {
    setFileName(name);
    setSelectedFile(name);
    const storedData = await loadFile(name);

    if (storedData === null || storedData === undefined) {
      setMessage("Error: File not found.");
      setFileContent("");
      return;
    }

    try {
      const parsedData = JSON.parse(storedData);

      if (
        !parsedData ||
        typeof parsedData !== "object" ||
        !("content" in parsedData)
      ) {
        throw new Error("Invalid file format");
      }

      // ✅ Load file content (even if empty) and show "File loaded successfully"
      setFileContent(parsedData.content || ""); // Ensure empty content is valid
      setMessage("File loaded successfully.");
    } catch (error) {
      console.error("Error loading file:", error);
      setMessage("Error: File could not be parsed.");
      setFileContent("");
    }
  };

  const handleSave = async () => {
    if (!selectedFile) {
      setMessage("No file selected.");
      return;
    }
    const timestamp = Date.now();
    await saveFile(
      selectedFile,
      JSON.stringify({ content: fileContent, createdAt: timestamp })
    );
    setFileList([...new Set([...fileList, selectedFile])]);
    setMessage("File saved successfully.");
  };

  const handleDelete = async () => {
    if (!selectedFile) {
      setMessage("File must be selected in order to delete.");
      return;
    }
    await deleteFile(selectedFile);
    setFileList(fileList.filter((f) => f !== selectedFile));
    setFileContent("");
    setSelectedFile(null);
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
      setSelectedFile(newFileName);
      setNewFileAdded(true); // Flag that a new file was added
      setMessage(`File '${newFileName}' created.`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen p-6 bg-white text-black max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-4">File Manager</h1>

      <div className="flex space-x-4 mb-4">
        <div className="w-1/4 bg-gray-100 p-4 shadow text-black border border-gray-400 max-h-64 flex flex-col overflow-hidden">
          <h2 className="text-sm font-semibold bg-gray-100 p-1 text-left mb-1 underline">
            Files
          </h2>
          <ul ref={fileListRef} className="overflow-y-scroll max-h-56 pl-1">
            {fileList.map((file) => (
              <li
                key={file}
                className={`cursor-pointer text-sm break-words overflow-hidden w-full p-1 ${
                  selectedFile === file
                    ? "bg-gray-300 text-black font-bold"
                    : "text-black hover:bg-gray-200"
                }`}
                onClick={() => handleLoad(file)}
              >
                {file}
              </li>
            ))}
          </ul>
        </div>

        {/* Always shows scrollbar */}
        <textarea
          className="w-3/4 p-2 border h-64 text-black border-gray-400 overflow-y-scroll resize-none bg-gray-100"
          value={selectedFile ? fileContent : ""}
          onChange={(e) => setFileContent(e.target.value)}
          placeholder={selectedFile ? "File Content..." : "Select a File..."}
          disabled={!selectedFile}
        />
      </div>

      <div className="flex space-x-2 mt-0 justify-center">
        <button
          onClick={handleCreateFile}
          className="px-4 py-1 bg-gray-700 text-white hover:bg-gray-800 border"
        >
          Create File
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-1 bg-gray-700 text-white hover:bg-gray-800 border"
          disabled={!selectedFile}
        >
          Save
        </button>
        <button
          onClick={handleDelete}
          className="px-4 py-1 bg-gray-700 text-white hover:bg-gray-800 border"
          disabled={!selectedFile}
        >
          Delete
        </button>
      </div>

      {message && <p className="mt-4 text-gray-800">{message}</p>}
    </div>
  );
}
