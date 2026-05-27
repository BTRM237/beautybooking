import Link from "next/link";
import CompactPageHeader from "@/components/public/CompactPageHeader";
import { formatDuration, formatPrice } from "@/lib/utils";
import { getActiveServices } from "@/lib/public-data";
import { ArrowRight, Check, Clock, Palette, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import type { Service } from "@prisma/client";

export const metadata: Metadata = {
  title: "Bảng giá makeup cô dâu, dự tiệc, kỷ yếu | Luna Makeup Studio",
  description:
    "Bảng giá dịch vụ makeup cô dâu, dự tiệc, kỷ yếu, chụp ảnh, sự kiện và combo makeup + làm tóc tại Luna Makeup Studio.",
};

function parseList(value: string | null): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function bestFor(service: Service) {
  const category = service.category.toLowerCase();
  if (category.includes("cô dâu")) return "Đẹp trọn ngày cưới, ăn hỏi, chụp ảnh cưới";
  if (category.includes("dự tiệc")) return "Phù hợp tiệc cưới, sinh nhật, gala";
  if (category.includes("kỷ yếu")) return "Phù hợp áo dài, chụp nhóm, concept trường";
  if (category.includes("chụp ảnh")) return "Phù hợp profile, lookbook, studio";
  if (category.includes("sự kiện")) return "Phù hợp hội nghị, sân khấu, lễ trao giải";
  if (category.includes("tóc")) return "Phù hợp đi tiệc, chụp ảnh, sự kiện";
  return "Phù hợp lịch cá nhân và sự kiện riêng";
}

export default async function PricingPage() {
  const services: Service[] = await getActiveServices();

  return (
    <>
      <CompactPageHeader
        eyebrow="Bảng giá"
        title="Gói dịch vụ rõ ràng"
        description="Mỗi gói đều có giá, thời lượng và phần bao gồm. Với lịch tại nhà hoặc địa điểm xa, studio sẽ xác nhận phụ phí trước khi giữ lịch."
        actions={[{ label: "Đặt lịch", href: "/dat-lich", primary: true }, { label: "Dịch vụ", href: "/dich-vu" }]}
      />

      <section className="bg-[#070509] py-8 md:py-10">
        <div className="container-custom">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {services.map((service) => {
              const includes = parseList(service.benefits);
              const fallbackIncludes = [
                "Tư vấn phong cách trước lịch",
                "Lớp nền phù hợp gương mặt",
                "Kiểm tra lại trước khi hoàn tất",
                "Hỗ trợ chỉnh sửa nhẹ",
              ];
              const featured = service.featured || service.category.toLowerCase().includes("cô dâu");

              return (
                <article
                  key={service.id}
                  className={[
                    "relative flex h-full flex-col rounded-2xl border p-5 transition duration-300 hover:-translate-y-1 md:p-6",
                    featured
                      ? "border-[#f3a38f]/55 bg-[linear-gradient(145deg,rgba(243,163,143,0.18),rgba(24,15,20,0.96))] shadow-[0_0_45px_rgba(243,163,143,0.16)]"
                      : "border-[#f3a38f]/18 bg-[#120d11]",
                  ].join(" ")}
                >
                  {featured && (
                    <span className="absolute -top-3 left-6 rounded-full bg-[#f3a38f] px-4 py-1.5 text-xs font-bold text-[#160c10]">
                      Được chọn nhiều
                    </span>
                  )}
                  <p className="text-xs font-bold uppercase text-[#bd7b6c]">{service.category}</p>
                  <h3 className="mt-3 font-heading text-2xl font-medium leading-tight text-[#f7e8e2] md:text-3xl">{service.name}</h3>
                  <p className="mt-2 min-h-10 text-sm leading-6 text-[#cdbab4]">{bestFor(service)}</p>

                  <div className="mt-6 flex items-end gap-3">
                    <p className="text-3xl font-bold text-[#ffc0ad] md:text-4xl">{formatPrice(service.basePrice)}</p>
                    <p className="pb-1 text-sm text-[#cdbab4]">{formatDuration(service.durationMin)}</p>
                  </div>

                  <ul className="mt-6 flex-1 space-y-3 border-t border-[#f3a38f]/12 pt-6">
                    {(includes.length ? includes : fallbackIncludes).slice(0, 5).map((item) => (
                      <li key={item} className="flex gap-3 text-sm leading-6 text-[#e9d8d1]">
                        <Check className="mt-1 h-4 w-4 shrink-0 text-[#ffc0ad]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>

                  <Link href={`/dat-lich?service=${service.slug}`} className="btn-primary mt-7 w-full text-xs uppercase">
                    Đặt lịch gói này
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-y border-[#f3a38f]/10 bg-[#120d11] py-10">
        <div className="container-custom grid gap-4 md:grid-cols-3">
          {[
            { icon: ShieldCheck, title: "Không phụ thu ẩn", desc: "Mọi khoản phát sinh như di chuyển xa hoặc lịch đặc biệt sẽ được báo trước." },
            { icon: Clock, title: "Thời lượng rõ ràng", desc: "Mỗi gói có thời gian dự kiến để bạn sắp xếp lịch chụp, tiệc hoặc lễ cưới." },
            { icon: Palette, title: "Tư vấn miễn phí", desc: "Chưa chắc chọn gói nào? Luna sẽ gợi ý theo dịp, trang phục và ngân sách." },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-[#f3a38f]/16 bg-[#070509]/55 p-5 md:p-6">
              <item.icon className="h-6 w-6 text-[#ffc0ad]" />
              <h2 className="mt-4 font-heading text-2xl font-medium text-[#f7e8e2]">{item.title}</h2>
              <p className="mt-2 text-sm leading-7 text-[#cdbab4]">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
