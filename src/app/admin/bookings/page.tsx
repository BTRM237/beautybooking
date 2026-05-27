"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/utils";
import { EmptyState, StatusBadge } from "@/components/ui/luxury";
import { Calendar, Check, Clock, Eye, X } from "lucide-react";

type Booking = {
  id: string;
  bookingCode: string;
  customerId: string;
  serviceId: string;
  staffId: string;
  startAt: string;
  endAt: string;
  bookingType: string;
  address: string | null;
  status: string;
  totalPrice: number;
  customerNote: string | null;
  adminNote: string | null;
  createdAt: string;
  customer: { name: string; phone: string; email: string | null };
  service: { name: string };
  staff: { name: string };
};

const statusLabels: Record<string, string> = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  COMPLETED: "Hoàn thành",
  CANCELLED: "Đã hủy",
  NO_SHOW: "Không đến",
};

const statusActions: Record<string, { label: string; next: string; color: string }[]> = {
  PENDING: [
    { label: "Xác nhận", next: "CONFIRMED", color: "text-emerald-300" },
    { label: "Hủy", next: "CANCELLED", color: "text-rose-300" },
  ],
  CONFIRMED: [
    { label: "Hoàn thành", next: "COMPLETED", color: "text-sky-300" },
    { label: "Không đến", next: "NO_SHOW", color: "text-slate-300" },
    { label: "Hủy", next: "CANCELLED", color: "text-rose-300" },
  ],
};

