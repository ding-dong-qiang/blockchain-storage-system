import { encryptWithKey, decryptWithKey } from "./encryption";
import axios from "axios";
import { Dispatch, SetStateAction } from "react";
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
function saveFileData(id: string, content: string): void {
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
    console.log("update file");

    // Handle IPFS synchronization if ipfsState is provided
    if (ipfsState) {
      try {
        await handleIPFSUpdate(ipfsState);
      } catch (error) {
        console.error("Failed to sync with IPFS:", error);
        // Continue with local update even if IPFS sync fails
      }
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
 * Handle IPFS file upload and deletion
 */
async function handleIPFSUpdate(ipfsState: IPFSState): Promise<void> {
  try {
    console.log("handleIPFSUpdate");
    // Combine all files into one JSON
    const allFiles = await getAllFilesForIPFS();
    const combinedContent = JSON.stringify(allFiles);

    // If there's an existing CID, delete the old file first
    if (ipfsState.cid) {
      try {
        console.log("delete old IPFS file");
        await axios.delete("/api/ipfs/delete", {
          data: { cid: ipfsState.cid },
        });
      } catch (error) {
        console.error("Error deleting old IPFS file:", error);
      }
    }
    console.log("upload new IPFS file");
    // Upload the new combined file
    const formData = new FormData();
    formData.append(
      "file",
      new Blob([combinedContent], { type: "application/json" })
    );
    formData.append("fileName", "combined_files.json");
    formData.append("accessKey", "your_access_key"); // You'll need to get this from somewhere

    const response = await axios.post("/api/ipfs/upload", formData);
    ipfsState.setCid(response.data.cid);
  } catch (error) {
    console.error("Error handling IPFS update:", error);
    throw error;
  }
}
