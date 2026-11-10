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
  Calendar,
  CreditCard,
  Layers,
  Send,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowDownLeft,
  FileSpreadsheet
} from "lucide-react";

export const ManagerOverview: React.FC = () => {
  const {
    activeBuilding,
    units,
    charges,
    expenses,
    incomes,
    accounts,
    transactions,
    ledgerEntries,
    setActiveTab,
    currentRole,
    sendBaleNotification
  } = useApp();

  const currentUnits = units.filter((u) => u.buildingId === activeBuilding.id);
  const occupiedCount = currentUnits.filter((u) => u.residentialStatus !== "خالی").length;
  const occupancyPercent = Math.round((occupiedCount / (currentUnits.length || 1)) * 100);

  // مجموع بدهی‌های معوقه واحدها
  const debtorUnits = currentUnits.filter((u) => u.currentBalance < 0);
  const totalDebts = debtorUnits.reduce((acc, u) => acc + Math.abs(u.currentBalance), 0);

  // حساب‌های مالی مجتمع (بانک، صندوق، تنخواه)
  const currentAccounts = accounts.filter((a) => a.buildingId === activeBuilding.id);
  const totalBankBalance = currentAccounts
    .filter((a) => a.accountType === "bank")
    .reduce((sum, a) => sum + a.currentBalance, 0);
  const totalCashBalance = currentAccounts
    .filter((a) => a.accountType === "cash" || a.accountType === "petty_cash")
    .reduce((sum, a) => sum + a.currentBalance, 0);
  const totalLiquid = totalBankBalance + totalCashBalance;

  // نرخ وصول شارژ آخرین دوره
  const latestCharge = charges.find((c) => c.buildingId === activeBuilding.id);
  const collectionRate = latestCharge && latestCharge.totalAmount > 0
    ? Math.round((latestCharge.totalCollected / latestCharge.totalAmount) * 100)
    : 0;

  // کل هزینه‌های دوره
  const totalBuildingExpenses = expenses
    .filter((e) => e.buildingId === activeBuilding.id)
    .reduce((sum, e) => sum + e.totalAmount, 0);

  return (
    <div className="space-y-6">
      
      {/* پیام و وضعیت نقش فعال */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 rounded-2xl p-5 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
              {currentRole?.role}
            </span>
            <span className="text-xs text-white/70">
              مجتمع {activeBuilding.name} ({activeBuilding.blocks.length > 0 ? `${activeBuilding.blocks.length} بلوک` : "تک‌بلوک"})
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black">داشبورد هوشمند سرابان</h2>
          <p className="text-xs text-emerald-100/80 mt-1">
            انطباق کامل با اصول ۴ گانه مالی: صدور شارژ و تفکیک هزینه تغییری در نقدینگی ایجاد نکرده و فقط تراکنش‌های تاییدشده بر حساب‌ها اثر می‌گذارند.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveTab("billing")}
            className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
          >
            <Receipt className="w-4 h-4" />
            صدور شارژ دوره
          </button>
          <button
            onClick={() => setActiveTab("expenses")}
            className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <TrendingDown className="w-4 h-4" />
            ثبت هزینه (۳ سناریو)
          </button>
          <button
            onClick={() => setActiveTab("accounting")}
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md"
          >
            <CreditCard className="w-4 h-4" />
            تراکنش و دفتر معین
          </button>
        </div>
      </div>

      {/* ردیف کارت‌های آماری شاخص‌های کلیدی (daisyUI Stats) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* ۱. موجودی نقدینگی (بانک + صندوق + تنخواه) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-emerald-300 transition-all">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-bold text-slate-500 block">نقدینگی در دسترس مجتمع</span>
              <span className="text-[11px] text-slate-400">بانک + صندوق + تنخواه‌گردان</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xl font-black text-slate-900 block">
              {formatToman(totalLiquid)}
            </span>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
              <span>بانک: {formatToman(totalBankBalance)}</span>
              <span>صندوق/تنخواه: {formatToman(totalCashBalance)}</span>
            </div>
          </div>
        </div>

        {/* ۲. بدهی معوقه واحدها (مطالبات مجتمع) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden hover:border-red-300 transition-all">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-bold text-slate-500 block">کل مطالبات معوقه از واحدها</span>
              <span className="text-[11px] text-red-500 font-medium">{debtorUnits.length} واحد بدهکار</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xl font-black text-red-600 block">
              {formatToman(totalDebts)}
            </span>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
              <span>تسهیم شارژ و جریمه روزانه فعال</span>
              <button
                onClick={() => setActiveTab("reports")}
                className="text-red-600 font-bold hover:underline"
              >
                مشاهده لیست بدهکاران
              </button>
            </div>
          </div>
        </div>

        {/* ۳. وضعیت واحدها و سکونت */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden hover:border-blue-300 transition-all">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-bold text-slate-500 block">واحدهای مجتمع ({activeBuilding.blocks.length} بلوک)</span>
              <span className="text-[11px] text-blue-600 font-medium">{occupancyPercent}٪ سکونت فعال</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Home className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xl font-black text-slate-900 block">
              {currentUnits.length} واحد ثبت‌شده
            </span>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
              <span>پر: {occupiedCount} واحد</span>
              <span>خالی: {currentUnits.length - occupiedCount} واحد</span>
            </div>
          </div>
        </div>

        {/* ۴. نرخ وصول شارژ آخرین دوره */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden hover:border-teal-300 transition-all">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-bold text-slate-500 block">نرخ وصول شارژ دوره</span>
              <span className="text-[11px] text-teal-600 font-medium">{latestCharge?.title || "دوره جاری"}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-black text-slate-900 block">
                {collectionRate}٪ وصول شده
              </span>
              <span className="text-xs font-bold text-slate-500">
                {formatToman(latestCharge?.totalCollected || 0)}
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-3">
              <div
                className="bg-teal-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, collectionRate))}%` }}
              ></div>
            </div>
          </div>
        </div>

      </div>

      {/* بخش سناریوهای سه‌گانه هزینه‌ها و اصول حسابداری سرابان */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-black text-slate-800 text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              سناریوهای استاندارد تسهیم و پرداخت هزینه‌ها در سرابان
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              مدیر ساختمان می‌تواند هزینه‌ها را مطابق یکی از ۳ سناریوی رسمی ثبت و پیگیری کند:
            </p>
          </div>
          <button
            onClick={() => setActiveTab("expenses")}
            className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors shrink-0"
          >
            ورود به بخش هزینه‌ها و کنتورخوانی ←
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">۱</span>
              <span className="font-bold text-xs text-slate-800">پرداخت از صندوق، سپس تسهیم</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              هزینه ابتدا از حساب/تنخواه ساختمان پرداخت می‌شود؛ سپس مبلغ بین واحدها تسهیم و واحدهای منتفع در دفتر معین بدهکار می‌شوند تا بدهی خود را پرداخت کنند.
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center">۲</span>
              <span className="font-bold text-xs text-slate-800">تسهیم و وصول اول، سپس پرداخت</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              هزینه‌های سنگین (مانند تعمیرات اساسی آسانسور یا موتورخانه) ابتدا بین واحدها اعلام و در قبوض ثبت می‌شود؛ پس از وصول مبالغ از اهالی، به پیمانکار پرداخت می‌گردد.
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">۳</span>
              <span className="font-bold text-xs text-slate-800">پرداخت مستقیم بدون تسهیم به اهالی</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              هزینه‌های جاری که از قبل در شارژ ماهیانه دیده شده‌اند (مثل خرید لامپ، نظافت دوره‌ای یا انعام سرایدار) مستقیماً از صندوق پرداخت شده و هیچ بدهی اضافی برای واحدها ایجاد نمی‌شود.
            </p>
          </div>
        </div>
      </div>

      {/* دو ستون: آخرین تراکنش‌های مالی واقعی + واحدهای دارای بدهی معوقه */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* ستون ۱: آخرین تراکنش‌های ثبت شده در حساب‌های مالی (جدول Transactions) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                تراکنش‌های واقعی حساب‌های مالی (بانک و صندوق)
              </h3>
              <span className="text-[11px] text-slate-400">فقط این رخدادها موجودی واقعی حساب‌ها را تغییر می‌دهند</span>
            </div>
            <button
              onClick={() => setActiveTab("accounting")}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-800"
            >
              همه تراکنش‌ها
            </button>
          </div>

          <div className="space-y-2.5">
            {transactions.slice(0, 5).map((tx) => (
              <div
                key={tx.id}
                className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between hover:bg-slate-50 transition-colors text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${
                    tx.type === "receipt" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                  }`}>
                    {tx.type === "receipt" ? <ArrowDownLeft className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="font-bold text-slate-800">{tx.description}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {tx.accountName} • طرف حساب: {tx.payerOrPayeeName}
                    </div>
                  </div>
                </div>

                <div className="text-left">
                  <span className={`font-black text-sm block ${
                    tx.type === "receipt" ? "text-emerald-600" : "text-slate-800"
                  }`}>
                    {tx.type === "receipt" ? "+" : "-"}{formatToman(tx.amount)}
                  </span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-0.5 font-semibold">
                    {tx.status === "confirmed" ? "تایید شده" : "در انتظار تایید"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ستون ۲: واحدهای دارای بدهی معوقه با امکان ارسال اخطار در بله */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                لیست واحدهای بدهکار (پیگیری و اخطار شارژ)
              </h3>
              <span className="text-[11px] text-slate-400">محاسبه بر اساس دفتر معین دوطرفه واحدها</span>
            </div>
            <button
              onClick={() => setActiveTab("reports")}
              className="text-xs font-bold text-red-600 hover:text-red-800"
            >
              گزارش بدهکاران
            </button>
          </div>

          <div className="space-y-2.5">
            {debtorUnits.length === 0 ? (
              <div className="text-center py-8 text-emerald-600 text-xs font-bold flex flex-col items-center gap-2">
                <CheckCircle2 className="w-8 h-8" />
                هیچ واحد بدهکاری وجود ندارد؛ تمام شارژها و هزینه‌ها تسویه شده‌اند.
              </div>
            ) : (
              debtorUnits.slice(0, 5).map((unit) => {
                const resident = unit.residents[0] || unit.owners[0];
                return (
                  <div
                    key={unit.id}
                    className="p-3 rounded-xl border border-red-100 bg-red-50/30 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-800 flex items-center gap-1.5">
                        <span>{unit.name}</span>
                        {unit.blockName && <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{unit.blockName}</span>}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {resident ? `${resident.userName} (${resident.userMobile})` : "سکونت ثبت نشده"}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-left">
                        <span className="font-black text-red-600 text-sm block">
                          {formatToman(Math.abs(unit.currentBalance))}
                        </span>
                        <span className="text-[10px] text-red-500 block">بدهی معوق</span>
                      </div>
                      <button
                        onClick={() => {
                          sendBaleNotification(
                            resident?.userName || unit.name,
                            `یادآوری بدهی سرابان: قبض شارژ معوق ${unit.name} به مبلغ ${new Intl.NumberFormat("fa-IR").format(Math.abs(unit.currentBalance))} تومان می‌باشد. لطفاً جهت پرداخت اقدام فرمایید.`
                          );
                        }}
                        title="ارسال پیامک و اعلان در ربات بله"
                        className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors shrink-0"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