const filterOptions = ["ALL", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"];
const filterLabels: Record<string, string> = {
  ALL: "Tất cả",
  ...statusLabels,
};

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [notice, setNotice] = useState("");
  const [detailId, setDetailId] = useState<string | null>(null);
  const [adminNote, setAdminNote] = useState("");

  const fetchData = () => {
    setLoading(true);
    fetch("/api/admin/bookings")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setBookings(d.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    void Promise.resolve().then(fetchData);
  }, []);

  const updateStatus = async (id: string, status: string) => {
    const res = await fetch(`/api/admin/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (data.success) {
      setNotice(`Đã cập nhật trạng thái: ${statusLabels[status]}`);
      fetchData();
    }
  };

  const saveNote = async (id: string) => {
    const res = await fetch(`/api/admin/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adminNote }),
    });
    const data = await res.json();
    if (data.success) {
      setNotice("Đã lưu ghi chú.");
      fetchData();
    }
  };

  const filtered = filter === "ALL" ? bookings : bookings.filter((b) => b.status === filter);
  const detailBooking = detailId ? bookings.find((b) => b.id === detailId) : null;

  // Stats
  const pending = bookings.filter((b) => b.status === "PENDING").length;
  const confirmed = bookings.filter((b) => b.status === "CONFIRMED").length;
  const today = bookings.filter((b) => {
    const d = new Date(b.startAt);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  }).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Quản lý lịch hẹn</h2>
          <p className="mt-1 text-sm text-slate-500">Theo dõi lịch mới, cập nhật trạng thái, ghi chú nội bộ.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="admin-card p-4 text-center">
          <Calendar className="mx-auto mb-2 h-5 w-5 text-[#e8c7b0]" />
          <p className="text-xl font-bold text-white">{today}</p>
          <p className="text-xs text-slate-500">Hôm nay</p>
        </div>
        <div className="admin-card p-4 text-center">
          <Clock className="mx-auto mb-2 h-5 w-5 text-amber-200" />
          <p className="text-xl font-bold text-amber-200">{pending}</p>
          <p className="text-xs text-slate-500">Chờ xác nhận</p>
        </div>
        <div className="admin-card p-4 text-center">
          <Check className="mx-auto mb-2 h-5 w-5 text-emerald-300" />
          <p className="text-xl font-bold text-emerald-300">{confirmed}</p>
          <p className="text-xs text-slate-500">Đã xác nhận</p>
        </div>
      </div>

      {notice && (
        <div className="rounded-2xl border border-emerald-300/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
          {notice}
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-1.5 overflow-x-auto rounded-2xl border border-white/8 bg-white/[0.025] p-1">
        {filterOptions.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => setFilter(opt)}
            className={`shrink-0 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
              filter === opt
                ? "bg-[#e8c7b0] text-[#120c12]"
                : "text-slate-400 hover:bg-white/[0.06] hover:text-white"
            }`}
          >
            {filterLabels[opt]}
            {opt !== "ALL" && ` (${bookings.filter((b) => b.status === opt).length})`}
          </button>
        ))}
      </div>

      {/* Detail Panel */}
      {detailBooking && (
        <section className="admin-card p-5 md:p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white">Chi tiết lịch #{detailBooking.bookingCode}</h3>
              <p className="text-sm text-slate-500">Xem thông tin và cập nhật trạng thái.</p>
            </div>
            <button type="button" onClick={() => setDetailId(null)} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/8 text-slate-300">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <InfoRow label="Khách hàng" value={detailBooking.customer.name} />
            <InfoRow label="SĐT" value={detailBooking.customer.phone} />
            <InfoRow label="Dịch vụ" value={detailBooking.service.name} />
            <InfoRow label="Chuyên viên" value={detailBooking.staff.name} />
            <InfoRow label="Ngày giờ" value={new Date(detailBooking.startAt).toLocaleString("vi-VN")} />
            <InfoRow label="Giá" value={formatPrice(detailBooking.totalPrice)} />
            <InfoRow label="Hình thức" value={detailBooking.bookingType === "STUDIO" ? "Tại studio" : "Tại nhà"} />
            {detailBooking.address && <InfoRow label="Địa chỉ" value={detailBooking.address} />}
            {detailBooking.customerNote && <InfoRow label="Ghi chú khách" value={detailBooking.customerNote} full />}
          </div>

          {/* Admin note */}
          <div className="mt-5">
            <label className="mb-2 block text-sm font-semibold text-slate-300">Ghi chú admin</label>
            <div className="flex gap-3">
              <textarea
                value={adminNote || detailBooking.adminNote || ""}
                onChange={(e) => setAdminNote(e.target.value)}
                rows={2}
                className="premium-input min-h-20 flex-1 resize-none"
                placeholder="Ghi chú nội bộ..."
              />
              <button
                type="button"
                onClick={() => saveNote(detailBooking.id)}
                className="btn-secondary shrink-0 self-end px-4"
              >
                Lưu
              </button>
            </div>
          </div>

          {/* Status actions */}
          {statusActions[detailBooking.status] && (
            <div className="mt-5 flex flex-wrap gap-2">
              {statusActions[detailBooking.status].map((action) => (
                <button
                  key={action.next}
                  type="button"
                  onClick={() => updateStatus(detailBooking.id, action.next)}
                  className={`btn-secondary text-sm ${action.color}`}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      <section className="admin-card overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-sm text-slate-500">Đang tải...</div>
        ) : filtered.length === 0 ? (
          <div className="p-5">
            <EmptyState title="Không có lịch hẹn" description={filter === "ALL" ? "Lịch hẹn sẽ xuất hiện khi khách đặt lịch từ website." : `Không có lịch hẹn nào ở trạng thái "${filterLabels[filter]}".`} />
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="admin-table">
                <thead>
                  <tr>
                    {["Mã", "Khách hàng", "SĐT", "Dịch vụ", "Chuyên viên", "Ngày giờ", "Giá", "Trạng thái", ""].map((heading) => (
                      <th key={heading}>{heading}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((booking) => (
                    <tr key={booking.id} className="cursor-pointer" onClick={() => { setDetailId(booking.id); setAdminNote(booking.adminNote || ""); }}>
                      <td className="font-mono text-xs text-[#e8c7b0]">{booking.bookingCode}</td>
                      <td className="font-semibold text-white">{booking.customer.name}</td>
                      <td>{booking.customer.phone}</td>
                      <td>{booking.service.name}</td>
                      <td>{booking.staff.name}</td>
                      <td>{new Date(booking.startAt).toLocaleString("vi-VN")}</td>
                      <td className="font-semibold text-[#e8c7b0]">{formatPrice(booking.totalPrice)}</td>
                      <td>
                        <StatusBadge status={booking.status} label={statusLabels[booking.status] || booking.status} />
                      </td>
                      <td>
                        <div className="flex justify-end gap-1.5">
                          {statusActions[booking.status]?.map((action) => (
                            <button
                              key={action.next}
                              type="button"
                              onClick={(e) => { e.stopPropagation(); updateStatus(booking.id, action.next); }}
                              className={`rounded-xl p-2 hover:bg-white/8 ${action.color}`}
                              title={action.label}
                            >
                              {action.next === "CONFIRMED" && <Check className="h-4 w-4" />}
                              {action.next === "COMPLETED" && <Check className="h-4 w-4" />}
                              {action.next === "CANCELLED" && <X className="h-4 w-4" />}
                              {action.next === "NO_SHOW" && <Eye className="h-4 w-4" />}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="grid gap-4 p-4 lg:hidden">
              {filtered.map((booking) => (
                <article
                  key={booking.id}
                  className="cursor-pointer rounded-2xl border border-white/8 bg-white/[0.025] p-4 transition hover:border-white/12"
                  onClick={() => { setDetailId(booking.id); setAdminNote(booking.adminNote || ""); }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-mono text-xs text-[#e8c7b0]">{booking.bookingCode}</p>
                      <h3 className="mt-1 font-bold text-white">{booking.customer.name}</h3>
                      <p className="text-sm text-slate-400">{booking.customer.phone}</p>
                    </div>
                    <StatusBadge status={booking.status} label={statusLabels[booking.status] || booking.status} />
                  </div>
                  <div className="mt-3 grid gap-1.5 text-sm text-slate-400">
                    <p><span className="text-slate-500">Dịch vụ:</span> {booking.service.name}</p>
                    <p><span className="text-slate-500">Ngày giờ:</span> {new Date(booking.startAt).toLocaleString("vi-VN")}</p>
                    <p className="font-bold text-[#e8c7b0]">{formatPrice(booking.totalPrice)}</p>
                  </div>
                  {statusActions[booking.status] && (
                    <div className="mt-3 flex gap-2">
                      {statusActions[booking.status].map((action) => (
                        <button
                          key={action.next}
                          type="button"
                          onClick={(e) => { e.stopPropagation(); updateStatus(booking.id, action.next); }}
                          className={`rounded-xl border border-white/8 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold hover:bg-white/8 ${action.color}`}
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}
                </article>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}

function InfoRow({ label, value, full }: { label: string; value: string; full?: boolean }) {
  return (
    <div className={`rounded-xl border border-white/8 bg-white/[0.025] px-4 py-3 ${full ? "md:col-span-2" : ""}`}>
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}
