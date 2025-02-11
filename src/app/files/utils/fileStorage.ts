import { encryptText, decryptText } from "./encryption"; 

// Create file
export const createFile = (fileName: string, initialContent: string = ""): string => {
  if (!fileName.trim()) {
    return "File name cannot be empty.";
  }

  if (localStorage.getItem(fileName)) {
    return "File already exists.";
  }

  const encryptedContent = encryptText(initialContent);
  localStorage.setItem(fileName, encryptedContent);
  return "File created successfully.";
};

// Save file
export const saveFile = (fileName: string, fileContent: string): string => {
  if (!fileName.trim()) {
    return "File name cannot be empty.";
  }

  const encryptedContent = encryptText(fileContent);
  localStorage.setItem(fileName, encryptedContent);
  return "File saved successfully.";
};

// Edit file
export const editFile = (fileName: string, newContent: string): string => {
  if (!localStorage.getItem(fileName)) {
    return "File not found.";
  }

  const encryptedContent = encryptText(newContent);
  localStorage.setItem(fileName, encryptedContent);
  return "File edited successfully.";
};

// Delete file
export const deleteFile = (fileName: string): string => {
  if (localStorage.getItem(fileName)) {
    localStorage.removeItem(fileName);
    return "File deleted successfully.";
  }
  return "File not found.";
};

// Load file
export const loadFile = (fileName: string): string => {
  const encryptedContent = localStorage.getItem(fileName);
  if (!encryptedContent) {
    return "File not found.";
  }

  const decryptedContent = decryptText(encryptedContent);
  return decryptedContent || "Failed to decrypt file.";
};
