"use client";

import { useState, useEffect } from "react";
import { createCustomer, updateCustomer } from "@/actions";
import { SOURCE_OPTIONS } from "@/lib/utils";
import { X } from "lucide-react";

interface Salesperson {
  id: number;
  name: string;
}

interface CustomerData {
  id?: number;
  name: string;
  phone: string;
  wechat?: string;
  source: string;
  productNeeds?: string;
  notes?: string;
  salespersonId: number;
}

export function CustomerDialog({
  open,
  onClose,
  customer,
  salespeople,
}: {
  open: boolean;
  onClose: () => void;
  customer?: CustomerData | null;
  salespeople: Salesperson[];
}) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<CustomerData>({
    name: "",
    phone: "",
    wechat: "",
    source: "到店",
    productNeeds: "",
    notes: "",
    salespersonId: salespeople[0]?.id || 0,
  });

  useEffect(() => {
    if (customer) {
      setForm({
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        wechat: customer.wechat || "",
        source: customer.source,
        productNeeds: customer.productNeeds || "",
        notes: customer.notes || "",
        salespersonId: customer.salespersonId,
      });
    } else {
      setForm({
        name: "",
        phone: "",
        wechat: "",
        source: "到店",
        productNeeds: "",
        notes: "",
        salespersonId: salespeople[0]?.id || 0,
      });
    }
  }, [customer, open, salespeople]);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (customer?.id) {
        await updateCustomer(customer.id, form);
      } else {
        await createCustomer(form);
      }
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-bold">{customer?.id ? "编辑客户" : "新增客户"}</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">客户姓名 *</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">联系电话 *</label>
            <input
              required
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">微信号</label>
            <input
              value={form.wechat}
              onChange={(e) => setForm({ ...form, wechat: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">来源渠道 *</label>
            <select
              value={form.source}
              onChange={(e) => setForm({ ...form, source: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
            >
              {SOURCE_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">需求产品</label>
            <input
              value={form.productNeeds}
              onChange={(e) => setForm({ ...form, productNeeds: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">销售人员 *</label>
            <select
              value={form.salespersonId}
              onChange={(e) => setForm({ ...form, salespersonId: Number(e.target.value) })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
            >
              {salespeople.map((sp) => (
                <option key={sp.id} value={sp.id}>{sp.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">备注</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg text-base font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {loading ? "保存中..." : "保存"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg text-base font-medium hover:bg-gray-200 transition-colors"
            >
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function DeleteConfirmDialog({
  open,
  onClose,
  onConfirm,
  name,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  name: string;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4 p-6">
        <h3 className="text-lg font-bold mb-2">确认删除</h3>
        <p className="text-gray-600 mb-6">确定要删除客户「{name}」吗？此操作不可撤销。</p>
        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-600 text-white py-2.5 rounded-lg text-base font-medium hover:bg-red-700 transition-colors"
          >
            删除
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg text-base font-medium hover:bg-gray-200 transition-colors"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  );
}
