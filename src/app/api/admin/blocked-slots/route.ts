import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { invalidateAvailabilityCache } from "@/lib/cache-invalidation";

function buildDateRange(body: Record<string, string | boolean | undefined>) {
  const isAllDay = Boolean(body.isAllDay);
  if (body.startAt && body.endAt) {
    return { startAt: new Date(String(body.startAt)), endAt: new Date(String(body.endAt)), isAllDay };
  }

  const date = String(body.date || "");
  if (!date) return null;

  const startTime = isAllDay ? "00:00" : String(body.startTime || "08:00");
  const endTime = isAllDay ? "23:59" : String(body.endTime || "09:00");
  return {
    startAt: new Date(`${date}T${startTime}:00`),
    endAt: new Date(`${date}T${endTime}:00`),
    isAllDay,
  };
}

async function decorateBlockedSlots() {
  const [slots, staff] = await Promise.all([
    prisma.blockedSlot.findMany({ orderBy: { startAt: "desc" } }),
    prisma.staffProfile.findMany({
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { sortOrder: "asc" },
    }),
  ]);
  const staffMap = new Map(staff.map((item) => [item.userId, item]));

  return slots.map((slot) => {
    const profile = slot.staffId ? staffMap.get(slot.staffId) : null;
    return {
      ...slot,
      staffName: profile?.displayName || (slot.staffId ? "Nhân viên đã xoá" : "Tất cả nhân viên"),
      staffEmail: profile?.user.email || null,
    };
  });
}

export async function GET() {
  try {
    const data = await decorateBlockedSlots();
    return NextResponse.json({ success: true, data });
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
    const range = buildDateRange(body);
    const staffId = body.staffId && body.staffId !== "ALL" ? String(body.staffId) : null;

    if (!range || Number.isNaN(range.startAt.getTime()) || Number.isNaN(range.endAt.getTime())) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_INPUT", message: "Vui lòng chọn ngày giờ hợp lệ." } },
        { status: 400 },
      );
    }

    if (range.endAt <= range.startAt) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_INPUT", message: "Giờ kết thúc phải sau giờ bắt đầu." } },
        { status: 400 },
      );
    }

    const slot = await prisma.blockedSlot.create({
      data: {
        staffId,
        startAt: range.startAt,
        endAt: range.endAt,
        isAllDay: range.isAllDay,
        reason: body.reason ? String(body.reason) : null,
      },
    });

    await invalidateAvailabilityCache();

    return NextResponse.json({ success: true, data: slot });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Có lỗi xảy ra." } },
      { status: 500 },
    );
  }
}
