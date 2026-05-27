import Image from "next/image";
import Link from "next/link";
import sanitizeHtml from "sanitize-html";
import { notFound } from "next/navigation";
import { getBlogDetailData, getBlogPostBySlug } from "@/lib/public-data";
import { ArrowLeft, ArrowRight, Calendar, Clock, Palette } from "lucide-react";
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

function readingTime(content: string) {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}

function extractHeadings(content: string) {
  return content
    .split("\n")
    .filter((line) => /^##?\s+/.test(line))
    .slice(0, 6)
    .map((line) => line.replace(/^#+\s+/, "").trim());
}

function markdownToHtml(content: string) {
  const escaped = content
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const html = escaped
    .replace(/^# (.+)$/gm, '<h2 id="$1">$1</h2>')
    .replace(/^## (.+)$/gm, '<h3 id="$1">$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/^(\d+)\. (.+)$/gm, "<li>$2</li>")
    .replace(/\n{2,}/g, "</p><p>")
    .replace(/\n/g, "<br />");

  return sanitizeHtml(`<p>${html}</p>`, {
    allowedTags: ["p", "br", "strong", "h2", "h3", "li"],
    allowedAttributes: { h2: ["id"], h3: ["id"] },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.seoTitle || `${post.title} | Luna Makeup Studio`,
    description: post.seoDescription || post.excerpt || "",
  };
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;
  const data = await getBlogDetailData(slug);
  if (!data) notFound();

  const { post, relatedPosts } = data;
  if (!post || post.status !== "PUBLISHED") notFound();

  const headings = extractHeadings(post.content);
  const html = markdownToHtml(post.content);
  const heroImage = post.thumbnail?.startsWith("/") ? post.thumbnail : "/images/luna-banner.png";

  return (
    <>
      <section className="relative isolate -mt-20 overflow-hidden border-b border-[#f3a38f]/12 bg-[#070509] pt-32 text-[#f7e8e2] md:pt-36">
        <Image
          src="/images/luna-banner.png"
          alt="Banner beauty journal của Luna"
          fill
          priority
          sizes="100vw"
          className="absolute inset-0 -z-20 object-cover object-[72%_center] opacity-[0.52]"
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,#070509_0%,rgba(7,5,9,0.94)_34%,rgba(7,5,9,0.70)_68%,#070509_100%)]" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-44 bg-gradient-to-t from-[#070509] to-transparent" />

        <div className="container-custom pb-16 md:pb-24">
          <Link href="/blog" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-[#cdbab4] transition-colors hover:text-[#ffc0ad]">
            <ArrowLeft className="h-4 w-4" />
            Quay lại Blog
          </Link>

          <div className="grid gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
            <div>
              {post.category && (
                <span className="inline-flex items-center gap-2 rounded-full border border-[#f3a38f]/24 bg-[#120d11]/58 px-4 py-2 text-xs font-bold uppercase text-[#ffc0ad] backdrop-blur-xl">
                  <Palette className="h-4 w-4" />
                  {post.category}
                </span>
              )}
              <h1 className="mt-4 font-heading text-[2.55rem] font-medium leading-[1] text-[#ffc4b3] md:mt-5 md:text-6xl lg:text-[4.75rem]">
                {post.title}
              </h1>
              {post.excerpt && <p className="mt-4 text-sm leading-7 text-[#f1ddd5] md:mt-5 md:text-lg md:leading-8">{post.excerpt}</p>}
              <div className="mt-7 flex flex-wrap gap-3 text-sm text-[#cdbab4]">
                {post.publishedAt && (
                  <span className="inline-flex items-center gap-2 rounded-full border border-[#f3a38f]/16 bg-[#120d11]/62 px-4 py-2">
                    <Calendar className="h-4 w-4 text-[#ffc0ad]" />
                    {new Date(post.publishedAt).toLocaleDateString("vi-VN", { year: "numeric", month: "long", day: "numeric" })}
                  </span>
                )}
                <span className="inline-flex items-center gap-2 rounded-full border border-[#f3a38f]/16 bg-[#120d11]/62 px-4 py-2">
                  <Clock className="h-4 w-4 text-[#ffc0ad]" />
                  {readingTime(post.content)} phút đọc
                </span>
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-[#f3a38f]/18 bg-[#120d11] p-2 shadow-[0_28px_90px_rgba(0,0,0,0.4)] md:p-3">
              <div className="relative aspect-[16/10] overflow-hidden rounded-[1.25rem] bg-[#24161d]">
                <Image
                  src={heroImage}
                  alt={`Ảnh minh họa bài viết ${post.title}`}
                  fill
                  priority
                  sizes="(min-width: 1024px) 45vw, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#070509]/72 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#070509] py-10 md:py-20">
        <div className="container-custom grid max-w-6xl gap-8 lg:grid-cols-[260px_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-28 rounded-3xl border border-[#f3a38f]/18 bg-[#120d11] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.34)]">
              <h2 className="font-heading text-2xl font-medium text-[#f7e8e2]">Mục lục</h2>
              <div className="mt-4 space-y-2">
                {headings.length ? (
                  headings.map((heading) => (
                    <a key={heading} href={`#${heading}`} className="block rounded-2xl px-3 py-2 text-sm text-[#cdbab4] hover:bg-white/[0.04] hover:text-[#ffc0ad]">
                      {heading}
                    </a>
                  ))
                ) : (
                  <p className="text-sm leading-6 text-[#cdbab4]">Bài viết ngắn, không có mục lục.</p>
                )}
              </div>
            </div>
          </aside>

          <article>
            <div className="rounded-3xl border border-[#f3a38f]/18 bg-[#120d11] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.34)] md:p-10">
              <div
                className="beauty-article text-base leading-8 text-[#e9d8d1]"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            </div>

            <div className="mt-6 rounded-3xl border border-[#f3a38f]/18 bg-[linear-gradient(145deg,rgba(243,163,143,0.14),rgba(18,13,17,0.96))] p-5 text-center md:mt-8 md:p-8">
              <h2 className="font-heading text-3xl font-medium leading-tight text-[#f7e8e2] md:text-4xl">
                Muốn được tư vấn makeup phù hợp?
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-[#cdbab4]">
                Đặt lịch ngay để Luna tư vấn tone makeup, kiểu tóc và khung giờ phù hợp với dịp của bạn.
              </p>
              <Link href="/dat-lich" className="btn-primary mt-6 uppercase">
                Đặt lịch ngay <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {relatedPosts.length > 0 && (
              <div className="mt-12">
                <h2 className="mb-6 font-heading text-4xl font-medium text-[#f7e8e2]">Bài viết liên quan</h2>
                <div className="grid gap-5 md:grid-cols-3">
                  {relatedPosts.map((related) => (
                    <Link key={related.id} href={`/blog/${related.slug}`} className="block rounded-2xl border border-[#f3a38f]/18 bg-[#120d11] p-5 transition hover:-translate-y-1 hover:border-[#f3a38f]/45">
                      <p className="text-xs font-bold uppercase text-[#bd7b6c]">{related.category}</p>
                      <h3 className="mt-2 font-heading text-2xl font-medium leading-tight text-[#f7e8e2]">{related.title}</h3>
                      {related.excerpt && <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#cdbab4]">{related.excerpt}</p>}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </article>
        </div>
      </section>
    </>
  );
}
