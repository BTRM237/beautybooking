"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import {
  BarChart3,
  Bot,
  Briefcase,
  Calendar,
  Clock,
  FileText,
  Image,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Gem,
  Star,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const sidebarLinks = [
  { href: "/admin/dashboard", label: "Tổng quan", icon: LayoutDashboard },
  { href: "/admin/bookings", label: "Lịch hẹn", icon: Calendar },
  { href: "/admin/services", label: "Dịch vụ", icon: Briefcase },
  { href: "/admin/staff", label: "Nhân viên", icon: Users },
  { href: "/admin/customers", label: "Khách hàng", icon: UserCheck },
  { href: "/admin/portfolio", label: "Portfolio", icon: Image },
  { href: "/admin/blog", label: "Blog", icon: FileText },
  { href: "/admin/reviews", label: "Đánh giá", icon: Star },
  { href: "/admin/ai-leads", label: "AI Leads", icon: Bot },
  { href: "/admin/blocked-slots", label: "Khung giờ chặn", icon: Clock },
  { href: "/admin/analytics", label: "Phân tích", icon: BarChart3 },
  { href: "/admin/settings", label: "Cài đặt", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const currentPage = useMemo(() => {
    return sidebarLinks.find((link) => pathname.startsWith(link.href)) || sidebarLinks[0];
  }, [pathname]);

  if (pathname === "/admin/login") return <>{children}</>;

  return (
    <div className="admin-shell min-h-screen text-white">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-white/8 bg-[#101015]/92 p-4 backdrop-blur-2xl lg:flex lg:flex-col">
        <AdminSidebar pathname={pathname} />
      </aside>

      {drawerOpen && (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            onClick={() => setDrawerOpen(false)}
            aria-label="Đóng menu admin"
          />
          <aside className="relative h-full w-[min(88vw,320px)] border-r border-white/8 bg-[#101015] p-4 shadow-2xl">
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/8 text-slate-200"
              aria-label="Đóng menu"
            >
              <X className="h-5 w-5" />
            </button>
            <AdminSidebar pathname={pathname} onNavigate={() => setDrawerOpen(false)} />
          </aside>
        </div>
      )}

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-white/8 bg-[#15131a]/82 px-4 py-3 backdrop-blur-2xl md:px-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/8 text-slate-100 lg:hidden"
                aria-label="Mở menu admin"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <p className="text-xs font-semibold text-slate-500">Luna Admin</p>
                <h1 className="text-xl font-bold text-white md:text-2xl">{currentPage.label}</h1>
              </div>
            </div>
            <Link href="/" className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/8 hover:text-white">
              Về website
            </Link>
          </div>
        </header>

        <main className="px-4 py-6 md:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

function AdminSidebar({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <>
      <div className="mb-7 flex items-center gap-3 px-2 py-2">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#e8c7b0]/12 text-[#e8c7b0]">
          <Gem className="h-5 w-5" />
        </span>
        <div>
          <p className="text-base font-bold text-white">Luna</p>
          <p className="text-xs text-slate-500">Bảng điều khiển studio</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto">
        {sidebarLinks.map((link) => {
          const active = pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition",
                active
                  ? "bg-[#e8c7b0] text-[#120c12]"
                  : "text-slate-400 hover:bg-white/[0.06] hover:text-white",
              )}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-6 border-t border-white/8 pt-4">
        <Link href="/" className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold text-slate-400 transition hover:bg-white/[0.06] hover:text-white">
          <LogOut className="h-4 w-4" />
          Về trang chủ
        </Link>
      </div>
    </>
  );
}
