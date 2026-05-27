import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const limited = await rateLimit(req, "admin-login", {
      limit: 5,
      windowSeconds: 60,
      message: "Đăng nhập quá nhiều lần. Vui lòng thử lại sau 1 phút.",
    });
    if (limited) return limited;

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_INPUT", message: "Vui lòng nhập email và mật khẩu" } },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.status !== "ACTIVE") {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_CREDENTIALS", message: "Email hoặc mật khẩu không đúng" } },
        { status: 401 }
      );
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_CREDENTIALS", message: "Email hoặc mật khẩu không đúng" } },
        { status: 401 }
      );
    }

    if (!["ADMIN", "STAFF"].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Bạn không có quyền truy cập" } },
        { status: 403 }
      );
    }

    // Set session cookie (simple JWT-like approach for MVP)
    const sessionData = JSON.stringify({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
    const encoded = Buffer.from(sessionData).toString("base64");

    const hostname = req.nextUrl.hostname;
    const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
    const isHttps =
      req.nextUrl.protocol === "https:" || req.headers.get("x-forwarded-proto") === "https";

    const cookieStore = await cookies();
    cookieStore.set("admin_session", encoded, {
      httpOnly: true,
      secure: isHttps && !isLocalhost,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return NextResponse.json({
      success: true,
      data: { name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Có lỗi xảy ra" } },
      { status: 500 }
    );
  }
}
