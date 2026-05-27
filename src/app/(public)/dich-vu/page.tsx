import ServiceCatalog from "@/components/public/ServiceCatalog";
import CompactPageHeader from "@/components/public/CompactPageHeader";
import { getActiveServices } from "@/lib/public-data";
import type { Metadata } from "next";
import type { Service } from "@prisma/client";

export const metadata: Metadata = {
  title: "Dịch vụ makeup cô dâu, dự tiệc, kỷ yếu | Luna Makeup Studio",
  description:
    "Khám phá dịch vụ makeup cô dâu, dự tiệc, kỷ yếu, chụp ảnh, sự kiện và làm tóc tại Luna Makeup Studio.",
};

export default async function ServicesPage() {
  const services: Service[] = await getActiveServices();

  return (
    <>
      <CompactPageHeader
        eyebrow="Dịch vụ"
        title="Chọn dịch vụ makeup"
        description="Từ cô dâu, dự tiệc, kỷ yếu đến chụp ảnh và sự kiện. Mỗi gói được trình bày rõ giá, thời lượng và phong cách để bạn đặt lịch tự tin hơn."
        actions={[{ label: "Đặt lịch", href: "/dat-lich", primary: true }, { label: "Bảng giá", href: "/bang-gia" }]}
      />

      <section className="bg-[#070509] py-8 md:py-10">
        <div className="container-custom">
          <ServiceCatalog services={services} />
        </div>
      </section>
    </>
  );
}
