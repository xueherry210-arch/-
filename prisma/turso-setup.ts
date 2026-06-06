import "dotenv/config";
import { createClient } from "@libsql/client";

const url = process.env.TURSO_DATABASE_URL!;
const token = process.env.TURSO_AUTH_TOKEN!;

const client = createClient({ url, authToken: token });

const SQL = `
CREATE TABLE IF NOT EXISTS Salesperson (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  phone TEXT
);

CREATE TABLE IF NOT EXISTS Customer (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  wechat TEXT,
  source TEXT NOT NULL DEFAULT '到店',
  productNeeds TEXT,
  notes TEXT,
  images TEXT NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT '新咨询',
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  lastFollowUpAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  salespersonId INTEGER NOT NULL REFERENCES Salesperson(id)
);

CREATE TABLE IF NOT EXISTS FollowUp (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customerId INTEGER NOT NULL REFERENCES Customer(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT '跟进',
  amount REAL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Order" (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  orderNo TEXT NOT NULL UNIQUE,
  customerId INTEGER NOT NULL REFERENCES Customer(id),
  productName TEXT NOT NULL,
  amount REAL NOT NULL,
  salespersonId INTEGER NOT NULL REFERENCES Salesperson(id),
  orderDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deliveryDate DATETIME,
  status TEXT NOT NULL DEFAULT '待确认',
  notes TEXT,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
`;

async function main() {
  console.log("Creating tables on Turso...");
  const statements = SQL.split(";").filter((s) => s.trim());
  for (const stmt of statements) {
    await client.execute(stmt.trim() + ";");
  }
  console.log("Tables created successfully!");

  // Insert salespeople
  const salespeople = [
    { name: "张三", phone: "13800001001" },
    { name: "李四", phone: "13800001002" },
    { name: "王五", phone: "13800001003" },
    { name: "赵六", phone: "13800001004" },
    { name: "陈七", phone: "13800001005" },
  ];
  for (const sp of salespeople) {
    await client.execute({
      sql: "INSERT INTO Salesperson (name, phone) VALUES (?, ?)",
      args: [sp.name, sp.phone],
    });
  }
  console.log("Salespeople inserted!");

  // Insert 100 demo customers
  const sources = ["抖音", "视频号", "到店", "转介绍", "老客户", "其他"];
  const statuses = ["新咨询", "已联系", "已报价", "高意向", "已成交", "无效客户"];
  const products = ["实木衣柜", "推拉门", "断桥铝窗", "橱柜定制", "书柜", "榻榻米", "衣帽间", "酒柜", "电视柜"];
  const firstNames = ["王", "李", "张", "刘", "陈", "杨", "赵", "黄", "周", "吴", "徐", "孙", "胡", "朱", "高"];
  const lastNames = ["伟", "芳", "娜", "秀英", "敏", "静", "丽", "强", "磊", "军", "洋", "勇", "艳", "杰", "娟"];

  const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
  const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

  for (let i = 0; i < 100; i++) {
    const name = pick(firstNames) + pick(lastNames);
    const source = pick(sources);
    const status = pick(statuses);
    const daysAgo = randInt(0, 60);
    const followDaysAgo = status === "新咨询" ? daysAgo : randInt(0, 18);
    const d = new Date();
    const created = new Date(d.getTime() - daysAgo * 86400000).toISOString();
    const followed = new Date(d.getTime() - followDaysAgo * 86400000).toISOString();

    await client.execute({
      sql: `INSERT INTO Customer (name, phone, wechat, source, productNeeds, status, createdAt, lastFollowUpAt, salespersonId)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        name,
        `1${randInt(30, 99)}${randInt(10000000, 99999999)}`,
        Math.random() > 0.3 ? `wx_${name}_${randInt(100, 999)}` : null,
        source,
        pick(products),
        status,
        created,
        followed,
        randInt(1, 5),
      ],
    });
  }
  console.log("100 customers inserted!");

  // 20 orders for "已成交" customers
  const orderResult = await client.execute("SELECT id FROM Customer WHERE status = '已成交' LIMIT 20");
  const orderStatuses = ["待确认", "生产中", "待交付", "已完成"];
  for (const row of orderResult.rows) {
    const customerId = row.id;
    for (let j = 0; j < Math.min(1, randInt(1, 1)); j++) {
      const orderDate = new Date(Date.now() - randInt(1, 30) * 86400000).toISOString();
      const deliveryDate = new Date(Date.now() + randInt(15, 60) * 86400000).toISOString();
      await client.execute({
        sql: `INSERT INTO "Order" (orderNo, customerId, productName, amount, salespersonId, orderDate, deliveryDate, status)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          `OD${Date.now()}${randInt(100, 999)}`,
          customerId,
          pick(products),
          randInt(3000, 80000),
          randInt(1, 5),
          orderDate,
          deliveryDate,
          pick(orderStatuses),
        ],
      });
    }
  }
  console.log("Orders inserted!");
  console.log("Setup complete!");
}

main()
  .catch(console.error)
  .finally(() => process.exit(0));
