"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, CalendarCheck, Clock } from "lucide-react";
import { formatDuration, formatPrice } from "@/lib/utils";

interface ServiceCardProps {
  service: {
    id: string;
    name: string;
    slug: string;
    category: string;
    shortDescription: string | null;
    basePrice: number;
    durationMin: number;
    thumbnail: string | null;
  };
}

const serviceVisuals: Record<string, { src: string; position: string }> = {
  "makeup-co-dau": { src: "/images/bridal.png", position: "center" },
  "makeup-du-tiec": { src: "/images/hero.png", position: "center" },
  "makeup-ky-yeu": { src: "/images/luna-banner.png", position: "70% 34%" },
  "makeup-chup-anh": { src: "/images/luna-banner.png", position: "62% 38%" },
  "makeup-di-su-kien": { src: "/images/luna-banner.png", position: "75% 36%" },
  "lam-toc-du-tiec": { src: "/images/hero.png", position: "58% 35%" },
};

export default function ServiceCard({ service }: ServiceCardProps) {
  const visual = serviceVisuals[service.slug] || { src: service.thumbnail || "/images/luna-banner.png", position: "68% 38%" };
  const src = service.thumbnail || visual.src;

  return (
    <motion.article
      whileHover={{ y: -7 }}
      transition={{ duration: 0.22 }}
      className="group flex h-full flex-col overflow-hidden rounded-[18px] border border-[#f3a38f]/22 bg-[#160f14] shadow-[0_18px_50px_rgba(0,0,0,0.32)] transition-colors hover:border-[#f3a38f]/45"
    >
      <Link href={`/dich-vu/${service.slug}`} className="relative block aspect-[16/10] overflow-hidden bg-[#24161d] sm:aspect-[1.2/1]">
        <Image
          src={src}
          alt={`Hình ảnh dịch vụ ${service.name}`}
          fill
          sizes="(min-width: 1024px) 17vw, (min-width: 768px) 33vw, 100vw"
          className="object-cover opacity-90 transition duration-700 group-hover:scale-[1.06]"
          style={{ objectPosition: service.thumbnail ? "center" : visual.position }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#120c12]/82 via-transparent to-transparent" />
        <span className="absolute left-3 top-3 rounded-full border border-[#f3a38f]/22 bg-[#070509]/62 px-3 py-1.5 text-[11px] font-bold text-[#ffc0ad] backdrop-blur-xl sm:left-4 sm:top-4 sm:text-xs">
          {service.category}
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <Link href={`/dich-vu/${service.slug}`} className="group/title">
          <h3 className="font-body text-[15px] font-bold text-[#f7e8e2] group-hover/title:text-[#ffc0ad]">{service.name}</h3>
          <p className="mt-1 line-clamp-2 min-h-10 text-xs leading-5 text-[#cdbab4]">
            {service.shortDescription || "Tôn vinh vẻ đẹp rạng ngời"}
          </p>
        </Link>

        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs text-[#cdbab4]">Từ</p>
            <p className="text-sm font-black text-[#ffc0ad]">{formatPrice(service.basePrice)}</p>
          </div>
          <div className="inline-flex items-center gap-1.5 text-xs text-[#cdbab4]">
            <Clock className="h-3.5 w-3.5 text-[#ffc0ad]" />
            {formatDuration(service.durationMin)}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-[1fr_44px] gap-2 border-t border-[#f3a38f]/10 pt-4">
          <Link href={`/dat-lich?service=${service.slug}`} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#f3a38f] px-3 text-xs font-bold uppercase text-[#160c10] transition hover:-translate-y-0.5">
            <CalendarCheck className="h-4 w-4" />
            Đặt lịch
          </Link>
          <Link
            href={`/dich-vu/${service.slug}`}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#f3a38f]/22 bg-white/[0.04] text-[#ffc0ad] transition hover:border-[#f3a38f]/50"
            aria-label={`Xem chi tiết ${service.name}`}
          >
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
