import fs from "fs";
import FormData from "form-data";
import axios from "axios";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

const PINATA_JWT = process.env.PINATA_JWT;
const FILE_PATH = "./test.txt"; // Change this to the file you want to upload

async function uploadFile() {
    try {
        // Ensure API keys are set
        if (!PINATA_JWT) {
            throw new Error("Pinata JWT is missing. Check your .env file.");
        }

        // Read the text file from the filesystem
        const fileStream = fs.createReadStream(FILE_PATH);
        
        // Create form data
        const formData = new FormData();
        formData.append("file", fileStream);

        // Pinata API request
        const response = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
            headers: {
                "Authorization": `Bearer ${PINATA_JWT}`
            }
        });

        console.log("File pinned successfully!");
        console.log("IPFS Hash:", response.data.IpfsHash);
    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            console.error("Error uploading file:", error.response?.data || error.message);
        } else if (error instanceof Error) {
            console.error("Unexpected error:", error.message);
        } else {
            console.error("An unknown error occurred");
        }
    }
}

// Run the upload function
uploadFile();
