import { NextResponse } from "next/server";
import axios from "axios";

const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_KEY = process.env.PINATA_SECRET_KEY;
const PINATA_JWT = process.env.PINATA_JWT;

export async function POST(req: Request) {
  try {
    if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
      return NextResponse.json({ error: "Pinata API Key not configured" }, { status: 500 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const fileName = formData.get("fileName") as string;
    const accessKey = formData.get("accessKey") as string;

    if (!file || !fileName || !accessKey) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    // 读取文件内容
    const fileContent = await file.text();

    // 创建 FormData 以便上传到 Pinata
    const pinataFormData = new FormData();
    pinataFormData.append("file", new Blob([fileContent], { type: "text/plain" }), fileName);
    pinataFormData.append("pinataMetadata", JSON.stringify({ name: fileName }));

    // 设置请求头
    const headers: Record<string, string> = {
      "Content-Type": "multipart/form-data",
    };
    if (PINATA_JWT) {
      headers["Authorization"] = `Bearer ${PINATA_JWT}`;
    } else {
      headers["pinata_api_key"] = PINATA_API_KEY;
      headers["pinata_secret_api_key"] = PINATA_SECRET_KEY;
    }

    // 发送到 Pinata
    const response = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", pinataFormData, { headers });

    return NextResponse.json({ cid: response.data.IpfsHash }, { status: 200 });
  } catch (error) {
    console.error("Failed to upload:", error);
    return NextResponse.json({ error: "Failed to upload" }, { status: 500 });
  }
}