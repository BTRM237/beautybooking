"use client";

import { useEffect, useState } from "react";
import { EmptyState, StatusBadge } from "@/components/ui/luxury";
import { MessageSquare, Phone, X } from "lucide-react";

type Lead = {
  id: string;
  customerName: string | null;
  phone: string | null;
  serviceInterest: string | null;
  status: string;
  summary: string | null;
  createdAt: string;
  conversation: { messages: { role: string; content: string; createdAt: string }[] };
};

const statusLabels: Record<string, string> = {
  NEW: "Mới",
  CONTACTED: "Đã liên hệ",
  WON: "Thành công",
  LOST: "Không thành",
};

export default function AdminAiLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingConvo, setViewingConvo] = useState<Lead | null>(null);

  const fetchData = () => {
    setLoading(true);
    fetch("/api/admin/ai-leads")
      .then((response) => response.json())
      .then((data) => {
        if (data.success) setLeads(data.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    void Promise.resolve().then(fetchData);
  }, []);

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/admin/ai-leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchData();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">AI Leads</h2>
        <p className="mt-1 text-sm text-slate-500">Theo dõi khách hàng quan tâm từ panel tư vấn AI.</p>
      </div>

      {viewingConvo && (
        <section className="admin-card p-5">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white">Cuộc hội thoại</h3>
              <p className="text-sm text-slate-500">{viewingConvo.customerName || "Khách chưa để tên"}</p>
            </div>
            <button type="button" onClick={() => setViewingConvo(null)} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/8 text-slate-300" aria-label="Đóng">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="max-h-96 space-y-3 overflow-y-auto rounded-3xl border border-white/8 bg-black/10 p-4">
            {viewingConvo.conversation.messages.map((message, index) => (
              <div key={index} className={`flex ${message.role === "USER" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[82%] rounded-3xl px-4 py-3 text-sm leading-6 ${message.role === "USER" ? "bg-[#e8c7b0] text-[#120c12]" : "bg-white/8 text-slate-100"}`}>
                  {message.content}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="admin-card overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-sm text-slate-500">Đang tải...</div>
        ) : leads.length === 0 ? (
          <div className="p-5">
            <EmptyState title="Chưa có lead AI" description="Lead từ AI Chat sẽ xuất hiện tại đây khi khách để lại nhu cầu." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  {["Tên", "SĐT", "Quan tâm", "Trạng thái", "Ngày", "Hành động"].map((heading) => (
                    <th key={heading}>{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id}>
                    <td className="font-semibold text-white">{lead.customerName || "Chưa có tên"}</td>
                    <td>{lead.phone || "Chưa có SĐT"}</td>
                    <td>{lead.serviceInterest || "Chưa rõ"}</td>
                    <td>
                      <select
                        value={lead.status}
                        onChange={(event) => updateStatus(lead.id, event.target.value)}
                        className="rounded-full border border-white/10 bg-[#15131a] px-3 py-1.5 text-xs font-bold text-slate-100 outline-none"
                      >
                        {Object.entries(statusLabels).map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                    </td>
                    <td>{new Date(lead.createdAt).toLocaleDateString("vi-VN")}</td>
                    <td>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => setViewingConvo(lead)} className="rounded-xl p-2 text-[#e8c7b0] hover:bg-white/8" aria-label="Xem hội thoại">
                          <MessageSquare className="h-4 w-4" />
                        </button>
                        {lead.phone && (
                          <a href={`tel:${lead.phone}`} className="rounded-xl p-2 text-emerald-300 hover:bg-white/8" aria-label="Gọi điện">
                            <Phone className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="flex flex-wrap gap-2">
        {Object.entries(statusLabels).map(([status, label]) => (
          <StatusBadge key={status} status={status} label={label} />
        ))}
      </div>
    </div>
  );
}
