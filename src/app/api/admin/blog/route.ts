import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { CACHE_TAGS } from "@/lib/cache";
import { invalidateContentCache } from "@/lib/cache-invalidation";

export async function GET() {
  try {
    const posts = await prisma.blogPost.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ success: true, data: posts });
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
    const content = String(body.content || "").trim();

    if (!title || !slug || !content) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_INPUT", message: "Vui lòng nhập tiêu đề, slug và nội dung." } },
        { status: 400 },
      );
    }

    const post = await prisma.blogPost.create({
      data: {
        title,
        slug,
        excerpt: body.excerpt || null,
        content,
        thumbnail: body.thumbnail || null,
        category: body.category || null,
        status: body.status || "DRAFT",
        seoTitle: body.seoTitle || null,
        seoDescription: body.seoDescription || null,
        publishedAt: body.status === "PUBLISHED" ? new Date() : null,
      },
    });

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
