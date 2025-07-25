// src/app/api/route.js
import { NextResponse } from "next/server";
import { ContainerClient } from "@azure/storage-blob";

// هنا ضع SAS URL كمتغير بيئة (يفضل)... أو بشكل مباشر إذا للتجربة فقط
const sasUrl = process.env.NEXT_PUBLIC_STORAGE_SAS_URL;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const employee = searchParams.get("employee") || null;
  const limit = parseInt(searchParams.get("limit") || "10", 10);

  const containerClient = new ContainerClient(sasUrl);
  const all = [];

  // جلب جميع الملفات مع معلومات metadata (إن وجدت)
  for await (const blob of containerClient.listBlobsFlat({ includeMetadata: true })) {
    // فلترة حسب الموظف إذا محدد
    if (!employee || (blob.metadata && blob.metadata.uploadedby === employee)) {
      all.push({
        name: blob.name,
        uploadedby: blob.metadata?.uploadedby || "Unknown",
        uploadDate: blob.properties.lastModified, // في الغالب سترجع القيمة هنا
        url: `${containerClient.getBlockBlobClient(blob.name).url}`,
      });
    }
  }

  // ترتيب حسب التاريخ تنازلي وأخذ أول limit
  all.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
  const sliced = all.slice(0, limit);

  return NextResponse.json(sliced);
}
