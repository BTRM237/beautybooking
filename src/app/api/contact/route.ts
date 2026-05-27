import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const limited = await rateLimit(req, "contact-form", {
      limit: 8,
      windowSeconds: 600,
      message: "Bạn gửi liên hệ quá nhiều lần. Vui lòng thử lại sau ít phút.",
    });
    if (limited) return limited;

    const body = await req.json();
    const { name, phone, service, message } = body;

    if (!name || !phone) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_INPUT", message: "Vui lòng nhập tên và số điện thoại" } },
        { status: 400 }
      );
    }

    await prisma.contactMessage.create({
      data: { name, phone, service: service || null, message: message || null },
    });

    return NextResponse.json({ success: true, data: { message: "Tin nhắn đã được gửi thành công" } });
  } catch (error) {
    console.error("POST /api/contact error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Có lỗi xảy ra" } },
      { status: 500 }
    );
  }
}
