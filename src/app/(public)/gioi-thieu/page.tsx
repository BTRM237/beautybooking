import Image from "next/image";
import Link from "next/link";
import CompactPageHeader from "@/components/public/CompactPageHeader";
import { ArrowRight, Award, Flower2, Heart, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Giới thiệu | Luna Makeup Studio",
  description:
    "Luna Makeup Studio - studio makeup chuyên nghiệp tại Việt Nam. Tìm hiểu về đội ngũ, triết lý và cam kết của chúng tôi.",
};

const values = [
  { icon: Heart, title: "Tận tâm", desc: "Lắng nghe gương mặt, trang phục và dịp xuất hiện để tạo phong cách riêng cho từng khách hàng." },
  { icon: Award, title: "Chuyên nghiệp", desc: "Quy trình tư vấn, chuẩn bị và xác nhận lịch rõ ràng, đúng giờ, hạn chế rủi ro trong ngày quan trọng." },
  { icon: ShieldCheck, title: "An toàn cho da", desc: "Ưu tiên mỹ phẩm chọn lọc, vệ sinh dụng cụ và kỹ thuật nền phù hợp từng tình trạng da." },
];

const teamMembers = [
  { name: "Linh", role: "Makeup Artist", exp: "7 năm kinh nghiệm", specialty: "Cô dâu & tone Hàn" },
  { name: "Khánh", role: "Beauty Stylist", exp: "5 năm kinh nghiệm", specialty: "Dự tiệc & sự kiện" },
  { name: "Mai", role: "Bridal Makeup", exp: "8 năm kinh nghiệm", specialty: "Cô dâu & tone Tây" },
];

export default function AboutPage() {
  return (
    <>
      <CompactPageHeader
        eyebrow="Giới thiệu"
        title="Luna Makeup Studio"
        description="Luna Makeup Studio theo đuổi phong cách sang trọng, nữ tính và hiện đại. Chúng tôi giúp bạn rạng rỡ trong lễ cưới, dự tiệc, kỷ yếu, chụp ảnh và sự kiện."
        actions={[{ label: "Đặt lịch", href: "/dat-lich", primary: true }, { label: "Portfolio", href: "/portfolio" }]}
      />

      <section className="bg-[#070509] py-8 md:py-10">
        <div className="container-custom grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase text-[#bd7b6c]">Câu chuyện Luna</p>
            <h2 className="mt-3 font-heading text-3xl font-medium leading-tight text-[#f7e8e2] md:text-5xl">
              Makeup không chỉ để đẹp hơn, mà để bạn thấy mình đúng là chính mình
            </h2>
            <div className="mt-6 space-y-4 text-sm leading-8 text-[#cdbab4]">
              <p>
                Luna bắt đầu từ niềm tin rằng mỗi người phụ nữ đều có một vẻ đẹp riêng. Studio không áp đặt một khuôn mặt giống nhau cho mọi khách hàng, mà chọn tone, lớp nền, dáng mắt và kiểu tóc dựa trên gương mặt, trang phục, ánh sáng và cảm xúc của ngày hôm đó.
              </p>
              <p>
                Tinh thần của Luna là sang trọng nhưng gần gũi: tư vấn rõ ràng, đúng lịch, tác phong chuyên nghiệp và luôn giữ sự mềm mại trong từng chi tiết.
              </p>
            </div>
            <Link href="/dich-vu" className="btn-secondary mt-8 w-fit uppercase">
              Xem dịch vụ
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-[#f3a38f]/18 bg-[#120d11] p-2 shadow-[0_28px_90px_rgba(0,0,0,0.4)] md:p-3">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[1.25rem]">
              <Image
                src="/images/luna-banner.png"
                alt="Phong cách makeup cô dâu sang trọng tại Luna"
                fill
                priority
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="object-cover object-[70%_center]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#070509]/90 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-[#f3a38f]/20 bg-[#120d11]/70 p-5 backdrop-blur-xl">
                <p className="text-sm font-bold uppercase text-[#ffc0ad]">Luna Makeup Studio</p>
                <p className="mt-2 text-sm leading-6 text-[#f1ddd5]">
                  Tư vấn tone, makeup, làm tóc và xác nhận lịch trong một quy trình nhẹ nhàng, rõ ràng.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[#f3a38f]/10 bg-[#120d11] py-10">
        <div className="container-custom grid gap-4 md:grid-cols-3">
          {values.map((value) => (
            <article key={value.title} className="rounded-2xl border border-[#f3a38f]/16 bg-[#070509]/55 p-5 md:p-6">
              <value.icon className="h-7 w-7 text-[#ffc0ad]" />
              <h2 className="mt-5 font-heading text-3xl font-medium text-[#f7e8e2]">{value.title}</h2>
              <p className="mt-3 text-sm leading-7 text-[#cdbab4]">{value.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-[#070509] py-10 md:py-14">
        <div className="container-custom">
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase text-[#bd7b6c]">Đội ngũ</p>
              <h2 className="mt-2 font-heading text-3xl font-medium leading-tight text-[#f7e8e2] md:text-5xl">
                Chuyên viên đồng hành cùng bạn
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-[#cdbab4]">
              Mỗi chuyên viên có thế mạnh riêng nhưng cùng một tiêu chuẩn: đẹp tinh tế, đúng giờ và chăm chút từng chi tiết.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {teamMembers.map((member) => (
              <article key={member.name} className="rounded-2xl border border-[#f3a38f]/18 bg-[#120d11] p-5 text-center transition hover:-translate-y-1 hover:border-[#f3a38f]/45 md:p-6">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#f3a38f]/22 bg-[#f3a38f]/10 font-heading text-3xl text-[#ffc0ad] md:h-20 md:w-20 md:text-4xl">
                  {member.name.charAt(0)}
                </div>
                <h3 className="mt-5 font-heading text-3xl font-medium text-[#f7e8e2]">{member.name}</h3>
                <p className="mt-1 text-sm font-bold text-[#bd7b6c]">{member.role}</p>
                <p className="mt-4 text-sm text-[#cdbab4]">{member.exp}</p>
                <p className="text-sm text-[#cdbab4]">{member.specialty}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-t border-[#f3a38f]/10 bg-[#120d11] py-10 md:py-14">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(243,163,143,0.14),transparent_28rem)]" />
        <div className="container-custom relative text-center">
          <span className="mx-auto inline-flex items-center gap-2 rounded-full border border-[#f3a38f]/20 bg-white/[0.04] px-4 py-2 text-xs font-bold uppercase text-[#ffc0ad]">
            <Flower2 className="h-4 w-4" />
            Sẵn sàng trải nghiệm?
          </span>
          <h2 className="mx-auto mt-5 max-w-3xl font-heading text-3xl font-medium leading-tight text-[#f7e8e2] md:text-6xl">
            Đặt lịch để được Luna tư vấn phong cách phù hợp nhất
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-[#cdbab4]">
            Studio sẽ gợi ý dịch vụ, tone makeup và khung giờ phù hợp với dịp của bạn.
          </p>
          <Link href="/dat-lich" className="btn-primary mt-8 uppercase">
            Đặt lịch ngay
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
