import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { invalidateServicesCache } from "@/lib/cache-invalidation";

type Params = { params: Promise<{ id: string }> };

function normalizeList(value: unknown) {
  if (Array.isArray(value)) return JSON.stringify(value.filter(Boolean));
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return JSON.stringify(parsed.filter(Boolean));
    } catch {}
    return JSON.stringify(trimmed.split(/[\n,]/).map((item) => item.trim()).filter(Boolean));
  }
  return null;
}

function normalizeFaq(value: unknown) {
  if (!value) return null;
  if (Array.isArray(value)) return JSON.stringify(value);
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return JSON.stringify(parsed);
    } catch {}
  }
  return null;
}

function serviceData(body: Record<string, unknown>) {
  return {
    name: String(body.name || "").trim(),
    slug: String(body.slug || "").trim(),
    category: String(body.category || "").trim(),
    shortDescription: body.shortDescription ? String(body.shortDescription) : null,
    description: body.description ? String(body.description) : null,
    basePrice: Number(body.basePrice) || 0,
    durationMin: Number(body.durationMin) || 60,
    thumbnail: body.thumbnail ? String(body.thumbnail) : null,
    gallery: normalizeList(body.gallery),
    benefits: normalizeList(body.benefits),
    occasions: normalizeList(body.occasions),
    styleSuggestions: normalizeList(body.styleSuggestions),
    faq: normalizeFaq(body.faq),
    seoTitle: body.seoTitle ? String(body.seoTitle) : null,
    seoDescription: body.seoDescription ? String(body.seoDescription) : null,
    status: String(body.status || "ACTIVE"),
    featured: Boolean(body.featured),
    sortOrder: Number(body.sortOrder) || 0,
  };
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();
    const data = serviceData(body);

    if (!data.name || !data.slug || !data.category) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_INPUT", message: "Vui lòng nhập tên, slug và danh mục." } },
        { status: 400 },
      );
    }

    const service = await prisma.service.update({ where: { id }, data });
    await invalidateServicesCache();

    return NextResponse.json({ success: true, data: service });
  } catch (error: unknown) {
    const message = error instanceof Error && error.message.includes("Unique") ? "Slug đã tồn tại." : "Có lỗi xảy ra.";
    return NextResponse.json({ success: false, error: { code: "SERVER_ERROR", message } }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    await prisma.service.delete({ where: { id } });
    await invalidateServicesCache();

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Có lỗi xảy ra." } },
      { status: 500 },
    );
  }
}
