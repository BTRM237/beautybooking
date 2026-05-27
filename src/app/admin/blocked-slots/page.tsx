"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Edit, Plus, Trash2, X } from "lucide-react";
import { EmptyState } from "@/components/ui/luxury";

type Staff = {
  id: string;
  userId: string;
  displayName: string;
  user: { id: string; email: string; status: string };
};

type BlockedSlot = {
  id: string;
  staffId: string | null;
  staffName: string;
  startAt: string;
  endAt: string;
  reason: string | null;
  isAllDay: boolean;
};

const initialForm = {
  staffId: "ALL",
  date: "",
  startTime: "08:00",
  endTime: "09:00",
  reason: "",
  isAllDay: false,
};

function dateToInputValue(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function timeToInputValue(date: Date) {
  const hours = `${date.getHours()}`.padStart(2, "0");
  const minutes = `${date.getMinutes()}`.padStart(2, "0");
  return `${hours}:${minutes}`;
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminBlockedSlotsPage() {
  const [slots, setSlots] = useState<BlockedSlot[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<BlockedSlot | null>(null);
  const [form, setForm] = useState({ ...initialForm, date: dateToInputValue(new Date()) });
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const activeStaff = useMemo(() => staff.filter((item) => item.user.status === "ACTIVE"), [staff]);

  const fetchData = () => {
    setLoading(true);
    Promise.all([fetch("/api/admin/blocked-slots").then((response) => response.json()), fetch("/api/admin/staff").then((response) => response.json())])
      .then(([slotData, staffData]) => {
        if (slotData.success) setSlots(slotData.data);
        if (staffData.success) setStaff(staffData.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    void Promise.resolve().then(fetchData);
  }, []);

  const openNew = () => {
    setEditing(null);
    setForm({ ...initialForm, date: dateToInputValue(new Date()) });
    setError("");
    setShowForm(true);
  };

  const openEdit = (slot: BlockedSlot) => {
    const start = new Date(slot.startAt);
    const end = new Date(slot.endAt);
    setEditing(slot);
    setForm({
      staffId: slot.staffId || "ALL",
      date: dateToInputValue(start),
      startTime: timeToInputValue(start),
      endTime: timeToInputValue(end),
      reason: slot.reason || "",
      isAllDay: slot.isAllDay,
    });
    setError("");
    setShowForm(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    const method = editing ? "PATCH" : "POST";
    const url = editing ? `/api/admin/blocked-slots/${editing.id}` : "/api/admin/blocked-slots";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();

    if (data.success) {
      setShowForm(false);
      setEditing(null);
      setNotice(editing ? "Đã cập nhật khung giờ chặn." : "Đã thêm khung giờ chặn.");
      fetchData();
    } else {
      setError(data.error?.message || "Không thể lưu khung giờ chặn.");
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xoá khung giờ chặn này?")) return;
    const res = await fetch(`/api/admin/blocked-slots/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) {
      setNotice("Đã xoá khung giờ chặn.");
      fetchData();
    } else {
      setError(data.error?.message || "Không thể xoá khung giờ chặn.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Khung giờ bị chặn</h2>
          <p className="mt-1 text-sm text-slate-500">Chặn lịch riêng cho một nhân viên hoặc toàn bộ studio.</p>
        </div>
        <button type="button" onClick={openNew} className="btn-primary">
          <Plus className="h-4 w-4" />
          Thêm khung giờ
        </button>
      </div>

      {notice && <div className="rounded-2xl border border-emerald-300/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">{notice}</div>}
      {error && <div className="rounded-2xl border border-rose-300/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">{error}</div>}

      {showForm && (
        <section className="admin-card p-5 md:p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white">{editing ? "Sửa khung giờ chặn" : "Thêm khung giờ chặn"}</h3>
              <p className="text-sm text-slate-500">Khách sẽ không thể đặt lịch trùng khoảng thời gian này.</p>
            </div>
            <button type="button" onClick={() => setShowForm(false)} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/8 text-slate-300">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <AdminField label="Nhân viên">
              <select value={form.staffId} onChange={(event) => setForm({ ...form, staffId: event.target.value })} className="premium-input">
                <option value="ALL">Tất cả nhân viên</option>
                {activeStaff.map((item) => (
                  <option key={item.userId} value={item.userId}>{item.displayName}</option>
                ))}
              </select>
            </AdminField>
            <AdminField label="Ngày">
              <input type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} className="premium-input" />
            </AdminField>
            <AdminField label="Giờ bắt đầu">
              <input type="time" value={form.startTime} onChange={(event) => setForm({ ...form, startTime: event.target.value })} disabled={form.isAllDay} className="premium-input disabled:opacity-50" />
            </AdminField>
            <AdminField label="Giờ kết thúc">
              <input type="time" value={form.endTime} onChange={(event) => setForm({ ...form, endTime: event.target.value })} disabled={form.isAllDay} className="premium-input disabled:opacity-50" />
            </AdminField>
            <AdminField label="Lý do" full>
              <input value={form.reason} onChange={(event) => setForm({ ...form, reason: event.target.value })} className="premium-input" placeholder="Ví dụ: Nghỉ lễ, lịch cá nhân, bảo trì studio..." />
            </AdminField>
            <label className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.035] p-4 md:col-span-2">
              <input type="checkbox" checked={form.isAllDay} onChange={(event) => setForm({ ...form, isAllDay: event.target.checked })} className="h-4 w-4 accent-[#e8c7b0]" />
              <span className="text-sm font-semibold text-slate-200">Chặn cả ngày</span>
            </label>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={handleSave} disabled={saving} className="btn-primary disabled:opacity-60">
              {saving ? "Đang lưu..." : "Lưu khung giờ"}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="btn-secondary">
              Hủy
            </button>
          </div>
        </section>
      )}

      <section className="admin-card overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-sm text-slate-500">Đang tải...</div>
        ) : slots.length === 0 ? (
          <div className="p-5">
            <EmptyState title="Chưa có khung giờ bị chặn" description="Thêm khung giờ chặn để ngăn khách đặt lịch vào thời gian cụ thể." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  {["Nhân viên", "Bắt đầu", "Kết thúc", "Lý do", "Cả ngày", ""].map((heading) => (
                    <th key={heading}>{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {slots.map((slot) => (
                  <tr key={slot.id}>
                    <td className="font-semibold text-white">{slot.staffName}</td>
                    <td>{formatDateTime(slot.startAt)}</td>
                    <td>{formatDateTime(slot.endAt)}</td>
                    <td>{slot.reason || "Không ghi chú"}</td>
                    <td>{slot.isAllDay ? "Có" : "Không"}</td>
                    <td>
                      <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => openEdit(slot)} className="rounded-xl p-2 text-[#e8c7b0] hover:bg-white/8" aria-label="Sửa khung giờ">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button type="button" onClick={() => handleDelete(slot.id)} className="rounded-xl p-2 text-rose-300 hover:bg-white/8" aria-label="Xoá khung giờ">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
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

function AdminField({ label, children, full }: { label: string; children: ReactNode; full?: boolean }) {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <label className="mb-2 block text-sm font-semibold text-slate-300">{label}</label>
      {children}
    </div>
  );
}
