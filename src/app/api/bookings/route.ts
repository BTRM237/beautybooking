import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateBookingCode } from "@/lib/utils";
import { invalidateAvailabilityCache } from "@/lib/cache-invalidation";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const limited = await rateLimit(req, "booking-create", {
      limit: 6,
      windowSeconds: 600,
      message: "Bạn đặt lịch quá nhiều lần. Vui lòng thử lại sau ít phút.",
    });
    if (limited) return limited;

    const body = await req.json();
    const { serviceId, staffId, startAt, customerName, customerPhone, customerEmail, bookingType, address, note, consent } = body;

    // Validate required fields
    if (!serviceId || !staffId || !startAt || !customerName || !customerPhone) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_INPUT", message: "Vui lòng điền đầy đủ thông tin" } },
        { status: 400 }
      );
    }

    // Validate phone
    if (!/^(0|\+84)\d{9,10}$/.test(customerPhone.replace(/\s/g, ""))) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_PHONE", message: "Vui lòng nhập số điện thoại hợp lệ" } },
        { status: 400 }
      );
    }

    const startDate = new Date(startAt);
    if (startDate <= new Date()) {
      return NextResponse.json(
        { success: false, error: { code: "PAST_DATE", message: "Vui lòng chọn thời gian trong tương lai" } },
        { status: 400 }
      );
    }

    // Check service exists
    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service || service.status !== "ACTIVE") {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_SERVICE", message: "Dịch vụ không hợp lệ" } },
        { status: 400 }
      );
    }

    // Check staff exists and can perform this service
    const staffProfile = await prisma.staffProfile.findFirst({
      where: {
        userId: staffId,
        workingStatus: "ACTIVE",
        services: { some: { service: { id: serviceId } } },
      },
    });
    if (!staffProfile) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_STAFF", message: "Chuyên viên không hợp lệ hoặc không phục vụ dịch vụ này" } },
        { status: 400 }
      );
    }

    const endDate = new Date(startDate.getTime() + service.durationMin * 60 * 1000);

    // Check for blocked slots
    const blocked = await prisma.blockedSlot.findFirst({
      where: {
        OR: [
          { staffId: staffId },
          { staffId: null },
        ],
        startAt: { lt: endDate },
        endAt: { gt: startDate },
      },
    });
    if (blocked) {
      return NextResponse.json(
        { success: false, error: { code: "BLOCKED_SLOT", message: "Khung giờ này không khả dụng" } },
        { status: 409 }
      );
    }

    // Check for existing booking (double booking prevention)
    const existing = await prisma.booking.findFirst({
      where: {
        staffId,
        status: { in: ["PENDING", "CONFIRMED"] },
        startAt: { lt: endDate },
        endAt: { gt: startDate },
      },
    });
    if (existing) {
      return NextResponse.json(
        { success: false, error: { code: "SLOT_TAKEN", message: "Khung giờ này vừa có người đặt. Vui lòng chọn khung giờ khác." } },
        { status: 409 }
      );
    }

    // Create or update customer
    const cleanPhone = customerPhone.replace(/\s/g, "");
    let customer = await prisma.customer.findUnique({ where: { phone: cleanPhone } });
    if (customer) {
      customer = await prisma.customer.update({
        where: { phone: cleanPhone },
        data: { name: customerName, email: customerEmail || undefined },
      });
    } else {
      customer = await prisma.customer.create({
        data: { name: customerName, phone: cleanPhone, email: customerEmail || undefined },
      });
    }

    // Generate unique booking code
    let bookingCode = generateBookingCode();
    let attempts = 0;
    while (attempts < 10) {
      const existingCode = await prisma.booking.findUnique({ where: { bookingCode } });
      if (!existingCode) break;
      bookingCode = generateBookingCode();
      attempts++;
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        bookingCode,
        customerId: customer.id,
        serviceId,
        staffId,
        startAt: startDate,
        endAt: endDate,
        bookingType: bookingType || "STUDIO",
        address: bookingType === "HOME" ? address : null,
        totalPrice: service.basePrice,
        customerNote: note || null,
        consentGiven: consent || false,
        status: "PENDING",
      },
    });

    // Create booking event
    await prisma.bookingEvent.create({
      data: {
        bookingId: booking.id,
        action: "CREATED",
        details: `Booking created by customer ${customerName}`,
        actor: "customer",
      },
    });

    // Track analytics
    await prisma.analyticsEvent.create({
      data: {
        eventType: "booking_complete",
        eventData: JSON.stringify({ serviceId, bookingCode }),
      },
    }).catch(() => {});

    await invalidateAvailabilityCache();

    return NextResponse.json({
      success: true,
      data: {
        bookingCode: booking.bookingCode,
        serviceName: service.name,
        startAt: booking.startAt,
        endAt: booking.endAt,
        totalPrice: booking.totalPrice,
        status: booking.status,
      },
    });
  } catch (error) {
    console.error("POST /api/bookings error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Có lỗi xảy ra, vui lòng thử lại" } },
      { status: 500 }
    );
  }
}
