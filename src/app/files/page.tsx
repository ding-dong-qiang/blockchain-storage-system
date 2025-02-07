"use client";

import { useState } from "react";

export default function FileManager() {
    const [files, setFiles] = useState<{name: string, content: string} []> ([]);
    const [newFileName, setNewFileName] = useState("");
    const [newFileContent, setNewFileContent] = useState("");

    // Create new file

    // Delete file

    // Edit file

    // Frontend
    return (
        <div>
            <h1>Blockchain Cloud Storage - File Management</h1>
        </div>
    );
};
