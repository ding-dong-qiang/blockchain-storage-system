"use client";
import { createFile, saveFile, editFile, deleteFile, loadFile } from "../utils/fileStorage";
import { useState } from "react";

export default function FileManager() {
  const [fileName, setFileName] = useState("");
  const [fileContent, setFileContent] = useState("");
  const [message, setMessage] = useState("");

  // Handle create file
const handleCreate = async () => {
  const result = createFile(fileName, fileContent);
  setMessage(result);
};

  // Handle save file
  const handleSave = async () => {
    const result = saveFile(fileName, fileContent);
    setMessage(result);
  };

  // Handle edit file
  const handleEdit = async () => {
    const result = editFile(fileName, fileContent);
    setMessage(result);
  };

  // Handle load file
  const handleLoad = async () => {
    const result = loadFile(fileName);
    setFileContent(result);
  };

  // Handle delete file
  const handleDelete = async () => {
    const result = deleteFile(fileName);
    setMessage(result);
  };

  return (
    <div>
      
    </div>
  );
}