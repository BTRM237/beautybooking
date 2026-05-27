import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const reviews = await prisma.review.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ success: true, data: reviews });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Có lỗi xảy ra." } },
      { status: 500 },
    );
  }
}
