"use client";

import { useState, useEffect } from "react";
import { getFileList, saveFile, loadFile, deleteFile } from "../utils/fileStorage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function FileManager({ accessKey }: { accessKey: string }) {
  const [fileList, setFileList] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>("");

  // Load file list
  useEffect(() => {
    setFileList(getFileList(accessKey));
  }, [accessKey]);

  // Handle file click and decrypt content
  const handleFileClick = async (fileName: string) => {
    const content = await loadFile(fileName, accessKey);
    setSelectedFile(fileName);
    setFileContent(content || ""); // If content is null, set empty string
  };

  // Save current file
  const handleSave = async () => {
    if (!selectedFile) {
      return alert("No file selected!");
    }
    await saveFile(selectedFile, fileContent, accessKey);
    alert(`File "${selectedFile}" saved successfully!`);

    setSelectedFile(null);
    setFileContent("");
  };

  // Delete current file
  const handleDelete = async () => {
    if (!selectedFile) return alert("No file selected!");
    await deleteFile(selectedFile, accessKey);
    setFileList(getFileList(accessKey));
    setSelectedFile(null);
    setFileContent("");
  };

  // Add new file
  const handleAddFile = () => {
    const newFileName = prompt("Enter new file name:");
    if (!newFileName) {
      alert("File name cannot be empty!");
      return;
    };
    
    if (fileList.includes(newFileName)) {
      alert("File already exists!");
      return;
    }
    setFileList([...fileList, newFileName]); // Update file list
    setSelectedFile(newFileName); // Select new file
    setFileContent(""); // Clear content
  };

  return (
    <div className="flex items-center justify-center w-full min-h-screen bg-gray-900 text-white">
      <Card className="w-full max-w-[95vw] bg-gray-800 shadow-xl rounded-lg overflow-hidden">
        <CardHeader className="bg-gray-700 py-4">
          <CardTitle className="text-center text-xl text-white">File Manager</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col lg:flex-row h-[calc(100vh-8rem)] p-4">
          {/* File list */}
          <Card className="w-full lg:w-1/4 h-full lg:mr-4 mb-4 lg:mb-0 bg-gray-700 overflow-hidden flex flex-col">
            <CardHeader className="py-2">
              <CardTitle className="text-gray-300 text-lg">My Files</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto border border-gray-600 rounded-lg p-2">
              <ul className="space-y-2">
                {fileList.map((file) => (
                  <li
                    key={file}
                    onClick={() => handleFileClick(file)}
                    className={`p-2 cursor-pointer rounded-md transition-all ${
                      selectedFile === file ? "bg-gray-500 text-white" : "hover:bg-gray-600 text-gray-300"
                    }`}
                  >
                    {file}
                  </li>
                ))}
              </ul>
            </CardContent>
            <div className="px-2 py-4">
            <button
              className="mt-4 w-full bg-gray-800 hover:bg-gray-900 text-white py-2 rounded-md transition duration-200"
              onClick={handleAddFile}
            >
              + Add File
            </button>
            </div>
          </Card>

          {/* File content editing area */}
          <Card className="w-full lg:w-3/4 h-full bg-gray-700 flex flex-col">
            <CardHeader className="py-2">
              <CardTitle className="text-gray-300 text-lg">
                {selectedFile ? `Editing: ${selectedFile}` : "Select a file to view or edit"}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col space-y-4">
              {/* Textarea */}
              <textarea
                className="w-full p-4 flex-1 bg-gray-600 text-white border border-gray-500 rounded-md focus:ring-2 focus:ring-blue-400 focus:outline-none resize-none"
                value={fileContent}
                onChange={(e) => setFileContent(e.target.value)}
                disabled={!selectedFile} // Disable textarea if no file selected
              />
              {/* Save & Delete Buttons */}
              <div className="flex justify-end space-x-4">
                <button
                  className={`w-1/3 rounded-md transition duration-200 ${
                    selectedFile ? "bg-gray-800 hover:bg-gray-900 text-white" : "bg-gray-500 text-gray-300 cursor-not-allowed"
                  }`}
                  onClick={handleSave}
                  disabled={!selectedFile}
                >
                  Save
                </button>
                <button
                  className={`w-1/6 py-2 rounded-md transition duration-200 ${
                    selectedFile ? "bg-red-600 hover:bg-red-700 text-white" : "bg-gray-500 text-gray-300 cursor-not-allowed"
                  }`}
                  onClick={handleDelete}
                  disabled={!selectedFile}
                >
                  Delete
                </button>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}