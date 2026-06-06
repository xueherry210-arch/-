"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Customer actions
export async function createCustomer(data: {
  name: string;
  phone: string;
  wechat?: string;
  source: string;
  productNeeds?: string;
  notes?: string;
  salespersonId: number;
}) {
  await prisma.customer.create({
    data: {
      ...data,
      wechat: data.wechat || null,
      productNeeds: data.productNeeds || null,
      notes: data.notes || null,
      status: "新咨询",
    },
  });
  revalidatePath("/");
  revalidatePath("/customers");
}

export async function updateCustomer(
  id: number,
  data: {
    name: string;
    phone: string;
    wechat?: string;
    source: string;
    productNeeds?: string;
    notes?: string;
    salespersonId: number;
  }
) {
  await prisma.customer.update({
    where: { id },
    data: {
      ...data,
      wechat: data.wechat || null,
      productNeeds: data.productNeeds || null,
      notes: data.notes || null,
    },
  });
  revalidatePath("/");
  revalidatePath("/customers");
  revalidatePath(`/customers/${id}`);
}

export async function deleteCustomer(id: number) {
  await prisma.customer.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/customers");
}

export async function changeCustomerStatus(id: number, status: string) {
  await prisma.customer.update({
    where: { id },
    data: { status, lastFollowUpAt: new Date() },
  });
  revalidatePath("/");
  revalidatePath("/customers");
  revalidatePath(`/customers/${id}`);
}

// FollowUp actions
export async function createFollowUp(data: {
  customerId: number;
  content: string;
  type: string;
  amount?: number;
}) {
  await prisma.followUp.create({
    data: {
      customerId: data.customerId,
      content: data.content,
      type: data.type,
      amount: data.amount || null,
    },
  });
  await prisma.customer.update({
    where: { id: data.customerId },
    data: { lastFollowUpAt: new Date() },
  });
  if (data.type === "成交") {
    await prisma.customer.update({
      where: { id: data.customerId },
      data: { status: "已成交" },
    });
  }
  revalidatePath(`/customers/${data.customerId}`);
  revalidatePath("/");
  revalidatePath("/customers");
}

// Order actions
export async function createOrder(data: {
  customerId: number;
  productName: string;
  amount: number;
  salespersonId: number;
  orderDate?: string;
  deliveryDate?: string;
  notes?: string;
}) {
  const orderNo = `OD${Date.now()}${Math.floor(Math.random() * 1000)}`;
  await prisma.order.create({
    data: {
      orderNo,
      customerId: data.customerId,
      productName: data.productName,
      amount: data.amount,
      salespersonId: data.salespersonId,
      status: "待确认",
      orderDate: data.orderDate ? new Date(data.orderDate) : new Date(),
      deliveryDate: data.deliveryDate ? new Date(data.deliveryDate) : null,
      notes: data.notes || null,
    },
  });
  await prisma.customer.update({
    where: { id: data.customerId },
    data: { status: "已成交", lastFollowUpAt: new Date() },
  });
  await prisma.followUp.create({
    data: {
      customerId: data.customerId,
      content: `客户成交，生成订单 ${orderNo}，金额 ¥${data.amount.toLocaleString("zh-CN")}`,
      type: "成交",
      amount: data.amount,
    },
  });
  revalidatePath("/");
  revalidatePath("/orders");
  revalidatePath(`/customers/${data.customerId}`);
}

export async function updateOrderStatus(id: number, status: string) {
  await prisma.order.update({
    where: { id },
    data: { status },
  });
  revalidatePath("/orders");
  revalidatePath("/");
}
