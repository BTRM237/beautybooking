import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cached, cacheKey, CACHE_TAGS, CACHE_TTL, publicCacheHeaders } from "@/lib/cache";
import { rateLimit } from "@/lib/rate-limit";
import { getTimeSlots } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const limited = await rateLimit(req, "availability", {
      limit: 90,
      windowSeconds: 60,
      message: "Bạn kiểm tra lịch quá nhanh. Vui lòng thử lại sau ít phút.",
    });
    if (limited) return limited;

    const { searchParams } = new URL(req.url);
    const staffId = searchParams.get("staffId");
    const date = searchParams.get("date");
    const serviceId = searchParams.get("serviceId");

    if (!staffId || !date) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_INPUT", message: "Vui lòng chọn chuyên viên và ngày" } },
        { status: 400 }
      );
    }

    const data = await cached(
      cacheKey("availability", staffId, date, serviceId || "default"),
      async () => {
        let durationMin = 60;
        if (serviceId) {
          const service = await prisma.service.findUnique({ where: { id: serviceId } });
          if (service) durationMin = service.durationMin;
        }

        const dayStart = new Date(`${date}T00:00:00`);
        const dayEnd = new Date(`${date}T23:59:59`);

        const [bookings, blocked] = await Promise.all([
          prisma.booking.findMany({
            where: {
              staffId,
              status: { in: ["PENDING", "CONFIRMED"] },
              startAt: { gte: dayStart, lte: dayEnd },
            },
            select: { startAt: true, endAt: true },
          }),
          prisma.blockedSlot.findMany({
            where: {
              OR: [{ staffId }, { staffId: null }],
              startAt: { lte: dayEnd },
              endAt: { gte: dayStart },
            },
          }),
        ]);

        const allSlots = getTimeSlots(8, 21, 30);
        const now = new Date();

        const slots = allSlots.map((time) => {
          const slotStart = new Date(`${date}T${time}:00`);
          const slotEnd = new Date(slotStart.getTime() + durationMin * 60 * 1000);

          if (slotStart <= now) return { time, available: false };

          const hasConflict = bookings.some((b) => slotStart < new Date(b.endAt) && slotEnd > new Date(b.startAt));
          if (hasConflict) return { time, available: false };

          const isBlocked = blocked.some((b) => slotStart < new Date(b.endAt) && slotEnd > new Date(b.startAt));
          if (isBlocked) return { time, available: false };

          return { time, available: true };
        });

        return { slots, durationMin };
      },
      {
        ttlSeconds: CACHE_TTL.availability,
        tags: [CACHE_TAGS.availability, CACHE_TAGS.bookings],
      },
    );

    return NextResponse.json({ success: true, data }, { headers: publicCacheHeaders(15, 15) });
  } catch (error) {
    console.error("GET /api/availability error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Có lỗi xảy ra" } },
      { status: 500 }
    );
  }
}
