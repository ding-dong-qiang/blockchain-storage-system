import { NextResponse } from "next/server";
import axios from "axios";

const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_KEY = process.env.PINATA_SECRET_KEY;
const PINATA_JWT = process.env.PINATA_JWT;
const PINATA_GATEWAY_URL =
  process.env.PINATA_GATEWAY_URL || "https://gateway.pinata.cloud/ipfs/";

export async function GET(req: Request) {
  try {
    // 获取URL参数
    const url = new URL(req.url);
    const publicKey = url.searchParams.get("publicKey");

    if (!publicKey) {
      return NextResponse.json(
        { error: "Missing publicKey parameter" },
        { status: 400 }
      );
    }

    if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
      return NextResponse.json(
        { error: "Pinata API Key not configured" },
        { status: 500 }
      );
    }

    // 设置请求头
    const headers: Record<string, string> = {};
    if (PINATA_JWT) {
      headers["Authorization"] = `Bearer ${PINATA_JWT}`;
    } else {
      headers["pinata_api_key"] = PINATA_API_KEY;
      headers["pinata_secret_api_key"] = PINATA_SECRET_KEY;
    }

    // 查询Pinata上的文件列表
    const response = await axios.get("https://api.pinata.cloud/data/pinList", {
      headers,
      params: {
        status: "pinned",
      },
    });

    // 检查是否找到匹配的文件
    const files = response.data.rows || [];
    let targetFile = null;

    // 遍历所有文件
    for (const file of files) {
      // 检查文件名是否为 publicKey.json
      const fileName = file.metadata?.name || "";
      if (fileName === `${publicKey}.json`) {
        targetFile = file;
        break;
      }
    }

    if (!targetFile) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // 获取文件的CID
    const fileCid = targetFile.ipfs_pin_hash;

    // 从Pinata网关下载文件
    const fileUrl = `${PINATA_GATEWAY_URL}${fileCid}`;
    const fileResponse = await axios.get(fileUrl);

    // 返回文件内容
    return NextResponse.json(
      {
        cid: fileCid,
        content: fileResponse.data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to download file:", error);
    return NextResponse.json(
      { error: "Failed to download file" },
      { status: 500 }
    );
  }
}
