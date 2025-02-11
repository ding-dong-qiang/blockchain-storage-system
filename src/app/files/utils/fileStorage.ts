import CryptoJS from "crypto-js";
import fs from "fs";
import path from "path";

const storagePath = path.join(__dirname, "storage");

// Save file
export function saveFile(
  filename: string,
  content: string,
  secretKey: string
): void {
  const encryptedContent = CryptoJS.AES.encrypt(content, secretKey).toString();
  fs.writeFileSync(path.join(storagePath, filename), encryptedContent);
}

// Load file
export function loadFile(filename: string, secretKey: string): string | null {
  try {
    const encryptedContent = fs.readFileSync(
      path.join(storagePath, filename),
      "utf8"
    );
    const bytes = CryptoJS.AES.decrypt(encryptedContent, secretKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error("Error loading file:", error);
    return null;
  }
}

// Delete file
export function deleteFile(filename: string): void {
  try {
    fs.unlinkSync(path.join(storagePath, filename));
  } catch (error) {
    console.error("Error deleting file:", error);
  }
}
