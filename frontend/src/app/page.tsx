"use client";

import React from "react";
import { useApp } from "@/lib/store";
import { Navbar } from "@/components/Navbar";
import { LoginModal } from "@/components/LoginModal";
import { BuildingRegistrationModal } from "@/components/BuildingRegistrationModal";
import { ManagerOverview } from "@/components/ManagerOverview";
import { UnitManagement } from "@/components/UnitManagement";
import { ChargeIssuanceModal } from "@/components/ChargeIssuanceModal";
import { ExpenseManagement } from "@/components/ExpenseManagement";
import { AccountingTransactions } from "@/components/AccountingTransactions";
import { ReportsModal } from "@/components/ReportsModal";
import { BaleBotIntegration } from "@/components/BaleBotIntegration";
import { ResidentPortal } from "@/components/ResidentPortal";
import {
  LayoutDashboard,
  Home,
  Receipt,
  TrendingDown,
  UserCheck,
  Shield,
  PlusCircle,
  HelpCircle,
  Sparkles,
  CreditCard,
  FileText,
  MessageSquare,
  Building2
} from "lucide-react";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const {
    isLoggedIn,
    currentRole,
    userRoles,
    switchRole,
    activeTab,
    setActiveTab,
    setIsNewBuildingModalOpen,
    setIsLoginModalOpen
  } = useApp();

  const isManager = currentRole?.role === "مدیر ساختمان" || currentRole?.role === "مدیر بلوک";

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      
      {/* نوار ناوبری اصلی سرابان */}
      <Navbar />

      {/* بنر سوییچ سریع نقش‌ها برای کارفرما و ارائه دمو */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-emerald-950 text-white text-xs py-2 px-4 shadow-inner border-b border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-right">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-[11px] font-bold text-slate-200">
              شبیه‌ساز نقش‌های سرابان: با یک کلیک بین ۴ نقش اصلی جابجا شوید:
            </span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
            {userRoles.map((r, idx) => (
              <button
                key={idx}
                onClick={() => switchRole(r)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all shrink-0 ${
                  currentRole?.role === r.role && currentRole?.unitId === r.unitId
                    ? "bg-emerald-500 text-white shadow-sm ring-1 ring-emerald-300"
                    : "bg-white/10 text-white/80 hover:bg-white/20"
                }`}
              >
                {r.role} {r.unitTitle ? `(${r.unitTitle})` : r.blockName ? `(${r.blockName})` : ""}
              </button>
            ))}
            <button
              onClick={() => setIsNewBuildingModalOpen(true)}
              className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 transition-all flex items-center gap-1 shrink-0"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              تعریف ساختمان جدید
            </button>
          </div>
        </div>
      </div>

      {/* بدنه اصلی صفحات سامانه */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        
        {isManager ? (
          <>
            {/* ناوبری تب‌های مدیریت مجتمع */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-1.5 flex flex-wrap gap-1">
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "dashboard"
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                داشبورد و آمار مالی
              </button>
              <button
                onClick={() => setActiveTab("units")}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "units"
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Home className="w-4 h-4" />
                واحدها، بلوک‌ها و مالکان
              </button>
              <button
                onClick={() => setActiveTab("billing")}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "billing"
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Receipt className="w-4 h-4" />
                صدور و تسهیم شارژ (۶ مدل)
              </button>
              <button
                onClick={() => setActiveTab("expenses")}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "expenses"
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <TrendingDown className="w-4 h-4" />
                هزینه‌ها (۳ سناریو) و کنتورخوانی
              </button>
              <button
                onClick={() => setActiveTab("accounting")}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "accounting"
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <CreditCard className="w-4 h-4" />
                حساب‌ها، تراکنش‌ها و دفتر معین
              </button>
              <button
                onClick={() => setActiveTab("reports")}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "reports"
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <FileText className="w-4 h-4" />
                گزارش‌های جامع و ترازنامه
              </button>
              <button
                onClick={() => setActiveTab("bale")}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "bale"
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                ربات پیام‌رسان بله
              </button>
            </div>

            {/* محتوای تب فعال مدیر */}
            {activeTab === "dashboard" && <ManagerOverview />}
            {activeTab === "units" && <UnitManagement />}
            {activeTab === "billing" && <ChargeIssuanceModal />}
            {activeTab === "expenses" && <ExpenseManagement />}
            {activeTab === "accounting" && <AccountingTransactions />}
            {activeTab === "reports" && <ReportsModal />}
            {activeTab === "bale" && <BaleBotIntegration />}
          </>
        ) : (
          /* پورتال اختصاصی ساکنین و مالکین */
          <ResidentPortal />
        )}

      </main>

      {/* فوتر رسمی سامانه سرابان */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">سامانه سرابان (saraband.ir)</span>
            <span>•</span>
            <span>بک‌اند: معماری ماژولار لاراول (Modular Monolith) با دیتابیس MySQL و Laratrust</span>
            <span>•</span>
            <span>فرانت‌اند: Next.js + daisyUI + Tailwind CSS (RTL)</span>
          </div>
          <div className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            نسخه ابری فعال بدون نیاز به رمز یا پروکسی
          </div>
        </div>
      </footer>

      {/* مودال‌های سیستمی */}
      <LoginModal />
      <BuildingRegistrationModal />

    </div>
  );
}
