import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const leads = await prisma.aiLead.findMany({
      orderBy: { createdAt: "desc" },
      include: { conversation: { include: { messages: { orderBy: { createdAt: "asc" } } } } },
    });
    return NextResponse.json({ success: true, data: leads });
  } catch { return NextResponse.json({ success: false, error: { code: "SERVER_ERROR", message: "Có lỗi xảy ra" } }, { status: 500 }); }
}
