import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get("file") as unknown as File;

    if (!file) {
      return NextResponse.json({ error: "No file received" }, { status: 400 });
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Max 5MB allowed" },
        { status: 400 },
      );
    }

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "application/pdf",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPG, PNG, and PDF are allowed" },
        { status: 400 },
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split(".").pop();
    const filename = `${timestamp}_${Math.random().toString(36).substring(7)}.${fileExtension}`;

    // Determine upload directory based on file type
    let uploadDir = "thumbnails";
    if (file.type === "application/pdf") {
      uploadDir = "certificates";
    }

    // Create uploads directory if it doesn't exist
    const uploadsPath = join(process.cwd(), "public", "uploads", uploadDir);
    if (!existsSync(uploadsPath)) {
      await mkdir(uploadsPath, { recursive: true });
    }

    // Write file
    const filePath = join(uploadsPath, filename);
    await writeFile(filePath, buffer);

    // Return the public URL
    const publicUrl = `/uploads/${uploadDir}/${filename}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: file.name,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// Handle GET request (optional - for checking endpoint)
export async function GET() {
  return NextResponse.json({
    message: "Upload endpoint is working",
    supportedTypes: ["image/jpeg", "image/png", "application/pdf"],
    maxSize: "5MB",
  });
}
