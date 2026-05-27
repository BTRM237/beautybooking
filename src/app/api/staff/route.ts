import { NextRequest, NextResponse } from "next/server";
import { publicCacheHeaders } from "@/lib/cache";
import { getPublicStaff } from "@/lib/public-data";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  try {
    const limited = await rateLimit(req, "staff-read", {
      limit: 180,
      windowSeconds: 60,
    });
    if (limited) return limited;

    const staff = await getPublicStaff();
    return NextResponse.json({ success: true, data: staff }, { headers: publicCacheHeaders(120, 480) });
  } catch (error) {
    console.error("GET /api/staff error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Có lỗi xảy ra" } },
      { status: 500 }
    );
  }
}
