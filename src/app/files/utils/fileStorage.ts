import CryptoJS from "crypto-js";
import { encryptText, decryptText } from "./encryption";

// Generate a unique 16-byte accessKey
export function generateAccessKey(): string {
  return CryptoJS.lib.WordArray.random(16).toString();
}

// Convert accessKey to accessHash
function getAccessHash(accessKey: string): string {
  return CryptoJS.SHA256(accessKey).toString();
}

// Encrypt save file list
function saveFileList(fileList: string[], accessKey: string) {
  const accessHash = getAccessHash(accessKey);
  const fileListKey = `fileList_${accessHash}`;
  const encryptedFileList = encryptText(JSON.stringify(fileList), accessHash);
  localStorage.setItem(fileListKey, encryptedFileList);
}

// Decrypt save file list
export function getFileList(accessKey: string): string[] {
  const accessHash = getAccessHash(accessKey);
  const fileListKey = `fileList_${accessHash}`;
  const encryptedFileList = localStorage.getItem(fileListKey);

  if (!encryptedFileList) return [];

  try {
    return JSON.parse(decryptText(encryptedFileList, accessHash));
  } catch {
    return [];
  }
}

// Save file and update fileList
export async function saveFile(fileName: string, content: string, accessKey: string) {
  const accessHash = getAccessHash(accessKey);
  const encryptedContent = encryptText(content, accessHash);
  localStorage.setItem(`${fileName}_${accessHash}`, encryptedContent);

  // Update file list
  let fileList = getFileList(accessKey);
  if (!fileList.includes(fileName)) {
    fileList.push(fileName);
  }
  saveFileList(fileList, accessKey);
}


// Load file
export async function loadFile(fileName: string, accessKey: string): Promise<string | null> {
  const accessHash = getAccessHash(accessKey);
  const encryptedContent = localStorage.getItem(`${fileName}_${accessHash}`);

  if (!encryptedContent) return null;
  
  return decryptText(encryptedContent, accessHash);
}

// Delete file and update fileList
export async function deleteFile(fileName: string, accessKey: string) {
  const accessHash = getAccessHash(accessKey);
  localStorage.removeItem(`${fileName}_${accessHash}`);

  // Update file list
  let fileList = getFileList(accessKey);
  fileList = fileList.filter(file => file !== fileName);
  saveFileList(fileList, accessKey);
}