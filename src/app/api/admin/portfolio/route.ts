import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { CACHE_TAGS } from "@/lib/cache";
import { invalidateContentCache } from "@/lib/cache-invalidation";

function normalizeGallery(value: unknown) {
  if (Array.isArray(value)) return JSON.stringify(value.filter(Boolean));
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return JSON.stringify(parsed.filter(Boolean));
    } catch {}
    return JSON.stringify(trimmed.split(",").map((item) => item.trim()).filter(Boolean));
  }
  return null;
}

export async function GET() {
  try {
    const items = await prisma.portfolioItem.findMany({ orderBy: { sortOrder: "asc" } });
    return NextResponse.json({ success: true, data: items });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Có lỗi xảy ra." } },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const title = String(body.title || "").trim();
    const slug = String(body.slug || "").trim();
    const style = String(body.style || "").trim();

    if (!title || !slug || !style) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_INPUT", message: "Vui lòng nhập tiêu đề, slug và phong cách." } },
        { status: 400 },
      );
    }

    const item = await prisma.portfolioItem.create({
      data: {
        title,
        slug,
        style,
        beforeImage: body.beforeImage || null,
        afterImage: body.afterImage || null,
        gallery: normalizeGallery(body.gallery),
        description: body.description || null,
        status: body.status || "VISIBLE",
        sortOrder: Number(body.sortOrder) || 0,
      },
    });

    await invalidateContentCache(CACHE_TAGS.portfolio);

    return NextResponse.json({ success: true, data: item });
  } catch (error: unknown) {
    const message = error instanceof Error && error.message.includes("Unique") ? "Slug đã tồn tại." : "Có lỗi xảy ra.";
    return NextResponse.json({ success: false, error: { code: "SERVER_ERROR", message } }, { status: 500 });
  }
}
