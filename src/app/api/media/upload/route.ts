import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = [
      // Images
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      // Videos
      "video/mp4",
      "video/webm",
      // Audio
      "audio/mpeg",
      "audio/mp3",
      // Documents
      "application/pdf",
      "application/msword", // .doc
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
      "application/vnd.ms-excel", // .xls
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
      "text/csv",
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `File type not supported: ${file.type}` },
        { status: 400 }
      );
    }

    // Create a unique filename
    const fileExtension = file.name.split(".").pop();
    const uniqueFilename = `${randomUUID()}.${fileExtension}`;

    // Determine directory based on file type
    let uploadDir = "other";
    if (file.type.startsWith("image/")) {
      uploadDir = "images";
    } else if (file.type.startsWith("video/")) {
      uploadDir = "videos";
    } else if (file.type.startsWith("audio/")) {
      uploadDir = "audio";
    } else if (
      file.type.startsWith("application/") ||
      file.type === "text/csv"
    ) {
      uploadDir = "documents";
    }

    // Ensure the directory exists
    const uploadPath = path.join(process.cwd(), "public", "uploads", uploadDir);

    // Convert the file to an ArrayBuffer
    const buffer = await file.arrayBuffer();

    // Save the file
    const filePath = path.join(uploadPath, uniqueFilename);
    await writeFile(filePath, Buffer.from(buffer));

    // Return file info for the client
    return NextResponse.json({
      success: true,
      file: {
        name: file.name,
        size: file.size,
        type: file.type,
        url: `/uploads/${uploadDir}/${uniqueFilename}`,
      },
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json({ error: "File upload failed" }, { status: 500 });
  }
}
