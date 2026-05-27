import type { BlogPost, PortfolioItem, Prisma, Review, Service } from "@prisma/client";
import prisma from "@/lib/prisma";
import { cached, cacheKey, CACHE_TAGS, CACHE_TTL } from "@/lib/cache";

export type SettingsMap = Record<string, string>;

export type HomeData = {
  services: Service[];
  reviews: Review[];
  settings: SettingsMap;
  blogPosts: BlogPost[];
  portfolio: PortfolioItem[];
};

export type PublicStaffProfile = Prisma.StaffProfileGetPayload<{
  include: {
    user: { select: { id: true; name: true; email: true } };
    services: { include: { service: { select: { id: true; name: true; slug: true } } } };
  };
}>;

export type ServiceStaffView = {
  id: string;
  staff: {
    displayName: string;
    experienceYears: number;
    user: { name: string };
  };
};

export type ServiceDetailData = {
  service: Service;
  staffProfiles: ServiceStaffView[];
  relatedServices: Service[];
};

export type BlogDetailData = {
  post: BlogPost;
  relatedPosts: BlogPost[];
};

function settingsToMap(settings: { key: string; value: string }[]): SettingsMap {
  return Object.fromEntries(settings.map((item) => [item.key, item.value]));
}

export async function getSettingsMap() {
  return cached(
    cacheKey("settings", "map"),
    async () => settingsToMap(await prisma.setting.findMany()),
    {
      ttlSeconds: CACHE_TTL.settings,
      tags: [CACHE_TAGS.public, CACHE_TAGS.settings],
    },
  );
}

export async function getHomeData(): Promise<HomeData> {
  return cached(
    cacheKey("home", "v1"),
    async () => {
      const [services, reviews, settings, blogPosts, portfolio] = await Promise.all([
        prisma.service.findMany({
          where: { status: "ACTIVE" },
          orderBy: { sortOrder: "asc" },
          take: 6,
        }),
        prisma.review.findMany({
          where: { isApproved: true },
          orderBy: { createdAt: "desc" },
          take: 4,
        }),
        prisma.setting.findMany(),
        prisma.blogPost.findMany({
          where: { status: "PUBLISHED" },
          orderBy: { publishedAt: "desc" },
          take: 3,
        }),
        prisma.portfolioItem.findMany({
          where: { status: "VISIBLE" },
          orderBy: { sortOrder: "asc" },
          take: 4,
        }),
      ]);

      return { services, reviews, settings: settingsToMap(settings), blogPosts, portfolio };
    },
    {
      ttlSeconds: CACHE_TTL.home,
      tags: [
        CACHE_TAGS.public,
        CACHE_TAGS.services,
        CACHE_TAGS.reviews,
        CACHE_TAGS.settings,
        CACHE_TAGS.blog,
        CACHE_TAGS.portfolio,
      ],
    },
  );
}

export async function getActiveServices() {
  return cached(
    cacheKey("services", "active"),
    () =>
      prisma.service.findMany({
        where: { status: "ACTIVE" },
        orderBy: { sortOrder: "asc" },
      }),
    {
      ttlSeconds: CACHE_TTL.publicData,
      tags: [CACHE_TAGS.public, CACHE_TAGS.services],
    },
  );
}

export async function getServiceBySlug(slug: string) {
  return cached(
    cacheKey("service", "slug", slug),
    () => prisma.service.findUnique({ where: { slug } }),
    {
      ttlSeconds: CACHE_TTL.content,
      tags: [CACHE_TAGS.public, CACHE_TAGS.services],
    },
  );
}

export async function getServiceDetailData(slug: string): Promise<ServiceDetailData | null> {
  return cached(
    cacheKey("service", "detail", slug),
    async () => {
      const service = await prisma.service.findUnique({ where: { slug } });
      if (!service) return null;

      const [staffProfiles, relatedServices] = await Promise.all([
        prisma.serviceStaff.findMany({
          where: { service: { id: service.id } },
          include: { staff: { include: { user: { select: { name: true } } } } },
        }),
        prisma.service.findMany({
          where: { status: "ACTIVE", category: service.category, id: { not: service.id } },
          take: 3,
          orderBy: { sortOrder: "asc" },
        }),
      ]);

      return {
        service,
        staffProfiles: staffProfiles as unknown as ServiceStaffView[],
        relatedServices,
      };
    },
    {
      ttlSeconds: CACHE_TTL.content,
      tags: [CACHE_TAGS.public, CACHE_TAGS.services, CACHE_TAGS.staff],
    },
  );
}

export async function getPublicStaff() {
  return cached<PublicStaffProfile[]>(
    cacheKey("staff", "active"),
    () =>
      prisma.staffProfile.findMany({
        where: { workingStatus: "ACTIVE" },
        orderBy: { sortOrder: "asc" },
        include: {
          user: { select: { id: true, name: true, email: true } },
          services: { include: { service: { select: { id: true, name: true, slug: true } } } },
        },
      }),
    {
      ttlSeconds: CACHE_TTL.publicData,
      tags: [CACHE_TAGS.public, CACHE_TAGS.staff, CACHE_TAGS.services],
    },
  );
}

export async function getPublishedBlogPosts() {
  return cached(
    cacheKey("blog", "published"),
    () =>
      prisma.blogPost.findMany({
        where: { status: "PUBLISHED" },
        orderBy: { publishedAt: "desc" },
      }),
    {
      ttlSeconds: CACHE_TTL.content,
      tags: [CACHE_TAGS.public, CACHE_TAGS.blog],
    },
  );
}

export async function getBlogPostBySlug(slug: string) {
  return cached(
    cacheKey("blog", "slug", slug),
    () => prisma.blogPost.findUnique({ where: { slug } }),
    {
      ttlSeconds: CACHE_TTL.content,
      tags: [CACHE_TAGS.public, CACHE_TAGS.blog],
    },
  );
}

export async function getBlogDetailData(slug: string): Promise<BlogDetailData | null> {
  return cached(
    cacheKey("blog", "detail", slug),
    async () => {
      const post = await prisma.blogPost.findUnique({ where: { slug } });
      if (!post) return null;

      const relatedPosts = await prisma.blogPost.findMany({
        where: { status: "PUBLISHED", id: { not: post.id }, category: post.category },
        take: 3,
      });

      return { post, relatedPosts };
    },
    {
      ttlSeconds: CACHE_TTL.content,
      tags: [CACHE_TAGS.public, CACHE_TAGS.blog],
    },
  );
}

export async function getVisiblePortfolioItems() {
  return cached(
    cacheKey("portfolio", "visible"),
    () =>
      prisma.portfolioItem.findMany({
        where: { status: "VISIBLE" },
        orderBy: { sortOrder: "asc" },
      }),
    {
      ttlSeconds: CACHE_TTL.content,
      tags: [CACHE_TAGS.public, CACHE_TAGS.portfolio],
    },
  );
}

export async function getSitemapContent() {
  return cached(
    cacheKey("sitemap", "content"),
    () =>
      Promise.all([
        prisma.service.findMany({
          where: { status: "ACTIVE" },
          select: { slug: true, updatedAt: true },
          orderBy: { sortOrder: "asc" },
        }),
        prisma.blogPost.findMany({
          where: { status: "PUBLISHED" },
          select: { slug: true, updatedAt: true, publishedAt: true },
          orderBy: { publishedAt: "desc" },
        }),
      ]).then(([services, posts]) => ({ services, posts })),
    {
      ttlSeconds: CACHE_TTL.content,
      tags: [CACHE_TAGS.public, CACHE_TAGS.services, CACHE_TAGS.blog],
    },
  );
}
