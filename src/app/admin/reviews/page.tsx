"use client";

import { useState, useEffect } from "react";
import { Check, Star, Trash2, X } from "lucide-react";
import { EmptyState, StatusBadge } from "@/components/ui/luxury";

type Review = {
  id: string;
  name: string;
  rating: number;
  comment: string;
  service: string | null;
  avatar: string | null;
  isApproved: boolean;
  createdAt: string;
};

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");

  const fetchData = () => {
    setLoading(true);
    fetch("/api/admin/reviews")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setReviews(d.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    void Promise.resolve().then(fetchData);
  }, []);

  const toggleApproval = async (id: string, isApproved: boolean) => {
    const res = await fetch(`/api/admin/reviews/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isApproved: !isApproved }),
    });
    const data = await res.json();
    if (data.success) {
      setNotice(!isApproved ? "Đã duyệt đánh giá." : "Đã ẩn đánh giá.");
      fetchData();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xoá đánh giá này?")) return;
    const res = await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) {
      setNotice("Đã xoá đánh giá.");
      fetchData();
    }
  };

  const approved = reviews.filter((r) => r.isApproved);
  const pending = reviews.filter((r) => !r.isApproved);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Quản lý đánh giá</h2>
          <p className="mt-1 text-sm text-slate-500">Duyệt, ẩn hoặc xoá đánh giá từ khách hàng.</p>
        </div>
        <div className="flex gap-3">
          <div className="rounded-2xl border border-white/8 bg-white/[0.035] px-4 py-2 text-center">
            <p className="text-lg font-bold text-white">{approved.length}</p>
            <p className="text-xs text-slate-500">Đã duyệt</p>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/[0.035] px-4 py-2 text-center">
            <p className="text-lg font-bold text-amber-200">{pending.length}</p>
            <p className="text-xs text-slate-500">Chờ duyệt</p>
          </div>
        </div>
      </div>

      {notice && (
        <div className="rounded-2xl border border-emerald-300/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
          {notice}
        </div>
      )}

      {pending.length > 0 && (
        <section className="admin-card overflow-hidden">
          <div className="border-b border-white/8 px-5 py-4">
            <h3 className="text-sm font-bold uppercase tracking-wide text-amber-200">Chờ duyệt ({pending.length})</h3>
          </div>
          <div className="divide-y divide-white/8">
            {pending.map((review) => (
              <ReviewRow key={review.id} review={review} onToggle={toggleApproval} onDelete={handleDelete} />
            ))}
          </div>
        </section>
      )}

      <section className="admin-card overflow-hidden">
        <div className="border-b border-white/8 px-5 py-4">
          <h3 className="text-sm font-bold uppercase tracking-wide text-slate-400">Đã duyệt ({approved.length})</h3>
        </div>
        {loading ? (
          <div className="p-10 text-center text-sm text-slate-500">Đang tải...</div>
        ) : reviews.length === 0 ? (
          <div className="p-5">
            <EmptyState title="Chưa có đánh giá" description="Đánh giá sẽ xuất hiện khi khách hàng gửi feedback." />
          </div>
        ) : approved.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">Chưa có đánh giá nào được duyệt.</div>
        ) : (
          <div className="divide-y divide-white/8">
            {approved.map((review) => (
              <ReviewRow key={review.id} review={review} onToggle={toggleApproval} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function ReviewRow({
  review,
  onToggle,
  onDelete,
}: {
  review: Review;
  onToggle: (id: string, isApproved: boolean) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <article className="flex gap-4 p-4 md:p-5">
      {/* Avatar */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e8c7b0]/12 text-sm font-bold text-[#e8c7b0]">
        {review.name.charAt(0)}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-white">{review.name}</p>
              <StatusBadge
                status={review.isApproved ? "ACTIVE" : "PENDING"}
                label={review.isApproved ? "Đã duyệt" : "Chờ duyệt"}
              />
            </div>
            <div className="mt-1 flex items-center gap-2">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-3 w-3"
                    fill={i < review.rating ? "#e8c7b0" : "none"}
                    color={i < review.rating ? "#e8c7b0" : "#3a2833"}
                  />
                ))}
              </div>
              {review.service && <span className="text-xs text-slate-500">{review.service}</span>}
              <span className="text-xs text-slate-500">
                · {new Date(review.createdAt).toLocaleDateString("vi-VN")}
              </span>
            </div>
          </div>
          <div className="flex shrink-0 gap-1.5">
            <button
              type="button"
              onClick={() => onToggle(review.id, review.isApproved)}
              className={`rounded-xl p-2 hover:bg-white/8 ${review.isApproved ? "text-amber-200" : "text-emerald-300"}`}
              aria-label={review.isApproved ? "Ẩn đánh giá" : "Duyệt đánh giá"}
              title={review.isApproved ? "Bỏ duyệt" : "Duyệt đánh giá"}
            >
              {review.isApproved ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={() => onDelete(review.id)}
              className="rounded-xl p-2 text-rose-300 hover:bg-white/8"
              aria-label="Xoá đánh giá"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
        <p className="mt-2 text-sm leading-6 text-slate-300">&ldquo;{review.comment}&rdquo;</p>
      </div>
    </article>
  );
}
