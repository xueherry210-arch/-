"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createOrder } from "@/actions";
import { X } from "lucide-react";

interface Salesperson {
  id: number;
  name: string;
}

export function OrderDialog({
  open,
  onClose,
  salespeople,
}: {
  open: boolean;
  onClose: () => void;
  salespeople: Salesperson[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<{ id: number; name: string }[]>([]);
  const [form, setForm] = useState({
    customerId: 0,
    productName: "",
    amount: "",
    salespersonId: salespeople[0]?.id || 0,
    orderDate: new Date().toISOString().split("T")[0],
    deliveryDate: "",
    notes: "",
  });

  useEffect(() => {
    if (open) {
      fetch("/api/customers")
        .then((r) => r.json())
        .then(setCustomers)
        .catch(console.error);
    }
  }, [open]);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.customerId || !form.productName || !form.amount) return;
    setLoading(true);
    await createOrder({
      customerId: form.customerId,
      productName: form.productName,
      amount: parseFloat(form.amount),
      salespersonId: form.salespersonId,
      orderDate: form.orderDate,
      deliveryDate: form.deliveryDate || undefined,
      notes: form.notes,
    });
    setLoading(false);
    onClose();
    router.refresh();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-bold">新增订单</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">客户 *</label>
            <select
              required
              value={form.customerId}
              onChange={(e) => setForm({ ...form, customerId: Number(e.target.value) })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-base bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value={0}>请选择客户</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">产品名称 *</label>
            <input required value={form.productName} onChange={(e) => setForm({ ...form, productName: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">订单金额 *</label>
            <input required type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">订单日期</label>
              <input type="date" value={form.orderDate} onChange={(e) => setForm({ ...form, orderDate: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">交货日期</label>
              <input type="date" value={form.deliveryDate} onChange={(e) => setForm({ ...form, deliveryDate: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">销售人员</label>
            <select value={form.salespersonId} onChange={(e) => setForm({ ...form, salespersonId: Number(e.target.value) })} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-base bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
              {salespeople.map((sp) => (<option key={sp.id} value={sp.id}>{sp.name}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">备注</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg text-base font-medium hover:bg-indigo-700 disabled:opacity-50">{loading ? "保存中..." : "保存订单"}</button>
            <button type="button" onClick={onClose} className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg text-base font-medium hover:bg-gray-200">取消</button>
          </div>
        </form>
      </div>
    </div>
  );
}
