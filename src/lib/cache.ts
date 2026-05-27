import { createClient } from "redis";

type RedisClient = ReturnType<typeof createClient>;

type GlobalWithRedis = typeof globalThis & {
  redisClient?: RedisClient;
  redisConnectPromise?: Promise<RedisClient | null>;
  redisErrorLogged?: boolean;
};

type CacheOptions = {
  ttlSeconds: number;
  tags?: string[];
};

const globalForRedis = globalThis as GlobalWithRedis;

const REDIS_URL = process.env.REDIS_URL;
const CACHE_DISABLED = process.env.REDIS_CACHE_DISABLED === "true";
const CACHE_PREFIX = process.env.REDIS_CACHE_PREFIX || "beauty-booking";
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;

export const CACHE_TTL = {
  availability: 20,
  api: 120,
  home: 300,
  publicData: 600,
  content: 900,
  settings: 600,
} as const;

export const CACHE_TAGS = {
  public: "public",
  services: "services",
  staff: "staff",
  settings: "settings",
  blog: "blog",
  portfolio: "portfolio",
  reviews: "reviews",
  availability: "availability",
  bookings: "bookings",
} as const;

export function cacheKey(...parts: Array<string | number | boolean | null | undefined>) {
  const safeParts = parts.map((part) =>
    String(part ?? "none")
      .trim()
      .replace(/[^a-zA-Z0-9_.-]+/g, "_")
      .slice(0, 160),
  );

  return [CACHE_PREFIX, ...safeParts].join(":");
}

function tagKey(tag: string) {
  return cacheKey("tag", tag);
}

function deserialize<T>(raw: string): T {
  return JSON.parse(raw, (_key, value) => {
    if (typeof value === "string" && DATE_PATTERN.test(value)) {
      return new Date(value);
    }
    return value;
  }) as T;
}

async function getRedisClient() {
  if (CACHE_DISABLED || !REDIS_URL) return null;

  if (!globalForRedis.redisClient) {
    const client = createClient({
      url: REDIS_URL,
      socket: {
        reconnectStrategy: (retries) => Math.min(retries * 50, 1000),
      },
    });

    client.on("error", (error) => {
      if (!globalForRedis.redisErrorLogged) {
        console.warn("Redis cache unavailable, falling back to database:", error.message);
        globalForRedis.redisErrorLogged = true;
      }
    });

    globalForRedis.redisClient = client;
  }

  const client = globalForRedis.redisClient;
  if (client.isOpen) return client;

  globalForRedis.redisConnectPromise ??= client
    .connect()
    .then(() => client)
    .catch((error) => {
      if (!globalForRedis.redisErrorLogged) {
        console.warn("Redis cache connect failed, falling back to database:", error.message);
        globalForRedis.redisErrorLogged = true;
      }
      globalForRedis.redisConnectPromise = undefined;
      return null;
    });

  return globalForRedis.redisConnectPromise;
}

export async function readCache<T>(key: string): Promise<{ hit: true; value: T } | { hit: false }> {
  const redis = await getRedisClient();
  if (!redis) return { hit: false };

  try {
    const raw = await redis.get(key);
    if (raw === null) return { hit: false };
    return { hit: true, value: deserialize<T>(raw) };
  } catch (error) {
    console.warn("Redis cache read failed:", error);
    return { hit: false };
  }
}

export async function writeCache<T>(key: string, value: T, options: CacheOptions) {
  const redis = await getRedisClient();
  if (!redis || value === undefined) return;

  try {
    const serialized = JSON.stringify(value);
    const multi = redis.multi();

    multi.set(key, serialized, { EX: options.ttlSeconds });

    for (const tag of options.tags || []) {
      const redisTagKey = tagKey(tag);
      multi.sAdd(redisTagKey, key);
      multi.expire(redisTagKey, options.ttlSeconds + 3600);
    }

    await multi.exec();
  } catch (error) {
    console.warn("Redis cache write failed:", error);
  }
}

export async function cached<T>(key: string, loader: () => Promise<T>, options: CacheOptions): Promise<T> {
  const existing = await readCache<T>(key);
  if (existing.hit) return existing.value;

  const value = await loader();
  await writeCache(key, value, options);
  return value;
}

export async function deleteCacheKeys(...keys: string[]) {
  const redis = await getRedisClient();
  if (!redis || keys.length === 0) return;

  try {
    await redis.del(keys);
  } catch (error) {
    console.warn("Redis cache delete failed:", error);
  }
}

export async function invalidateCacheTags(...tags: string[]) {
  const redis = await getRedisClient();
  if (!redis || tags.length === 0) return;

  try {
    for (const tag of tags) {
      const redisTagKey = tagKey(tag);
      const keys = await redis.sMembers(redisTagKey);
      if (keys.length > 0) await redis.del(keys);
      await redis.del(redisTagKey);
    }
  } catch (error) {
    console.warn("Redis cache tag invalidation failed:", error);
  }
}

export async function incrementExpiringCounter(key: string, ttlSeconds: number) {
  const redis = await getRedisClient();
  if (!redis) return null;

  try {
    const count = await redis.incr(key);
    let ttl = await redis.ttl(key);

    if (count === 1 || ttl < 0) {
      await redis.expire(key, ttlSeconds);
      ttl = ttlSeconds;
    }

    return {
      count,
      resetAt: Date.now() + ttl * 1000,
    };
  } catch (error) {
    console.warn("Redis rate limit counter failed:", error);
    return null;
  }
}

export function publicCacheHeaders(maxAge: number = CACHE_TTL.api, staleWhileRevalidate: number = maxAge * 4) {
  return {
    "Cache-Control": `public, max-age=${maxAge}, stale-while-revalidate=${staleWhileRevalidate}`,
  };
}
