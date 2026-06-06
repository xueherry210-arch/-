import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "客户成交看板",
  description: "家具建材行业客户管理与成交追踪系统",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="h-full bg-slate-50" suppressHydrationWarning>
        <Sidebar />
        {/* Main content area */}
        <main className="lg:pl-60 pt-14 lg:pt-0 min-h-full">
          <div className="max-w-[1400px] mx-auto p-4 lg:p-6">{children}</div>
        </main>
      </body>
    </html>
  );
}
