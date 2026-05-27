import { NextRequest, NextResponse } from "next/server";

type ProxyRateLimitState = {
  count: number;
  resetAt: number;
};

const proxyRateLimitStore = new Map<string, ProxyRateLimitState>();

function parseAdminSession(value: string) {
  const binary = atob(value);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes));
}

function getClientIp(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("true-client-ip") ||
    request.headers.get("x-real-ip") ||
    forwardedFor ||
    "unknown"
  );
}

function rateLimitProxy(request: NextRequest, scope: string, limit: number, windowSeconds: number) {
  const key = `${scope}:${getClientIp(request)}`;
  const now = Date.now();
  const current = proxyRateLimitStore.get(key);

  if (!current || current.resetAt <= now) {
    proxyRateLimitStore.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return null;
  }

  current.count += 1;
  proxyRateLimitStore.set(key, current);

  if (current.count <= limit) return null;

  return NextResponse.json(
    {
      success: false,
      error: {
        code: "RATE_LIMITED",
        message: "Quá nhiều yêu cầu. Vui lòng thử lại sau.",
      },
    },
    {
      status: 429,
      headers: {
        "Retry-After": String(Math.max(1, Math.ceil((current.resetAt - now) / 1000))),
      },
    },
  );
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/")) {
    const limited = rateLimitProxy(request, "api", pathname.startsWith("/api/admin") ? 240 : 600, 60);
    if (limited) return limited;
  }

  if (pathname.startsWith("/admin")) {
    const limited = rateLimitProxy(request, "admin-page", 180, 60);
    if (limited) return limited;
  }

  // Protect admin routes except login
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const session = request.cookies.get("admin_session");
    if (!session) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    // Verify session is valid base64 JSON
    try {
      const data = parseAdminSession(session.value);
      if (!data.id || !["ADMIN", "STAFF"].includes(data.role)) {
        return NextResponse.redirect(new URL("/admin/login", request.url));
      }
    } catch {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  // Protect admin API routes
  if (pathname.startsWith("/api/admin") && !pathname.startsWith("/api/admin/auth")) {
    const session = request.cookies.get("admin_session");
    if (!session) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Chưa đăng nhập" } },
        { status: 401 }
      );
    }
    try {
      const data = parseAdminSession(session.value);
      if (!data.id || !["ADMIN", "STAFF"].includes(data.role)) {
        return NextResponse.json(
          { success: false, error: { code: "FORBIDDEN", message: "Không có quyền" } },
          { status: 403 }
        );
      }
    } catch {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Phiên đăng nhập không hợp lệ" } },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/:path*"],
};
