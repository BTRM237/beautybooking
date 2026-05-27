import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { getHomeData } from "@/lib/public-data";
import HeroSection from "@/components/public/HeroSection";
import ServiceCard from "@/components/public/ServiceCard";
import {
  ArrowRight,
  Award,
  Check,
  Clock,
  Flower2,
  Gem,
  HeartHandshake,
  Home,
  MapPin,
  ShieldCheck,
  Star,
} from "lucide-react";
import type { BlogPost, PortfolioItem, Review, Service } from "@prisma/client";

const whyItems = [
  { icon: Gem, title: "Sản phẩm cao cấp", desc: "An toàn cho da" },
  { icon: Home, title: "Hỗ trợ tại nhà", desc: "Studio & Tại nhà" },
  { icon: Flower2, title: "Phong cách đa dạng", desc: "Cập nhật xu hướng mới nhất" },
  { icon: Clock, title: "Đúng giờ", desc: "Tôn trọng thời gian" },
  { icon: HeartHandshake, title: "Tư vấn tận tâm", desc: "Hiểu bạn hơn bạn nghĩ" },
  { icon: ShieldCheck, title: "Bảo hành makeup", desc: "Hỗ trợ chỉnh sửa" },
];

const pricingFallback = [
  { name: "Makeup Dự Tiệc", price: "800.000đ", slug: "makeup-du-tiec" },
  { name: "Makeup Cô Dâu", price: "1.800.000đ", slug: "makeup-co-dau", featured: true },
  { name: "Makeup Kỷ Yếu", price: "600.000đ", slug: "makeup-ky-yeu" },
  { name: "Makeup Chụp Ảnh", price: "900.000đ", slug: "makeup-chup-anh" },
  { name: "Combo Makeup + Tóc", price: "1.200.000đ", slug: "lam-toc-du-tiec" },
];

