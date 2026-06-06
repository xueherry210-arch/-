"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDate, formatMoney, statusColor, ORDER_STATUS_OPTIONS } from "@/lib/utils";
import { Badge } from "@/components/Badge";
import { updateOrderStatus } from "@/actions";
import { Search, Edit, Plus } from "lucide-react";
import Link from "next/link";
import { OrderDialog } from "@/components/OrderDialog";

interface Order {
  id: number;
  orderNo: string;
  customerId: number;
  productName: string;
  amount: number;
  orderDate: string | Date;
  deliveryDate: string | Date | null;
  status: string;
  notes: string | null;
  customer: { id: number; name: string; phone: string };
  salesperson: { id: number; name: string };
}

interface Salesperson {
  id: number;
  name: string;
}

export function OrderListClient({
  orders,
  salespeople,
  statusFilter: initialStatus,
  search: initialSearch,
}: {
  orders: Order[];
  salespeople: Salesperson[];
  statusFilter: string;
  search: string;
}) {
  const router = useRouter();
  const [search, setSearch] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [dialogOpen, setDialogOpen] = useState(false);

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);
    router.push(`/orders?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("");
    router.push("/orders");
  };

  async function handleStatusChange(orderId: number, status: string) {
    await updateOrderStatus(orderId, status);
    router.refresh();
  }

  return (
    <>
      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 lg:p-5">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyFilters()}
              placeholder="搜索订单号、产品、客户..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2.5 text-base bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">全部状态</option>
            {ORDER_STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          <div className="flex gap-2">
            <button onClick={applyFilters} className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg text-base font-medium hover:bg-indigo-700 transition-colors">筛选</button>
            <button onClick={clearFilters} className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-base font-medium hover:bg-gray-200 transition-colors">重置</button>
            <button onClick={() => setDialogOpen(true)} className="px-4 py-2.5 bg-green-600 text-white rounded-lg text-base font-medium hover:bg-green-700 transition-colors flex items-center gap-2">
              <Plus className="w-5 h-5" /> 新增
            </button>
          </div>
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden lg:block bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-base">
          <thead>
            <tr className="border-b bg-gray-50 text-left">
              <th className="px-5 py-3 font-semibold text-gray-600">订单号</th>
              <th className="px-5 py-3 font-semibold text-gray-600">客户</th>
              <th className="px-5 py-3 font-semibold text-gray-600">产品</th>
              <th className="px-5 py-3 font-semibold text-gray-600">金额</th>
              <th className="px-5 py-3 font-semibold text-gray-600">销售</th>
              <th className="px-5 py-3 font-semibold text-gray-600">订单日期</th>
              <th className="px-5 py-3 font-semibold text-gray-600">交货日期</th>
              <th className="px-5 py-3 font-semibold text-gray-600">状态</th>
              <th className="px-5 py-3 font-semibold text-gray-600">操作</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="px-5 py-3 font-mono text-sm text-gray-500">{o.orderNo}</td>
                <td className="px-5 py-3">
                  <Link href={`/customers/${o.customer.id}`} className="font-medium text-indigo-700 hover:underline">{o.customer.name}</Link>
                </td>
                <td className="px-5 py-3 text-gray-600">{o.productName}</td>
                <td className="px-5 py-3 font-bold text-green-600">{formatMoney(o.amount)}</td>
                <td className="px-5 py-3 text-gray-600">{o.salesperson.name}</td>
                <td className="px-5 py-3 text-gray-500">{formatDate(o.orderDate)}</td>
                <td className="px-5 py-3 text-gray-500">{o.deliveryDate ? formatDate(o.deliveryDate) : "-"}</td>
                <td className="px-5 py-3">
                  <select
                    value={o.status}
                    onChange={(e) => handleStatusChange(o.id, e.target.value)}
                    className={`border-0 rounded-full px-3 py-1 text-sm font-medium ${statusColor(o.status)} cursor-pointer`}
                  >
                    {ORDER_STATUS_OPTIONS.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </td>
                <td className="px-5 py-3">
                  <span className="text-sm text-gray-400">{o.notes || "-"}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="lg:hidden space-y-3">
        {orders.map((o) => (
          <div key={o.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-sm text-gray-500">{o.orderNo}</span>
              <select
                value={o.status}
                onChange={(e) => handleStatusChange(o.id, e.target.value)}
                className={`border-0 rounded-full px-3 py-1 text-sm font-medium ${statusColor(o.status)} cursor-pointer`}
              >
                {ORDER_STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <Link href={`/customers/${o.customer.id}`} className="font-bold text-base hover:underline">{o.customer.name}</Link>
            <p className="text-gray-600 text-sm mt-1">{o.productName}</p>
            <div className="flex items-center justify-between mt-2">
              <span className="font-bold text-green-600">{formatMoney(o.amount)}</span>
              <span className="text-sm text-gray-400">{formatDate(o.orderDate)}</span>
            </div>
          </div>
        ))}
      </div>

      <OrderDialog open={dialogOpen} onClose={() => setDialogOpen(false)} salespeople={salespeople} />
    </>
  );
}
