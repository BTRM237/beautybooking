"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";

type FormState = {
  name: string;
  phone: string;
  service: string;
  message: string;
};

export default function ContactForm() {
  const [form, setForm] = useState<FormState>({ name: "", phone: "", service: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (data.success) {
        setSuccess(true);
        setForm({ name: "", phone: "", service: "", message: "" });
      } else {
        setError(data.error?.message || "Không gửi được tin nhắn, vui lòng thử lại.");
      }
    } catch {
      setError("Không gửi được tin nhắn, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="rounded-3xl border border-[#f3a38f]/18 bg-[#120d11] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.34)] md:p-7">
      <p className="text-xs font-bold uppercase text-[#bd7b6c]">Gửi yêu cầu</p>
      <h2 className="mt-2 font-heading text-3xl font-medium leading-tight text-[#f7e8e2] md:mt-3 md:text-4xl">Tư vấn lịch makeup</h2>
      <p className="mt-3 text-sm leading-7 text-[#cdbab4]">
        Để lại thông tin, Luna sẽ liên hệ lại để tư vấn dịch vụ, tone makeup và khung giờ phù hợp.
      </p>

      <div className="mt-6 grid gap-4">
        <div>
          <label className="mb-2 block text-sm font-bold text-[#ffc0ad]">Họ và tên</label>
          <input
            required
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            className="premium-input border-[#f3a38f]/18 bg-[#070509]/70"
            placeholder="Nguyễn Minh Anh"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-bold text-[#ffc0ad]">Số điện thoại</label>
          <input
            required
            value={form.phone}
            onChange={(event) => setForm({ ...form, phone: event.target.value })}
            className="premium-input border-[#f3a38f]/18 bg-[#070509]/70"
            placeholder="0393 231 806"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-bold text-[#ffc0ad]">Dịch vụ cần tư vấn</label>
          <input
            value={form.service}
            onChange={(event) => setForm({ ...form, service: event.target.value })}
            className="premium-input border-[#f3a38f]/18 bg-[#070509]/70"
            placeholder="Makeup cô dâu, dự tiệc, kỷ yếu..."
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-bold text-[#ffc0ad]">Nội dung</label>
          <textarea
            value={form.message}
            onChange={(event) => setForm({ ...form, message: event.target.value })}
            rows={4}
            className="premium-input min-h-28 resize-none border-[#f3a38f]/18 bg-[#070509]/70"
            placeholder="Ví dụ: em cần makeup tại nhà vào sáng thứ Bảy..."
          />
        </div>
      </div>

      {error && <p className="mt-4 rounded-2xl border border-rose-300/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">{error}</p>}
      {success && (
        <p className="mt-4 flex items-center gap-2 rounded-2xl border border-emerald-300/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
          <CheckCircle2 className="h-4 w-4" />
          Tin nhắn đã được gửi. Luna sẽ liên hệ lại sớm.
        </p>
      )}

      <button type="submit" disabled={loading} className="btn-primary mt-6 w-full text-xs uppercase disabled:opacity-60">
        {loading ? "Đang gửi..." : "Gửi tin nhắn"}
        <ArrowRight className="h-4 w-4" />
      </button>
    </form>
  );
}
