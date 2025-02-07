import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold text-center">Welcome to Blockchain Cloud Storage</h1>
      <p className="text-gray-600 text-lg mt-2">Manage your files securely on the blockchain.</p>

      <Link href="/files">
        <button className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600">
          Go to File Management
        </button>
      </Link>
    </div>
  );
}
