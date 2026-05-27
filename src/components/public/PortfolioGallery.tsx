"use client";

/* eslint-disable @next/next/no-img-element */

import Image from "next/image";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, Flower2, X } from "lucide-react";
import { EmptyState } from "@/components/ui/luxury";
import { cn } from "@/lib/utils";

export type PortfolioView = {
  id: string;
  title: string;
  style: string;
  description: string | null;
  beforeImage: string | null;
  afterImage: string | null;
  gallery: string[];
};

const defaultFilters = ["Tất cả", "Cô dâu", "Kỷ yếu", "Dự tiệc", "Tone Hàn", "Tone Tây", "Tự nhiên"];

function pickImage(item: PortfolioView, index: number) {
  return item.afterImage || item.beforeImage || item.gallery[0] || (index % 2 === 0 ? "/images/bridal.png" : "/images/hero.png");
}

function isLocalImage(src: string) {
  return src.startsWith("/");
}

function SmartImage({
  src,
  alt,
  className,
  sizes,
}: {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
}) {
  if (isLocalImage(src)) {
    return <Image src={src} alt={alt} fill sizes={sizes} className={className} />;
  }

  return <img src={src} alt={alt} className={cn("h-full w-full", className)} />;
}

export default function PortfolioGallery({ items }: { items: PortfolioView[] }) {
  const [filter, setFilter] = useState("Tất cả");
  const [activeItem, setActiveItem] = useState<PortfolioView | null>(null);
  const [slider, setSlider] = useState(50);

  const filters = useMemo(() => {
    const actual = new Set(items.flatMap((item) => [item.style, item.style.includes("Cô dâu") ? "Cô dâu" : ""]));
    const preferred = defaultFilters.filter((item) => item === "Tất cả" || actual.has(item) || items.some((entry) => entry.style.includes(item)));
    const extras = Array.from(actual).filter(Boolean).filter((item) => !preferred.includes(item));
    return [...preferred, ...extras];
  }, [items]);

  const filteredItems = items.filter((item) => filter === "Tất cả" || item.style.includes(filter) || item.title.includes(filter));

  return (
    <>
      <div className="-mx-2 mb-6 flex flex-nowrap gap-2 overflow-x-auto px-2 pb-1 hide-scrollbar sm:mx-0 sm:mb-9 sm:flex-wrap sm:justify-center sm:overflow-visible sm:px-0 sm:pb-0">
        {filters.map((item) => (
          <button
            type="button"
            key={item}
            onClick={() => setFilter(item)}
            className={cn(
              "min-h-10 shrink-0 rounded-full border px-4 text-xs font-bold uppercase transition",
              filter === item
                ? "border-[#f3a38f] bg-[#f3a38f] text-[#160c10]"
                : "border-[#f3a38f]/18 bg-[#120d11] text-[#d9c7c0] hover:border-[#f3a38f]/50 hover:text-[#ffc0ad]",
            )}
          >
            {item}
          </button>
        ))}
      </div>

      {filteredItems.length ? (
        <div className="masonry-grid">
          {filteredItems.map((item, index) => {
            const image = pickImage(item, index);
            return (
              <motion.button
                type="button"
                key={item.id}
                onClick={() => {
                  setActiveItem(item);
                  setSlider(50);
                }}
                whileHover={{ y: -5 }}
                className="masonry-item group relative w-full overflow-hidden rounded-2xl border border-[#f3a38f]/18 bg-[#160f14] text-left shadow-[0_18px_55px_rgba(0,0,0,0.3)]"
              >
                <div className="relative bg-[#2a1623]" style={{ height: `${260 + (index % 3) * 56}px` }}>
                  <SmartImage
                    src={image}
                    alt={`Portfolio makeup ${item.title}`}
                    sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                    className="object-cover opacity-90 transition duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#070509]/92 via-transparent to-transparent opacity-85" />
                  <div className="absolute left-4 top-4 rounded-full border border-[#f3a38f]/24 bg-[#070509]/62 px-3 py-1.5 text-xs font-bold text-[#ffc0ad] backdrop-blur-xl">
                    {item.style}
                  </div>
                  <div className="absolute inset-x-4 bottom-4 translate-y-0 transition sm:inset-x-5 sm:bottom-5 sm:translate-y-2 sm:group-hover:translate-y-0">
                    <h3 className="font-heading text-xl font-medium leading-tight text-[#f7e8e2] sm:text-2xl">{item.title}</h3>
                    <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#f3a38f] px-4 py-2 text-xs font-bold text-[#160c10] opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
                      <Eye className="h-3.5 w-3.5" />
                      Xem ảnh
                    </div>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      ) : (
        <EmptyState title="Chưa có ảnh phù hợp" description="Hãy chọn danh mục khác hoặc quay lại sau khi studio cập nhật gallery mới." />
      )}

      <AnimatePresence>
        {activeItem && (
          <motion.div
            className="fixed inset-0 z-[80] flex items-center justify-center bg-black/72 p-3 backdrop-blur-md sm:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveItem(null)}
          >
            <motion.div
              className="relative grid max-h-[92dvh] w-full max-w-5xl overflow-y-auto rounded-3xl border border-[#f3a38f]/20 bg-[#120d11] shadow-2xl lg:grid-cols-[1.1fr_0.9fr] lg:overflow-hidden"
              initial={{ scale: 0.96, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 20 }}
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setActiveItem(null)}
                className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-[#070509]/78 text-white backdrop-blur-xl"
                aria-label="Đóng ảnh"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="relative min-h-[320px] bg-[#24161d] sm:min-h-[420px] lg:min-h-[620px]">
                {activeItem.beforeImage && activeItem.afterImage ? (
                  <>
                    <SmartImage
                      src={activeItem.beforeImage}
                      alt={`Ảnh trước makeup ${activeItem.title}`}
                      sizes="(min-width: 1024px) 54vw, 100vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${slider}%` }}>
                      <div className="relative h-full" style={{ width: `${10000 / Math.max(slider, 1)}%` }}>
                        <SmartImage
                          src={activeItem.afterImage}
                          alt={`Ảnh sau makeup ${activeItem.title}`}
                          sizes="(min-width: 1024px) 54vw, 100vw"
                          className="object-cover"
                        />
                      </div>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={90}
                      value={slider}
                      onChange={(event) => setSlider(Number(event.target.value))}
                      className="absolute inset-x-8 bottom-8 accent-[#f3a38f]"
                      aria-label="Kéo để xem trước và sau"
                    />
                  </>
                ) : (
                  <SmartImage
                    src={pickImage(activeItem, 0)}
                    alt={`Portfolio makeup ${activeItem.title}`}
                    sizes="(min-width: 1024px) 54vw, 100vw"
                    className="object-cover"
                  />
                )}
              </div>

              <div className="overflow-y-auto p-5 md:p-8">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#f3a38f]/20 bg-white/[0.05] px-4 py-2 text-sm font-bold text-[#ffc0ad]">
                  <Flower2 className="h-4 w-4" />
                  {activeItem.style}
                </div>
                <h2 className="font-heading text-3xl font-medium leading-tight text-[#f7e8e2] md:text-4xl">{activeItem.title}</h2>
                {activeItem.description && (
                  <p className="mt-4 text-sm leading-7 text-[#cdbab4]">{activeItem.description}</p>
                )}
                <div className="mt-8 grid gap-3">
                  {["Tone Hàn", "Tone Tây", "Tự nhiên", "Cô dâu"].map((tag) => (
                    <span key={tag} className="rounded-2xl border border-[#f3a38f]/14 bg-white/[0.035] px-4 py-3 text-sm text-[#d9c7c0]">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
