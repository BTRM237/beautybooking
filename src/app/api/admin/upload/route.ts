import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const maxFileSize = 5 * 1024 * 1024;

function extensionFor(file: File) {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName && /^[a-z0-9]+$/.test(fromName)) return fromName;
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  if (file.type === "image/gif") return "gif";
  return "jpg";
}

export async function POST(req: Request) {
  try {
    const limited = await rateLimit(req, "admin-upload", {
      limit: 20,
      windowSeconds: 600,
      message: "Bạn tải ảnh lên quá nhiều lần. Vui lòng thử lại sau ít phút.",
    });
    if (limited) return limited;

    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_INPUT", message: "Vui lòng chọn ảnh cần tải lên." } },
        { status: 400 },
      );
    }

    if (!allowedTypes.has(file.type)) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_FILE", message: "Chỉ hỗ trợ ảnh JPG, PNG, WEBP hoặc GIF." } },
        { status: 400 },
      );
    }

    if (file.size > maxFileSize) {
      return NextResponse.json(
        { success: false, error: { code: "FILE_TOO_LARGE", message: "Ảnh không được vượt quá 5MB." } },
        { status: 400 },
      );
    }

    const now = new Date();
    const folder = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", folder);
    await mkdir(uploadDir, { recursive: true });

    const filename = `${Date.now()}-${crypto.randomUUID()}.${extensionFor(file)}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(uploadDir, filename), buffer);

    const url = `/uploads/${folder}/${filename}`;
    return NextResponse.json({ success: true, data: { url, filename, size: file.size, type: file.type } });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Không thể tải ảnh lên." } },
      { status: 500 },
    );
  }
}
