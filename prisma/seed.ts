import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient();

const SALESPEOPLE = [
  { name: "张三", phone: "13800001001" },
  { name: "李四", phone: "13800001002" },
  { name: "王五", phone: "13800001003" },
  { name: "赵六", phone: "13800001004" },
  { name: "陈七", phone: "13800001005" },
];

const SOURCES = ["抖音", "视频号", "到店", "转介绍", "老客户", "其他"];
const STATUSES = ["新咨询", "已联系", "已报价", "高意向", "已成交", "无效客户"];
const PRODUCTS = [
  "实木衣柜", "推拉门", "断桥铝窗", "橱柜定制", "书柜", "榻榻米",
  "衣帽间", "酒柜", "电视柜", "鞋柜", "阳台柜", "淋浴房",
  "实木床", "餐桌套装", "沙发", "茶几", "办公桌", "文件柜",
];

const FIRST_NAMES = [
  "王", "李", "张", "刘", "陈", "杨", "赵", "黄", "周", "吴",
  "徐", "孙", "胡", "朱", "高", "林", "何", "郭", "马", "罗",
  "梁", "宋", "郑", "谢", "韩", "唐", "冯", "于", "董", "萧",
];
const LAST_NAMES = [
  "伟", "芳", "娜", "秀英", "敏", "静", "丽", "强", "磊", "军",
  "洋", "勇", "艳", "杰", "娟", "涛", "明", "超", "秀兰", "霞",
  "平", "刚", "桂英", "文", "华", "飞", "玉兰", "斌", "玲", "国强",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(randInt(8, 20), randInt(0, 59), 0, 0);
  return d;
}

async function main() {
  // Clear existing data
  await prisma.followUp.deleteMany();
  await prisma.order.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.salesperson.deleteMany();

  // Create salespeople
  const salespeople = [];
  for (const sp of SALESPEOPLE) {
    const s = await prisma.salesperson.create({ data: sp });
    salespeople.push(s);
  }

  // Create 100 customers
  const customers = [];
  for (let i = 0; i < 100; i++) {
    const name = pick(FIRST_NAMES) + pick(LAST_NAMES);
    const createdDaysAgo = randInt(0, 60);
    const status = pick(STATUSES);
    // Some customers intentionally haven't been followed up recently for "warning" demo
    const followUpDaysAgo =
      status === "新咨询"
        ? createdDaysAgo
        : status === "无效客户"
          ? randInt(20, 45)
          : randInt(0, 18);

    const customer = await prisma.customer.create({
      data: {
        name,
        phone: `1${randInt(30, 99)}${String(randInt(10000000, 99999999))}`,
        wechat: Math.random() > 0.3 ? `wx_${name.toLowerCase()}_${randInt(100, 999)}` : null,
        source: pick(SOURCES),
        productNeeds: pick(PRODUCTS) + (Math.random() > 0.5 ? "、" + pick(PRODUCTS) : ""),
        notes: Math.random() > 0.4 ? `客户对价格比较敏感，需要多沟通` : null,
        status,
        createdAt: daysAgo(createdDaysAgo),
        lastFollowUpAt: daysAgo(followUpDaysAgo),
        salespersonId: pick(salespeople).id,
      },
    });
    customers.push(customer);
  }

  // Create follow-ups for each customer (1-3 records)
  for (const customer of customers) {
    const count = randInt(1, 3);
    for (let j = 0; j < count; j++) {
      const isQuote = Math.random() > 0.7;
      const isDeal = !isQuote && customer.status === "已成交" && j === count - 1;
      await prisma.followUp.create({
        data: {
          customerId: customer.id,
          content: isDeal
            ? "客户同意报价，已确认成交。"
            : isQuote
              ? `报价方案：根据客户需求提供${customer.productNeeds || "产品"}方案，总价约${randInt(5000, 50000)}元。`
              : pick([
                  "电话沟通了解客户需求",
                  "微信发送了产品图册",
                  "邀请客户到店看样品",
                  "客户咨询了产品材质和工艺",
                  "向客户介绍了优惠活动",
                  "预约了上门测量时间",
                  "发送了设计方案给客户确认",
                  "客户来店看了实物样品",
                ]),
          type: isDeal ? "成交" : isQuote ? "报价" : "跟进",
          amount: isQuote || isDeal ? randInt(5000, 50000) : null,
          createdAt: daysAgo(
            Math.max(
              0,
              Math.floor(
                (Date.now() - customer.createdAt.getTime()) / 86400000
              ) - randInt(0, 3)
            )
          ),
        },
      });
    }
  }

  // Create 20 orders from "已成交" customers
  const dealCustomers = customers.filter((c) => c.status === "已成交");
  // If fewer than 20 deal customers, fill with random ones
  const orderPool = dealCustomers.length >= 20
    ? dealCustomers.slice(0, 20)
    : [...dealCustomers, ...customers.filter(c => c.status !== "已成交" && c.status !== "无效客户").slice(0, 20 - dealCustomers.length)];

  const orderStatuses = ["待确认", "生产中", "待交付", "已完成"];
  for (let i = 0; i < Math.min(20, orderPool.length); i++) {
    const customer = orderPool[i];
    const orderDate = daysAgo(randInt(1, 30));
    const deliveryDate = new Date(orderDate);
    deliveryDate.setDate(deliveryDate.getDate() + randInt(15, 60));
    await prisma.order.create({
      data: {
        orderNo: `OD${String(Date.now()).slice(-6)}${String(i + 1).padStart(3, "0")}`,
        customerId: customer.id,
        productName: customer.productNeeds || pick(PRODUCTS),
        amount: randInt(3000, 80000),
        salespersonId: customer.salespersonId,
        orderDate,
        deliveryDate,
        status: pick(orderStatuses),
        notes: Math.random() > 0.6 ? "加急订单，客户要求尽快交付" : null,
      },
    });
  }

  console.log("Seed complete: 5 salespeople, 100 customers, 20 orders");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
