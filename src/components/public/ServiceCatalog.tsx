"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import ServiceCard from "@/components/public/ServiceCard";
import { cn } from "@/lib/utils";

type Service = {
  id: string;
  name: string;
  slug: string;
  category: string;
  shortDescription: string | null;
  basePrice: number;
  durationMin: number;
  thumbnail: string | null;
};

const preferredCategories = ["Tất cả", "Cô dâu", "Dự tiệc", "Kỷ yếu", "Chụp ảnh", "Sự kiện", "Làm tóc"];

export default function ServiceCatalog({ services }: { services: Service[] }) {
  const [activeCategory, setActiveCategory] = useState("Tất cả");
  const [query, setQuery] = useState("");

  const categories = useMemo(() => {
    const actual = new Set(services.map((service) => service.category));
    const ordered = preferredCategories.filter((category) => category === "Tất cả" || actual.has(category));
    const extras = Array.from(actual).filter((category) => !ordered.includes(category));
    return [...ordered, ...extras];
  }, [services]);

  const filtered = services.filter((service) => {
    const matchesCategory = activeCategory === "Tất cả" || service.category === activeCategory;
    const matchesQuery = `${service.name} ${service.shortDescription || ""} ${service.category}`
      .toLowerCase()
      .includes(query.trim().toLowerCase());
    return matchesCategory && matchesQuery;
  });

  return (
    <div>
      <div className="mb-6 grid gap-3 md:mb-9 lg:grid-cols-[1fr_340px] lg:items-center">
        <div className="-mx-2 flex flex-nowrap gap-2 overflow-x-auto px-2 pb-1 hide-scrollbar sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
          {categories.map((category) => (
            <button
              type="button"
              key={category}
              onClick={() => setActiveCategory(category)}
              className={cn(
                "min-h-10 shrink-0 rounded-full border px-4 text-xs font-bold uppercase transition",
                activeCategory === category
                  ? "border-[#f3a38f] bg-[#f3a38f] text-[#160c10]"
                  : "border-[#f3a38f]/18 bg-[#120d11] text-[#d9c7c0] hover:border-[#f3a38f]/50 hover:text-[#ffc0ad]",
              )}
            >
              {category}
            </button>
          ))}
        </div>
        <label className="relative block">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#f3a38f]" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="h-11 w-full rounded-full border border-[#f3a38f]/18 bg-[#120d11] pl-11 pr-4 text-sm text-[#f7e8e2] outline-none placeholder:text-[#8d7570] focus:border-[#f3a38f]/60"
            placeholder="Tìm dịch vụ, tone makeup..."
          />
        </label>
      </div>

      {filtered.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-[#f3a38f]/18 bg-[#120d11] p-6 text-center md:p-10">
          <h3 className="font-heading text-2xl text-[#f7e8e2] md:text-3xl">Chưa tìm thấy dịch vụ phù hợp</h3>
          <p className="mt-2 text-sm text-[#cdbab4]">Bạn có thể đổi từ khóa hoặc nhắn Zalo để được tư vấn gói makeup riêng.</p>
        </div>
      )}
    </div>
  );
}
