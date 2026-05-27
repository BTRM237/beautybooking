import Link from "next/link";
import Image from "next/image";
import { Clock, MapPin, Phone } from "lucide-react";

const quickLinks = [
  { href: "/dich-vu", label: "Dịch vụ makeup" },
  { href: "/bang-gia", label: "Bảng giá" },
  { href: "/dat-lich", label: "Đặt lịch" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/blog", label: "Blog làm đẹp" },
];

const services = [
  "Makeup cô dâu",
  "Makeup dự tiệc",
  "Makeup kỷ yếu",
  "Makeup chụp ảnh",
  "Làm tóc dự tiệc",
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-[#e8c7b0]/12 bg-[#0d080d]">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#e8c7b0]/45 to-transparent" />
      <div className="container-custom py-10 md:py-14">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-[1.2fr_0.8fr_0.8fr_1fr]">
          <div>
            <Link href="/" className="relative mb-4 block h-14 w-[190px] md:h-16 md:w-[220px]">
              <Image
                src="/images/luna-logo-transparent.png"
                alt="Luna Makeup Studio"
                fill
                sizes="220px"
                className="object-contain object-left"
              />
            </Link>
            <p className="max-w-sm text-sm leading-7 text-[#b8a8ae]">
              Studio makeup chuyên nghiệp cho cô dâu, dự tiệc, kỷ yếu, chụp ảnh và sự kiện. Tư vấn tinh tế, lịch hẹn rõ ràng, trải nghiệm chỉn chu.
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-bold text-[#f6eee8] md:mb-4">Liên kết nhanh</h4>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2 md:block md:space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-[#b8a8ae] transition-colors hover:text-[#e8c7b0]">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-bold text-[#f6eee8] md:mb-4">Dịch vụ</h4>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2 md:block md:space-y-3">
              {services.map((service) => (
                <li key={service} className="text-sm text-[#b8a8ae]">
                  {service}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-bold text-[#f6eee8]">Liên hệ</h4>
            <div className="space-y-3.5">
              <div className="flex items-start gap-3 text-sm leading-6 text-[#b8a8ae]">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#e8c7b0]/18 bg-[#e8c7b0]/8 text-[#e8c7b0]">
                  <MapPin className="h-4 w-4" strokeWidth={2.2} />
                </span>
                <span>123 Trần Hưng Đạo, TP. Quảng Ngãi</span>
              </div>
              <a href="tel:0393231806" className="flex items-center gap-3 text-sm leading-6 text-[#b8a8ae] transition-colors hover:text-[#e8c7b0]">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#e8c7b0]/18 bg-[#e8c7b0]/8 text-[#e8c7b0]">
                  <Phone className="h-4 w-4" strokeWidth={2.2} />
                </span>
                <span>039 323 1806</span>
              </a>
              <div className="flex items-center gap-3 text-sm leading-6 text-[#b8a8ae]">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#e8c7b0]/18 bg-[#e8c7b0]/8 text-[#e8c7b0]">
                  <Clock className="h-4 w-4" strokeWidth={2.2} />
                </span>
                <span>08:00 - 21:00</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-4 border-t border-[#e8c7b0]/10 pt-5 text-xs text-[#8f8087] sm:flex-row sm:items-center sm:justify-between md:mt-12 md:pt-6">
          <p>© {new Date().getFullYear()} Luna Makeup Studio. Bảo lưu mọi quyền.</p>
          <div className="flex gap-4">
            <a href="https://facebook.com/lunamakeup" target="_blank" rel="noopener noreferrer" className="hover:text-[#e8c7b0]">
              Facebook
            </a>
            <a href="https://tiktok.com/@lunamakeup" target="_blank" rel="noopener noreferrer" className="hover:text-[#e8c7b0]">
              TikTok
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
