"use client";

import { useEffect, useState, type ReactNode } from "react";
import { formatDuration, formatPrice } from "@/lib/utils";
import { EmptyState, StatusBadge } from "@/components/ui/luxury";
import { Check, Edit, Plus, Trash2, X } from "lucide-react";
import { ImageUploadField, MultiImageUploadField } from "@/components/admin/ImageUploadField";

type Service = {
  id: string;
  name: string;
  slug: string;
  category: string;
  shortDescription: string | null;
  description: string | null;
  basePrice: number;
  durationMin: number;
  thumbnail: string | null;
  gallery: string | null;
  benefits: string | null;
  occasions: string | null;
  styleSuggestions: string | null;
  faq: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  status: string;
  featured: boolean;
  sortOrder: number;
};

const categories = ["Cô dâu", "Dự tiệc", "Kỷ yếu", "Chụp ảnh", "Sự kiện", "Makeup cá nhân", "Làm tóc"];

const initialForm = {
  name: "",
  slug: "",
  category: "Cô dâu",
  shortDescription: "",
  description: "",
  basePrice: 0,
  durationMin: 60,
  thumbnail: "",
  gallery: "",
  benefits: "",
  occasions: "",
  styleSuggestions: "",
  faq: "",
  seoTitle: "",
  seoDescription: "",
  status: "ACTIVE",
  featured: false,
  sortOrder: 0,
};

