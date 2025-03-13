"use client";

import { useState } from "react";
import { generateKeyPair } from "../../files/utils/encryption";
import { useAuth } from "../authContext";
import Link from "next/link";
import axios from "axios";

export default function GenerateKey() {
  const { storeTestKey } = useAuth(); // Get the storeTestKey function
  const [generatedKey, setGeneratedKey] = useState("");
  const [publicKey, setPublicKey] = useState("");
  const [uploadStatus, setUploadStatus] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handleGenerateKey = async () => {
    const { privateKey, publicKey } = generateKeyPair();
    setGeneratedKey(privateKey);
    setPublicKey(publicKey);

    // Store the key in the auth context
    storeTestKey(privateKey);



    // 自动上传公钥到服务器
    await uploadPublicKey(publicKey);
  };

  const uploadPublicKey = async (pubKey: string) => {
    try {
      setIsUploading(true);
      setUploadStatus("正在上传公钥...");

      // 使用公钥作为文件名并添加.json后缀
      const fileName = `${pubKey}.json`;

      // 创建包含公钥信息的JSON文件
      const jsonContent = JSON.stringify(
        {
          publicKey: pubKey,
          timestamp: new Date().toISOString(),
          type: "public_key",
        },
        null,
        2
      );
      const fileBlob = new Blob([jsonContent], { type: "application/json" });
      const file = new File([fileBlob], fileName, { type: "application/json" });

      // 创建FormData对象
      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileName", fileName);
      formData.append("accessKey", "public"); // 使用公共访问权限

      // 发送到API端点
      const response = await axios.post("/api/ipfs/upload", formData);

      if (response.data.cid) {
        setUploadStatus(`Public key uploaded! CID: ${response.data.cid}`);
      } else {
        setUploadStatus("Upload failed, please try again");
      }
    } catch (error) {
      console.error("上传公钥失败:", error);
      setUploadStatus("Upload failed, please try again");
    } finally {
      setIsUploading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-black text-center">
        Key Generator (Test Tool)
      </h1>

      <div className="flex flex-col items-center mt-10">
        <div className="flex gap-4">
          <button
            onClick={handleGenerateKey}
            className="px-6 py-2 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 active:scale-95"
            disabled={isUploading}
          >
            Generate New Key
          </button>
          <Link href="/">
            <button className="px-6 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 active:scale-95">
              Back to Home
            </button>
          </Link>
        </div>

        {generatedKey && (
          <div className="mt-8 p-4 border rounded bg-white w-full max-w-xl">
            <h2 className="font-bold text-lg mb-2">Your Generated Key:</h2>
            <div className="flex">
              <input
                type="text"
                readOnly
                value={generatedKey}
                className="w-full p-2 border rounded text-sm font-mono"
              />
              <button
                onClick={() => copyToClipboard(generatedKey)}
                className="ml-2 px-3 bg-blue-500 text-white rounded active:scale-95 hover:bg-blue-600"
              >
                Copy
              </button>
            </div>

            {publicKey && (
              <div className="mt-4">
                <h2 className="font-bold text-lg mb-2">Public Key:</h2>
                <div className="flex">
                  <input
                    type="text"
                    readOnly
                    value={publicKey}
                    className="w-full p-2 border rounded text-sm font-mono"
                  />
                  {/* <button
                    onClick={() => copyToClipboard(publicKey)}
                    className="ml-2 px-3 bg-blue-500 text-white rounded active:scale-95 hover:bg-blue-600"
                  >
                    Copy
                  </button> */}
                </div>
              </div>
            )}

            {uploadStatus && (
              <div className="mt-4 p-2 border rounded bg-gray-50">
                <p className="text-sm">{uploadStatus}</p>
              </div>
            )}

            {/* <div className="mt-6 text-center">
              <Link href="/" className="text-blue-500 hover:underline">
                Go to Login Page to Test
              </Link>
            </div> */}
          </div>
        )}
      </div>
    </div>
  );
}
