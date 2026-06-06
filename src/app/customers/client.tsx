"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { formatDate, statusColor, sourceColor, warningBadge, SOURCE_OPTIONS, STATUS_OPTIONS } from "@/lib/utils";
import { Badge } from "@/components/Badge";
import { CustomerDialog, DeleteConfirmDialog } from "@/components/CustomerDialog";
import { deleteCustomer } from "@/actions";
import { Plus, Search, Phone, Edit, Trash2 } from "lucide-react";
import Link from "next/link";

interface Customer {
  id: number;
  name: string;
  phone: string;
  wechat: string | null;
  source: string;
  productNeeds: string | null;
  status: string;
  createdAt: string | Date;
  lastFollowUpAt: string | Date;
  salesperson: { id: number; name: string };
}

interface Salesperson {
  id: number;
  name: string;
}

export function CustomerListClient({
  customers,
  salespeople,
  search: initialSearch,
  sourceFilter: initialSource,
  statusFilter: initialStatus,
  salesFilter: initialSales,
}: {
  customers: Customer[];
  salespeople: Salesperson[];
  search: string;
  sourceFilter: string;
  statusFilter: string;
  salesFilter: string;
}) {
  const router = useRouter();
  const [search, setSearch] = useState(initialSearch);
  const [sourceFilter, setSourceFilter] = useState(initialSource);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [salesFilter, setSalesFilter] = useState(initialSales);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);

  const applyFilters = useCallback(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (sourceFilter) params.set("source", sourceFilter);
    if (statusFilter) params.set("status", statusFilter);
    if (salesFilter) params.set("sales", salesFilter);
    router.push(`/customers?${params.toString()}`);
  }, [search, sourceFilter, statusFilter, salesFilter, router]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };

  const clearFilters = () => {
    setSearch("");
    setSourceFilter("");
    setStatusFilter("");
    setSalesFilter("");
    router.push("/customers");
  };

  const handleEdit = (c: Customer) => {
    setEditingCustomer({
      ...c,
      salespersonId: c.salesperson.id,
      wechat: c.wechat || "",
      productNeeds: c.productNeeds || "",
    } as never);
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteCustomer(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <>
      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 lg:p-5">
        <form onSubmit={handleSearch} className="space-y-3">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="搜索客户姓名、电话..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2.5 text-base bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">全部来源</option>
              {SOURCE_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2.5 text-base bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">全部状态</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            <select
              value={salesFilter}
              onChange={(e) => setSalesFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2.5 text-base bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">全部销售</option>
              {salespeople.map((sp) => (
                <option key={sp.id} value={sp.id}>{sp.name}</option>
              ))}
            </select>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg text-base font-medium hover:bg-indigo-700 transition-colors"
              >
                筛选
              </button>
              <button
                type="button"
                onClick={clearFilters}
                className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-base font-medium hover:bg-gray-200 transition-colors"
              >
                重置
              </button>
              <button
                type="button"
                onClick={() => { setEditingCustomer(null); setDialogOpen(true); }}
                className="px-4 py-2.5 bg-green-600 text-white rounded-lg text-base font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-5 h-5" /> 新增
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Table - desktop */}
      <div className="hidden lg:block bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-base">
          <thead>
            <tr className="border-b bg-gray-50 text-left">
              <th className="px-5 py-3 font-semibold text-gray-600">客户</th>
              <th className="px-5 py-3 font-semibold text-gray-600">来源</th>
              <th className="px-5 py-3 font-semibold text-gray-600">需求产品</th>
              <th className="px-5 py-3 font-semibold text-gray-600">状态</th>
              <th className="px-5 py-3 font-semibold text-gray-600">预警</th>
              <th className="px-5 py-3 font-semibold text-gray-600">销售</th>
              <th className="px-5 py-3 font-semibold text-gray-600">录入时间</th>
              <th className="px-5 py-3 font-semibold text-gray-600">操作</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => {
              const warn = warningBadge(c.lastFollowUpAt);
              return (
                <tr key={c.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <Link href={`/customers/${c.id}`} className="font-medium text-indigo-700 hover:underline">
                      {c.name}
                    </Link>
                    <div className="flex items-center gap-1 text-sm text-gray-400 mt-0.5">
                      <Phone className="w-3 h-3" /> {c.phone}
                    </div>
                  </td>
                  <td className="px-5 py-3"><Badge color={sourceColor(c.source)}>{c.source}</Badge></td>
                  <td className="px-5 py-3 text-gray-600 max-w-[160px] truncate">{c.productNeeds || "-"}</td>
                  <td className="px-5 py-3"><Badge color={statusColor(c.status)}>{c.status}</Badge></td>
                  <td className="px-5 py-3">{warn && <Badge color={warn.color}>{warn.label}</Badge>}</td>
                  <td className="px-5 py-3 text-gray-600">{c.salesperson.name}</td>
                  <td className="px-5 py-3 text-gray-500 text-sm">{formatDate(c.createdAt)}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleEdit(c)} className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500 hover:text-indigo-600 transition-colors" title="编辑">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeleteTarget(c)} className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500 hover:text-red-600 transition-colors" title="删除">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Card list - mobile */}
      <div className="lg:hidden space-y-3">
        {customers.map((c) => {
          const warn = warningBadge(c.lastFollowUpAt);
          return (
            <Link key={c.id} href={`/customers/${c.id}`} className="block bg-white rounded-xl border border-gray-200 shadow-sm p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-base">{c.name}</span>
                <Badge color={statusColor(c.status)}>{c.status}</Badge>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
                <Phone className="w-3 h-3" /> {c.phone}
              </div>
              <div className="flex flex-wrap gap-1.5 mb-2">
                <Badge color={sourceColor(c.source)}>{c.source}</Badge>
                {warn && <Badge color={warn.color}>{warn.label}</Badge>}
              </div>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{c.salesperson.name}</span>
                <span>{formatDate(c.createdAt)}</span>
              </div>
            </Link>
          );
        })}
      </div>

      <CustomerDialog
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setEditingCustomer(null); }}
        customer={editingCustomer as never}
        salespeople={salespeople}
      />

      <DeleteConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        name={deleteTarget?.name || ""}
      />
    </>
  );
}
