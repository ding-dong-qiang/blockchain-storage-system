import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

// Make sure the uploads directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Create a new file (POST)

// Delete a file (DELETE)

// Edit a file (PUT)