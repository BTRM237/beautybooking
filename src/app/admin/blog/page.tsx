"use client";

import { useState, useEffect, type ReactNode } from "react";
import { Edit, FileText, Plus, Trash2, X } from "lucide-react";
import { EmptyState, StatusBadge } from "@/components/ui/luxury";
import { ImageUploadField } from "@/components/admin/ImageUploadField";

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  thumbnail: string | null;
  category: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  status: string;
  publishedAt: string | null;
};

const categories = ["Mẹo làm đẹp", "Xu hướng", "Review sản phẩm", "Chia sẻ kinh nghiệm", "Tin tức studio", "Hướng dẫn"];

const initialForm = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  thumbnail: "",
  category: "",
  status: "DRAFT",
  seoTitle: "",
  seoDescription: "",
};

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

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"content" | "seo">("content");

  const fetchData = () => {
    setLoading(true);
    fetch("/api/admin/blog")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setPosts(d.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    void Promise.resolve().then(fetchData);
  }, []);

  const openNew = () => {
    setEditing(null);
    setForm(initialForm);
    setActiveTab("content");
    setError("");
    setShowForm(true);
  };

  const openEdit = (post: BlogPost) => {
    setEditing(post);
    setForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || "",
      content: post.content,
      thumbnail: post.thumbnail || "",
      category: post.category || "",
      status: post.status,
      seoTitle: post.seoTitle || "",
      seoDescription: post.seoDescription || "",
    });
    setActiveTab("content");
    setError("");
    setShowForm(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    const method = editing ? "PATCH" : "POST";
    const url = editing ? `/api/admin/blog/${editing.id}` : "/api/admin/blog";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (data.success) {
      setShowForm(false);
      setEditing(null);
      setNotice(editing ? "Đã cập nhật bài viết." : "Đã thêm bài viết mới.");
      fetchData();
    } else {
      setError(data.error?.message || "Không thể lưu bài viết.");
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa bài viết này?")) return;
    const res = await fetch(`/api/admin/blog/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) {
      setNotice("Đã xóa bài viết.");
      fetchData();
    } else {
      setError(data.error?.message || "Không thể xoá bài viết.");
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

  const tabs = [
    { key: "content" as const, label: "Nội dung" },
    { key: "seo" as const, label: "SEO" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Quản lý Blog</h2>
          <p className="mt-1 text-sm text-slate-500">Viết bài, chia sẻ mẹo làm đẹp, xu hướng makeup.</p>
        </div>
        <button type="button" onClick={openNew} className="btn-primary">
          <Plus className="h-4 w-4" />
          Bài viết mới
        </button>
      </div>

      {notice && <div className="rounded-2xl border border-emerald-300/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">{notice}</div>}
      {error && <div className="rounded-2xl border border-rose-300/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">{error}</div>}

      {showForm && (
        <section className="admin-card p-5 md:p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white">{editing ? "Sửa bài viết" : "Thêm bài viết"}</h3>
              <p className="text-sm text-slate-500">Viết nội dung, thêm ảnh thumbnail và tối ưu SEO.</p>
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

          {activeTab === "content" && (
            <div className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <AdminField label="Tiêu đề">
                  <input value={form.title} onChange={(e) => updateField("title", e.target.value)} className="premium-input" placeholder="VD: 5 Xu hướng makeup cô dâu 2026" />
                </AdminField>
                <AdminField label="Slug (URL)">
                  <input value={form.slug} onChange={(e) => updateField("slug", e.target.value)} className="premium-input" placeholder="5-xu-huong-makeup-co-dau-2026" />
                </AdminField>
                <AdminField label="Danh mục">
                  <select value={form.category} onChange={(e) => updateField("category", e.target.value)} className="premium-input">
                    <option value="">— Chọn danh mục —</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </AdminField>
                <AdminField label="Trạng thái">
                  <select value={form.status} onChange={(e) => updateField("status", e.target.value)} className="premium-input">
                    <option value="DRAFT">Bản nháp</option>
                    <option value="PUBLISHED">Đã xuất bản</option>
                  </select>
                </AdminField>
              </div>

              <ImageUploadField
                label="Ảnh thumbnail"
                value={form.thumbnail}
                onChange={(value) => updateField("thumbnail", value)}
                helper="Ảnh hiển thị trong danh sách blog, khuyến nghị 1200×630px."
              />

              <AdminField label="Tóm tắt" full>
                <textarea value={form.excerpt} onChange={(e) => updateField("excerpt", e.target.value)} rows={3} className="premium-input min-h-24 resize-none" placeholder="Tóm tắt ngắn gọn hiển thị trong danh sách blog..." />
              </AdminField>

              <AdminField label="Nội dung bài viết" full>
                <textarea
                  value={form.content}
                  onChange={(e) => updateField("content", e.target.value)}
                  rows={14}
                  className="premium-input min-h-64 resize-none font-mono text-sm"
                  placeholder="Nội dung chi tiết bài viết (hỗ trợ markdown)..."
                />
              </AdminField>
            </div>
          )}

          {activeTab === "seo" && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-5">
                <h4 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-400">Tối ưu SEO</h4>
                <AdminField label="SEO Title" full>
                  <input
                    value={form.seoTitle}
                    onChange={(e) => updateField("seoTitle", e.target.value)}
                    className="premium-input"
                    placeholder="Tiêu đề hiển thị trên Google"
                  />
                  <p className="mt-1.5 text-xs text-slate-500">{form.seoTitle.length}/60 ký tự</p>
                </AdminField>
                <AdminField label="SEO Description" full>
                  <textarea
                    value={form.seoDescription}
                    onChange={(e) => updateField("seoDescription", e.target.value)}
                    rows={3}
                    className="premium-input min-h-24 resize-none"
                    placeholder="Mô tả hiển thị dưới tiêu đề trên Google"
                  />
                  <p className="mt-1.5 text-xs text-slate-500">{form.seoDescription.length}/160 ký tự</p>
                </AdminField>
              </div>

              {/* Preview */}
              <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-5">
                <h4 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-400">Xem trước trên Google</h4>
                <div className="rounded-xl bg-white p-4">
                  <p className="text-lg leading-tight text-blue-700 hover:underline">
                    {form.seoTitle || form.title || "Tiêu đề bài viết"}
                  </p>
                  <p className="mt-1 text-sm text-green-700">lunamakeup.vn/blog/{form.slug || "url-bai-viet"}</p>
                  <p className="mt-1 text-sm text-gray-600">
                    {form.seoDescription || form.excerpt || "Mô tả bài viết sẽ hiển thị ở đây..."}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={handleSave} disabled={saving} className="btn-primary disabled:opacity-60">
              {saving ? "Đang lưu..." : "Lưu bài viết"}
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
        ) : posts.length === 0 ? (
          <div className="p-5">
            <EmptyState title="Chưa có bài viết" description="Viết bài đầu tiên để blog ngoài website có nội dung." />
          </div>
        ) : (
          <div className="divide-y divide-white/8">
            {posts.map((post) => (
              <article key={post.id} className="flex gap-4 p-4 transition hover:bg-white/[0.025] md:p-5">
                {/* Thumbnail */}
                <div className="hidden h-20 w-28 shrink-0 overflow-hidden rounded-xl border border-white/8 bg-[#120d11] sm:block">
                  {post.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={post.thumbnail} alt={post.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <FileText className="h-5 w-5 text-slate-600" />
                    </div>
                  )}
                </div>
                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-bold text-white">{post.title}</h3>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2">
                        <StatusBadge status={post.status === "PUBLISHED" ? "ACTIVE" : "PENDING"} label={post.status === "PUBLISHED" ? "Đã xuất bản" : "Bản nháp"} />
                        {post.category && <span className="text-xs text-slate-500">{post.category}</span>}
                        {post.publishedAt && (
                          <span className="text-xs text-slate-500">
                            · {new Date(post.publishedAt).toLocaleDateString("vi-VN")}
                          </span>
                        )}
                      </div>
                      {post.excerpt && <p className="mt-2 line-clamp-1 text-xs text-slate-400">{post.excerpt}</p>}
                    </div>
                    <div className="flex shrink-0 gap-1.5">
                      <button type="button" onClick={() => openEdit(post)} className="rounded-xl p-2 text-[#e8c7b0] hover:bg-white/8" aria-label="Sửa bài viết">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button type="button" onClick={() => handleDelete(post.id)} className="rounded-xl p-2 text-rose-300 hover:bg-white/8" aria-label="Xoá bài viết">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
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
