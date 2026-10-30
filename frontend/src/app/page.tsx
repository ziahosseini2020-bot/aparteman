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
  Sparkles
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

  const isManager = currentRole?.role === "مدیر ساختمان";

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      
      {/* نوار ناوبری اصلی */}
      <Navbar />

      {/* بنر راهنمای تست دمو برای ارائه به کارفرما / شخص سوم */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white text-xs py-2.5 px-4 shadow-inner">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-right">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>راهنمای تست دمو:</strong> می‌توانید با کلیک بر روی نقش‌های زیر، نمای هر کاربر را شبیه‌سازی کنید:
            </span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto">
            {userRoles.map((r, idx) => (
              <button
                key={idx}
                onClick={() => switchRole(r)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  currentRole?.role === r.role && currentRole?.unitId === r.unitId
                    ? "bg-blue-500 text-white shadow-sm"
                    : "bg-white/10 text-white/80 hover:bg-white/20"
                }`}
              >
                {r.role} {r.unitTitle ? `(${r.unitTitle})` : ""}
              </button>
            ))}
            <button
              onClick={() => setIsNewBuildingModalOpen(true)}
              className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 transition-all flex items-center gap-1"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              تست تعریف ساختمان جدید
            </button>
          </div>
        </div>
      </div>

      {/* بدنه اصلی */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        
        {isManager ? (
          <>
            {/* ناوبری تب‌های مدیر ساختمان */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-1.5 flex flex-wrap gap-1">
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "dashboard"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                داشبورد و آمار مالی
              </button>
              <button
                onClick={() => setActiveTab("units")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "units"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Home className="w-4 h-4" />
                مدیریت واحدها (تکی و اکسل)
              </button>
              <button
                onClick={() => setActiveTab("billing")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "billing"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Receipt className="w-4 h-4" />
                صدور و وصول شارژ واحدها
              </button>
              <button
                onClick={() => setActiveTab("expenses")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "expenses"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <TrendingDown className="w-4 h-4" />
                هزینه‌ها، کنتورخوانی و درآمدها
              </button>
            </div>

            {/* محتوای تب فعال مدیر */}
            {activeTab === "dashboard" && <ManagerOverview />}
            {activeTab === "units" && <UnitManagement />}
            {activeTab === "billing" && <ChargeIssuanceModal />}
            {activeTab === "expenses" && <ExpenseManagement />}
          </>
        ) : (
          /* پورتال ساکنین / مالکین */
          <ResidentPortal />
        )}

      </main>

      {/* فوتر */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">سامانه مدیریت ساختمان (پروتوتایپ آپارتمانا)</span>
            <span>•</span>
            <span>معماری Modular Monolith لاراول + فرانت‌اند Next.js</span>
          </div>
          <div className="text-[11px] text-slate-400">
            آماده برای ارائه نسخه آنلاین و دریافت بازخورد
          </div>
        </div>
      </footer>

      {/* مودال‌های سیستمی */}
      <LoginModal />
      <BuildingRegistrationModal />

    </div>
  );
}
