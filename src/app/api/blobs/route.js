// src/app/api/blobs/route.js
import { NextResponse } from "next/server";
import { ContainerClient } from "@azure/storage-blob";

const sasUrl = process.env.NEXT_PUBLIC_STORAGE_SAS_URL;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const employee = searchParams.get("employee") || null;
  const limit = parseInt(searchParams.get("limit") || "10", 10);

  const containerClient = new ContainerClient(sasUrl);
  const all = [];

  // list all blobs with metadata
  for await (const blob of containerClient.listBlobsFlat({
    includeMetadata: true,
  })) {
    // إذا لم يُحدد employee، أو مطابقة للبادج، أو metadata.uploadedBy مفقودة أو 'Unknown'
    if (!employee || blob.metadata?.uploadedby === employee)
{
      all.push({
        name: blob.name,
        uploadedby: blob.metadata?.uploadedby || "Unknown",
        uploadDate: blob.properties.lastModified,
        url: `${containerClient.getBlockBlobClient(blob.name).url}`,
      });
    }
  }

  // رتب حسب التاريخ تنازلياً وخذ أول N
  all.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
  const sliced = all.slice(0, limit);

  return NextResponse.json(sliced);
}
