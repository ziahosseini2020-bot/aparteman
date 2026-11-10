"use client";

import React, { useState } from "react";
import { useApp } from "@/lib/store";
import { Charge } from "@/lib/mockData";
import { formatToman } from "@/lib/utils";
import {
  Receipt,
  Plus,
  Calendar,
  AlertTriangle,
  Calculator,
  Users,
  CheckCircle2,
  Clock,
  Eye,
  CreditCard,
  ChevronDown,
  Layers,
  Send,
  Maximize2
} from "lucide-react";

export const ChargeIssuanceModal: React.FC = () => {
  const { charges, createCharge, units, activeBuilding, currentRole, sendBaleNotification } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<"list" | "create">("list");
  const [selectedCharge, setSelectedCharge] = useState<Charge | null>(charges[0] || null);

  // فرم صدور شارژ
  const [title, setTitle] = useState("شارژ ماهیانه آبان‌ماه ۱۴۰۵");
  const [description, setDescription] = useState("شارژ عمومی شامل نظافت، روشنایی مشاعات، سرویس آسانسور و سرایداری");
  const [calculationMethod, setCalculationMethod] = useState<Charge["calculationMethod"]>("default_charge");
  const [dueDateDays, setDueDateDays] = useState(10);
  const [penaltyType, setPenaltyType] = useState<"daily_fixed" | "daily_percentage">("daily_fixed");
  const [dailyPenaltyAmount, setDailyPenaltyAmount] = useState(25000);
  const [penaltyPercentage, setPenaltyPercentage] = useState(0.5);

  // پارامترهای مدل‌های محاسباتی
  const [baseAmount, setBaseAmount] = useState(400000); // مبلغ ثابت
  const [areaRate, setAreaRate] = useState(4000); // تومان به ازای هر متر
  const [occupantRate, setOccupantRate] = useState(80000); // تومان به ازای هر نفر
  const [payerTarget, setPayerTarget] = useState<Charge["payerTarget"]>("residents");
  const [targetUnitsScope, setTargetUnitsScope] = useState<Charge["targetUnitsScope"]>("all");

  const currentUnits = units.filter((u) => u.buildingId === activeBuilding.id);

  // محاسبه پیش‌نمایش زنده مبلغ هر واحد
  const calculatePreviewAmount = (unit: typeof units[0]): number => {
    const area = unit.area;
    const occupants = unit.peopleCount || 1;
    const defaultCharge = unit.defaultChargeAmount || 450000;

    switch (calculationMethod) {
      case "equal":
        return baseAmount;
      case "fixed":
        return baseAmount;
      case "area":
        return area * areaRate;
      case "resident":
        return occupants * occupantRate;
      case "area_resident":
        return (area * areaRate) + (occupants * occupantRate);
      case "default_charge":
        return defaultCharge;
      default:
        return defaultCharge;
    }
  };

  const previewTargetUnits = currentUnits.filter((u) => {
    if (targetUnitsScope === "occupied") return u.residentialStatus !== "خالی";
    if (targetUnitsScope === "empty") return u.residentialStatus === "خالی";
    return true;
  });

  const totalPreviewAmount = previewTargetUnits.reduce((acc, u) => acc + calculatePreviewAmount(u), 0);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createCharge({
      title,
      description,
      calculationMethod,
      issueDate: "۱۴۰۵/۰۸/۰۱",
      dueDate: `۱۴۰۵/۰۸/${(1 + dueDateDays).toString().padStart(2, "0")}`,
      dueDateDays,
      status: "issued",
      fineType: penaltyType === "daily_fixed" ? "price" : "percent",
      fineAmount: penaltyType === "daily_fixed" ? dailyPenaltyAmount : penaltyPercentage,
      penaltyType,
      dailyPenaltyAmount,
      penaltyPercentage,
      payerTarget,
      targetUnitsScope
    });

    setActiveSubTab("list");
  };

  const buildingCharges = charges.filter((c) => c.buildingId === activeBuilding.id);

  return (
    <div className="space-y-6">
      
      {/* هدر و تب‌های داخلی */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-emerald-600" />
            سیستم هوشمند صدور و وصول شارژ واحدها
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            پشتیبانی از ۶ مدل تسهیم (متراژ، نفرات، پیش‌فرض، ترکیبی)، جریمه دیرکرد روزانه و تفکیک ساکن/مالک
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab("list")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === "list"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            لیست قبوض دوره‌ای
          </button>
          <button
            onClick={() => setActiveSubTab("create")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === "create"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
            }`}
          >
            <Plus className="w-4 h-4" />
            صدور شارژ دوره جدید
          </button>
        </div>
      </div>

      {activeSubTab === "list" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* ستون راست: لیست دوره‌های شارژ */}
          <div className="lg:col-span-1 space-y-3">
            <span className="text-xs font-bold text-slate-500 block px-1">دوره‌های شارژ صادر شده:</span>
            {buildingCharges.map((chg) => {
              const percent = chg.totalAmount > 0 ? Math.round((chg.totalCollected / chg.totalAmount) * 100) : 0;
              const isSelected = selectedCharge?.id === chg.id;

              return (
                <div
                  key={chg.id}
                  onClick={() => setSelectedCharge(chg)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? "border-emerald-500 bg-emerald-50/50 shadow-sm ring-2 ring-emerald-500/20"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-slate-900 text-xs sm:text-sm">{chg.title}</h3>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-mono">
                      {chg.issueDate}
                    </span>
                  </div>

                  <div className="mt-3 flex justify-between items-baseline text-xs">
                    <span className="text-slate-500">مجموع دوره:</span>
                    <span className="font-bold text-slate-800">{formatToman(chg.totalAmount)}</span>
                  </div>

                  <div className="mt-1 flex justify-between items-baseline text-xs">
                    <span className="text-slate-500">وصول شده:</span>
                    <span className="font-bold text-emerald-600">{formatToman(chg.totalCollected)} ({percent}٪)</span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-3">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all"
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ستون چپ: ریز قبوض واحدهای دوره انتخاب‌شده */}
          <div className="lg:col-span-2">
            {selectedCharge ? (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="font-black text-slate-800 text-sm">{selectedCharge.title}</h3>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 mt-1">
                      <span>مهلت پرداخت: {selectedCharge.dueDate}</span>
                      <span>•</span>
                      <span>
                        جریمه دیرکرد: {selectedCharge.fineType === "price" || selectedCharge.penaltyType === "daily_fixed"
                          ? `${new Intl.NumberFormat("fa-IR").format(selectedCharge.fineAmount || selectedCharge.dailyPenaltyAmount || 0)} تومان/روز`
                          : `${selectedCharge.fineAmount || selectedCharge.penaltyPercentage || 0}٪ در روز`}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      sendBaleNotification(
                        "اهالی ساختمان",
                        `یادآوری سرابان: قبض شارژ دوره ${selectedCharge.title} صادر شده است. لطفاً نسبت به بررسی و پرداخت آن از طریق ربات اقدام فرمایید.`
                      );
                    }}
                    className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    ارسال یادآوری در ربات بله
                  </button>
                </div>

                {/* جدول اقلام شارژ واحدها */}
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">واحد</th>
                        <th className="p-2.5">پرداخت‌کننده</th>
                        <th className="p-2.5">مبلغ شارژ</th>
                        <th className="p-2.5">جریمه دیرکرد</th>
                        <th className="p-2.5">پرداخت‌شده</th>
                        <th className="p-2.5">وضعیت تسویه</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedCharge.items.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-2.5 font-bold text-slate-800">{item.unitTitle}</td>
                          <td className="p-2.5 text-slate-600">
                            <div>{item.payerName}</div>
                            <span className="text-[10px] text-slate-400 font-mono">{item.payerMobile}</span>
                          </td>
                          <td className="p-2.5 font-bold text-slate-700">{formatToman(item.amount)}</td>
                          <td className="p-2.5 text-red-500 font-mono">
                            {item.fineAmount > 0 ? formatToman(item.fineAmount) : "-"}
                          </td>
                          <td className="p-2.5 text-emerald-600 font-bold">
                            {item.paidAmount > 0 ? formatToman(item.paidAmount) : "۰"}
                          </td>
                          <td className="p-2.5">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              item.settlementStatus === "paid"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : item.settlementStatus === "partially_paid"
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-red-50 text-red-600 border border-red-200"
                            }`}>
                              {item.settlementStatus === "paid" ? "تسویه شده ✓" : item.settlementStatus === "partially_paid" ? "ناقص" : "پرداخت نشده"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-400">
                یک دوره شارژ را برای مشاهده انتخاب کنید.
              </div>
            )}
          </div>

        </div>
      ) : (
        /* فرم صدور شارژ دوره جدید با ۶ مدل محاسبه */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="font-black text-slate-900 text-base">فرمول‌بندی و صدور شارژ دوره جدید</h3>
            <p className="text-xs text-slate-500 mt-1">
              مدل محاسبه موردنظر خود را انتخاب کنید تا مبالغ هر واحد به صورت زنده محاسبه شوند.
            </p>
          </div>

          <form onSubmit={handleCreateSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">عنوان دوره شارژ</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">مهلت پرداخت (تعداد روز)</label>
                <input
                  type="number"
                  value={dueDateDays}
                  onChange={(e) => setDueDateDays(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-center"
                />
              </div>
            </div>

            {/* مدل محاسبه ۶ گانه */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">مدل محاسبه و تسهیم شارژ:</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {[
                  { id: "default_charge", title: "شارژ پیش‌فرض واحدها", desc: "استفاده از مبلغ تعیین‌شده در جدول واحدها" },
                  { id: "equal", title: "مساوی برای تمام واحدها", desc: "تقسیم مبلغ کل یا نرخ یکسان برای همه" },
                  { id: "area", title: "بر اساس متراژ واحدها", desc: "ضرب متراژ در نرخ مصوب هر متر مربع" },
                  { id: "resident", title: "بر اساس تعداد نفرات", desc: "ضرب تعداد نفرات ساکن در نرخ هر نفر" },
                  { id: "area_resident", title: "ترکیبی متراژ و نفرات (با ضرایب وزنی)", desc: "نرخ هر متر + نرخ هر نفر ساکن" },
                  { id: "fixed", title: "مبلغ ثابت دلخواه", desc: "تعیین یک مبلغ ثابت مشخص برای همه" }
                ].map((item) => (
                  <label
                    key={item.id}
                    onClick={() => setCalculationMethod(item.id as any)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                      calculationMethod === item.id
                        ? "border-emerald-500 bg-emerald-50/70 shadow-sm ring-1 ring-emerald-500"
                        : "border-slate-200 bg-white hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-800">{item.title}</span>
                      <input
                        type="radio"
                        checked={calculationMethod === item.id}
                        onChange={() => setCalculationMethod(item.id as any)}
                        className="accent-emerald-600"
                      />
                    </div>
                    <span className="text-[11px] text-slate-400 mt-1">{item.desc}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* ورودی‌های متغیر بر اساس مدل انتخابی */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {(calculationMethod === "equal" || calculationMethod === "fixed") && (
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">مبلغ ثابت برای هر واحد (تومان)</label>
                  <input
                    type="number"
                    value={baseAmount}
                    onChange={(e) => setBaseAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-center"
                  />
                </div>
              )}

              {(calculationMethod === "area" || calculationMethod === "area_resident") && (
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">نرخ هر متر مربع (تومان)</label>
                  <input
                    type="number"
                    value={areaRate}
                    onChange={(e) => setAreaRate(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-center"
                  />
                </div>
              )}

              {(calculationMethod === "resident" || calculationMethod === "area_resident") && (
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">نرخ هر نفر ساکن (تومان)</label>
                  <input
                    type="number"
                    value={occupantRate}
                    onChange={(e) => setOccupantRate(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-center"
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">واحدهای مشمول</label>
                <select
                  value={targetUnitsScope}
                  onChange={(e) => setTargetUnitsScope(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                >
                  <option value="all">همه واحدهای مجتمع</option>
                  <option value="occupied">فقط واحدهای پر (سکونت فعال)</option>
                  <option value="empty">فقط واحدهای خالی</option>
                  <option value="custom">چند واحد خاص انتخابی</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">پرداخت‌کننده</label>
                <select
                  value={payerTarget}
                  onChange={(e) => setPayerTarget(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                >
                  <option value="residents">ساکنین (مستأجر یا مالک‌نشین)</option>
                  <option value="owners">فقط مالکین واحدها</option>
                  <option value="both">تسهیم بین هر دو</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">نوع جریمه دیرکرد</label>
                <select
                  value={penaltyType}
                  onChange={(e) => setPenaltyType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                >
                  <option value="daily_fixed">مبلغ ثابت روزانه (تومان)</option>
                  <option value="daily_percentage">درصد روزانه بر مانده شارژ</option>
                </select>
              </div>
            </div>

            {/* پیش‌نمایش زنده مبالغ و صدور نهایی */}
            <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-xs text-emerald-900">
                  پیش‌نمایش صدور برای {previewTargetUnits.length} واحد:
                </span>
                <span className="font-black text-sm text-emerald-800">
                  مجموع قابل وصول: {formatToman(totalPreviewAmount)}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-40 overflow-y-auto pr-1">
                {previewTargetUnits.map((u) => (
                  <div key={u.id} className="p-2 bg-white rounded-lg border border-emerald-100 text-[11px] flex justify-between">
                    <span className="font-bold text-slate-700">{u.name}</span>
                    <span className="text-emerald-700 font-bold">{formatToman(calculatePreviewAmount(u))}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                تایید نهایی و صدور قبوض دوره (ثبت در دفتر معین و ارسال در بله)
              </button>
              <button
                type="button"
                onClick={() => setActiveSubTab("list")}
                className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all"
              >
                انصراف
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
