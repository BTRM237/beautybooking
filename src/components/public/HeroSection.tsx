"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
} from "lucide-react";

const trustItems = [
  "Tư vấn miễn phí",
  "Chuyên viên chuyên nghiệp",
  "Sản phẩm cao cấp",
  "Xác nhận lịch rõ ràng",
];

export default function HeroSection() {
  return (
    <section className="relative -mt-20 overflow-hidden bg-[#08050a] pb-8 pt-24 sm:pb-10 md:min-h-[calc(100vh+4rem)] md:pt-36">
      <Image
        src="/images/luna-banner.png"
        alt="Banner cô dâu makeup sang trọng của Luna Makeup Studio"
        fill
        priority
        sizes="100vw"
        className="object-cover object-[64%_center] md:object-[68%_center]"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,5,10,0.97)_0%,rgba(18,12,18,0.90)_42%,rgba(18,12,18,0.48)_100%)] md:bg-[linear-gradient(90deg,rgba(8,5,10,0.96)_0%,rgba(18,12,18,0.86)_27%,rgba(18,12,18,0.36)_55%,rgba(18,12,18,0.28)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_54%_36%,rgba(232,199,176,0.15),transparent_26rem)]" />
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#120c12] to-transparent" />

      <div className="container-custom relative z-10 grid gap-8 md:min-h-[calc(100vh-7rem)] md:items-center md:pb-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-4xl"
        >
          <div className="mb-4 inline-flex rounded-full border border-[#f3b59e]/28 bg-[#120c12]/55 px-4 py-2 text-[11px] font-bold uppercase text-[#f3b59e] backdrop-blur-xl md:mb-6 md:px-5 md:text-sm">
            Makeup chuyên nghiệp tại Việt Nam
          </div>

          <h1 className="max-w-4xl text-[2.65rem] font-semibold uppercase leading-[0.95] text-[#ffc6b4] drop-shadow-[0_18px_38px_rgba(0,0,0,0.34)] sm:text-7xl lg:text-[5.65rem]">
            Tôn vinh vẻ đẹp
            <span className="mt-2 block font-heading text-[0.68em] normal-case italic leading-none text-[#ffd1c2]">
              của riêng bạn
            </span>
          </h1>

          <p className="mt-5 max-w-xl text-sm leading-7 text-[#f6eee8] md:mt-7 md:text-lg md:leading-8">
            Makeup cô dâu, dự tiệc, kỷ yếu, chụp ảnh và sự kiện. Tư vấn tận tâm, đặt lịch dễ dàng, nâng tầm thần thái.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row md:mt-8">
            <Link href="/dat-lich" className="btn-primary w-full px-8 py-4 text-base sm:w-auto">
              Đặt lịch ngay <CalendarCheck className="h-5 w-5" />
            </Link>
            <Link href="/bang-gia" className="btn-secondary w-full border-[#ffc6b4]/45 px-8 py-4 text-base text-[#ffc6b4] sm:w-auto">
              Xem bảng giá <ArrowRight className="h-5 w-5" />
            </Link>
          </div>

          <div className="mt-6 grid max-w-4xl gap-2 text-sm text-[#f6eee8] sm:grid-cols-2 md:mt-8 lg:grid-cols-4">
            {trustItems.map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-full border border-[#ffc6b4]/18 bg-[#120c12]/68 px-3 py-2.5 md:px-4 md:py-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#ffc6b4]/22 text-[#ffc6b4] md:h-9 md:w-9">
                  <CheckCircle2 className="h-4 w-4" />
                </span>
                <span className="text-xs font-semibold md:text-sm">{item}</span>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </section>
  );
}
