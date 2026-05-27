import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { invalidateAvailabilityCache } from "@/lib/cache-invalidation";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, adminNote } = body;

    const booking = await prisma.booking.update({
      where: { id },
      data: { ...(status && { status }), ...(adminNote !== undefined && { adminNote }) },
    });

    // Create event
    if (status) {
      await prisma.bookingEvent.create({
        data: { bookingId: id, action: status, details: `Status changed to ${status}`, actor: "admin" },
      });
    }

    await invalidateAvailabilityCache();

    return NextResponse.json({ success: true, data: booking });
  } catch {
    return NextResponse.json({ success: false, error: { code: "SERVER_ERROR", message: "Có lỗi xảy ra" } }, { status: 500 });
  }
}
