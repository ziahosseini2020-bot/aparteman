"use client";

import React from "react";
import { useApp } from "@/lib/store";
import { formatToman } from "@/lib/utils";
import {
  Wallet,
  TrendingDown,
  TrendingUp,
  Home,
  Users,
  Receipt,
  AlertTriangle,
  ArrowUpRight,
  ShieldAlert,
  Building2,
  Calendar
} from "lucide-react";

export const ManagerOverview: React.FC = () => {
  const { activeBuilding, units, invoices, expenses, otherRevenues, setActiveTab } = useApp();

  const currentUnits = units.filter((u) => u.buildingId === activeBuilding.id);
  const occupiedCount = currentUnits.filter((u) => u.isOccupied).length;
  const occupancyPercent = Math.round((occupiedCount / (currentUnits.length || 1)) * 100);

  // مجموع بدهی‌های واحدها
  const totalDebts = currentUnits
    .filter((u) => u.balance < 0)
    .reduce((acc, u) => acc + Math.abs(u.balance), 0);

  // کل هزینه‌های ثبت شده
  const totalExpenses = expenses
    .filter((e) => e.buildingId === activeBuilding.id)
    .reduce((acc, e) => acc + e.totalAmount, 0);

  // آخرین شارژ صادر شده
  const latestInvoice = invoices.find((i) => i.buildingId === activeBuilding.id);
  const latestPaidCount = latestInvoice?.items.filter((i) => i.isPaid).length || 0;
  const latestTotalCount = latestInvoice?.items.length || 1;
  const collectionRate = Math.round((latestPaidCount / latestTotalCount) * 100);

  return (
    <div className="space-y-6">
      
      {/* ردیف کارت‌های آماری کلیدی */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* کارت موجودی صندوق */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-500">موجودی صندوق ساختمان</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xl font-black text-slate-900 block">
              {formatToman(activeBuilding.fundBalance)}
            </span>
            <span className="text-[11px] font-medium text-emerald-600 flex items-center gap-1 mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              امور مالی و تنخواه‌گردان فعال
            </span>
          </div>
        </div>

        {/* بدهی‌های معوقه واحدها */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-500">مجموع بدهی معوقه واحدها</span>
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xl font-black text-red-600 block">
              {formatToman(totalDebts)}
            </span>
            <span className="text-[11px] font-medium text-slate-400 block mt-1">
              قابل وصول از طریق قبوض شارژ
            </span>
          </div>
        </div>

        {/* وضعیت واحدها و سکونت */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-500">واحدهای مسکونی / تجاری</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Home className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xl font-black text-slate-900 block">
              {currentUnits.length} واحد
            </span>
            <span className="text-[11px] font-medium text-blue-600 block mt-1">
              {occupiedCount} واحد پر ({occupancyPercent}٪ سکونت فعال)
            </span>
          </div>
        </div>

        {/* درصد وصول آخرین شارژ */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-500">وصول آخرین شارژ دوره‌ای</span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xl font-black text-purple-700 block">
              {collectionRate}٪ وصول شده
            </span>
            <span className="text-[11px] font-medium text-slate-400 block mt-1">
              {latestPaidCount} از {latestTotalCount} واحد تسویه کردند
            </span>
          </div>
        </div>

      </div>

      {/* دو ستون: آخرین رویدادهای مالی و بدهکارترین واحدها */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* بدهکارترین واحدها */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-black text-slate-800 text-sm flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-500" />
              واحدهای دارای مانده بدهی معوق
            </h3>
            <button
              onClick={() => setActiveTab("units")}
              className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1"
            >
              مشاهده همه واحدها
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {currentUnits
              .filter((u) => u.balance < 0)
              .map((u) => (
                <div
                  key={u.id}
                  className="p-3 bg-slate-50 rounded-xl flex items-center justify-between text-xs hover:bg-slate-100 transition-colors"
                >
                  <div>
                    <div className="font-bold text-slate-800">{u.title} ({u.residentName})</div>
                    <div className="text-[11px] text-slate-400">
                      موبایل: {u.residentMobile} • {u.blockName || "بلوک اصلی"}
                    </div>
                  </div>
                  <div className="text-left">
                    <span className="font-black text-red-600 block">
                      {formatToman(Math.abs(u.balance))}
                    </span>
                    <span className="text-[10px] text-slate-400">بدهی شارژ و هزینه</span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* آخرین هزینه‌ها و پرداخت‌های صندوق */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-black text-slate-800 text-sm flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-slate-600" />
              آخرین هزینه‌های ثبت شده در ساختمان
            </h3>
            <button
              onClick={() => setActiveTab("expenses")}
              className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1"
            >
              مشاهده همه هزینه‌ها
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {expenses
              .filter((e) => e.buildingId === activeBuilding.id)
              .slice(0, 4)
              .map((exp) => (
                <div
                  key={exp.id}
                  className="p-3 bg-slate-50 rounded-xl flex items-center justify-between text-xs hover:bg-slate-100 transition-colors"
                >
                  <div>
                    <div className="font-bold text-slate-800">{exp.title}</div>
                    <div className="text-[11px] text-slate-400">
                      روش: {exp.calculationMethod} • {exp.date}
                    </div>
                  </div>
                  <div className="text-left">
                    <span className="font-black text-red-600 block">
                      {formatToman(exp.totalAmount)}
                    </span>
                    <span className="text-[10px] text-slate-400">{exp.settlementMethod}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>

      </div>

      {/* اطلاعات بلوک‌ها و مشخصات ساختمان */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h3 className="font-black text-slate-800 text-sm mb-4 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-blue-600" />
          بلوک‌ها و ساختار مجتمع {activeBuilding.name}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {activeBuilding.blocks.map((blk) => (
            <div key={blk.id} className="p-4 bg-blue-50/40 border border-blue-100 rounded-xl">
              <span className="font-bold text-blue-900 text-sm block">{blk.name}</span>
              <div className="flex gap-4 text-xs text-slate-600 mt-2">
                <span>تعداد طبقات: <strong>{blk.floors}</strong></span>
                <span>ظرفیت واحدها: <strong>{blk.unitsCount}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
