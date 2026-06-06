export function cn(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(" ");
}

export function formatMoney(amount: number): string {
  return `¥${amount.toLocaleString("zh-CN")}`;
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function formatDateTime(date: Date | string): string {
  const d = new Date(date);
  return `${formatDate(d)} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function daysSince(date: Date | string): number {
  const now = new Date();
  const d = new Date(date);
  const diff = now.getTime() - d.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export const STATUS_OPTIONS = [
  { value: "新咨询", label: "新咨询" },
  { value: "已联系", label: "已联系" },
  { value: "已报价", label: "已报价" },
  { value: "高意向", label: "高意向" },
  { value: "已成交", label: "已成交" },
  { value: "无效客户", label: "无效客户" },
] as const;

export const SOURCE_OPTIONS = [
  { value: "抖音", label: "抖音" },
  { value: "视频号", label: "视频号" },
  { value: "到店", label: "到店" },
  { value: "转介绍", label: "转介绍" },
  { value: "老客户", label: "老客户" },
  { value: "其他", label: "其他" },
] as const;

export const ORDER_STATUS_OPTIONS = [
  { value: "待确认", label: "待确认" },
  { value: "生产中", label: "生产中" },
  { value: "待交付", label: "待交付" },
  { value: "已完成", label: "已完成" },
] as const;

export function statusColor(status: string): string {
  const map: Record<string, string> = {
    "新咨询": "bg-blue-100 text-blue-800",
    "已联系": "bg-cyan-100 text-cyan-800",
    "已报价": "bg-purple-100 text-purple-800",
    "高意向": "bg-orange-100 text-orange-800",
    "已成交": "bg-green-100 text-green-800",
    "无效客户": "bg-gray-200 text-gray-600",
    "待确认": "bg-yellow-100 text-yellow-800",
    "生产中": "bg-blue-100 text-blue-800",
    "待交付": "bg-purple-100 text-purple-800",
    "已完成": "bg-green-100 text-green-800",
  };
  return map[status] || "bg-gray-100 text-gray-800";
}

export function warningBadge(lastFollowUpAt: Date | string): {
  label: string;
  color: string;
} | null {
  const days = daysSince(lastFollowUpAt);
  if (days >= 15) return { label: "已逾期", color: "bg-red-100 text-red-800" };
  if (days >= 7) return { label: "待跟进", color: "bg-yellow-100 text-yellow-800" };
  return null;
}

export function sourceColor(source: string): string {
  const map: Record<string, string> = {
    "抖音": "bg-pink-100 text-pink-700",
    "视频号": "bg-green-100 text-green-700",
    "到店": "bg-blue-100 text-blue-700",
    "转介绍": "bg-indigo-100 text-indigo-700",
    "老客户": "bg-teal-100 text-teal-700",
    "其他": "bg-gray-100 text-gray-700",
  };
  return map[source] || "bg-gray-100 text-gray-700";
}
