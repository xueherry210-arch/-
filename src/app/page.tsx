import { prisma } from "@/lib/prisma";
import { formatMoney, formatDate, statusColor, warningBadge } from "@/lib/utils";
import { StatCard } from "@/components/StatCard";
import { Badge } from "@/components/Badge";
import {
  UserPlus,
  Users,
  Star,
  Clock,
  CheckCircle,
  DollarSign,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [todayNew, monthNew, highIntent, pendingFollowUp, closedDeals, orders] =
    await Promise.all([
      prisma.customer.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.customer.count({ where: { createdAt: { gte: monthStart } } }),
      prisma.customer.count({ where: { status: "高意向" } }),
      prisma.customer.count({
        where: {
          status: { notIn: ["已成交", "无效客户"] },
          lastFollowUpAt: { lte: new Date(Date.now() - 7 * 86400000) },
        },
      }),
      prisma.customer.count({ where: { status: "已成交" } }),
      prisma.order.aggregate({
        _sum: { amount: true },
        where: { orderDate: { gte: monthStart } },
      }),
    ]);

  const warningCustomers = await prisma.customer.findMany({
    where: {
      status: { notIn: ["已成交", "无效客户"] },
      lastFollowUpAt: { lte: new Date(Date.now() - 7 * 86400000) },
    },
    take: 10,
    orderBy: { lastFollowUpAt: "asc" },
    include: { salesperson: true },
  });

  const recentOrders = await prisma.order.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { customer: true, salesperson: true },
  });

  const sourceDistribution = await prisma.customer.groupBy({
    by: ["source"],
    _count: true,
  });
  const totalCustomers = sourceDistribution.reduce((s, g) => s + g._count, 0);

  const statusDistribution = await prisma.customer.groupBy({
    by: ["status"],
    _count: true,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">仪表盘</h1>
        <p className="text-gray-500 mt-1 text-base">客户成交数据概览</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 lg:gap-4">
        <StatCard title="今日新增" value={todayNew} color="bg-blue-50 text-blue-600" icon={<UserPlus className="w-5 h-5" />} />
        <StatCard title="本月新增" value={monthNew} color="bg-indigo-50 text-indigo-600" icon={<Users className="w-5 h-5" />} />
        <StatCard title="高意向" value={highIntent} color="bg-orange-50 text-orange-600" icon={<Star className="w-5 h-5" />} />
        <StatCard title="待跟进" value={pendingFollowUp} color="bg-yellow-50 text-yellow-600" icon={<Clock className="w-5 h-5" />} />
        <StatCard title="已成交" value={closedDeals} color="bg-green-50 text-green-600" icon={<CheckCircle className="w-5 h-5" />} />
        <StatCard title="本月成交" value={formatMoney(orders._sum.amount || 0)} color="bg-teal-50 text-teal-600" icon={<DollarSign className="w-5 h-5" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h2 className="text-lg font-bold text-gray-900">待跟进客户提醒</h2>
          </div>
          {warningCustomers.length === 0 ? (
            <p className="text-gray-500 text-base py-4">暂无需要跟进的客户</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-base">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 font-semibold text-gray-600">客户</th>
                    <th className="pb-3 font-semibold text-gray-600">状态</th>
                    <th className="pb-3 font-semibold text-gray-600">销售</th>
                    <th className="pb-3 font-semibold text-gray-600">最后跟进</th>
                    <th className="pb-3 font-semibold text-gray-600">预警</th>
                    <th className="pb-3 font-semibold text-gray-600"></th>
                  </tr>
                </thead>
                <tbody>
                  {warningCustomers.map((c) => {
                    const warn = warningBadge(c.lastFollowUpAt);
                    return (
                      <tr key={c.id} className="border-b last:border-0">
                        <td className="py-3 font-medium">{c.name}</td>
                        <td className="py-3"><Badge color={statusColor(c.status)}>{c.status}</Badge></td>
                        <td className="py-3 text-gray-600">{c.salesperson.name}</td>
                        <td className="py-3 text-gray-500">{formatDate(c.lastFollowUpAt)}</td>
                        <td className="py-3">{warn && <Badge color={warn.color}>{warn.label}</Badge>}</td>
                        <td className="py-3">
                          <Link href={`/customers/${c.id}`} className="text-indigo-600 hover:underline text-sm font-medium">跟进</Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h2 className="text-lg font-bold text-gray-900 mb-4">客户来源</h2>
          <div className="space-y-4">
            {sourceDistribution.map((s) => (
              <div key={s.source}>
                <div className="flex justify-between text-base mb-1">
                  <span className="text-gray-700 font-medium">{s.source}</span>
                  <span className="text-gray-500">{s._count} ({((s._count / totalCustomers) * 100).toFixed(1)}%)</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div className="bg-indigo-500 h-3 rounded-full" style={{ width: `${(s._count / totalCustomers) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h2 className="text-lg font-bold text-gray-900 mb-4">客户状态分布</h2>
          <div className="space-y-4">
            {statusDistribution.map((s) => (
              <div key={s.status}>
                <div className="flex justify-between text-base mb-1">
                  <span className="text-gray-700 font-medium">{s.status}</span>
                  <span className="text-gray-500">{s._count}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div className={`h-3 rounded-full ${
                    s.status === "已成交" ? "bg-green-500" : s.status === "高意向" ? "bg-orange-500" : s.status === "无效客户" ? "bg-gray-400" : "bg-blue-500"
                  }`} style={{ width: `${(s._count / totalCustomers) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <h2 className="text-lg font-bold text-gray-900">最近成交</h2>
            </div>
            <Link href="/orders" className="text-sm text-indigo-600 hover:underline font-medium">查看全部</Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-gray-500 text-base py-4">暂无成交记录</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((o) => (
                <div key={o.id} className="flex items-center justify-between py-3 border-b last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-base truncate">{o.customer.name}</p>
                    <p className="text-sm text-gray-500 truncate">{o.productName}</p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-bold text-base text-green-600">{formatMoney(o.amount)}</p>
                    <p className="text-sm text-gray-400">{formatDate(o.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
