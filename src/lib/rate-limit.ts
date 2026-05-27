import { NextResponse } from "next/server";
import { cacheKey, incrementExpiringCounter } from "@/lib/cache";

type RateLimitOptions = {
  limit: number;
  windowSeconds: number;
  message?: string;
};

type CounterState = {
  count: number;
  resetAt: number;
};

type GlobalWithRateLimit = typeof globalThis & {
  rateLimitStore?: Map<string, CounterState>;
};

const globalForRateLimit = globalThis as GlobalWithRateLimit;
const RATE_LIMIT_DISABLED = process.env.RATE_LIMIT_DISABLED === "true";
const MAX_MEMORY_KEYS = Number(process.env.RATE_LIMIT_MEMORY_MAX_KEYS || 10000);

globalForRateLimit.rateLimitStore ??= new Map();

function getClientIp(req: Request) {
  const candidates = [
    req.headers.get("cf-connecting-ip"),
    req.headers.get("true-client-ip"),
    req.headers.get("x-real-ip"),
    req.headers.get("x-forwarded-for")?.split(",")[0],
  ];

  return candidates.find((value) => value?.trim())?.trim() || "unknown";
}

function incrementMemoryCounter(key: string, windowSeconds: number) {
  const store = globalForRateLimit.rateLimitStore!;
  const now = Date.now();
  const current = store.get(key);

  if (!current || current.resetAt <= now) {
    const next = { count: 1, resetAt: now + windowSeconds * 1000 };
    store.set(key, next);
    return next;
  }

  current.count += 1;
  store.set(key, current);

  if (store.size > MAX_MEMORY_KEYS) {
    for (const [storedKey, value] of store) {
      if (value.resetAt <= now) store.delete(storedKey);
      if (store.size <= MAX_MEMORY_KEYS) break;
    }
  }

  return current;
}

export async function rateLimit(req: Request, scope: string, options: RateLimitOptions) {
  if (RATE_LIMIT_DISABLED) return null;

  const ip = getClientIp(req);
  const key = cacheKey("rate-limit", scope, ip);
  const counter =
    (await incrementExpiringCounter(key, options.windowSeconds)) ??
    incrementMemoryCounter(key, options.windowSeconds);

  if (counter.count <= options.limit) return null;

  const retryAfter = Math.max(1, Math.ceil((counter.resetAt - Date.now()) / 1000));

  return NextResponse.json(
    {
      success: false,
      error: {
        code: "RATE_LIMITED",
        message: options.message || "Quá nhiều yêu cầu. Vui lòng thử lại sau.",
      },
    },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfter),
        "X-RateLimit-Limit": String(options.limit),
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": String(Math.ceil(counter.resetAt / 1000)),
      },
    },
  );
}
