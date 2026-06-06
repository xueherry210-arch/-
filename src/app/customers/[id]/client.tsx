"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDateTime, formatMoney, statusColor, SOURCE_OPTIONS } from "@/lib/utils";
import { Badge } from "@/components/Badge";
import { changeCustomerStatus, createFollowUp, createOrder } from "@/actions";
import { MessageSquare, DollarSign, CheckCircle, FileText, ShoppingCart } from "lucide-react";

interface CustomerData {
  id: number;
  name: string;
  phone: string;
  wechat: string | null;
  source: string;
  productNeeds: string | null;
  status: string;
  lastFollowUpAt: Date | string;
  salesperson: { id: number; name: string };
  followUps: FollowUpData[];
}

interface FollowUpData {
  id: number;
  content: string;
  type: string;
  amount: number | null;
  createdAt: Date | string;
}

interface Salesperson {
  id: number;
  name: string;
}

const followUpTypeIcons: Record<string, React.ReactNode> = {
  "跟进": <MessageSquare className="w-4 h-4" />,
  "报价": <DollarSign className="w-4 h-4" />,
  "成交": <CheckCircle className="w-4 h-4" />,
  "备注": <FileText className="w-4 h-4" />,
};

const followUpTypeColors: Record<string, string> = {
  "跟进": "bg-blue-50 border-blue-200",
  "报价": "bg-purple-50 border-purple-200",
  "成交": "bg-green-50 border-green-200",
  "备注": "bg-gray-50 border-gray-200",
};

const followUpTypeIconColors: Record<string, string> = {
  "跟进": "text-blue-600",
  "报价": "text-purple-600",
  "成交": "text-green-600",
  "备注": "text-gray-500",
};

export function CustomerDetailClient({
  customer,
  salespeople,
}: {
  customer: CustomerData;
  salespeople: Salesperson[];
}) {
  const router = useRouter();
  const [followUpContent, setFollowUpContent] = useState("");
  const [followUpType, setFollowUpType] = useState("跟进");
  const [followUpAmount, setFollowUpAmount] = useState("");
  const [saving, setSaving] = useState(false);
  const [orderOpen, setOrderOpen] = useState(false);
  const [orderForm, setOrderForm] = useState({
    productName: customer.productNeeds || "",
    amount: "",
    deliveryDate: "",
    notes: "",
  });

  async function handleFollowUp(e: React.FormEvent) {
    e.preventDefault();
    if (!followUpContent.trim()) return;
    setSaving(true);
    await createFollowUp({
      customerId: customer.id,
      content: followUpContent,
      type: followUpType,
      amount: followUpAmount ? parseFloat(followUpAmount) : undefined,
    });
    setFollowUpContent("");
    setFollowUpAmount("");
    setSaving(false);
    router.refresh();
  }

  async function handleStatusChange(status: string) {
    await changeCustomerStatus(customer.id, status);
    router.refresh();
  }

  async function handleCreateOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!orderForm.productName || !orderForm.amount) return;
    setSaving(true);
    await createOrder({
      customerId: customer.id,
      productName: orderForm.productName,
      amount: parseFloat(orderForm.amount),
      salespersonId: customer.salesperson.id,
      deliveryDate: orderForm.deliveryDate || undefined,
      notes: orderForm.notes,
    });
    setOrderOpen(false);
    setSaving(false);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {/* Actions */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-base text-gray-600 font-medium">状态：</span>
            <select
              value={customer.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-base bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="新咨询">新咨询</option>
              <option value="已联系">已联系</option>
              <option value="已报价">已报价</option>
              <option value="高意向">高意向</option>
              <option value="已成交">已成交</option>
              <option value="无效客户">无效客户</option>
            </select>
          </div>
          <div className="h-8 w-px bg-gray-200" />
          <button
            onClick={() => setOrderOpen(!orderOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-base font-medium hover:bg-green-700 transition-colors"
          >
            <ShoppingCart className="w-5 h-5" /> 转为订单
          </button>
        </div>
      </div>

      {/* Order form */}
      {orderOpen && (
        <div className="bg-white rounded-xl border border-green-300 shadow-sm p-5">
          <h3 className="text-lg font-bold text-gray-900 mb-4">转为订单</h3>
          <form onSubmit={handleCreateOrder} className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">产品名称 *</label>
                <input
                  required
                  value={orderForm.productName}
                  onChange={(e) => setOrderForm({ ...orderForm, productName: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">订单金额 *</label>
                <input
                  required
                  type="number"
                  value={orderForm.amount}
                  onChange={(e) => setOrderForm({ ...orderForm, amount: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">交货日期</label>
                <input
                  type="date"
                  value={orderForm.deliveryDate}
                  onChange={(e) => setOrderForm({ ...orderForm, deliveryDate: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">备注</label>
                <input
                  value={orderForm.notes}
                  onChange={(e) => setOrderForm({ ...orderForm, notes: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="px-6 py-2.5 bg-green-600 text-white rounded-lg text-base font-medium hover:bg-green-700 disabled:opacity-50">
                {saving ? "处理中..." : "确认转为订单"}
              </button>
              <button type="button" onClick={() => setOrderOpen(false)} className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-base font-medium hover:bg-gray-200">
                取消
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add follow-up */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h3 className="text-lg font-bold text-gray-900 mb-4">新增跟进记录</h3>
        <form onSubmit={handleFollowUp} className="space-y-3">
          <div className="flex flex-wrap gap-3">
            <select
              value={followUpType}
              onChange={(e) => setFollowUpType(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-base bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="跟进">跟进记录</option>
              <option value="报价">报价记录</option>
              <option value="成交">成交记录</option>
              <option value="备注">添加备注</option>
            </select>
            {(followUpType === "报价" || followUpType === "成交") && (
              <input
                type="number"
                placeholder="金额"
                value={followUpAmount}
                onChange={(e) => setFollowUpAmount(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-base w-40 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            )}
          </div>
          <textarea
            required
            value={followUpContent}
            onChange={(e) => setFollowUpContent(e.target.value)}
            placeholder="输入跟进内容..."
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={saving || !followUpContent.trim()}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg text-base font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {saving ? "保存中..." : "提交"}
          </button>
        </form>
      </div>

      {/* Follow-up timeline */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h3 className="text-lg font-bold text-gray-900 mb-4">跟进记录</h3>
        {customer.followUps.length === 0 ? (
          <p className="text-gray-500 text-base py-4">暂无跟进记录</p>
        ) : (
          <div className="space-y-0">
            {customer.followUps.map((fu) => (
              <div key={fu.id} className="relative pl-6 pb-5 last:pb-0">
                {/* Timeline line */}
                <div className="absolute left-2.5 top-2 bottom-0 w-px bg-gray-200 last:hidden" />
                {/* Timeline dot */}
                <div className={`absolute left-1 top-1.5 w-3 h-3 rounded-full border-2 border-white ${followUpTypeColors[fu.type]?.split(" ")[0] || "bg-gray-100"} ring-1 ring-gray-300`} />
                <div className={`rounded-lg border p-3 ${followUpTypeColors[fu.type] || "bg-gray-50 border-gray-200"}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`flex items-center gap-1 text-xs font-medium ${followUpTypeIconColors[fu.type] || "text-gray-600"}`}>
                      {followUpTypeIcons[fu.type]} {fu.type}
                    </span>
                    <span className="text-xs text-gray-400">{formatDateTime(fu.createdAt)}</span>
                    {fu.amount && (
                      <span className="text-xs font-bold text-green-600 ml-auto">{formatMoney(fu.amount)}</span>
                    )}
                  </div>
                  <p className="text-base text-gray-700">{fu.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
