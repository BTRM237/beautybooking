"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarCheck, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Trang chủ" },
  { href: "/dich-vu", label: "Dịch vụ" },
  { href: "/bang-gia", label: "Bảng giá" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/blog", label: "Blog" },
  { href: "/gioi-thieu", label: "Giới thiệu" },
  { href: "/lien-he", label: "Liên hệ" },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[#f4ad98]/12 bg-[#070509]/78 backdrop-blur-2xl transform-gpu will-change-transform">
      <div className="mx-auto flex h-16 max-w-[1320px] items-center justify-between gap-3 px-4 md:h-[72px] md:px-8">
        <Link href="/" className="relative h-11 w-[136px] md:h-12 md:w-[176px]">
          <Image
            src="/images/luna-logo-transparent.png"
            alt="Luna Makeup Studio"
            fill
            priority
            sizes="176px"
            className="object-contain object-left"
          />
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => {
            const active = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative py-7 text-[13px] font-bold uppercase text-[#f4ece8] transition-colors hover:text-[#f5ad9a]",
                  active && "text-[#f5ad9a]",
                )}
              >
                {link.label}
                {active && <span className="absolute inset-x-0 bottom-0 h-px bg-[#f5ad9a]" />}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/dat-lich" className="btn-primary hidden min-h-10 px-6 py-3 text-xs uppercase sm:inline-flex">
            Đặt lịch ngay
          </Link>
          <button
            type="button"
            onClick={() => setIsOpen((value) => !value)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[#f5ad9a]/18 bg-white/[0.04] text-[#f4ece8] lg:hidden"
            aria-label={isOpen ? "Đóng menu" : "Mở menu"}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-[#f5ad9a]/10 bg-[#09060b]/96 p-3 shadow-2xl shadow-black/40 lg:hidden"
          >
            <nav className="mx-auto grid max-w-[1320px] gap-1">
              {navLinks.map((link) => {
                const active = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "rounded-2xl px-4 py-2.5 text-sm font-bold uppercase",
                      active ? "bg-[#f5ad9a]/12 text-[#f5ad9a]" : "text-[#f4ece8]",
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <Link
                href="/dat-lich"
                onClick={() => setIsOpen(false)}
                className="btn-primary mt-2 w-full"
              >
                <CalendarCheck className="h-4 w-4" />
                Đặt lịch ngay
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
