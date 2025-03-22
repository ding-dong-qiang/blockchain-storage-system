import { NextResponse } from "next/server";
import axios from "axios";

const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_KEY = process.env.PINATA_SECRET_KEY;

export async function DELETE(req: Request) {
  try {
    if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
      return NextResponse.json({ error: "Pinata API credentials not configured" }, { status: 500 });
    }

    let requestBody;
    try {
      requestBody = await req.json();
    } catch (parseError) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { cid } = requestBody;
    if (!cid || typeof cid !== "string") {
      return NextResponse.json({ error: "Invalid or missing CID" }, { status: 400 });
    }

    // 构造请求头
    const headers = {
      "pinata_api_key": PINATA_API_KEY,
      "pinata_secret_api_key": PINATA_SECRET_KEY,
    };

    // 发送删除请求
    const response = await axios.delete(`https://api.pinata.cloud/pinning/unpin/${cid}`, { headers });

    if (response.status === 200) {
      return NextResponse.json({ success: true }, { status: 200 });
    } else {
      return NextResponse.json({ error: "Unexpected response from Pinata" }, { status: response.status });
    }
  } catch (error) {
    console.error("Failed to delete file:", error);
    
    let errorMessage = "Failed to delete";
    if (axios.isAxiosError(error)) {
      if (error.response) {
        errorMessage = error.response.data?.error || `Pinata API error: ${error.response.statusText}`;
      } else if (error.request) {
        errorMessage = "No response from Pinata API";
      } else {
        errorMessage = error.message;
      }
    }
    
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}