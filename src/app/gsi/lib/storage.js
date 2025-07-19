// src/app/gsi/lib/storage.js

const sasUrl = process.env.NEXT_PUBLIC_STORAGE_SAS_URL;
console.log("🔑 SAS URL is:", sasUrl);

import { ContainerClient } from "@azure/storage-blob";

// 📝 دالة ترفع ملف الوورد أو أي Blob مع حفظ البادج في الـ metadata
export async function uploadReportBlob(blob, filename, uploadedby) {
  try {
    const containerClient = new ContainerClient(sasUrl);
    const blockBlobClient = containerClient.getBlockBlobClient(filename);
    await blockBlobClient.uploadData(blob, {
      metadata: {
        uploadedby: String(uploadedby),
      },
      blobHTTPHeaders: {
        blobContentType:
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      },
    });
    console.log("✅ uploadReportBlob success:", blockBlobClient.url);
    return blockBlobClient.url;
  } catch (err) {
    console.error("❌ uploadReportBlob error:", err);
    throw new Error("Upload report failed: " + err.message);
  }
}

// 📝 دالة ترفع صورة مع حفظ البادج في الـ metadata
export async function uploadImageBlob(file, filename, uploadedby) {
  try {
    const containerClient = new ContainerClient(sasUrl);
    const blockBlobClient = containerClient.getBlockBlobClient(filename);
      await blockBlobClient.uploadData(file, {
    metadata: { uploadedby: String(uploadedby) },
    blobHTTPHeaders: { blobContentType: file.type },
    });
    console.log("✅ uploadImageBlob success:", blockBlobClient.url);
    return blockBlobClient.url;
  } catch (err) {
    console.error("❌ uploadImageBlob error:", err);
    throw new Error("Upload image failed: " + err.message);
  }
}
