import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { CACHE_TAGS } from "@/lib/cache";
import { invalidateContentCache } from "@/lib/cache-invalidation";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();

    const data: Record<string, unknown> = {};

    if (body.title !== undefined) data.title = String(body.title).trim();
    if (body.slug !== undefined) data.slug = String(body.slug).trim();
    if (body.excerpt !== undefined) data.excerpt = body.excerpt || null;
    if (body.content !== undefined) data.content = String(body.content);
    if (body.thumbnail !== undefined) data.thumbnail = body.thumbnail || null;
    if (body.category !== undefined) data.category = body.category || null;
    if (body.seoTitle !== undefined) data.seoTitle = body.seoTitle || null;
    if (body.seoDescription !== undefined) data.seoDescription = body.seoDescription || null;

    if (body.status !== undefined) {
      data.status = body.status;
      if (body.status === "PUBLISHED" && !body.publishedAt) {
        data.publishedAt = new Date();
      }
    }

    const post = await prisma.blogPost.update({ where: { id }, data });
    await invalidateContentCache(CACHE_TAGS.blog);

    return NextResponse.json({ success: true, data: post });
  } catch (error: unknown) {
    const msg = error instanceof Error && error.message.includes("Unique") ? "Slug đã tồn tại." : "Có lỗi xảy ra.";
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: msg } },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    await prisma.blogPost.delete({ where: { id } });
    await invalidateContentCache(CACHE_TAGS.blog);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Có lỗi xảy ra." } },
      { status: 500 },
    );
  }
}
