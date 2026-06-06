import { prisma } from "@/lib/prisma";
import { formatMoney, formatDate, statusColor, warningBadge } from "@/lib/utils";
import { Badge } from "@/components/Badge";
import { Crown, TrendingUp, Users, Target, AlertTriangle, Star, DollarSign } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function BossPage() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  // Monthly stats
  const [monthOrders, totalCustomers, closedDeals, monthNewCustomers] = await Promise.all([
    prisma.order.aggregate({
      _sum: { amount: true },
      _count: true,
      where: { orderDate: { gte: monthStart } },
    }),
    prisma.customer.count(),
    prisma.customer.count({ where: { status: "已成交" } }),
    prisma.customer.count({ where: { createdAt: { gte: monthStart } } }),
  ]);

  const closeRate = totalCustomers > 0 ? ((closedDeals / totalCustomers) * 100).toFixed(1) : "0";

  // Sales rankings
  const salesRankings = await prisma.salesperson.findMany({
    include: {
      orders: {
        where: { orderDate: { gte: monthStart } },
        select: { amount: true },
      },
      customers: {
        where: { createdAt: { gte: monthStart } },
        select: { id: true },
      },
      _count: {
        select: { customers: true },
      },
    },
  });

  const salesData = salesRankings.map((sp) => ({
    id: sp.id,
    name: sp.name,
    totalAmount: sp.orders.reduce((sum, o) => sum + o.amount, 0),
    orderCount: sp.orders.length,
    newCustomers: sp.customers.length,
    totalCustomers: sp._count.customers,
  })).sort((a, b) => b.totalAmount - a.totalAmount);

  const maxAmount = Math.max(...salesData.map((s) => s.totalAmount), 1);
  const maxNewCustomers = Math.max(...salesData.map((s) => s.newCustomers), 1);

  // Pending follow-up
  const pendingCustomers = await prisma.customer.findMany({
    where: {
      status: { notIn: ["已成交", "无效客户"] },
      lastFollowUpAt: { lte: new Date(Date.now() - 7 * 86400000) },
    },
    take: 10,
    orderBy: { lastFollowUpAt: "asc" },
    include: { salesperson: true },
  });

  // High intent
  const highIntentCustomers = await prisma.customer.findMany({
    where: { status: "高意向" },
    take: 10,
    orderBy: { lastFollowUpAt: "desc" },
    include: { salesperson: true },
  });

  // Recent orders
  const recentOrders = await prisma.order.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
    include: { customer: true, salesperson: true },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
          <Crown className="w-6 h-6 text-yellow-600" />
        </div>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">老板看板</h1>
          <p className="text-gray-500 text-base">核心经营数据一览</p>
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-green-500" />
            <span className="text-base text-gray-500">本月成交金额</span>
          </div>
          <p className="text-2xl lg:text-3xl font-bold text-gray-900">{formatMoney(monthOrders._sum.amount || 0)}</p>
          <p className="text-sm text-gray-400 mt-1">{monthOrders._count} 单</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-blue-500" />
            <span className="text-base text-gray-500">成交客户数</span>
          </div>
          <p className="text-2xl lg:text-3xl font-bold text-gray-900">{closedDeals}</p>
          <p className="text-sm text-gray-400 mt-1">共 {totalCustomers} 位客户</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-indigo-500" />
            <span className="text-base text-gray-500">成交率</span>
          </div>
          <p className="text-2xl lg:text-3xl font-bold text-gray-900">{closeRate}%</p>
          <p className="text-sm text-gray-400 mt-1">本月新增 {monthNewCustomers} 位</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <span className="text-base text-gray-500">待跟进客户</span>
          </div>
          <p className="text-2xl lg:text-3xl font-bold text-gray-900">{pendingCustomers.length}</p>
          <p className="text-sm text-gray-400 mt-1">7天以上未跟进</p>
        </div>
      </div>

      {/* Sales ranking */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <h2 className="text-lg font-bold text-gray-900">销售排行榜（本月成交额）</h2>
          </div>
          <div className="space-y-4">
            {salesData.map((sp, i) => (
              <div key={sp.id}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                      i === 0 ? "bg-yellow-100 text-yellow-700" :
                      i === 1 ? "bg-gray-100 text-gray-600" :
                      i === 2 ? "bg-orange-100 text-orange-700" :
                      "bg-gray-50 text-gray-500"
                    }`}>{i + 1}</span>
                    <span className="text-base font-medium">{sp.name}</span>
                  </div>
                  <span className="text-base font-bold text-green-600">{formatMoney(sp.totalAmount)}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div className="bg-indigo-500 h-3 rounded-full" style={{ width: `${(sp.totalAmount / maxAmount) * 100}%` }} />
                </div>
                <div className="text-xs text-gray-400 mt-1">{sp.orderCount} 单</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-bold text-gray-900">新增客户排行（本月）</h2>
          </div>
          <div className="space-y-4">
            {[...salesData].sort((a, b) => b.newCustomers - a.newCustomers).map((sp, i) => (
              <div key={sp.id}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                      i === 0 ? "bg-yellow-100 text-yellow-700" :
                      i === 1 ? "bg-gray-100 text-gray-600" :
                      i === 2 ? "bg-orange-100 text-orange-700" :
                      "bg-gray-50 text-gray-500"
                    }`}>{i + 1}</span>
                    <span className="text-base font-medium">{sp.name}</span>
                  </div>
                  <span className="text-base font-bold text-blue-600">{sp.newCustomers} 位</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div className="bg-blue-500 h-3 rounded-full" style={{ width: `${(sp.newCustomers / maxNewCustomers) * 100}%` }} />
                </div>
                <div className="text-xs text-gray-400 mt-1">总计 {sp.totalCustomers} 位客户</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Warning + High intent */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h2 className="text-lg font-bold text-gray-900">待跟进客户</h2>
          </div>
          {pendingCustomers.length === 0 ? (
            <p className="text-gray-500 py-4">暂无待跟进客户</p>
          ) : (
            <div className="space-y-2">
              {pendingCustomers.map((c) => {
                const warn = warningBadge(c.lastFollowUpAt);
                return (
                  <Link key={c.id} href={`/customers/${c.id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 border">
                    <div>
                      <p className="font-medium">{c.name}</p>
                      <p className="text-sm text-gray-400">{c.salesperson.name} · {formatDate(c.lastFollowUpAt)}</p>
                    </div>
                    {warn && <Badge color={warn.color}>{warn.label}</Badge>}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg font-bold text-gray-900">高意向客户</h2>
          </div>
          {highIntentCustomers.length === 0 ? (
            <p className="text-gray-500 py-4">暂无高意向客户</p>
          ) : (
            <div className="space-y-2">
              {highIntentCustomers.map((c) => (
                <Link key={c.id} href={`/customers/${c.id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 border">
                  <div>
                    <p className="font-medium">{c.name}</p>
                    <p className="text-sm text-gray-400">{c.salesperson.name} · 最后跟进 {formatDate(c.lastFollowUpAt)}</p>
                  </div>
                  <Badge color={statusColor("高意向")}>高意向</Badge>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <h2 className="text-lg font-bold text-gray-900">最近订单</h2>
          </div>
          <Link href="/orders" className="text-sm text-indigo-600 hover:underline font-medium">查看全部</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-base">
            <thead>
              <tr className="border-b text-left">
                <th className="pb-3 font-semibold text-gray-600">订单号</th>
                <th className="pb-3 font-semibold text-gray-600">客户</th>
                <th className="pb-3 font-semibold text-gray-600">产品</th>
                <th className="pb-3 font-semibold text-gray-600">金额</th>
                <th className="pb-3 font-semibold text-gray-600">销售</th>
                <th className="pb-3 font-semibold text-gray-600">状态</th>
                <th className="pb-3 font-semibold text-gray-600">日期</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((o) => (
                <tr key={o.id} className="border-b last:border-0">
                  <td className="py-3 font-mono text-sm text-gray-500">{o.orderNo}</td>
                  <td className="py-3 font-medium">{o.customer.name}</td>
                  <td className="py-3 text-gray-600">{o.productName}</td>
                  <td className="py-3 font-bold text-green-600">{formatMoney(o.amount)}</td>
                  <td className="py-3 text-gray-600">{o.salesperson.name}</td>
                  <td className="py-3"><Badge color={statusColor(o.status)}>{o.status}</Badge></td>
                  <td className="py-3 text-gray-500 text-sm">{formatDate(o.orderDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
