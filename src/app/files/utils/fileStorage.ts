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

// Save file
export async function saveFile(fileName: string, content: string, accessKey: string) {
  const accessHash = getAccessHash(accessKey);
  const encryptedContent = encryptText(content, accessHash);
  localStorage.setItem(`${fileName}_${accessHash}`, encryptedContent);
}

// Load file
export async function loadFile(fileName: string, accessKey: string): Promise<string | null> {
  const accessHash = getAccessHash(accessKey);
  const encryptedContent = localStorage.getItem(`${fileName}_${accessHash}`);

  if (!encryptedContent) return null;
  
  return encryptedContent ? decryptText(encryptedContent, accessHash) : null;
}

// Delete file
export async function deleteFile(fileName: string, accessKey: string) {
  const accessHash = getAccessHash(accessKey);
  localStorage.removeItem(`${fileName}_${accessHash}`);
}