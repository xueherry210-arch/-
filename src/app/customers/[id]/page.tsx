import { prisma } from "@/lib/prisma";
import { formatDate, formatDateTime, formatMoney, statusColor, sourceColor, STATUS_OPTIONS, ORDER_STATUS_OPTIONS } from "@/lib/utils";
import { Badge } from "@/components/Badge";
import { notFound } from "next/navigation";
import { CustomerDetailClient } from "./client";
import Link from "next/link";
import { ArrowLeft, Phone, MessageCircle, Calendar, User } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customerId = parseInt(id);

  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    include: {
      salesperson: true,
      followUps: {
        orderBy: { createdAt: "desc" },
        take: 50,
      },
      orders: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!customer) notFound();

  const salespeople = await prisma.salesperson.findMany();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/customers" className="p-2 rounded-lg hover:bg-gray-200 transition-colors text-gray-500">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{customer.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge color={statusColor(customer.status)}>{customer.status}</Badge>
            <Badge color={sourceColor(customer.source)}>{customer.source}</Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - info */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h2 className="text-lg font-bold text-gray-900 mb-4">基本信息</h2>
            <div className="space-y-3 text-base">
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="w-4 h-4 text-gray-400" />
                <span>{customer.phone}</span>
              </div>
              {customer.wechat && (
                <div className="flex items-center gap-2 text-gray-600">
                  <MessageCircle className="w-4 h-4 text-gray-400" />
                  <span>{customer.wechat}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-gray-600">
                <User className="w-4 h-4 text-gray-400" />
                <span>销售：{customer.salesperson.name}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span>录入：{formatDate(customer.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span>最后跟进：{formatDate(customer.lastFollowUpAt)}</span>
              </div>
            </div>
            {customer.productNeeds && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-500 mb-1">需求产品</p>
                <p className="text-base font-medium">{customer.productNeeds}</p>
              </div>
            )}
            {customer.notes && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-500 mb-1">备注</p>
                <p className="text-base text-gray-700">{customer.notes}</p>
              </div>
            )}
          </div>

          {/* Orders */}
          {customer.orders.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <h2 className="text-lg font-bold text-gray-900 mb-4">关联订单</h2>
              <div className="space-y-3">
                {customer.orders.map((o) => (
                  <div key={o.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-sm text-gray-500">{o.orderNo}</span>
                      <Badge color={statusColor(o.status)}>{o.status}</Badge>
                    </div>
                    <p className="font-medium">{o.productName}</p>
                    <p className="text-green-600 font-bold mt-1">{formatMoney(o.amount)}</p>
                    <p className="text-sm text-gray-400 mt-1">
                      {formatDate(o.orderDate)}
                      {o.deliveryDate && ` → 交货 ${formatDate(o.deliveryDate)}`}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column - timeline */}
        <div className="lg:col-span-2">
          <CustomerDetailClient
            customer={customer}
            salespeople={salespeople}
          />
        </div>
      </div>
    </div>
  );
}
