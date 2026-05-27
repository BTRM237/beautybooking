import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { invalidateStaffCache } from "@/lib/cache-invalidation";

function normalizeSpecialties(value: unknown) {
  if (Array.isArray(value)) return JSON.stringify(value.filter(Boolean));
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return JSON.stringify(parsed.filter(Boolean));
    } catch {}
    return JSON.stringify(trimmed.split(",").map((item) => item.trim()).filter(Boolean));
  }
  return null;
}

export async function GET() {
  try {
    const staff = await prisma.staffProfile.findMany({
      orderBy: { sortOrder: "asc" },
      include: { user: { select: { id: true, name: true, email: true, role: true, status: true } } },
    });

    return NextResponse.json({ success: true, data: staff });
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
    const displayName = String(body.displayName || body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "Admin@123456");

    if (!displayName || !email) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_INPUT", message: "Vui lòng nhập tên hiển thị và email." } },
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const staff = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: displayName,
        role: "STAFF",
        status: body.userStatus || "ACTIVE",
        avatar: body.avatar || null,
        staffProfile: {
          create: {
            displayName,
            avatar: body.avatar || null,
            bio: body.bio || null,
            experienceYears: Number(body.experienceYears) || 0,
            specialties: normalizeSpecialties(body.specialties),
            workingStatus: body.workingStatus || "ACTIVE",
            serviceRadiusKm: Number(body.serviceRadiusKm) || 10,
            workingHours: body.workingHours || null,
            sortOrder: Number(body.sortOrder) || 0,
          },
        },
      },
      include: { staffProfile: { include: { user: { select: { id: true, name: true, email: true, role: true, status: true } } } } },
    });

    await invalidateStaffCache();

    return NextResponse.json({ success: true, data: staff.staffProfile });
  } catch (error: unknown) {
    const message = error instanceof Error && error.message.includes("Unique") ? "Email đã tồn tại." : "Có lỗi xảy ra.";
    return NextResponse.json({ success: false, error: { code: "SERVER_ERROR", message } }, { status: 500 });
  }
}
