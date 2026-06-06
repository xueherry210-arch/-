"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Crown,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const menuItems = [
  { href: "/", label: "仪表盘", icon: LayoutDashboard },
  { href: "/customers", label: "客户管理", icon: Users },
  { href: "/orders", label: "订单管理", icon: ClipboardList },
  { href: "/boss", label: "老板看板", icon: Crown },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between bg-indigo-600 text-white px-4 py-3 shadow-md">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 -ml-2 rounded-lg hover:bg-indigo-700"
          aria-label="打开菜单"
        >
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold tracking-wide">客户成交看板</h1>
        <div className="w-10" />
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div
        className={cn(
          "lg:hidden fixed top-0 left-0 bottom-0 z-50 w-64 bg-white shadow-2xl transform transition-transform duration-200",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b">
          <h2 className="text-lg font-bold text-indigo-600">客户成交看板</h2>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1 rounded-lg hover:bg-gray-100"
            aria-label="关闭菜单"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="p-3 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors",
                  active
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:z-20 lg:w-60 lg:bg-white lg:border-r lg:border-gray-200">
        <div className="flex items-center h-16 px-6 border-b border-gray-100">
          <h1 className="text-xl font-bold text-indigo-600 tracking-wide">
            客户成交看板
          </h1>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors",
                  active
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="px-6 py-4 border-t border-gray-100 text-xs text-gray-400">
          客户成交看板 v1.0
        </div>
      </aside>
    </>
  );
}
