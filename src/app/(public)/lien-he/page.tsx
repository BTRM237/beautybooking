import ContactForm from "@/components/public/ContactForm";
import CompactPageHeader from "@/components/public/CompactPageHeader";
import { getSettingsMap } from "@/lib/public-data";
import { ExternalLink, Globe, MapPin, MessageCircle, Phone, Send, Timer, Video } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Liên hệ Luna Makeup Studio | Zalo, Messenger, bản đồ",
  description:
    "Liên hệ Luna Makeup Studio qua hotline, Zalo, Messenger, Facebook, TikTok. Xem địa chỉ studio, khu vực phục vụ và bản đồ chỉ đường.",
};

function parseHours(value?: string) {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value);
    return typeof parsed === "object" && parsed ? (parsed as Record<string, string>) : {};
  } catch {
    return {};
  }
}

export default async function ContactPage() {
  const settings = await getSettingsMap();
  const hours = parseHours(settings.opening_hours);

  const phone = settings.phone || "0393231806";
  const zalo = settings.zalo_url || `https://zalo.me/${phone.replace(/\s/g, "")}`;

  const quickButtons = [
    { label: "Gọi ngay", href: `tel:${phone}`, icon: Phone, external: false, primary: true },
    { label: "Nhắn Zalo", href: zalo, icon: Send, external: true, primary: true },
    { label: "Nhắn Messenger", href: settings.messenger_url || "https://m.me/lunamakeup", icon: MessageCircle, external: true },
    { label: "Chỉ đường", href: settings.google_map_direction_url || "#", icon: ExternalLink, external: true },
  ];

  const contactRows = [
    { icon: MapPin, label: "Địa chỉ studio", value: settings.address || "Việt Nam" },
    { icon: Phone, label: "Hotline", value: phone },
    { icon: Send, label: "Zalo", value: settings.zalo_phone || phone },
    { icon: Timer, label: "Giờ làm việc", value: Object.keys(hours).length ? `${hours.weekdays || ""} ${hours.saturday ? `· ${hours.saturday}` : ""}` : "08:00 - 21:00" },
    { icon: Globe, label: "Khu vực phục vụ", value: settings.area_served || "Studio và trang điểm tại nhà theo lịch hẹn" },
  ];

  return (
    <>
      <CompactPageHeader
        eyebrow="Liên hệ"
        title="Tư vấn và xác nhận lịch"
        description="Gửi yêu cầu, gọi trực tiếp hoặc nhắn Zalo/Messenger để studio kiểm tra khung giờ và gợi ý gói makeup phù hợp."
        actions={[{ label: "Đặt lịch", href: "/dat-lich", primary: true }]}
      />

      <section className="bg-[#070509] py-8 md:py-10">
        <div className="container-custom grid gap-5 lg:grid-cols-[0.88fr_1.12fr] lg:gap-8">
          <div className="space-y-5">
            <div className="rounded-3xl border border-[#f3a38f]/18 bg-[#120d11] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.34)] md:p-7">
              <p className="text-xs font-bold uppercase text-[#bd7b6c]">Thông tin studio</p>
              <h2 className="mt-2 font-heading text-3xl font-medium leading-tight text-[#f7e8e2] md:mt-3 md:text-4xl">
                Luna Makeup Studio
              </h2>
              <div className="mt-6 space-y-3">
                {contactRows.map((row) => (
                  <div key={row.label} className="flex gap-3 rounded-2xl border border-[#f3a38f]/12 bg-[#070509]/48 p-4">
                    <row.icon className="mt-0.5 h-5 w-5 shrink-0 text-[#ffc0ad]" />
                    <div>
                      <p className="text-sm font-bold text-[#f7e8e2]">{row.label}</p>
                      <p className="mt-1 text-sm leading-6 text-[#cdbab4]">{row.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {quickButtons.map((button) => (
                <a
                  key={button.label}
                  href={button.href}
                  target={button.external && button.href !== "#" ? "_blank" : undefined}
                  rel={button.external && button.href !== "#" ? "noopener noreferrer" : undefined}
                  className={button.primary ? "btn-primary w-full text-xs uppercase" : "btn-secondary w-full text-xs uppercase"}
                >
                  <button.icon className="h-4 w-4" />
                  {button.label}
                </a>
              ))}
            </div>

            <div className="rounded-3xl border border-[#f3a38f]/18 bg-[#120d11] p-5 md:p-6">
              <h2 className="font-heading text-2xl font-medium text-[#f7e8e2] md:text-3xl">Kênh mạng xã hội</h2>
              <div className="mt-5 flex flex-wrap gap-3">
                {settings.facebook_url && (
                  <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer" className="btn-secondary">
                    <MessageCircle className="h-4 w-4" />
                    Facebook
                  </a>
                )}
                {settings.tiktok_url && (
                  <a href={settings.tiktok_url} target="_blank" rel="noopener noreferrer" className="btn-secondary">
                    <Video className="h-4 w-4" />
                    TikTok
                  </a>
                )}
                {settings.website_url && (
                  <a href={settings.website_url} target="_blank" rel="noopener noreferrer" className="btn-secondary">
                    <Globe className="h-4 w-4" />
                    Website
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="overflow-hidden rounded-3xl border border-[#f3a38f]/18 bg-[#120d11] p-2 shadow-[0_24px_80px_rgba(0,0,0,0.34)]">
              {settings.google_map_embed_url ? (
                <iframe
                  src={settings.google_map_embed_url}
                  width="100%"
                  height="430"
                  className="h-[300px] rounded-[1.25rem] md:h-[430px]"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Bản đồ Luna Makeup Studio"
                />
              ) : (
                <div className="flex min-h-[280px] items-center justify-center rounded-[1.25rem] bg-[linear-gradient(135deg,#160f14,#2a171f)] p-6 text-center md:min-h-[360px] md:p-8">
                  <div>
                    <MapPin className="mx-auto mb-4 h-9 w-9 text-[#ffc0ad]" />
                    <p className="font-heading text-3xl font-medium text-[#f7e8e2]">Bản đồ đang được cập nhật</p>
                    <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#cdbab4]">
                      Khi cấu hình Google Map hoàn tất, vị trí studio sẽ hiển thị tại đây.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
