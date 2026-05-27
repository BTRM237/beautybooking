import { MetadataRoute } from "next";
import { getSitemapContent } from "@/lib/public-data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const { services, posts } = await getSitemapContent();
  const now = new Date();

  return [
    { url: baseUrl, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/dich-vu`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/bang-gia`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/dat-lich`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/portfolio`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/gioi-thieu`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/lien-he`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    ...services.map((service) => ({
      url: `${baseUrl}/dich-vu/${service.slug}`,
      lastModified: service.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.75,
    })),
    ...posts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: post.updatedAt || post.publishedAt || now,
      changeFrequency: "weekly" as const,
      priority: 0.65,
    })),
  ];
}
