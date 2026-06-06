import { prisma } from "@/lib/prisma";
import { formatDate, formatMoney, statusColor, ORDER_STATUS_OPTIONS } from "@/lib/utils";
import { Badge } from "@/components/Badge";
import { OrderListClient } from "./client";

export const dynamic = "force-dynamic";

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;
  const statusFilter = params.status || "";
  const search = params.search || "";

  const where: Record<string, unknown> = {};
  if (statusFilter) where.status = statusFilter;
  if (search) {
    where.OR = [
      { orderNo: { contains: search } },
      { productName: { contains: search } },
      { customer: { name: { contains: search } } },
    ];
  }

  const [orders, salespeople, stats] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { customer: true, salesperson: true },
    }),
    prisma.salesperson.findMany(),
    prisma.order.aggregate({
      _sum: { amount: true },
      _count: true,
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">订单管理</h1>
        <p className="text-gray-500 mt-1 text-base">
          共 {stats._count} 单，总金额 {formatMoney(stats._sum.amount || 0)}
        </p>
      </div>

      <OrderListClient
        orders={orders}
        salespeople={salespeople}
        statusFilter={statusFilter}
        search={search}
      />
    </div>
  );
}
