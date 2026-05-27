import { NextRequest, NextResponse } from "next/server";
import { publicCacheHeaders } from "@/lib/cache";
import { getActiveServices } from "@/lib/public-data";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  try {
    const limited = await rateLimit(req, "services-read", {
      limit: 180,
      windowSeconds: 60,
    });
    if (limited) return limited;

    const services = await getActiveServices();
    return NextResponse.json({ success: true, data: services }, { headers: publicCacheHeaders(120, 480) });
  } catch (error) {
    console.error("GET /api/services error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Có lỗi xảy ra" } },
      { status: 500 }
    );
  }
}
