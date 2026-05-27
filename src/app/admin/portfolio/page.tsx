"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Edit, Plus, Trash2, X } from "lucide-react";
import { EmptyState, StatusBadge } from "@/components/ui/luxury";
import { ImageUploadField, MultiImageUploadField } from "@/components/admin/ImageUploadField";

type PortfolioItem = {
  id: string;
  title: string;
  slug: string;
  style: string;
  beforeImage: string | null;
  afterImage: string | null;
  gallery: string | null;
  description: string | null;
  status: string;
  sortOrder: number;
};

const styles = ["Cô dâu", "Kỷ yếu", "Dự tiệc", "Tone Hàn Quốc", "Tone Tây", "Tự nhiên", "Sự kiện"];

const initialForm = {
  title: "",
  slug: "",
  style: "Cô dâu",
  beforeImage: "",
  afterImage: "",
  gallery: "",
  description: "",
  status: "VISIBLE",
  sortOrder: 0,
};

function galleryToText(value: string | null) {
  if (!value) return "";
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.join(", ");
  } catch {}
  return value;
}

function toSlug(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function AdminPortfolioPage() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<PortfolioItem | null>(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const fetchData = () => {
    setLoading(true);
    fetch("/api/admin/portfolio")
      .then((response) => response.json())
      .then((data) => {
        if (data.success) setItems(data.data);
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

  const openEdit = (item: PortfolioItem) => {
    setEditing(item);
    setForm({
      title: item.title,
      slug: item.slug,
      style: item.style,
      beforeImage: item.beforeImage || "",
      afterImage: item.afterImage || "",
      gallery: galleryToText(item.gallery),
      description: item.description || "",
      status: item.status,
      sortOrder: item.sortOrder,
    });
    setError("");
    setShowForm(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    const method = editing ? "PATCH" : "POST";
    const url = editing ? `/api/admin/portfolio/${editing.id}` : "/api/admin/portfolio";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();

    if (data.success) {
      setShowForm(false);
      setEditing(null);
      setNotice(editing ? "Đã cập nhật portfolio." : "Đã thêm portfolio mới.");
      fetchData();
    } else {
      setError(data.error?.message || "Không thể lưu portfolio.");
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xoá portfolio này?")) return;
    const res = await fetch(`/api/admin/portfolio/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) {
      setNotice("Đã xoá portfolio.");
      fetchData();
    } else {
      setError(data.error?.message || "Không thể xoá portfolio.");
    }
  };

  const updateField = <K extends keyof typeof initialForm>(key: K, value: (typeof initialForm)[K]) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "title" && !editing) {
        next.slug = toSlug(value as string);
      }
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Quản lý Portfolio</h2>
          <p className="mt-1 text-sm text-slate-500">Thêm ảnh before/after và gallery hiển thị ngoài website.</p>
        </div>
        <button type="button" onClick={openNew} className="btn-primary">
          <Plus className="h-4 w-4" />
          Thêm portfolio
        </button>
      </div>

      {notice && <div className="rounded-2xl border border-emerald-300/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">{notice}</div>}
      {error && <div className="rounded-2xl border border-rose-300/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">{error}</div>}

      {showForm && (
        <section className="admin-card p-5 md:p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white">{editing ? "Sửa portfolio" : "Thêm portfolio mới"}</h3>
              <p className="text-sm text-slate-500">Tải ảnh trực tiếp hoặc nhập URL ảnh.</p>
            </div>
            <button type="button" onClick={() => setShowForm(false)} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/8 text-slate-300">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <AdminField label="Tiêu đề">
              <input value={form.title} onChange={(e) => updateField("title", e.target.value)} className="premium-input" placeholder="VD: Cô dâu Hàn Quốc" />
            </AdminField>
            <AdminField label="Slug (URL)">
              <input value={form.slug} onChange={(e) => updateField("slug", e.target.value)} className="premium-input" placeholder="co-dau-han-quoc" />
            </AdminField>
            <AdminField label="Phong cách">
              <select value={form.style} onChange={(e) => updateField("style", e.target.value)} className="premium-input">
                {styles.map((style) => (
                  <option key={style} value={style}>{style}</option>
                ))}
              </select>
            </AdminField>
            <AdminField label="Trạng thái">
              <select value={form.status} onChange={(e) => updateField("status", e.target.value)} className="premium-input">
                <option value="VISIBLE">Hiện</option>
                <option value="HIDDEN">Ẩn</option>
              </select>
            </AdminField>
            <AdminField label="Thứ tự">
              <input type="number" value={form.sortOrder} onChange={(e) => updateField("sortOrder", Number(e.target.value))} className="premium-input" />
            </AdminField>
          </div>

          <div className="mt-5 space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <ImageUploadField
                label="Ảnh trước (Before)"
                value={form.beforeImage}
                onChange={(value) => updateField("beforeImage", value)}
                helper="Ảnh trước khi makeup, tạo hiệu ứng so sánh."
              />
              <ImageUploadField
                label="Ảnh sau (After)"
                value={form.afterImage}
                onChange={(value) => updateField("afterImage", value)}
                helper="Ảnh sau khi makeup - kết quả ấn tượng."
              />
            </div>
            <MultiImageUploadField
              label="Gallery ảnh bổ sung"
              value={form.gallery}
              onChange={(value) => updateField("gallery", value)}
              helper="Thêm ảnh chi tiết từ nhiều góc, không giới hạn số lượng."
            />
            <AdminField label="Mô tả" full>
              <textarea value={form.description} onChange={(e) => updateField("description", e.target.value)} rows={3} className="premium-input min-h-28 resize-none" placeholder="Mô tả ngắn về bộ ảnh, phong cách, kỹ thuật..." />
            </AdminField>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={handleSave} disabled={saving} className="btn-primary disabled:opacity-60">
              {saving ? "Đang lưu..." : "Lưu portfolio"}
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
        ) : items.length === 0 ? (
          <div className="p-5">
            <EmptyState title="Chưa có portfolio" description="Thêm hình ảnh đầu tiên để gallery ngoài website có nội dung." />
          </div>
        ) : (
          <div className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <article key={item.id} className="group relative overflow-hidden rounded-2xl border border-white/8 bg-white/[0.025]">
                {/* Image Preview */}
                <div className="relative aspect-[4/3] overflow-hidden bg-[#120d11]">
                  {item.afterImage || item.beforeImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.afterImage || item.beforeImage || ""}
                      alt={item.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm text-slate-600">Chưa có ảnh</div>
                  )}
                  {/* Status overlay */}
                  <div className="absolute left-3 top-3">
                    <StatusBadge status={item.status === "VISIBLE" ? "ACTIVE" : "INACTIVE"} label={item.status === "VISIBLE" ? "Hiện" : "Ẩn"} />
                  </div>
                  {/* Before/After indicator */}
                  {item.beforeImage && item.afterImage && (
                    <div className="absolute bottom-3 left-3 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-bold text-white">
                      BEFORE → AFTER
                    </div>
                  )}
                </div>
                {/* Info */}
                <div className="p-4">
                  <h3 className="text-sm font-bold text-white">{item.title}</h3>
                  <p className="mt-1 text-xs text-slate-500">{item.style} · Thứ tự #{item.sortOrder}</p>
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
