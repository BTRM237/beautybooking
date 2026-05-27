import prisma from "@/lib/prisma";
import { AdminStatCard, EmptyState } from "@/components/ui/luxury";
import { BarChart3, Eye, MessageSquare, MousePointerClick, Calendar } from "lucide-react";
import type { AnalyticsEvent } from "@prisma/client";

const eventTypeLabels: Record<string, string> = {
  page_view: "Lượt xem trang",
  contact_click: "Click liên hệ",
  booking_start: "Bắt đầu đặt lịch",
  booking_complete: "Hoàn tất đặt lịch",
  ai_chat_open: "Mở chat AI",
};

const eventTypeIcons: Record<string, typeof Eye> = {
  page_view: Eye,
  contact_click: MousePointerClick,
  booking_start: Calendar,
  booking_complete: Calendar,
  ai_chat_open: MessageSquare,
};

const eventTypeTones: Record<string, "rose" | "blue" | "green" | "amber"> = {
  page_view: "blue",
  contact_click: "amber",
  booking_start: "rose",
  booking_complete: "green",
  ai_chat_open: "rose",
};

export default async function AdminAnalyticsPage() {
  const events: AnalyticsEvent[] = await prisma.analyticsEvent.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const eventCounts: Record<string, number> = {};
  for (const e of events) {
    eventCounts[e.eventType] = (eventCounts[e.eventType] || 0) + 1;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Phân tích</h2>
        <p className="mt-1 text-sm text-slate-500">Theo dõi hành vi khách hàng và hiệu quả website.</p>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Object.entries(eventCounts).map(([type, count]) => (
          <AdminStatCard
            key={type}
            icon={eventTypeIcons[type] || BarChart3}
            label={eventTypeLabels[type] || type.replace(/_/g, " ").toUpperCase()}
            value={count}
            tone={eventTypeTones[type] || "rose"}
          />
        ))}
      </div>

      {/* Events log */}
      <section className="admin-card overflow-hidden">
        <div className="border-b border-white/8 px-5 py-4">
          <h3 className="text-sm font-bold uppercase tracking-wide text-slate-400">Sự kiện gần đây (100 mới nhất)</h3>
        </div>
        {events.length === 0 ? (
          <div className="p-5">
            <EmptyState title="Chưa có sự kiện" description="Sự kiện sẽ được ghi nhận khi có khách truy cập website." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  {["Loại sự kiện", "Dữ liệu", "Trang", "Thời gian"].map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {events.map((e) => (
                  <tr key={e.id}>
                    <td>
                      <span className="rounded-full bg-[#e8c7b0]/10 px-2.5 py-1 text-xs font-bold text-[#e8c7b0]">
                        {eventTypeLabels[e.eventType] || e.eventType}
                      </span>
                    </td>
                    <td className="max-w-xs truncate font-mono text-xs text-slate-500">{e.eventData || "—"}</td>
                    <td>{e.page || "—"}</td>
                    <td>{new Date(e.createdAt).toLocaleString("vi-VN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
