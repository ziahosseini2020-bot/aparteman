import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/lib/store";

export const metadata: Metadata = {
  title: "سامانه مدیریت ساختمان و آپارتمان",
  description: "سامانه جامع مدیریت ساختمان، شارژ، کنتورخوانی و امور مالی آپارتمان‌ها",
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
