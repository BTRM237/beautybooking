"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Gem } from "lucide-react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success) {
        router.push("/admin/dashboard");
      } else {
        setError(data.error?.message || "Email hoặc mật khẩu không đúng");
      }
    } catch {
      setError("Có lỗi xảy ra, vui lòng thử lại");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "#120C12" }}>
      <div className="glass-card p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Gem className="w-6 h-6" style={{ color: "#E8C7B0" }} />
            <span className="text-xl font-bold" style={{ fontFamily: "var(--font-heading)", color: "#E8C7B0" }}>
              LUNA
            </span>
          </div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-heading)", color: "#F6EEE8" }}>
            Đăng nhập Admin
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "#E8C7B0" }}>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="w-full bg-[#1E1520] border border-[#3A2833] rounded-xl px-4 py-3 text-sm text-white placeholder:text-[#B8A8AE] focus:outline-none focus:border-[#E8C7B0]"
              placeholder="admin@glamora.vn" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "#E8C7B0" }}>Mật khẩu</label>
            <div className="relative">
              <input type={showPass ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required
                className="w-full bg-[#1E1520] border border-[#3A2833] rounded-xl px-4 py-3 text-sm text-white placeholder:text-[#B8A8AE] focus:outline-none focus:border-[#E8C7B0] pr-10"
                placeholder="••••••••" />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "#B8A8AE" }}>
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-center" style={{ color: "#f87171" }}>{error}</p>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full py-3 disabled:opacity-50">
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>
      </div>
    </div>
  );
}
