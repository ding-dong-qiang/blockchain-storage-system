"use client";

import { useState } from "react";
import { generateKeyPair, encryptWithKey } from "../../files/utils/encryption"; 
import { useAuth } from "../authContext"; 
import Link from "next/link";

export default function GenerateKey() {
  const { storeTestKey } = useAuth();  // Get the storeTestKey function
  const [generatedKey, setGeneratedKey] = useState("");
  const [testEncrypted, setTestEncrypted] = useState("");
  
  const handleGenerateKey = () => {
    const { privateKey } = generateKeyPair();
    setGeneratedKey(privateKey);
    
    // Store the key in the auth context
    storeTestKey(privateKey);
    
    // Also create and display the encrypted value for reference
    const testValue = encryptWithKey("valid_user", privateKey);
    setTestEncrypted(testValue);
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
        <button
          onClick={handleGenerateKey}
          className="px-6 py-2 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 active:scale-95"
        >
          Generate New Key
        </button>
        
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
            
            <div className="mt-6 text-center">
              <Link href="/" className="text-blue-500 hover:underline">
                Go to Login Page to Test
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}