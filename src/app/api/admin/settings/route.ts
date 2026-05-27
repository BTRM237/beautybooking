import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { CACHE_TAGS } from "@/lib/cache";
import { invalidateContentCache } from "@/lib/cache-invalidation";

export async function GET() {
  try {
    const settings = await prisma.setting.findMany();
    const data = Object.fromEntries(settings.map(s => [s.key, s.value]));
    return NextResponse.json({ success: true, data });
  } catch { return NextResponse.json({ success: false, error: { code: "SERVER_ERROR", message: "Có lỗi xảy ra" } }, { status: 500 }); }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    for (const [key, value] of Object.entries(body)) {
      await prisma.setting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      });
    }
    await invalidateContentCache(CACHE_TAGS.settings);

    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ success: false, error: { code: "SERVER_ERROR", message: "Có lỗi xảy ra" } }, { status: 500 }); }
}
