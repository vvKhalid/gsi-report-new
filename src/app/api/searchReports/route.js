import { NextResponse } from "next/server";
import { BlobServiceClient } from "@azure/storage-blob";

const CONTAINER_NAME = "reports";

// هذا الـ SAS Token انسخه من البوابة (بدون المسافة الأخيرة)
// لا تنسَ تحدثه إذا انتهى تاريخه
const SAS_TOKEN = "sp=racwdli&st=2025-07-19T00:11:59Z&se=2026-06-09T08:26:59Z&spr=https&sv=2024-11-04&sr=c&sig=VmIkcftFAhOFwv6cwWrunaTNjMsMmpgZK6Qi2D%2Fe%2B6w%3D";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query");
  if (!query) return NextResponse.json({ error: "Missing query" }, { status: 400 });

  try {
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      "DefaultEndpointsProtocol=https;AccountName=iagsireports;AccountKey=+DUlYb10wCjfb9jD1b91LrTsvZPrymnqSSe6r4fbPydtEp2sEVvO6+gsNfexWafxQ/UqNgHxkvTK+AStcVYPig==;EndpointSuffix=core.windows.net"
    );
    const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);

    let result = [];
    for await (const blob of containerClient.listBlobsFlat()) {
      if (blob.name.toLowerCase().includes(query.toLowerCase())) {
        // رابط التحميل + SAS
        const url = `https://iagsireports.blob.core.windows.net/${CONTAINER_NAME}/${encodeURIComponent(blob.name)}?${SAS_TOKEN}`;
        result.push({
          name: blob.name,
          url: url,
        });
      }
    }

    return NextResponse.json({ reports: result });
  } catch (err) {
    console.error("Azure Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
