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
  saveFileData,
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
  const [showNewFileDialog, setShowNewFileDialog] = useState(false);
  const [newFileName, setNewFileName] = useState("");

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

  // 添加一个事件监听器，用于监听filesUpdated事件
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleFilesUpdated = () => {
      console.log("收到filesUpdated事件，开始更新文件列表");
      updateFileList();
    };

    window.addEventListener("filesUpdated", handleFilesUpdated);

    return () => {
      window.removeEventListener("filesUpdated", handleFilesUpdated);
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (!selectedFile) return;
    if (fileContent === null || fileContent === undefined) return;

    console.log("开始保存文件内容");
    console.log("fileContent", fileContent);

    const timeoutId = setTimeout(() => {
      try {
        saveFileData(selectedFile.id, fileContent);
        console.log("文件保存成功");
      } catch (error) {
        console.error("保存文件时出错:", error);
      }
    }, 1000);

    return () => {
      console.log("清除之前的定时器");
      clearTimeout(timeoutId);
    };
  }, [fileContent]);

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

      // 从localStorage中重新获取最新的CID值
      const savedCid = localStorage.getItem("lastCid");
      if (savedCid && savedCid !== cid) {
        console.log("从localStorage获取到新的CID值:", savedCid);
        setCid(savedCid);
      }

      // 检查当前cid状态
      console.log("当前CID状态:", savedCid || cid);

      // 使用从localStorage获取的CID值创建ipfsState对象
      const ipfsState: IPFSState = { cid: savedCid || cid, setCid };
      console.log("准备调用updateFile函数，传递CID:", savedCid || cid);
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
    setShowNewFileDialog(true);
    setNewFileName("");
  };

  const handleNewFileSubmit = async () => {
    if (!newFileName || !newFileName.trim()) {
      setMessage("文件名不能为空");
      return;
    }

    try {
      const trimmedName = newFileName.trim();
      const files = await getAllFiles();
      const exists = files.some((f) => f.title === trimmedName);

      if (exists) {
        const action = confirm(
          `The file "${trimmedName}" already exists.\nClick OK to create a new name, or Cancel to skip.`
        );

        if (!action) {
          setMessage("File creation has been canceled.");
          setShowNewFileDialog(false);
          return;
        }

        // 添加后缀使文件名唯一
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
      setShowNewFileDialog(false);
    } catch (error) {
      console.error("Error creating file:", error);
      setMessage("Failed to create file");
    }
  };

  // 清除所有本地存储数据
  const clearAllLocalData = () => {
    console.log("开始清除所有本地存储数据");

    try {
      // 保存一下需要保留的数据（如果有的话）
      // const dataToKeep = {}; // 如果有需要保留的数据，可以在这里保存

      // 一次性清除所有localStorage数据
      localStorage.clear();
      console.log("已清除所有localStorage数据");

      // 清除sessionStorage数据（如果有使用的话）
      sessionStorage.clear();
      console.log("已清除所有sessionStorage数据");

      // 尝试清除IndexedDB数据（如果有使用的话）
      const clearIndexedDB = async () => {
        try {
          const databases = await window.indexedDB.databases();
          databases.forEach((db) => {
            if (db.name) {
              window.indexedDB.deleteDatabase(db.name);
              console.log(`已删除IndexedDB数据库: ${db.name}`);
            }
          });
        } catch (error) {
          console.error("清除IndexedDB时出错:", error);
        }
      };

      // 尝试执行IndexedDB清除
      clearIndexedDB().catch((err) => console.error("清除IndexedDB失败:", err));

      // 清除所有cookies（如果有使用的话）
      document.cookie.split(";").forEach((cookie) => {
        const eqPos = cookie.indexOf("=");
        const name =
          eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      });
      console.log("已清除所有cookies");

      // 恢复需要保留的数据（如果有的话）
      // Object.entries(dataToKeep).forEach(([key, value]) => {
      //   localStorage.setItem(key, value);
      // });

      console.log("本地数据清除完成");
    } catch (error) {
      console.error("清除本地数据时出错:", error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen p-6 bg-white text-black max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-4">File Manager</h1>

      <div className="flex space-x-4 mb-4">
        <div className="w-1/3 bg-gray-100 p-4 shadow text-black border border-gray-400 max-h-64 flex flex-col overflow-hidden">
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
          className="w-2/3 p-2 border h-64 text-black border-gray-400 overflow-y-scroll resize-none bg-gray-100"
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
          const confirmLogout = confirm(
            "Are you sure you want to logout? Logging out will clear all local data. Make sure to save your work before proceeding."
          );
          if (confirmLogout) {
            clearAllLocalData(); // 先清除本地数据
            logout(); // 然后调用登出函数
            router.push("/");
          }
        }}
        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 mt-4"
      >
        Logout
      </button>

      {showNewFileDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Create New File</h2>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded mb-4"
              placeholder="Enter file name"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleNewFileSubmit();
                }
              }}
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowNewFileDialog(false)}
                className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleNewFileSubmit}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