function jsonToText(value: string | null) {
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

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"basic" | "content" | "seo">("basic");

  const fetchData = () => {
    setLoading(true);
    fetch("/api/admin/services")
      .then((response) => response.json())
      .then((data) => {
        if (data.success) setServices(data.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    void Promise.resolve().then(fetchData);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    const method = editing ? "PATCH" : "POST";
    const url = editing ? `/api/admin/services/${editing.id}` : "/api/admin/services";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (data.success) {
      setShowForm(false);
      setEditing(null);
      setNotice(editing ? "Đã cập nhật dịch vụ." : "Đã thêm dịch vụ mới.");
      fetchData();
    } else {
      setError(data.error?.message || "Không thể lưu dịch vụ.");
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa dịch vụ này?")) return;
    await fetch(`/api/admin/services/${id}`, { method: "DELETE" });
    setNotice("Đã xóa dịch vụ.");
    fetchData();
  };

  const openEdit = (service: Service) => {
    setEditing(service);
    setForm({
      name: service.name,
      slug: service.slug,
      category: service.category,
      shortDescription: service.shortDescription || "",
      description: service.description || "",
      basePrice: service.basePrice,
      durationMin: service.durationMin,
      thumbnail: service.thumbnail || "",
      gallery: jsonToText(service.gallery),
      benefits: jsonToText(service.benefits),
      occasions: jsonToText(service.occasions),
      styleSuggestions: jsonToText(service.styleSuggestions),
      faq: service.faq || "",
      seoTitle: service.seoTitle || "",
      seoDescription: service.seoDescription || "",
      status: service.status,
      featured: service.featured,
      sortOrder: service.sortOrder,
    });
    setActiveTab("basic");
    setError("");
    setShowForm(true);
  };

  const openNew = () => {
    setEditing(null);
    setForm(initialForm);
    setActiveTab("basic");
    setError("");
    setShowForm(true);
  };

  const updateField = <K extends keyof typeof initialForm>(key: K, value: (typeof initialForm)[K]) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      // Auto-generate slug from name when creating new
      if (key === "name" && !editing) {
        next.slug = toSlug(value as string);
      }
      return next;
    });
  };

  const tabs = [
    { key: "basic" as const, label: "Thông tin cơ bản" },
    { key: "content" as const, label: "Nội dung & Ảnh" },
    { key: "seo" as const, label: "SEO & Mở rộng" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Quản lý dịch vụ</h2>
          <p className="mt-1 text-sm text-slate-500">Cập nhật gói makeup, giá, thời lượng, ảnh, SEO và nội dung chi tiết.</p>
        </div>
        <button type="button" onClick={openNew} className="btn-primary">
          <Plus className="h-4 w-4" />
          Thêm dịch vụ
        </button>
      </div>

      {notice && (
        <div className="rounded-2xl border border-emerald-300/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
          {notice}
        </div>
      )}
      {error && (
        <div className="rounded-2xl border border-rose-300/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {error}
        </div>
      )}

      {showForm && (
        <section className="admin-card p-5 md:p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white">{editing ? "Sửa dịch vụ" : "Thêm dịch vụ mới"}</h3>
              <p className="text-sm text-slate-500">Điền đầy đủ thông tin hiển thị trên website.</p>
            </div>
            <button type="button" onClick={() => setShowForm(false)} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/8 text-slate-300">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Tabs */}
          <div className="mb-6 flex gap-1 rounded-2xl border border-white/8 bg-white/[0.025] p-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                  activeTab === tab.key
                    ? "bg-[#e8c7b0] text-[#120c12]"
                    : "text-slate-400 hover:text-white hover:bg-white/[0.06]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab: Basic */}
          {activeTab === "basic" && (
            <div className="grid gap-4 md:grid-cols-2">
              <AdminField label="Tên dịch vụ">
                <input value={form.name} onChange={(e) => updateField("name", e.target.value)} className="premium-input" placeholder="VD: Makeup Cô Dâu Cao Cấp" />
              </AdminField>
              <AdminField label="Slug (URL)">
                <input value={form.slug} onChange={(e) => updateField("slug", e.target.value)} className="premium-input" placeholder="makeup-co-dau-cao-cap" />
              </AdminField>
              <AdminField label="Giá (VNĐ)">
                <input type="number" value={form.basePrice} onChange={(e) => updateField("basePrice", Number(e.target.value))} className="premium-input" />
              </AdminField>
              <AdminField label="Thời gian (phút)">
                <input type="number" value={form.durationMin} onChange={(e) => updateField("durationMin", Number(e.target.value))} className="premium-input" />
              </AdminField>
              <AdminField label="Danh mục">
                <select value={form.category} onChange={(e) => updateField("category", e.target.value)} className="premium-input">
                  {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </AdminField>
              <AdminField label="Trạng thái">
                <select value={form.status} onChange={(e) => updateField("status", e.target.value)} className="premium-input">
                  <option value="ACTIVE">Hoạt động</option>
                  <option value="INACTIVE">Tạm ẩn</option>
                </select>
              </AdminField>
              <AdminField label="Thứ tự hiển thị">
                <input type="number" value={form.sortOrder} onChange={(e) => updateField("sortOrder", Number(e.target.value))} className="premium-input" />
              </AdminField>
              <AdminField label="Mô tả ngắn" full>
                <textarea value={form.shortDescription} onChange={(e) => updateField("shortDescription", e.target.value)} rows={3} className="premium-input min-h-28 resize-none" placeholder="Mô tả ngắn gọn hiển thị trong card dịch vụ" />
              </AdminField>
              <label className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.035] p-4 md:col-span-2">
                <input type="checkbox" checked={form.featured} onChange={(e) => updateField("featured", e.target.checked)} className="h-4 w-4 accent-[#e8c7b0]" />
                <span className="text-sm font-semibold text-slate-200">Dịch vụ nổi bật trên trang chủ</span>
              </label>
            </div>
          )}

          {/* Tab: Content & Images */}
          {activeTab === "content" && (
            <div className="space-y-5">
              <ImageUploadField
                label="Ảnh đại diện (thumbnail)"
                value={form.thumbnail}
                onChange={(value) => updateField("thumbnail", value)}
                helper="Ảnh hiển thị trong card dịch vụ, khuyến nghị 800×600px."
              />
              <MultiImageUploadField
                label="Gallery ảnh"
                value={form.gallery}
                onChange={(value) => updateField("gallery", value)}
                helper="Bộ ảnh chi tiết hiển thị trong trang dịch vụ. Có thể thêm nhiều ảnh."
              />
              <AdminField label="Mô tả chi tiết (nội dung đầy đủ)" full>
                <textarea
                  value={form.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  rows={8}
                  className="premium-input min-h-48 resize-none font-mono text-sm"
                  placeholder="Mô tả chi tiết về dịch vụ, có thể dùng markdown. Nội dung hiển thị trên trang chi tiết dịch vụ..."
                />
              </AdminField>
              <AdminField label="Lợi ích (mỗi item cách nhau bằng dấu phẩy)" full>
                <textarea
                  value={form.benefits}
                  onChange={(e) => updateField("benefits", e.target.value)}
                  rows={3}
                  className="premium-input min-h-24 resize-none"
                  placeholder="Trang điểm bền 12h, Phong cách Hàn Quốc, Tư vấn trang phục miễn phí"
                />
              </AdminField>
              <div className="grid gap-4 md:grid-cols-2">
                <AdminField label="Phù hợp với dịp">
                  <input
                    value={form.occasions}
                    onChange={(e) => updateField("occasions", e.target.value)}
                    className="premium-input"
                    placeholder="Đám cưới, Lễ đính hôn, Pre-wedding"
                  />
                </AdminField>
                <AdminField label="Gợi ý phong cách">
                  <input
                    value={form.styleSuggestions}
                    onChange={(e) => updateField("styleSuggestions", e.target.value)}
                    className="premium-input"
                    placeholder="Tone Hàn, Tone Tây, Tự nhiên"
                  />
                </AdminField>
              </div>
            </div>
          )}

          {/* Tab: SEO & Extended */}
          {activeTab === "seo" && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-5">
                <h4 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-400">Tối ưu SEO</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <AdminField label="SEO Title" full>
                    <input
                      value={form.seoTitle}
                      onChange={(e) => updateField("seoTitle", e.target.value)}
                      className="premium-input"
                      placeholder="Makeup Cô Dâu Cao Cấp tại Luna Studio"
                    />
                    <p className="mt-1.5 text-xs text-slate-500">{form.seoTitle.length}/60 ký tự</p>
                  </AdminField>
                  <AdminField label="SEO Description" full>
                    <textarea
                      value={form.seoDescription}
                      onChange={(e) => updateField("seoDescription", e.target.value)}
                      rows={3}
                      className="premium-input min-h-24 resize-none"
                      placeholder="Dịch vụ trang điểm cô dâu chuyên nghiệp tại Luna Makeup Studio..."
                    />
                    <p className="mt-1.5 text-xs text-slate-500">{form.seoDescription.length}/160 ký tự</p>
                  </AdminField>
                </div>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-5">
                <h4 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-400">FAQ (câu hỏi thường gặp)</h4>
                <textarea
                  value={form.faq}
                  onChange={(e) => updateField("faq", e.target.value)}
                  rows={6}
                  className="premium-input min-h-36 resize-none font-mono text-sm"
                  placeholder={'[{"question": "Bao lâu thì xong?", "answer": "Khoảng 60 phút"}]'}
                />
                <p className="mt-1.5 text-xs text-slate-500">Nhập dạng JSON array gồm các object {`{question, answer}`}.</p>
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={handleSave} disabled={saving} className="btn-primary disabled:opacity-60">
              {saving ? "Đang lưu..." : "Lưu dịch vụ"}
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
        ) : services.length === 0 ? (
          <div className="p-5">
            <EmptyState title="Chưa có dịch vụ" description="Thêm dịch vụ đầu tiên để hiển thị trên website." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  {["Ảnh", "Tên", "Danh mục", "Giá", "Thời gian", "Trạng thái", "Nổi bật", "Thao tác"].map((heading) => (
                    <th key={heading}>{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {services.map((service) => (
                  <tr key={service.id}>
                    <td>
                      <div className="h-10 w-10 overflow-hidden rounded-xl border border-white/8 bg-[#120d11]">
                        {service.thumbnail ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={service.thumbnail} alt={service.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs text-slate-600">—</div>
                        )}
                      </div>
                    </td>
                    <td className="font-semibold text-white">{service.name}</td>
                    <td>{service.category}</td>
                    <td className="font-semibold text-[#e8c7b0]">{formatPrice(service.basePrice)}</td>
                    <td>{formatDuration(service.durationMin)}</td>
                    <td>
                      <StatusBadge status={service.status} label={service.status === "ACTIVE" ? "Hoạt động" : "Tạm ẩn"} />
                    </td>
                    <td>{service.featured && <Check className="h-4 w-4 text-[#e8c7b0]" />}</td>
                    <td>
                      <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => openEdit(service)} className="rounded-xl p-2 text-[#e8c7b0] hover:bg-white/8" aria-label="Sửa">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button type="button" onClick={() => handleDelete(service.id)} className="rounded-xl p-2 text-rose-300 hover:bg-white/8" aria-label="Xóa">
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
