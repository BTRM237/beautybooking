"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Calendar, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export type BlogPostView = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  category: string | null;
  thumbnail: string | null;
  publishedAt: string | null;
};

function formatDate(value: string | null) {
  if (!value) return "Chưa đặt ngày";
  return new Date(value).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function BlogIndex({ posts }: { posts: BlogPostView[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Tất cả");
  const featured = posts[0];

  const categories = useMemo(() => {
    const actual = Array.from(new Set(posts.map((post) => post.category).filter(Boolean))) as string[];
    return ["Tất cả", ...actual];
  }, [posts]);

  const filtered = posts.filter((post) => {
    const matchesCategory = category === "Tất cả" || post.category === category;
    const matchesQuery = `${post.title} ${post.excerpt || ""} ${post.category || ""}`
      .toLowerCase()
      .includes(query.trim().toLowerCase());
    return matchesCategory && matchesQuery;
  });

  return (
    <div>
      {featured && (
        <Link href={`/blog/${featured.slug}`} className="group mb-7 grid overflow-hidden rounded-3xl border border-[#f3a38f]/18 bg-[#120d11] shadow-[0_24px_70px_rgba(0,0,0,0.32)] md:mb-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="relative min-h-[220px] overflow-hidden bg-[#120d11] sm:min-h-[280px] lg:min-h-[320px]">
            <Image
              src={featured.thumbnail?.startsWith("/") ? featured.thumbnail : "/images/bridal.png"}
              alt={`Ảnh bài viết ${featured.title}`}
              fill
              priority
              sizes="(min-width: 1024px) 54vw, 100vw"
              className="object-cover opacity-90 transition duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#070509]/88 to-transparent" />
          </div>
          <div className="relative z-10 flex flex-col justify-center bg-[#120d11] p-5 md:p-10">
            <span className="mb-3 w-fit rounded-full border border-[#f3a38f]/22 bg-white/[0.05] px-3 py-1.5 text-xs font-bold text-[#ffc0ad] md:mb-4 md:px-4 md:py-2 md:text-sm">
              Bài nổi bật
            </span>
            <h2 className="font-heading text-3xl font-medium leading-tight text-[#f7e8e2] md:text-5xl">{featured.title}</h2>
            {featured.excerpt && <p className="mt-3 line-clamp-3 text-sm leading-7 text-[#cdbab4] md:mt-5 md:text-base md:leading-8">{featured.excerpt}</p>}
            <div className="mt-5 flex items-center gap-3 text-sm text-[#bd7b6c] md:mt-7">
              <Calendar className="h-4 w-4" />
              {formatDate(featured.publishedAt)}
              <span className="ml-auto inline-flex items-center gap-2 font-bold text-[#ffc0ad]">
                Đọc bài <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </div>
        </Link>
      )}

      <div className="mb-6 grid gap-3 md:mb-9 lg:grid-cols-[1fr_340px] lg:items-center">
        <div className="-mx-2 flex flex-nowrap gap-2 overflow-x-auto px-2 pb-1 hide-scrollbar sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setCategory(item)}
              className={cn(
                "min-h-10 shrink-0 rounded-full border px-4 text-xs font-bold uppercase transition",
                category === item
                  ? "border-[#f3a38f] bg-[#f3a38f] text-[#160c10]"
                  : "border-[#f3a38f]/18 bg-[#120d11] text-[#d9c7c0] hover:border-[#f3a38f]/50 hover:text-[#ffc0ad]",
              )}
            >
              {item}
            </button>
          ))}
        </div>
        <label className="relative block">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#f3a38f]" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="h-11 w-full rounded-full border border-[#f3a38f]/18 bg-[#120d11] pl-11 pr-4 text-sm text-[#f7e8e2] outline-none placeholder:text-[#8d7570] focus:border-[#f3a38f]/60"
            placeholder="Tìm bài viết..."
          />
        </label>
      </div>

      {filtered.length ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#f3a38f]/18 bg-[#160f14]">
              <div className="relative aspect-video overflow-hidden bg-[#160f14]">
                <Image
                  src={post.thumbnail?.startsWith("/") ? post.thumbnail : "/images/hero.png"}
                  alt={`Ảnh bài viết ${post.title}`}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                  className="object-cover opacity-90 transition duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#070509]/86 to-transparent" />
              </div>
              <div className="relative z-10 -mt-px flex flex-1 flex-col bg-[#160f14] p-5 md:p-6">
                {post.category && <p className="mb-3 text-xs font-bold text-[#bd7b6c]">{post.category}</p>}
                <h3 className="font-heading text-2xl font-medium leading-tight text-[#f7e8e2] group-hover:text-[#ffc0ad]">{post.title}</h3>
                {post.excerpt && <p className="mt-3 line-clamp-3 flex-1 text-sm leading-7 text-[#cdbab4]">{post.excerpt}</p>}
                <div className="mt-5 flex items-center justify-between border-t border-[#f3a38f]/10 pt-5 text-xs text-[#cdbab4]">
                  <span>{formatDate(post.publishedAt)}</span>
                  <span className="font-bold text-[#ffc0ad]">Đọc thêm</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-[#f3a38f]/18 bg-[#120d11] p-6 text-center md:p-10">
          <h3 className="font-heading text-2xl text-[#f7e8e2] md:text-3xl">Không tìm thấy bài viết</h3>
          <p className="mt-2 text-sm text-[#cdbab4]">Bạn thử đổi từ khóa hoặc chọn danh mục khác nhé.</p>
        </div>
      )}

      <div className="mt-8 rounded-3xl border border-[#f3a38f]/18 bg-[#1a1216] p-5 text-center md:mt-12 md:p-7">
        <h2 className="font-heading text-2xl font-medium text-[#f7e8e2] md:text-3xl">Muốn được tư vấn makeup phù hợp?</h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-[#cdbab4]">
          Đặt lịch để studio tư vấn tone makeup, kiểu tóc và khung giờ phù hợp với dịp của bạn.
        </p>
        <Link href="/dat-lich" className="btn-primary mt-6">
          Đặt lịch ngay <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
