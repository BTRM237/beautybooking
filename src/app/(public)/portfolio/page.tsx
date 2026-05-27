import PortfolioGallery, { type PortfolioView } from "@/components/public/PortfolioGallery";
import CompactPageHeader from "@/components/public/CompactPageHeader";
import { getVisiblePortfolioItems } from "@/lib/public-data";
import type { Metadata } from "next";
import type { PortfolioItem } from "@prisma/client";

export const metadata: Metadata = {
  title: "Portfolio makeup cô dâu, kỷ yếu, dự tiệc | Luna Makeup Studio",
  description:
    "Xem gallery portfolio makeup cô dâu, kỷ yếu, dự tiệc, tone Hàn, tone Tây và phong cách tự nhiên tại Luna Makeup Studio.",
};

function parseGallery(value: string | null): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export default async function PortfolioPage() {
  const items: PortfolioItem[] = await getVisiblePortfolioItems();

  const viewItems: PortfolioView[] = items.map((item) => ({
    id: item.id,
    title: item.title,
    style: item.style,
    description: item.description,
    beforeImage: item.beforeImage,
    afterImage: item.afterImage,
    gallery: parseGallery(item.gallery),
  }));

  return (
    <>
      <CompactPageHeader
        eyebrow="Portfolio"
        title="Gallery makeup"
        description="Gallery tập trung vào ảnh thật, before/after và phong cách makeup lên hình. Lọc theo cô dâu, kỷ yếu, dự tiệc, tone Hàn, tone Tây hoặc tự nhiên."
        actions={[{ label: "Đặt lịch", href: "/dat-lich", primary: true }]}
      />

      <section className="bg-[#070509] py-8 md:py-10">
        <div className="container-custom">
          <PortfolioGallery items={viewItems} />
        </div>
      </section>
    </>
  );
}
