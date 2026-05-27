import Link from "next/link";
import prisma from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { AdminStatCard, EmptyState, StatusBadge } from "@/components/ui/luxury";
import { Bot, Calendar, Clock, Plus, TrendingUp, UserRoundCheck } from "lucide-react";
import type { AiLead, Booking, Customer, Service } from "@prisma/client";

type BookingWithRelations = Booking & { customer: Customer; service: Service };
type LeadRow = AiLead;

async function getDashboardData() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [todayBookings, pendingBookings, activeBookings, newCustomers, aiLeads, recentBookings, recentLeads] =
    await Promise.all([
      prisma.booking.count({ where: { startAt: { gte: today, lt: tomorrow } } }),
      prisma.booking.count({ where: { status: "PENDING" } }),
      prisma.booking.findMany({ where: { status: { in: ["PENDING", "CONFIRMED"] } }, select: { totalPrice: true } }),
      prisma.customer.count({ where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } }),
      prisma.aiLead.count({ where: { status: "NEW" } }),
      prisma.booking.findMany({
        orderBy: { createdAt: "desc" },
        take: 6,
        include: { customer: true, service: true },
      }),
      prisma.aiLead.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    ]);

  const estimatedRevenue = activeBookings.reduce((sum, booking) => sum + booking.totalPrice, 0);
  return {
    todayBookings,
    pendingBookings,
    estimatedRevenue,
    newCustomers,
    aiLeads,
    recentBookings: recentBookings as BookingWithRelations[],
    recentLeads,
  };
}

const bookingStatusLabels: Record<string, string> = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  COMPLETED: "Hoàn thành",
  CANCELLED: "Đã hủy",
  NO_SHOW: "Không đến",
};

const leadStatusLabels: Record<string, string> = {
  NEW: "Mới",
  CONTACTED: "Đã liên hệ",
  WON: "Thành công",
  LOST: "Không thành",
};

export default async function AdminDashboard() {
  const data = await getDashboardData();

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <AdminStatCard icon={Calendar} label="Lịch hôm nay" value={data.todayBookings} hint="Theo ngày hiện tại" />
        <AdminStatCard icon={Clock} label="Chờ xác nhận" value={data.pendingBookings} hint="Cần xử lý sớm" tone="amber" />
        <AdminStatCard icon={TrendingUp} label="Doanh thu dự kiến" value={formatPrice(data.estimatedRevenue)} hint="Pending + confirmed" tone="green" />
        <AdminStatCard icon={UserRoundCheck} label="Khách hàng mới" value={data.newCustomers} hint="Trong 30 ngày" tone="blue" />
        <AdminStatCard icon={Bot} label="Lead AI mới" value={data.aiLeads} hint="Từ chat tư vấn" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="admin-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/8 p-5">
            <div>
              <h2 className="text-lg font-bold text-white">Lịch hẹn gần đây</h2>
              <p className="text-sm text-slate-500">Theo thời gian tạo mới nhất</p>
            </div>
            <Link href="/admin/bookings" className="rounded-full border border-white/10 px-3 py-2 text-xs font-bold text-slate-300 hover:bg-white/8">
              Xem tất cả
            </Link>
          </div>
          {data.recentBookings.length === 0 ? (
            <div className="p-5">
              <EmptyState title="Chưa có lịch hẹn" description="Lịch mới sẽ xuất hiện tại đây khi khách đặt từ website." />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Mã</th>
                    <th>Khách hàng</th>
                    <th>Dịch vụ</th>
                    <th>Ngày</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentBookings.map((booking) => (
                    <tr key={booking.id}>
                      <td className="font-mono text-xs text-[#e8c7b0]">{booking.bookingCode}</td>
                      <td className="font-semibold text-white">{booking.customer.name}</td>
                      <td>{booking.service.name}</td>
                      <td>{new Date(booking.startAt).toLocaleString("vi-VN")}</td>
                      <td>
                        <StatusBadge status={booking.status} label={bookingStatusLabels[booking.status] || booking.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="admin-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/8 p-5">
            <div>
              <h2 className="text-lg font-bold text-white">Lead AI mới</h2>
              <p className="text-sm text-slate-500">Khách quan tâm từ chat tư vấn</p>
            </div>
            <Link href="/admin/ai-leads" className="rounded-full border border-white/10 px-3 py-2 text-xs font-bold text-slate-300 hover:bg-white/8">
              Quản lý
            </Link>
          </div>
          <div className="divide-y divide-white/8">
            {data.recentLeads.length === 0 ? (
              <div className="p-5 text-sm text-slate-500">Chưa có lead mới từ AI Chat.</div>
            ) : (
              data.recentLeads.map((lead: LeadRow) => (
                <div key={lead.id} className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-white">{lead.customerName || "Khách chưa để tên"}</p>
                      <p className="mt-1 text-sm text-slate-500">{lead.serviceInterest || "Chưa rõ dịch vụ quan tâm"}</p>
                    </div>
                    <StatusBadge status={lead.status} label={leadStatusLabels[lead.status] || lead.status} />
                  </div>
                  {lead.phone && <p className="mt-3 text-sm text-[#e8c7b0]">{lead.phone}</p>}
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <section className="admin-card p-5">
          <h2 className="text-lg font-bold text-white">Thao tác nhanh</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            {[
              { href: "/admin/services", label: "Thêm dịch vụ", icon: Plus },
              { href: "/admin/blog", label: "Viết bài blog", icon: Plus },
              { href: "/admin/settings", label: "Cập nhật thông tin studio", icon: Plus },
            ].map((action) => (
              <Link key={action.href} href={action.href} className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.035] px-4 py-3 text-sm font-semibold text-slate-200 hover:bg-white/[0.07]">
                <action.icon className="h-4 w-4 text-[#e8c7b0]" />
                {action.label}
              </Link>
            ))}
          </div>
        </section>

        <section className="admin-card p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">Biểu đồ đặt lịch</h2>
              <p className="text-sm text-slate-500">Khu vực sẵn sàng cho chart doanh thu/lịch hẹn</p>
            </div>
          </div>
          <div className="mt-5 flex min-h-[220px] items-end gap-3 rounded-3xl border border-white/8 bg-black/10 p-5">
            {[42, 65, 48, 78, 54, 88, 72].map((height, index) => (
              <div key={index} className="flex flex-1 flex-col justify-end">
                <div className="rounded-t-2xl bg-gradient-to-t from-[#c98b9f] to-[#e8c7b0]" style={{ height: `${height}%` }} />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
