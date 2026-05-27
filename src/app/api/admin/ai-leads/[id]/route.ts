import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
type Params = { params: Promise<{ id: string }> };
export async function PATCH(req: NextRequest, { params }: Params) {
  try { const { id } = await params; const body = await req.json(); const lead = await prisma.aiLead.update({ where: { id }, data: body }); return NextResponse.json({ success: true, data: lead }); }
  catch { return NextResponse.json({ success: false, error: { code: "SERVER_ERROR", message: "Có lỗi xảy ra" } }, { status: 500 }); }
}
