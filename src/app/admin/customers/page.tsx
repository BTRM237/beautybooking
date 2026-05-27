import prisma from "@/lib/prisma";
import { EmptyState } from "@/components/ui/luxury";
import type { Customer } from "@prisma/client";

type CustomerWithCount = Customer & { _count: { bookings: number } };

export default async function AdminCustomersPage() {
  const customers = (await prisma.customer.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { bookings: true } } },
  })) as CustomerWithCount[];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Quản lý khách hàng</h2>
          <p className="mt-1 text-sm text-slate-500">Danh sách khách hàng đã đặt lịch qua website.</p>
        </div>
        <div className="admin-card px-4 py-2 text-center">
          <p className="text-lg font-bold text-[#e8c7b0]">{customers.length}</p>
          <p className="text-xs text-slate-500">Tổng khách</p>
        </div>
      </div>

      <section className="admin-card overflow-hidden">
        {customers.length === 0 ? (
          <div className="p-5">
            <EmptyState title="Chưa có khách hàng" description="Khách hàng sẽ được tạo tự động khi có người đặt lịch." />
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="admin-table">
                <thead>
                  <tr>
                    {["Tên", "SĐT", "Email", "Địa chỉ", "Số lần đặt", "Ngày tạo"].map((h) => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e8c7b0]/12 text-xs font-bold text-[#e8c7b0]">
                            {c.name.charAt(0)}
                          </div>
                          <span className="font-semibold text-white">{c.name}</span>
                        </div>
                      </td>
                      <td className="text-[#e8c7b0]">{c.phone}</td>
                      <td>{c.email || "—"}</td>
                      <td className="max-w-[200px] truncate">{c.address || "—"}</td>
                      <td>
                        <span className="rounded-full bg-[#e8c7b0]/10 px-2.5 py-1 text-xs font-bold text-[#e8c7b0]">
                          {c._count.bookings} lần
                        </span>
                      </td>
                      <td>{new Date(c.createdAt).toLocaleDateString("vi-VN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="grid gap-3 p-4 md:hidden">
              {customers.map((c) => (
                <article key={c.id} className="rounded-2xl border border-white/8 bg-white/[0.025] p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e8c7b0]/12 text-sm font-bold text-[#e8c7b0]">
                      {c.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-white">{c.name}</p>
                      <p className="text-sm text-[#e8c7b0]">{c.phone}</p>
                    </div>
                    <span className="ml-auto rounded-full bg-[#e8c7b0]/10 px-2.5 py-1 text-xs font-bold text-[#e8c7b0]">
                      {c._count.bookings}×
                    </span>
                  </div>
                  {(c.email || c.address) && (
                    <div className="mt-3 grid gap-1 text-xs text-slate-400">
                      {c.email && <p>Email: {c.email}</p>}
                      {c.address && <p>Địa chỉ: {c.address}</p>}
                    </div>
                  )}
                </article>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