export default async function HomePage() {
  const { services, reviews, settings, blogPosts, portfolio } = await getHomeData();
  const pricingServices = services.slice(0, 5);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BeautySalon",
    name: "Luna Makeup Studio",
    description:
      "Studio makeup chuyên nghiệp tại Việt Nam. Dịch vụ makeup cô dâu, dự tiệc, kỷ yếu, chụp ảnh và sự kiện.",
    url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    telephone: settings.phone || "+84393231806",
    address: {
      "@type": "PostalAddress",
      streetAddress: settings.address || "68 Nguyễn Huệ",
      addressLocality: "TP. Hồ Chí Minh",
      addressCountry: "VN",
    },
    priceRange: "300.000đ - 2.500.000đ",
  };

  return (
    <main className="bg-[#070509] text-[#f7e8e2]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <HeroSection />

      <section className="relative -mt-8 border-b border-[#f3a38f]/10 bg-[#070509] pb-10 pt-6 md:-mt-24 md:pb-12">
        <div className="container-custom">
          <div className="mb-5 flex flex-col gap-4 md:mb-7 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase text-[#bd7b6c]">Dịch vụ nổi bật</p>
              <h2 className="mt-2 font-heading text-3xl font-medium leading-tight text-[#f7e8e2] md:text-5xl">
                Dịch vụ makeup chuyên nghiệp
              </h2>
            </div>
            <Link href="/dich-vu" className="btn-secondary w-full border-[#f3a38f]/30 px-5 text-xs uppercase text-[#ffc0ad] sm:w-fit">
              Xem tất cả dịch vụ <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
            {services.map((service: Service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[linear-gradient(90deg,#0a070b,#1b1216_52%,#0a070b)] py-10 md:py-12">
        <div className="container-custom grid gap-8 lg:grid-cols-[330px_1fr] lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase text-[#bd7b6c]">Vì sao chọn chúng tôi</p>
            <h2 className="mt-2 font-heading text-3xl font-medium leading-[1.05] text-[#f7e8e2] md:text-5xl">
              Nâng tầm nhan sắc tự tin tỏa sáng
            </h2>
            <p className="mt-4 text-sm leading-7 text-[#cdbab4]">
              Chúng tôi không chỉ makeup, chúng tôi tôn vinh vẻ đẹp riêng của bạn.
            </p>
            <Link href="/gioi-thieu" className="btn-secondary mt-6 border-[#f3a38f]/30 px-5 text-xs uppercase text-[#ffc0ad]">
              Tìm hiểu thêm <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {whyItems.map((item) => (
              <div key={item.title} className="rounded-2xl border border-[#f3a38f]/16 bg-[#21171b]/72 p-5 shadow-[0_18px_45px_rgba(0,0,0,0.25)]">
                <div className="flex items-center gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#f3a38f]/12 text-[#ffc0ad]">
                    <item.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-[#f7e8e2]">{item.title}</h3>
                    <p className="mt-1 text-xs text-[#cdbab4]">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-[#f3a38f]/10 bg-[#070509] py-10 md:py-12">
        <div className="container-custom">
          <SectionBar eyebrow="Portfolio" title="Hàng ngàn khách hàng đã tỏa sáng" href="/portfolio" cta="Xem tất cả" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {(portfolio.length ? portfolio : Array.from({ length: 4 })).map((item, index) => {
              const p = item as PortfolioItem | undefined;
              return <BeforeAfterCard key={p?.id || index} item={p} />;
            })}
          </div>
        </div>
      </section>

      <section className="border-t border-[#f3a38f]/10 bg-[#100b0f] py-10 md:py-12">
        <div className="container-custom">
          <SectionBar eyebrow="Bảng giá" title="Gói dịch vụ phổ biến" href="/bang-gia" cta="Xem bảng giá đầy đủ" />
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-5">
            {(pricingServices.length ? pricingServices : pricingFallback).map((item) => {
              const service = item as Service;
              const fallback = item as (typeof pricingFallback)[number];
              const title = "basePrice" in item ? service.name : fallback.name;
              const price = "basePrice" in item ? formatPrice(service.basePrice) : fallback.price;
              const slug = "slug" in item ? item.slug : fallback.slug;
              const featured = "featured" in item ? Boolean(item.featured) : Boolean(fallback.featured);
              return (
                <div
                  key={slug}
                  className={`relative rounded-2xl border bg-[#120d11] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.24)] ${
                    featured ? "border-[#ffb5a6] shadow-[0_0_36px_rgba(243,163,143,0.22)]" : "border-[#f3a38f]/16"
                  }`}
                >
                  {featured && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#f3a38f] px-4 py-1 text-[11px] font-bold text-[#160c10]">
                      Được chọn nhiều
                    </span>
                  )}
                  <h3 className="text-lg font-bold text-[#ffc0ad]">{title}</h3>
                  <p className="mt-3 text-2xl font-black text-[#ffc0ad]">{price}</p>
                  <ul className="mt-5 space-y-3 text-xs text-[#d9c7c0]">
                    {["Makeup chuyên nghiệp", "Tư vấn phong cách", "Mỹ phẩm cao cấp", "Hỗ trợ đúng ngày"].map((line) => (
                      <li key={line} className="flex gap-2">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#ffc0ad]" />
                        {line}
                      </li>
                    ))}
                  </ul>
                  <Link href={`/dat-lich?service=${slug}`} className="btn-primary mt-6 w-full min-h-10 rounded-lg py-3 text-[11px] uppercase">
                    Đặt lịch ngay
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-t border-[#f3a38f]/10 bg-[#070509] py-10 md:py-12">
        <div className="container-custom">
          <SectionBar eyebrow="Đánh giá khách hàng" title="Khách hàng nói gì về chúng tôi" />
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {(reviews.length ? reviews : []).map((review: Review) => (
              <article key={review.id} className="rounded-2xl border border-[#f3a38f]/16 bg-[#1a1216] p-5">
                <div className="mb-4 flex items-center gap-3">
                  <div className="relative h-12 w-12 overflow-hidden rounded-full bg-[#2a1b21]">
                    <Image src="/images/bridal.png" alt={`Ảnh đại diện ${review.name}`} fill sizes="48px" className="object-cover" />
                  </div>
                  <div>
                    <div className="flex text-[#ffc0ad]">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-current" />
                      ))}
                    </div>
                    <p className="mt-1 text-xs font-bold text-[#f7e8e2]">{review.name}</p>
                  </div>
                </div>
                <p className="line-clamp-4 text-xs leading-6 text-[#d9c7c0]">{review.comment}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-[#f3a38f]/10 bg-[#100b0f] py-10 md:py-12">
        <div className="container-custom grid gap-8 lg:grid-cols-[1fr_1fr]">
          <div>
            <SectionBar eyebrow="Bài viết mới" title="Cẩm nang làm đẹp" href="/blog" cta="Xem tất cả bài viết" />
            <div className="grid gap-4 md:grid-cols-3">
              {blogPosts.map((post: BlogPost, index) => (
                <Link key={post.id} href={`/blog/${post.slug}`} className="overflow-hidden rounded-2xl border border-[#f3a38f]/16 bg-[#1a1216]">
                  <div className="relative aspect-[4/3] bg-[#24161d]">
                    <Image
                      src={index % 2 ? "/images/hero.png" : "/images/bridal.png"}
                      alt={`Ảnh bài viết ${post.title}`}
                      fill
                      sizes="(min-width: 1024px) 16vw, 33vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#120c12]/70 to-transparent" />
                  </div>
                  <div className="p-4">
                    <h3 className="line-clamp-2 text-sm font-bold leading-5 text-[#f7e8e2]">{post.title}</h3>
                    <p className="mt-3 text-xs text-[#cdbab4]">
                      {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("vi-VN") : "Mới cập nhật"}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-bold uppercase text-[#bd7b6c]">Liên hệ & địa chỉ</p>
            <h2 className="mt-2 font-heading text-3xl font-medium text-[#f7e8e2] md:text-4xl">Luôn sẵn sàng hỗ trợ bạn</h2>
            <div className="mt-5 grid gap-5 md:grid-cols-[0.8fr_1.2fr]">
              <div className="space-y-3 text-sm leading-6 text-[#d9c7c0]">
                <p className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#f3a38f]/18 bg-[#f3a38f]/8 text-[#ffc0ad]">
                    <MapPin className="h-4.5 w-4.5" strokeWidth={2.2} />
                  </span>
                  <span>{settings.address || "68 Nguyễn Huệ, TP. Hồ Chí Minh"}</span>
                </p>
                <p className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#f3a38f]/18 bg-[#f3a38f]/8 text-[#ffc0ad]">
                    <Award className="h-4.5 w-4.5" strokeWidth={2.2} />
                  </span>
                  <span>{settings.phone || "0901 234 567"}</span>
                </p>
                <p className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#f3a38f]/18 bg-[#f3a38f]/8 text-[#ffc0ad]">
                    <Clock className="h-4.5 w-4.5" strokeWidth={2.2} />
                  </span>
                  <span>08:00 - 20:00</span>
                </p>
              </div>
              <div className="overflow-hidden rounded-2xl border border-[#f3a38f]/16 bg-[#1a1216] p-2">
                {settings.google_map_embed_url ? (
                  <iframe
                    src={settings.google_map_embed_url}
                    width="100%"
                    height="220"
                    className="rounded-xl"
                    style={{ border: 0 }}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Bản đồ Luna Makeup Studio"
                  />
                ) : (
                  <div className="flex h-[220px] items-center justify-center rounded-xl bg-[#24161d] text-sm text-[#cdbab4]">Bản đồ studio</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function SectionBar({
  eyebrow,
  title,
  href,
  cta,
}: {
  eyebrow: string;
  title: string;
  href?: string;
  cta?: string;
}) {
  return (
    <div className="mb-5 flex flex-col gap-4 md:mb-7 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="text-xs font-bold uppercase text-[#bd7b6c]">{eyebrow}</p>
        <h2 className="mt-2 font-heading text-2xl font-medium leading-tight text-[#f7e8e2] md:text-4xl">{title}</h2>
      </div>
      {href && (
        <Link href={href} className="btn-secondary w-full border-[#f3a38f]/30 px-5 text-xs uppercase text-[#ffc0ad] sm:w-fit">
          {cta} <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}

function BeforeAfterCard({ item }: { item?: PortfolioItem }) {
  const title = item?.title || "Before & After";
  const beforeImg = item?.beforeImage || "/images/hero.png";
  const afterImg = item?.afterImage || "/images/luna-banner.png";

  return (
    <Link href="/portfolio" className="group block overflow-hidden rounded-2xl border border-[#f3a38f]/18 bg-[#160f14]">
      <div className="relative grid aspect-[2.7/1] grid-cols-2 overflow-hidden">
        <div className="relative">
          <Image src={beforeImg} alt={`Ảnh trước makeup ${title}`} fill sizes="25vw" className="object-cover grayscale-[0.15]" />
        </div>
        <div className="relative">
          <Image src={afterImg} alt={`Ảnh sau makeup ${title}`} fill sizes="25vw" className="object-cover object-center" />
        </div>
        <span className="absolute left-1/2 top-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#ffc0ad] text-[#160c10]">
          +
        </span>
      </div>
    </Link>
  );
}
