"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/authContext";
import {
  createFile,
  updateFile,
  deleteFile,
  getAllFiles,
  getFileById,
  FileData,
  IPFSState,
  handleIPFSUpdate,
} from "../utils/fileStorage";

export default function FileManager() {
  const { isAuthenticated, logout } = useAuth();
  const router = useRouter();

  const [files, setFiles] = useState<FileData[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileData | null>(null);
  const [fileContent, setFileContent] = useState("");
  const [message, setMessage] = useState("");
  const [cid, setCid] = useState<string | null>(null);
  const fileListRef = useRef<HTMLUListElement>(null);

  // 从localStorage加载cid
  useEffect(() => {
    const savedCid = localStorage.getItem("lastCid");
    if (savedCid) {
      console.log("从localStorage加载CID:", savedCid);
      setCid(savedCid);
    }
  }, []);

  // 当cid变化时保存到localStorage
  useEffect(() => {
    if (cid) {
      console.log("保存CID到localStorage:", cid);
      localStorage.setItem("lastCid", cid);
    }
  }, [cid]);

  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated) {
      router.push("/");
      return;
    }

    // If authenticated, update the file list
    updateFileList();
  }, [isAuthenticated, router]);

  const updateFileList = async () => {
    try {
      const allFiles = await getAllFiles();
      setFiles(allFiles);
    } catch (error) {
      console.error("Error updating file list:", error);
      setMessage("Failed to load file list");
    }
  };

  const handleLoad = async (file: FileData) => {
    try {
      const fileData = await getFileById(file.id);
      if (!fileData) {
        setMessage("File not found");
        setFileContent("");
        return;
      }
      setSelectedFile(fileData);
      setFileContent(fileData.content);
      setMessage("File loaded successfully");
    } catch (error) {
      console.error("Error loading file:", error);
      setMessage("Failed to load file");
      setFileContent("");
    }
  };

  const handleSave = async () => {
    if (!selectedFile) {
      setMessage("No file selected");
      return;
    }
    try {
      console.log("开始保存文件");

      // 检查localStorage中是否有authToken
      const authToken = localStorage.getItem("authToken");
      console.log(
        "保存文件时，从localStorage获取的authToken:",
        authToken ? "已找到" : "未找到"
      );

      // 检查当前cid状态
      console.log("当前CID状态:", cid);

      const ipfsState: IPFSState = { cid, setCid };
      console.log("准备调用updateFile函数，传递CID:", cid);
      await updateFile(selectedFile.id, fileContent, ipfsState);
      console.log("updateFile函数调用完成，新CID:", cid);
      await updateFileList();
      setMessage("File saved successfully");
    } catch (error) {
      console.error("Error saving file:", error);
      setMessage("Failed to save file");
    }
  };

  const handleDelete = async () => {
    if (!selectedFile) {
      setMessage("Please select a file to delete");
      return;
    }

    try {
      console.log("开始删除文件");
      console.log("当前CID状态:", cid);

      const ipfsState: IPFSState = { cid, setCid };
      await deleteFile(selectedFile.id);
      console.log("文件已从本地删除，准备更新IPFS");
      await handleIPFSUpdate(ipfsState);
      console.log("IPFS更新完成，新CID:", cid);
      await updateFileList();
      setFileContent("");
      setSelectedFile(null);
      setMessage("File deleted successfully");
    } catch (error) {
      console.error("Error deleting file:", error);
      setMessage("Failed to delete file");
    }
  };

  const handleCreateFile = async () => {
    const newFileName = prompt("Enter new filename:");
    if (!newFileName || !newFileName.trim()) {
      setMessage("Filename cannot be empty");
      return;
    }

    try {
      const trimmedName = newFileName.trim();
      const files = await getAllFiles();
      const exists = files.some((f) => f.title === trimmedName);

      if (exists) {
        const action = confirm(
          `File "${trimmedName}" already exists.\nClick OK to create with a new name, or Cancel to skip.`
        );

        if (!action) {
          setMessage("File creation cancelled");
          return;
        }

        // Add a suffix to make the filename unique
        let counter = 1;
        let newName = trimmedName;
        while (files.some((f) => f.title === newName)) {
          newName = `${trimmedName} (${counter})`;
          counter++;
        }

        const newFile = await createFile(newName);
        await updateFileList();
        setSelectedFile(newFile);
        setFileContent("");
        setMessage(`File '${newName}' created successfully`);
      } else {
        const newFile = await createFile(trimmedName);
        await updateFileList();
        setSelectedFile(newFile);
        setFileContent("");
        setMessage(`File '${trimmedName}' created successfully`);
      }
    } catch (error) {
      console.error("Error creating file:", error);
      setMessage("Failed to create file");
    }
  };

  return (
    <div className="flex flex-col min-h-screen p-6 bg-white text-black max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-4">File Manager</h1>

      <div className="flex space-x-4 mb-4">
        <div className="w-1/4 bg-gray-100 p-4 shadow text-black border border-gray-400 max-h-64 flex flex-col overflow-hidden">
          <h2 className="text-sm font-semibold bg-gray-100 p-1 text-left mb-1 underline">
            File List
          </h2>
          <ul ref={fileListRef} className="overflow-y-scroll max-h-56 pl-1">
            {files.map((file) => (
              <li
                key={file.id}
                className={`cursor-pointer text-sm break-words overflow-hidden w-full p-1 ${
                  selectedFile?.id === file.id
                    ? "bg-gray-300 text-black font-bold"
                    : "text-black hover:bg-gray-200"
                }`}
                onClick={() => handleLoad(file)}
              >
                {file.title}
              </li>
            ))}
          </ul>
        </div>

        <textarea
          className="w-3/4 p-2 border h-64 text-black border-gray-400 overflow-y-scroll resize-none bg-gray-100"
          value={fileContent}
          onChange={(e) => setFileContent(e.target.value)}
          placeholder="Enter file content here..."
        />
      </div>

      <div className="flex justify-center space-x-4">
        <button
          onClick={handleCreateFile}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          New File
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          disabled={!selectedFile}
        >
          Save
        </button>
        <button
          onClick={handleDelete}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          disabled={!selectedFile}
        >
          Delete
        </button>
      </div>

      {message && <div className="mt-4 p-2 text-center text-sm">{message}</div>}

      <button
        onClick={() => {
          logout();
          router.push("/");
        }}
        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 mt-4"
      >
        Logout
      </button>
    </div>
  );
}
