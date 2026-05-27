import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { invalidateStaffCache } from "@/lib/cache-invalidation";

type Params = { params: Promise<{ id: string }> };

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

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();
    const current = await prisma.staffProfile.findUnique({ where: { id } });

    if (!current) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Không tìm thấy nhân viên." } },
        { status: 404 },
      );
    }

    const displayName = String(body.displayName || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const userData: Record<string, string | null> = {};

    if (displayName) userData.name = displayName;
    if (email) userData.email = email;
    if (body.userStatus) userData.status = body.userStatus;
    if (typeof body.avatar === "string") userData.avatar = body.avatar || null;
    if (body.password) userData.password = await bcrypt.hash(String(body.password), 12);

    await prisma.$transaction([
      Object.keys(userData).length
        ? prisma.user.update({ where: { id: current.userId }, data: userData })
        : prisma.user.findUniqueOrThrow({ where: { id: current.userId } }),
      prisma.staffProfile.update({
        where: { id },
        data: {
          displayName: displayName || current.displayName,
          avatar: typeof body.avatar === "string" ? body.avatar || null : current.avatar,
          bio: typeof body.bio === "string" ? body.bio || null : current.bio,
          experienceYears: Number(body.experienceYears) || 0,
          specialties: normalizeSpecialties(body.specialties),
          workingStatus: body.workingStatus || current.workingStatus,
          serviceRadiusKm: Number(body.serviceRadiusKm) || current.serviceRadiusKm,
          workingHours: typeof body.workingHours === "string" ? body.workingHours || null : current.workingHours,
          sortOrder: Number(body.sortOrder) || 0,
        },
      }),
    ]);

    const updated = await prisma.staffProfile.findUnique({
      where: { id },
      include: { user: { select: { id: true, name: true, email: true, role: true, status: true } } },
    });

    await invalidateStaffCache();

    return NextResponse.json({ success: true, data: updated });
  } catch (error: unknown) {
    const message = error instanceof Error && error.message.includes("Unique") ? "Email đã tồn tại." : "Có lỗi xảy ra.";
    return NextResponse.json({ success: false, error: { code: "SERVER_ERROR", message } }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const staff = await prisma.staffProfile.findUnique({ where: { id } });

    if (!staff) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Không tìm thấy nhân viên." } },
        { status: 404 },
      );
    }

    await prisma.$transaction([
      prisma.staffProfile.delete({ where: { id } }),
      prisma.user.update({ where: { id: staff.userId }, data: { status: "DISABLED" } }),
    ]);

    await invalidateStaffCache();

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Có lỗi xảy ra." } },
      { status: 500 },
    );
  }
}
