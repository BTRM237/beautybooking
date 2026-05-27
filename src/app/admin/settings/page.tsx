"use client";

import { useState, useEffect } from "react";
import { Building2, Check, ClipboardList, Link2, MapPin, Save, Search, type LucideIcon } from "lucide-react";

type SettingSection = {
  title: string;
  icon: LucideIcon;
  fields: Array<{ key: string; label: string; type: "text" | "textarea" }>;
};

const settingSections: SettingSection[] = [
  {
    title: "Thông tin studio",
    icon: Building2,
    fields: [
      { key: "studio_name", label: "Tên studio", type: "text" },
      { key: "phone", label: "Số điện thoại", type: "text" },
      { key: "address", label: "Địa chỉ", type: "text" },
      { key: "area_served", label: "Khu vực phục vụ", type: "text" },
    ],
  },
  {
    title: "Mạng xã hội & Liên hệ",
    icon: Link2,
    fields: [
      { key: "zalo_phone", label: "Zalo phone", type: "text" },
      { key: "zalo_url", label: "Zalo URL", type: "text" },
      { key: "messenger_url", label: "Messenger URL", type: "text" },
      { key: "facebook_url", label: "Facebook URL", type: "text" },
      { key: "tiktok_url", label: "TikTok URL", type: "text" },
      { key: "website_url", label: "Website URL", type: "text" },
    ],
  },
  {
    title: "Google Maps",
    icon: MapPin,
    fields: [
      { key: "google_map_embed_url", label: "Google Map Embed URL", type: "textarea" },
      { key: "google_map_direction_url", label: "Google Map Direction URL", type: "text" },
    ],
  },
  {
    title: "Chính sách",
    icon: ClipboardList,
    fields: [
      { key: "booking_policy", label: "Chính sách đặt lịch", type: "textarea" },
      { key: "cancellation_policy", label: "Chính sách hủy", type: "textarea" },
    ],
  },
  {
    title: "SEO mặc định",
    icon: Search,
    fields: [
      { key: "default_seo_title", label: "SEO Title mặc định", type: "text" },
      { key: "default_seo_description", label: "SEO Description mặc định", type: "textarea" },
    ],
  },
];

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setSettings(d.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    if ((await res.json()).success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setSaving(false);
  };

  if (loading) {
    return <div className="p-10 text-center text-sm text-slate-500">Đang tải...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Cài đặt studio</h2>
          <p className="mt-1 text-sm text-slate-500">Thông tin liên hệ, mạng xã hội, chính sách và SEO.</p>
        </div>
        <button type="button" onClick={handleSave} disabled={saving} className="btn-primary disabled:opacity-60">
          {saving ? (
            <>Đang lưu...</>
          ) : saved ? (
            <>
              <Check className="h-4 w-4" />
              Đã lưu
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Lưu cài đặt
            </>
          )}
        </button>
      </div>

      {saved && (
        <div className="rounded-2xl border border-emerald-300/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
          Cài đặt đã được cập nhật thành công.
        </div>
      )}

      <div className="space-y-5">
        {settingSections.map((section) => (
          <section key={section.title} className="admin-card p-5 md:p-6">
            <h3 className="mb-5 flex items-center gap-2.5 text-base font-bold text-white">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/8 bg-white/[0.04] text-[#e8c7b0]">
                <section.icon className="h-4.5 w-4.5" />
              </span>
              {section.title}
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              {section.fields.map((f) => (
                <div key={f.key} className={f.type === "textarea" ? "md:col-span-2" : ""}>
                  <label className="mb-2 block text-sm font-semibold text-slate-300">{f.label}</label>
                  {f.type === "textarea" ? (
                    <textarea
                      value={settings[f.key] || ""}
                      onChange={(e) => setSettings({ ...settings, [f.key]: e.target.value })}
                      rows={3}
                      className="premium-input min-h-24 resize-none"
                    />
                  ) : (
                    <input
                      value={settings[f.key] || ""}
                      onChange={(e) => setSettings({ ...settings, [f.key]: e.target.value })}
                      className="premium-input"
                    />
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
