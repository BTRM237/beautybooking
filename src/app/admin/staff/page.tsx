"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Edit, Plus, Trash2, X } from "lucide-react";
import { EmptyState, StatusBadge } from "@/components/ui/luxury";
import { ImageUploadField } from "@/components/admin/ImageUploadField";

type Staff = {
  id: string;
  userId: string;
  displayName: string;
  avatar: string | null;
  bio: string | null;
  experienceYears: number;
  specialties: string | null;
  workingStatus: string;
  serviceRadiusKm: number;
  sortOrder: number;
  user: { id: string; name: string; email: string; role: string; status: string };
};

const initialForm = {
  displayName: "",
  email: "",
  password: "",
  avatar: "",
  bio: "",
  specialties: "",
  experienceYears: 0,
  serviceRadiusKm: 10,
  sortOrder: 0,
  workingStatus: "ACTIVE",
  userStatus: "ACTIVE",
};

function specialtiesToText(value: string | null) {
  if (!value) return "";
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.join(", ");
  } catch {}
  return value;
}

function statusLabel(status: string) {
  if (status === "ACTIVE") return "Đang làm";
  if (status === "ON_LEAVE") return "Nghỉ phép";
  return "Ngừng";
}

export default function AdminStaffPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Staff | null>(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const fetchData = () => {
    setLoading(true);
    fetch("/api/admin/staff")
      .then((response) => response.json())
      .then((data) => {
        if (data.success) setStaff(data.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    void Promise.resolve().then(fetchData);
  }, []);

  const openNew = () => {
    setEditing(null);
    setForm(initialForm);
    setError("");
    setShowForm(true);
  };

  const openEdit = (item: Staff) => {
    setEditing(item);
    setForm({
      displayName: item.displayName,
      email: item.user.email,
      password: "",
      avatar: item.avatar || "",
      bio: item.bio || "",
      specialties: specialtiesToText(item.specialties),
      experienceYears: item.experienceYears,
      serviceRadiusKm: item.serviceRadiusKm,
      sortOrder: item.sortOrder,
      workingStatus: item.workingStatus,
      userStatus: item.user.status,
    });
    setError("");
    setShowForm(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    const method = editing ? "PATCH" : "POST";
    const url = editing ? `/api/admin/staff/${editing.id}` : "/api/admin/staff";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();

    if (data.success) {
      setShowForm(false);
      setEditing(null);
      setNotice(editing ? "Đã cập nhật nhân viên." : "Đã thêm nhân viên mới.");
      fetchData();
    } else {
      setError(data.error?.message || "Không thể lưu nhân viên.");
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xoá nhân viên này? Lịch cũ vẫn được giữ để đối soát.")) return;
    const res = await fetch(`/api/admin/staff/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) {
      setNotice("Đã xoá nhân viên khỏi danh sách.");
      fetchData();
    } else {
      setError(data.error?.message || "Không thể xoá nhân viên.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Quản lý nhân viên</h2>
          <p className="mt-1 text-sm text-slate-500">Thêm, sửa, xoá chuyên viên makeup hiển thị trong luồng đặt lịch.</p>
        </div>
        <button type="button" onClick={openNew} className="btn-primary">
          <Plus className="h-4 w-4" />
          Thêm nhân viên
        </button>
      </div>

      {notice && <div className="rounded-2xl border border-emerald-300/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">{notice}</div>}
      {error && <div className="rounded-2xl border border-rose-300/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">{error}</div>}

      {showForm && (
        <section className="admin-card p-5 md:p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white">{editing ? "Sửa nhân viên" : "Thêm nhân viên mới"}</h3>
              <p className="text-sm text-slate-500">Mật khẩu mặc định khi không nhập là Admin@123456.</p>
            </div>
            <button type="button" onClick={() => setShowForm(false)} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/8 text-slate-300">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid gap-5 lg:grid-cols-[240px_1fr]">
            {/* Avatar upload */}
            <div>
              <ImageUploadField
                label="Ảnh đại diện"
                value={form.avatar}
                onChange={(value) => setForm({ ...form, avatar: value })}
                helper="Ảnh hiển thị trong team & đặt lịch."
              />
            </div>

            {/* Form fields */}
            <div className="grid gap-4 md:grid-cols-2">
              <AdminField label="Tên hiển thị">
                <input value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} className="premium-input" />
              </AdminField>
              <AdminField label="Email đăng nhập">
                <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="premium-input" type="email" />
              </AdminField>
              <AdminField label={editing ? "Mật khẩu mới (nếu đổi)" : "Mật khẩu"}>
                <input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="premium-input" type="password" placeholder="Admin@123456" />
              </AdminField>
              <AdminField label="Kinh nghiệm (năm)">
                <input type="number" value={form.experienceYears} onChange={(e) => setForm({ ...form, experienceYears: Number(e.target.value) })} className="premium-input" />
              </AdminField>
              <AdminField label="Bán kính phục vụ (km)">
                <input type="number" value={form.serviceRadiusKm} onChange={(e) => setForm({ ...form, serviceRadiusKm: Number(e.target.value) })} className="premium-input" />
              </AdminField>
              <AdminField label="Trạng thái làm việc">
                <select value={form.workingStatus} onChange={(e) => setForm({ ...form, workingStatus: e.target.value })} className="premium-input">
                  <option value="ACTIVE">Đang làm</option>
                  <option value="ON_LEAVE">Nghỉ phép</option>
                  <option value="INACTIVE">Ngừng</option>
                </select>
              </AdminField>
              <AdminField label="Trạng thái tài khoản">
                <select value={form.userStatus} onChange={(e) => setForm({ ...form, userStatus: e.target.value })} className="premium-input">
                  <option value="ACTIVE">Hoạt động</option>
                  <option value="DISABLED">Khoá</option>
                </select>
              </AdminField>
              <AdminField label="Thứ tự hiển thị">
                <input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} className="premium-input" />
              </AdminField>
              <AdminField label="Chuyên môn" full>
                <input value={form.specialties} onChange={(e) => setForm({ ...form, specialties: e.target.value })} className="premium-input" placeholder="Makeup cô dâu, Tone Hàn, Làm tóc" />
              </AdminField>
              <AdminField label="Giới thiệu" full>
                <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3} className="premium-input min-h-28 resize-none" placeholder="Giới thiệu ngắn về chuyên viên..." />
              </AdminField>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={handleSave} disabled={saving} className="btn-primary disabled:opacity-60">
              {saving ? "Đang lưu..." : "Lưu nhân viên"}
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
        ) : staff.length === 0 ? (
          <div className="p-5">
            <EmptyState title="Chưa có nhân viên" description="Thêm chuyên viên đầu tiên để khách có thể chọn trong luồng đặt lịch." />
          </div>
        ) : (
          <div className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
            {staff.map((item) => (
              <article key={item.id} className="group overflow-hidden rounded-2xl border border-white/8 bg-white/[0.025] transition hover:border-white/12">
                {/* Avatar */}
                <div className="relative aspect-[4/3] overflow-hidden bg-[#120d11]">
                  {item.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.avatar}
                      alt={item.displayName}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-4xl font-bold text-[#e8c7b0]/30">
                      {item.displayName.charAt(0)}
                    </div>
                  )}
                  <div className="absolute left-3 top-3">
                    <StatusBadge status={item.workingStatus} label={statusLabel(item.workingStatus)} />
                  </div>
                  <div className="absolute right-3 top-3">
                    <StatusBadge status={item.user.status === "ACTIVE" ? "ACTIVE" : "INACTIVE"} label={item.user.status === "ACTIVE" ? "TK hoạt động" : "TK khoá"} />
                  </div>
                </div>
                {/* Info */}
                <div className="p-4">
                  <h3 className="text-sm font-bold text-white">{item.displayName}</h3>
                  <p className="mt-0.5 text-xs text-slate-500">{item.user.email}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <span className="rounded-full bg-[#e8c7b0]/10 px-2 py-0.5 text-[10px] font-bold text-[#e8c7b0]">
                      {item.experienceYears} năm KN
                    </span>
                    {specialtiesToText(item.specialties) && (
                      <span className="truncate rounded-full bg-white/8 px-2 py-0.5 text-[10px] font-semibold text-slate-300">
                        {specialtiesToText(item.specialties)}
                      </span>
                    )}
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button type="button" onClick={() => openEdit(item)} className="flex-1 rounded-xl border border-white/8 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-[#e8c7b0] hover:bg-white/8">
                      <Edit className="mr-1 inline h-3.5 w-3.5" />
                      Sửa
                    </button>
                    <button type="button" onClick={() => handleDelete(item.id)} className="rounded-xl border border-white/8 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-rose-300 hover:bg-white/8">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
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
