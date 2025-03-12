import { encryptWithKey, decryptWithKey } from "./encryption";
import axios from "axios";
import { Dispatch, SetStateAction } from "react";
import CryptoJS from "crypto-js";
/**
 * Interface for file data structure
 */
export interface FileData {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

/**
 * Interface for combined file data for IPFS
 */
interface IPFSFileData {
  filename: string;
  content: string;
}

/**
 * Interface for IPFS state management
 */
export interface IPFSState {
  cid: string | null;
  setCid: Dispatch<SetStateAction<string | null>>;
}

// Constants for storage keys
const FILE_PREFIX = "file_";
const FILE_INDEX_KEY = "file_index";

/**
 * Interface for file index structure
 * Maps file IDs to their metadata
 */
interface FileIndex {
  [id: string]: {
    title: string;
    createdAt: number;
  };
}

/**
 * Get the file index from storage
 * Returns an empty object if no index exists or on error
 */
function getFileIndex(): FileIndex {
  try {
    const encryptedIndex = localStorage.getItem(FILE_INDEX_KEY);
    if (!encryptedIndex) return {};

    const decrypted = decryptWithKey(encryptedIndex);
    return JSON.parse(decrypted);
  } catch (error) {
    console.error("Error getting file index:", error);
    return {};
  }
}

/**
 * Save the file index to storage
 * Encrypts the index before saving
 */
function saveFileIndex(index: FileIndex): void {
  try {
    const indexStr = JSON.stringify(index);
    const encrypted = encryptWithKey(indexStr);
    localStorage.setItem(FILE_INDEX_KEY, encrypted);
  } catch (error) {
    console.error("Error saving file index:", error);
    throw new Error("Failed to save file index");
  }
}

/**
 * Get encrypted file data from storage
 * Returns null if file doesn't exist or on error
 */
function getFileData(id: string): string | null {
  try {
    const encrypted = localStorage.getItem(`${FILE_PREFIX}${id}`);
    if (!encrypted) return null;
    return encrypted; // Return raw encrypted data without decryption
  } catch (error) {
    console.error("Error getting file data:", error);
    return null;
  }
}

/**
 * Save encrypted file data to storage
 */
export function saveFileData(id: string, content: string): void {
  try {
    const encrypted = encryptWithKey(content);
    localStorage.setItem(`${FILE_PREFIX}${id}`, encrypted);
  } catch (error) {
    console.error("Error saving file data:", error);
    throw new Error("Failed to save file data");
  }
}

/**
 * Get all files from storage
 * Returns an array of FileData objects sorted by creation time
 */
export async function getAllFiles(): Promise<FileData[]> {
  try {
    const index = getFileIndex();
    const files: FileData[] = [];

    for (const [id, info] of Object.entries(index)) {
      const encrypted = getFileData(id);
      if (encrypted !== null) {
        const content = decryptWithKey(encrypted);
        files.push({
          id,
          title: info.title,
          content,
          createdAt: info.createdAt,
          updatedAt: info.createdAt,
        });
      }
    }

    return files.sort((a, b) => b.createdAt - a.createdAt);
  } catch (error) {
    console.error("Error getting all files:", error);
    return [];
  }
}

/**
 * Get a specific file by ID
 * Returns null if file doesn't exist or on error
 */
export async function getFileById(id: string): Promise<FileData | null> {
  try {
    const index = getFileIndex();
    const fileInfo = index[id];
    if (!fileInfo) return null;

    const encrypted = getFileData(id);
    if (encrypted === null) return null;

    const content = decryptWithKey(encrypted);
    return {
      id,
      title: fileInfo.title,
      content,
      createdAt: fileInfo.createdAt,
      updatedAt: fileInfo.createdAt,
    };
  } catch (error) {
    console.error("Error getting file:", error);
    return null;
  }
}

/**
 * Create a new file
 * Generates a unique ID and stores both file data and index entry
 */
export async function createFile(
  title: string,
  content: string = ""
): Promise<FileData> {
  try {
    const index = getFileIndex();
    const id = generateId();
    const now = Date.now();

    // Update index
    index[id] = {
      title,
      createdAt: now,
    };
    saveFileIndex(index);

    // Save file content
    saveFileData(id, content);

    return {
      id,
      title,
      content,
      createdAt: now,
      updatedAt: now,
    };
  } catch (error) {
    console.error("Error creating file:", error);
    throw error;
  }
}

/**
 * Update an existing file's content
 * Throws error if file doesn't exist
 */
export async function updateFile(
  id: string,
  content: string,
  ipfsState?: IPFSState
): Promise<FileData> {
  try {
    console.log("updateFile - 开始执行");
    const index = getFileIndex();
    const fileInfo = index[id];

    if (!fileInfo) {
      throw new Error("File not found");
    }

    // Save new content
    saveFileData(id, content);

    const fileData = {
      id,
      title: fileInfo.title,
      content,
      createdAt: fileInfo.createdAt,
      updatedAt: Date.now(),
    };
    console.log("文件内容已更新");

    // Handle IPFS synchronization if ipfsState is provided
    if (ipfsState) {
      console.log("ipfsState存在，准备调用handleIPFSUpdate");
      try {
        await handleIPFSUpdate(ipfsState);
        console.log("handleIPFSUpdate调用完成");
      } catch (error) {
        console.error("Failed to sync with IPFS:", error);
        // Continue with local update even if IPFS sync fails
      }
    } else {
      console.log("ipfsState不存在，跳过IPFS同步");
    }

    return fileData;
  } catch (error) {
    console.error("Error updating file:", error);
    throw error;
  }
}

/**
 * Delete a file and its index entry
 * Throws error if file doesn't exist
 */
export async function deleteFile(id: string): Promise<void> {
  try {
    const index = getFileIndex();

    if (!index[id]) {
      throw new Error("File not found");
    }

    // Remove from index
    delete index[id];
    saveFileIndex(index);

    // Remove file content
    localStorage.removeItem(`${FILE_PREFIX}${id}`);
  } catch (error) {
    console.error("Error deleting file:", error);
    throw error;
  }
}

/**
 * Rename a file
 * Throws error if file doesn't exist or if a file with the new title already exists
 */
export async function renameFile(
  id: string,
  newTitle: string
): Promise<FileData> {
  try {
    const index = getFileIndex();

    // Check for duplicate title
    if (Object.values(index).some((file) => file.title === newTitle)) {
      throw new Error("File with this title already exists");
    }

    if (!index[id]) {
      throw new Error("File not found");
    }

    // Update index
    index[id] = {
      ...index[id],
      title: newTitle,
    };
    saveFileIndex(index);

    // Get current content
    const encryptedContent = getFileData(id);
    if (!encryptedContent) {
      throw new Error("File content not found");
    }

    const content = decryptWithKey(encryptedContent);
    return {
      id,
      title: newTitle,
      content,
      createdAt: index[id].createdAt,
      updatedAt: Date.now(),
    };
  } catch (error) {
    console.error("Error renaming file:", error);
    throw error;
  }
}

/**
 * Generate a unique ID using timestamp and random string
 */
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Combine all files into a single JSON file for IPFS
 */
async function getAllFilesForIPFS(): Promise<IPFSFileData[]> {
  const index = getFileIndex();
  const files: IPFSFileData[] = [];

  for (const [id, info] of Object.entries(index)) {
    const encrypted = getFileData(id);
    if (encrypted !== null) {
      files.push({
        filename: info.title,
        content: encrypted, // Use encrypted content directly for IPFS
      });
    }
  }

  return files;
}

/**
 * Calculate public key from private key
 */
function calculatePublicKey(privateKey: string): string {
  console.log("calculatePublicKey - 开始计算公钥");
  console.log("privateKey类型:", typeof privateKey);
  console.log("privateKey长度:", privateKey.length);

  try {
    const publicKey = CryptoJS.SHA256(privateKey).toString();
    console.log("计算完成，公钥前10位:", publicKey.substring(0, 10) + "...");
    return publicKey;
  } catch (error) {
    console.error("计算公钥时出错:", error);
    throw error;
  }
}

/**
 * Handle IPFS file upload and deletion
 */
export async function handleIPFSUpdate(ipfsState: IPFSState): Promise<void> {
  try {
    console.log("handleIPFSUpdate - 开始执行");
    // Combine all files into one JSON
    const allFiles = await getAllFilesForIPFS();
    const combinedContent = JSON.stringify(allFiles);

    // If there's an existing CID, delete the old file first
    if (ipfsState.cid) {
      console.log("发现现有CID:", ipfsState.cid);
      try {
        console.log("准备删除旧文件，CID:", ipfsState.cid);
        const deleteResponse = await axios.delete("/api/ipfs/delete", {
          data: { cid: ipfsState.cid },
        });
        console.log("删除旧文件响应:", deleteResponse.data);
      } catch (error: any) {
        console.error("删除旧文件时出错:", error);
        if (error.response) {
          console.error("错误响应数据:", error.response.data);
          console.error("错误响应状态:", error.response.status);
        }
      }
    } else {
      console.log("没有现有CID，跳过删除步骤");
    }

    console.log("准备上传新文件");

    // 检查localStorage中是否有authToken
    const authToken = localStorage.getItem("authToken");
    console.log(
      "从localStorage获取的authToken:",
      authToken ? "已找到" : "未找到"
    );

    // Generate file name based on user's public key
    let fileName = "combined_files.json"; // Default fallback

    if (authToken) {
      // Calculate public key from private key
      const publicKey = calculatePublicKey(authToken);
      console.log("计算得到的公钥前10位:", publicKey.substring(0, 10) + "...");
      fileName = `${publicKey}.json`;
      console.log("使用的文件名:", fileName);
    } else {
      console.log("未找到authToken，使用默认文件名:", fileName);
    }

    // Upload the new combined file
    const formData = new FormData();
    formData.append(
      "file",
      new Blob([combinedContent], { type: "application/json" })
    );
    formData.append("fileName", fileName);
    formData.append("accessKey", "public"); // Using public access

    // 检查formData中的fileName是否被正确设置
    console.log("检查formData中的fileName");
    try {
      for (const pair of formData.entries()) {
        console.log(
          `${pair[0]}: ${typeof pair[1] === "object" ? "[Blob/File]" : pair[1]}`
        );
      }
    } catch (error) {
      console.error("无法遍历formData:", error);
    }

    console.log("开始上传，使用文件名:", fileName);
    const response = await axios.post("/api/ipfs/upload", formData);
    console.log("上传完成，获取到新CID:", response.data.cid);

    // 更新ipfsState中的cid
    const oldCid = ipfsState.cid;
    ipfsState.setCid(response.data.cid);
    console.log("CID已更新:", oldCid, "->", response.data.cid);

    console.log("上传完成，CID:", response.data.cid);
  } catch (error) {
    console.error("Error handling IPFS update:", error);
    throw error;
  }
}
