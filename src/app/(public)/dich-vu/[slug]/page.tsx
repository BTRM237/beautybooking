import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDuration, formatPrice } from "@/lib/utils";
import { getServiceBySlug, getServiceDetailData, type ServiceStaffView } from "@/lib/public-data";
import ServiceCard from "@/components/public/ServiceCard";
import {
  ArrowRight,
  CalendarCheck,
  Check,
  ChevronDown,
  Clock,
  Gem,
  Heart,
  Palette,
} from "lucide-react";
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

function parseList(value: string | null): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function parseFaq(value: string | null): { question: string; answer: string }[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((item) => typeof item?.question === "string" && typeof item?.answer === "string")
      : [];
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) return {};
  return {
    title: service.seoTitle || `${service.name} | Luna Makeup Studio`,
    description: service.seoDescription || service.shortDescription || "",
    openGraph: { title: service.name, description: service.shortDescription || "" },
  };
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;
  const data = await getServiceDetailData(slug);
  if (!data) notFound();

  const { service, relatedServices } = data;
  const staffProfiles: ServiceStaffView[] = data.staffProfiles;
  if (!service || service.status !== "ACTIVE") notFound();

  const benefits = parseList(service.benefits);
  const occasions = parseList(service.occasions);
  const styles = parseList(service.styleSuggestions);
  const faq = parseFaq(service.faq);
  const gallery = parseList(service.gallery);
  const heroImage = service.thumbnail || "/images/luna-banner.png";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    description: service.shortDescription || service.description || "",
    provider: { "@type": "BeautySalon", name: "Luna Makeup Studio" },
    offers: { "@type": "Offer", price: service.basePrice, priceCurrency: "VND" },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="relative isolate -mt-20 overflow-hidden border-b border-[#f3a38f]/12 bg-[#070509] pt-32 text-[#f7e8e2] md:pt-36">
        <Image
          src="/images/luna-banner.png"
          alt="Banner makeup sang trọng của Luna"
          fill
          priority
          sizes="100vw"
          className="absolute inset-0 -z-20 object-cover object-[72%_center] opacity-[0.58]"
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,#070509_0%,rgba(7,5,9,0.94)_34%,rgba(7,5,9,0.62)_70%,#070509_100%)]" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-44 bg-gradient-to-t from-[#070509] to-transparent" />

        <div className="container-custom pb-16 md:pb-24">
          <nav className="mb-8 flex flex-wrap items-center gap-2 text-sm text-[#cdbab4]">
            <Link href="/" className="hover:text-[#ffc0ad]">Trang chủ</Link>
            <span>/</span>
            <Link href="/dich-vu" className="hover:text-[#ffc0ad]">Dịch vụ</Link>
            <span>/</span>
            <span className="text-[#ffc0ad]">{service.name}</span>
          </nav>

          <div className="grid gap-10 lg:grid-cols-[0.96fr_1.04fr] lg:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#f3a38f]/24 bg-[#120d11]/58 px-4 py-2 text-xs font-bold uppercase text-[#ffc0ad] backdrop-blur-xl">
                <Palette className="h-4 w-4" />
                {service.category}
              </span>
              <h1 className="mt-4 font-heading text-[2.7rem] font-medium leading-[0.98] text-[#ffc4b3] md:mt-5 md:text-7xl lg:text-[5.1rem]">
                {service.name}
              </h1>
              {service.shortDescription && (
                <p className="mt-4 max-w-2xl text-sm leading-7 text-[#f1ddd5] md:mt-5 md:text-lg md:leading-8">
                  {service.shortDescription}
                </p>
              )}

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-[#f3a38f]/18 bg-[#120d11]/70 p-5 backdrop-blur-xl">
                  <p className="text-sm text-[#cdbab4]">Giá dịch vụ</p>
                  <p className="mt-2 text-3xl font-bold text-[#ffc0ad]">{formatPrice(service.basePrice)}</p>
                </div>
                <div className="rounded-2xl border border-[#f3a38f]/18 bg-[#120d11]/70 p-5 backdrop-blur-xl">
                  <p className="text-sm text-[#cdbab4]">Thời lượng</p>
                  <p className="mt-2 flex items-center gap-2 text-2xl font-bold text-[#f7e8e2]">
                    <Clock className="h-5 w-5 text-[#ffc0ad]" />
                    {formatDuration(service.durationMin)}
                  </p>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href={`/dat-lich?service=${service.slug}`} className="btn-primary uppercase">
                  <CalendarCheck className="h-4 w-4" />
                  Đặt lịch dịch vụ này
                </Link>
                <Link href="/bang-gia" className="btn-secondary uppercase">
                  Xem bảng giá <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-3xl border border-[#f3a38f]/18 bg-[#120d11] p-2 shadow-[0_28px_90px_rgba(0,0,0,0.4)] md:p-3">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[1.25rem] bg-[#24161d]">
                <Image
                  src={heroImage}
                  alt={`Ảnh minh họa ${service.name}`}
                  fill
                  priority
                  sizes="(min-width: 1024px) 45vw, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#070509]/88 via-transparent to-transparent" />
                <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-[#f3a38f]/20 bg-[#120d11]/70 p-5 backdrop-blur-xl">
                  <p className="text-sm font-bold uppercase text-[#ffc0ad]">Luna tư vấn trước lịch</p>
                  <p className="mt-2 text-sm leading-6 text-[#f1ddd5]">
                    Studio sẽ xác nhận phong cách, địa điểm và thời gian trước khi lịch chính thức được giữ.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#070509] py-10 md:py-20">
        <div className="container-custom grid gap-8 lg:grid-cols-[1fr_360px] lg:items-start">
          <div className="space-y-6">
            {service.description && (
              <article className="rounded-3xl border border-[#f3a38f]/18 bg-[#120d11] p-5 md:p-8">
                <p className="text-xs font-bold uppercase text-[#bd7b6c]">Mô tả dịch vụ</p>
                <h2 className="mt-3 font-heading text-4xl font-medium leading-tight text-[#f7e8e2]">
                  Dành cho ai muốn lên ảnh đẹp nhưng vẫn tinh tế
                </h2>
                <p className="mt-5 text-sm leading-8 text-[#cdbab4]">{service.description}</p>
              </article>
            )}

            {benefits.length > 0 && (
              <article className="rounded-3xl border border-[#f3a38f]/18 bg-[#120d11] p-5 md:p-8">
                <h2 className="font-heading text-4xl font-medium text-[#f7e8e2]">Dịch vụ bao gồm</h2>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {benefits.map((benefit) => (
                    <div key={benefit} className="flex gap-3 rounded-2xl border border-[#f3a38f]/12 bg-[#070509]/48 p-4 text-sm leading-6 text-[#e9d8d1]">
                      <Check className="mt-1 h-4 w-4 shrink-0 text-[#ffc0ad]" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </article>
            )}

            <article className="rounded-3xl border border-[#f3a38f]/18 bg-[#120d11] p-5 md:p-8">
              <h2 className="font-heading text-4xl font-medium text-[#f7e8e2]">Quy trình thực hiện</h2>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {[
                  ["01", "Tư vấn tone", "Trao đổi trang phục, dịp sử dụng, da và phong cách mong muốn."],
                  ["02", "Makeup & làm tóc", "Chuyên viên chuẩn bị lớp nền, mắt, môi và tóc theo thời lượng gói."],
                  ["03", "Kiểm tra trước khi đi", "Dặm lại chi tiết, hướng dẫn giữ lớp makeup và chốt ảnh feedback."],
                ].map(([step, title, desc]) => (
                  <div key={step} className="rounded-2xl border border-[#f3a38f]/12 bg-[#070509]/48 p-5">
                    <p className="text-sm font-bold text-[#bd7b6c]">{step}</p>
                    <h3 className="mt-3 font-heading text-2xl font-medium text-[#f7e8e2]">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[#cdbab4]">{desc}</p>
                  </div>
                ))}
              </div>
            </article>

            {(occasions.length > 0 || styles.length > 0) && (
              <article className="rounded-3xl border border-[#f3a38f]/18 bg-[#120d11] p-5 md:p-8">
                <h2 className="font-heading text-4xl font-medium text-[#f7e8e2]">Phù hợp với</h2>
                <div className="mt-6 flex flex-wrap gap-2">
                  {[...occasions, ...styles].map((item) => (
                    <span key={item} className="rounded-full border border-[#f3a38f]/18 bg-[#070509]/55 px-4 py-2 text-sm font-semibold text-[#e9d8d1]">
                      {item}
                    </span>
                  ))}
                </div>
              </article>
            )}

            {gallery.length > 0 && (
              <article className="rounded-3xl border border-[#f3a38f]/18 bg-[#120d11] p-5 md:p-8">
                <h2 className="font-heading text-4xl font-medium text-[#f7e8e2]">Gallery</h2>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {gallery.slice(0, 4).map((image, index) => (
                    <div key={image} className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-[#24161d]">
                      <Image
                        src={image}
                        alt={`Ảnh gallery ${service.name} ${index + 1}`}
                        fill
                        sizes="(min-width: 768px) 40vw, 100vw"
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </article>
            )}

            {staffProfiles.length > 0 && (
              <article className="rounded-3xl border border-[#f3a38f]/18 bg-[#120d11] p-5 md:p-8">
                <h2 className="font-heading text-4xl font-medium text-[#f7e8e2]">Chuyên viên có thể thực hiện</h2>
                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  {staffProfiles.map((profile) => (
                    <div key={profile.id} className="rounded-2xl border border-[#f3a38f]/12 bg-[#070509]/48 p-5 text-center">
                      <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full border border-[#f3a38f]/20 bg-[#f3a38f]/10 font-heading text-2xl text-[#ffc0ad]">
                        {profile.staff.displayName.charAt(0)}
                      </div>
                      <p className="font-semibold text-[#f7e8e2]">{profile.staff.displayName}</p>
                      <p className="mt-1 text-xs text-[#cdbab4]">{profile.staff.experienceYears} năm kinh nghiệm</p>
                    </div>
                  ))}
                </div>
              </article>
            )}

            {faq.length > 0 && (
              <article className="rounded-3xl border border-[#f3a38f]/18 bg-[#120d11] p-5 md:p-8">
                <h2 className="font-heading text-4xl font-medium text-[#f7e8e2]">Câu hỏi thường gặp</h2>
                <div className="mt-6 space-y-3">
                  {faq.map((item) => (
                    <details key={item.question} className="group rounded-2xl border border-[#f3a38f]/12 bg-[#070509]/48 p-5">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-bold text-[#f7e8e2]">
                        {item.question}
                        <ChevronDown className="h-4 w-4 shrink-0 text-[#ffc0ad] transition group-open:rotate-180" />
                      </summary>
                      <p className="mt-4 text-sm leading-7 text-[#cdbab4]">{item.answer}</p>
                    </details>
                  ))}
                </div>
              </article>
            )}
          </div>

          <aside className="hidden lg:sticky lg:top-28 lg:block">
            <div className="rounded-3xl border border-[#f3a38f]/18 bg-[#120d11] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.34)]">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#f3a38f]/20 bg-white/[0.04] px-4 py-2 text-xs font-bold uppercase text-[#ffc0ad]">
                <Gem className="h-4 w-4" />
                Tóm tắt đặt lịch
              </span>
              <h2 className="mt-5 font-heading text-3xl font-medium leading-tight text-[#f7e8e2]">{service.name}</h2>
              <div className="mt-5 space-y-4 border-t border-[#f3a38f]/12 pt-5">
                <div className="flex justify-between gap-4 text-sm">
                  <span className="text-[#cdbab4]">Giá</span>
                  <span className="font-bold text-[#ffc0ad]">{formatPrice(service.basePrice)}</span>
                </div>
                <div className="flex justify-between gap-4 text-sm">
                  <span className="text-[#cdbab4]">Thời lượng</span>
                  <span className="text-[#f7e8e2]">{formatDuration(service.durationMin)}</span>
                </div>
                <div className="flex justify-between gap-4 text-sm">
                  <span className="text-[#cdbab4]">Danh mục</span>
                  <span className="text-[#f7e8e2]">{service.category}</span>
                </div>
              </div>
              <Link href={`/dat-lich?service=${service.slug}`} className="btn-primary mt-6 w-full uppercase">
                Đặt lịch ngay <ArrowRight className="h-4 w-4" />
              </Link>
              <p className="mt-4 flex gap-2 text-xs leading-5 text-[#cdbab4]">
                <Heart className="mt-0.5 h-4 w-4 shrink-0 text-[#ffc0ad]" />
                Studio sẽ liên hệ xác nhận trước khi lịch chính thức được giữ.
              </p>
            </div>
          </aside>
        </div>
      </section>

      {relatedServices.length > 0 && (
        <section className="border-t border-[#f3a38f]/10 bg-[#120d11] py-10 md:py-20">
          <div className="container-custom">
            <div className="mb-10 text-center">
              <p className="text-xs font-bold uppercase text-[#bd7b6c]">Dịch vụ liên quan</p>
              <h2 className="mx-auto mt-2 max-w-3xl font-heading text-3xl font-medium leading-tight text-[#f7e8e2] md:text-5xl">
                Có thể bạn cũng sẽ thích
              </h2>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {relatedServices.map((related) => (
                <ServiceCard key={related.id} service={related} />
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#f3a38f]/14 bg-[#070509]/90 p-3 backdrop-blur-2xl lg:hidden">
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-[#f7e8e2]">{service.name}</p>
            <p className="text-xs text-[#ffc0ad]">{formatPrice(service.basePrice)} · {formatDuration(service.durationMin)}</p>
          </div>
          <Link href={`/dat-lich?service=${service.slug}`} className="btn-primary px-5 text-xs uppercase">
            Đặt lịch
          </Link>
        </div>
      </div>
    </>
  );
}
