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
    if (typeof body.isApproved === "boolean") data.isApproved = body.isApproved;

    const review = await prisma.review.update({ where: { id }, data });
    await invalidateContentCache(CACHE_TAGS.reviews);

    return NextResponse.json({ success: true, data: review });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Có lỗi xảy ra." } },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    await prisma.review.delete({ where: { id } });
    await invalidateContentCache(CACHE_TAGS.reviews);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Có lỗi xảy ra." } },
      { status: 500 },
    );
  }
}
