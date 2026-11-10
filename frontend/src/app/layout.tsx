import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/lib/store";

export const metadata: Metadata = {
  title: "سَـرابـان | سامانه جامع مدیریت هوشمند ساختمان و مجتمع‌ها (saraband.ir)",
  description: "سامانه مدیریت شارژ، تسهیم هزینه‌ها، کنتورخوانی، حسابداری دوبل و اتصال به پیام‌رسان بله",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <body className="antialiased min-h-screen bg-slate-50 flex flex-col text-slate-800">
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
