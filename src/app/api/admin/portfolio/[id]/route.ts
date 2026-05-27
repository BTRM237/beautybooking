import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { CACHE_TAGS } from "@/lib/cache";
import { invalidateContentCache } from "@/lib/cache-invalidation";

type Params = { params: Promise<{ id: string }> };

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

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();
    const item = await prisma.portfolioItem.update({
      where: { id },
      data: {
        title: body.title,
        slug: body.slug,
        style: body.style,
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

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    await prisma.portfolioItem.delete({ where: { id } });
    await invalidateContentCache(CACHE_TAGS.portfolio);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Có lỗi xảy ra." } },
      { status: 500 },
    );
  }
}
