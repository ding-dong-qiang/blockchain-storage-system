"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import FileManager from "./components/FileManager";

export default function FilesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [accessKey, setAccessKey] = useState<string | null>(null);

  useEffect(() => {
    const key = searchParams.get("accessKey");
    if (!key) {
      router.push("/"); // If no access key, redirect to home page
    } else {
      setAccessKey(key);
    }
  }, [searchParams, router]);

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