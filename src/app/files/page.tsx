"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import FileManager from "./components/FileManager";

export default function FilesPage() {
  const router = useRouter();
  const [accessKey, setAccessKey] = useState<string | null>(null);

  useEffect(() => {
    const key = sessionStorage.getItem("accessKey");
    console.log("Access Key in FilesPage:", key);

    if (!key) {
      alert("Access Key is missing. Please enter again.");
      router.push("/"); // If no access key, redirect to home page
    } else {
      setAccessKey(key);
    }
  }, [router]);

  return (
    <div className="min-h-screen w-full h-screen bg-gray-900 flex items-center justify-center">
      {accessKey ? (
        <FileManager accessKey={accessKey} />
      ) : (
        <div className="w-full h-screen flex items-center justify-center bg-gray-800 text-gray-400 text-lg rounded-lg shadow-lg">
          Loading...
        </div>
      )}
    </div>
  );
}