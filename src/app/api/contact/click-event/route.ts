import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const limited = await rateLimit(req, "contact-click", {
      limit: 60,
      windowSeconds: 60,
    });
    if (limited) return limited;

    const body = await req.json();
    const { eventType, eventData } = body;

    await prisma.analyticsEvent.create({
      data: {
        eventType: eventType || "contact_click",
        eventData: eventData ? JSON.stringify(eventData) : null,
        page: req.headers.get("referer") || null,
      },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: true }); // Don't fail on analytics
  }
}
