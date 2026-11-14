import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const mimeType = file.type || "image/jpeg";
    const base64Data = buffer.toString("base64");
    const dataUri = `data:${mimeType};base64,${base64Data}`;

    // On Vercel / serverless (/var/task is read-only), return data URI directly
    if (process.env.VERCEL) {
      return NextResponse.json({
        success: true,
        url: dataUri,
        filename: file.name,
      });
    }

    // On local environment, attempt disk write to public/uploads
    try {
      const uploadDir = path.join(process.cwd(), "public", "uploads", "proofs");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const filename = `${Date.now()}-${cleanName}`;
      const filePath = path.join(uploadDir, filename);
      fs.writeFileSync(filePath, buffer);
      return NextResponse.json({
        success: true,
        url: `/uploads/proofs/${filename}`,
        filename: filename,
      });
    } catch {
      // Fallback to data URI if disk write is not permitted
      return NextResponse.json({
        success: true,
        url: dataUri,
        filename: file.name,
      });
    }
  } catch (err: any) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to upload file: " + (err.message || err) },
      { status: 500 }
    );
  }
}
