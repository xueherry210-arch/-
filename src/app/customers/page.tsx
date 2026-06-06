import { prisma } from "@/lib/prisma";
import { formatDate, statusColor, sourceColor, warningBadge, SOURCE_OPTIONS, STATUS_OPTIONS } from "@/lib/utils";
import { Badge } from "@/components/Badge";
import Link from "next/link";
import { CustomerListClient } from "./client";

export const dynamic = "force-dynamic";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;
  const search = params.search || "";
  const sourceFilter = params.source || "";
  const statusFilter = params.status || "";
  const salesFilter = params.sales || "";

  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { phone: { contains: search } },
    ];
  }
  if (sourceFilter) where.source = sourceFilter;
  if (statusFilter) where.status = statusFilter;
  if (salesFilter) where.salespersonId = Number(salesFilter);

  const [customers, salespeople] = await Promise.all([
    prisma.customer.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { salesperson: true },
    }),
    prisma.salesperson.findMany(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">客户管理</h1>
          <p className="text-gray-500 mt-1 text-base">共 {customers.length} 位客户</p>
        </div>
      </div>

      <CustomerListClient
        customers={customers}
        salespeople={salespeople}
        search={search}
        sourceFilter={sourceFilter}
        statusFilter={statusFilter}
        salesFilter={salesFilter}
      />
    </div>
  );
}
