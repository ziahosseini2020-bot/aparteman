"use client";

import React, { useState } from "react";
import { useApp } from "@/lib/store";
import { formatToman } from "@/lib/utils";
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  FileText,
  Home,
  Shield,
  Receipt,
  ArrowUpRight,
  Sparkles,
  Calendar,
  Upload,
  BookOpen
} from "lucide-react";

export const ResidentPortal: React.FC = () => {
  const { currentRole, units, charges, addTransaction, activeBuilding, ledgerEntries } = useApp();

  const [paymentSuccessModal, setPaymentSuccessModal] = useState<string | null>(null);
  const [selectedChargeItem, setSelectedChargeItem] = useState<{ id: string; amount: number; title: string } | null>(null);
  const [isReceiptUploadOpen, setIsReceiptUploadOpen] = useState(false);
  const [receiptTrackingCode, setReceiptTrackingCode] = useState("987654321");

  // یافتن واحد کاربر فعلی
  const myUnit = units.find((u) => u.id === currentRole?.unitId) || units[0];

  // قبوض شارژ صادرشده برای واحد من
  const myChargeItems = charges.flatMap((chg) => {
    const item = chg.items.find((i) => i.unitId === myUnit?.id);
    if (!item) return [];
    return [
      {
        chargeId: chg.id,
        itemId: item.id,
        title: chg.title,
        dueDate: chg.dueDate,
        amount: item.amount,
        fineAmount: item.fineAmount,
        total: item.amount + item.fineAmount,
        paidAmount: item.paidAmount,
        settlementStatus: item.settlementStatus
      }
    ];
  });

  const unpaidTotal = myChargeItems
    .filter((c) => c.settlementStatus !== "paid")
    .reduce((acc, curr) => acc + (curr.total - curr.paidAmount), 0);

  // دفتر معین واحد من
  const myLedger = ledgerEntries.filter((l) => l.unitId === myUnit?.id);

  // پرداخت آنلاین شبیه‌ساز درگاه شاپرک
  const handlePayOnline = (itemId: string, title: string, amount: number) => {
    addTransaction({
      financialAccountId: "acc-1", // حساب بانکی اصلی
      accountName: "حساب جاری بانک ملت ساختمان",
      type: "receipt",
      category: "دریافت شارژ",
      amount,
      transactionDate: "امروز",
      description: `پرداخت آنلاین شارژ واحد ${myUnit.name} - ${title}`,
      payerOrPayeeName: currentRole.role + " (" + myUnit.name + ")",
      status: "confirmed",
      allocations: [
        {
          id: "ta-" + Date.now(),
          transactionId: "",
          allocatableType: "charge_item",
          allocatableId: itemId,
          allocatableTitle: title,
          unitTitle: myUnit.name,
          amount
        }
      ]
    });

    setSelectedChargeItem(null);
    setPaymentSuccessModal(title);
  };

  // ارسال فیش واریزی برای بررسی مدیر
  const handleUploadReceiptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addTransaction({
      financialAccountId: "acc-1",
      accountName: "حساب جاری ساختمان",
      type: "receipt",
      category: "دریافت شارژ",
      amount: unpaidTotal > 0 ? unpaidTotal : 500000,
      transactionDate: "امروز",
      description: `فیش واریزی کارت به کارت واحد ${myUnit.name} (کد پیگیری: ${receiptTrackingCode})`,
      payerOrPayeeName: myUnit.name,
      status: "pending_approval",
      allocations: []
    });

    setIsReceiptUploadOpen(false);
    alert("فیش واریزی شما با موفقیت ثبت شد و پس از بررسی توسط مدیر ساختمان تایید خواهد شد.");
  };

  const isOwner = currentRole?.role === "مالک";

  return (
    <div className="space-y-6">
      
      {/* کارت خوش‌آمدگویی و مشخصات واحد */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold text-emerald-100 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" />
                  نقش شما در سرابان: {currentRole?.role || "ساکن"}
                </span>
                <span className="text-xs text-white/70">{activeBuilding.name} {myUnit?.blockName ? `(${myUnit.blockName})` : ""}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black">{myUnit?.name || "واحد شما"}</h2>
              <p className="text-xs sm:text-sm text-emerald-100 mt-1">
                طبقه {myUnit?.floorNumber} • متراژ {myUnit?.area} متر • {myUnit?.peopleCount} نفر ساکن
                {isOwner && " • مالک رسمی واحد (۱۰۰٪ مالکیت)"}
              </p>
            </div>

            {/* وضعیت بدهی */}
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-center sm:text-left min-w-[200px]">
              <span className="text-xs text-emerald-100 block">مانده حساب / بدهی قابل پرداخت:</span>
              <span className="text-2xl font-black tracking-tight block mt-1">
                {myUnit?.currentBalance < 0 ? (
                  <span className="text-amber-300">{formatToman(Math.abs(myUnit.currentBalance))}</span>
                ) : (
                  <span className="text-emerald-300">تسویه کامل ✓</span>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* قبوض شارژ صادرشده برای واحد من */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-black text-slate-800 text-base flex items-center gap-2">
              <Receipt className="w-5 h-5 text-emerald-600" />
              قبوض شارژ و هزینه‌های صادر شده برای {myUnit.name}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              امکان پرداخت مستقیم آنلاین از طریق شبیه‌ساز درگاه بانکی شاپرک یا بارگذاری فیش کارت به کارت
            </p>
          </div>

          <button
            onClick={() => setIsReceiptUploadOpen(true)}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0"
          >
            <Upload className="w-4 h-4" />
            بارگذاری فیش واریزی
          </button>
        </div>

        <div className="space-y-3">
          {myChargeItems.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              هیچ قبض شارژی برای این واحد ثبت نشده است.
            </div>
          ) : (
            myChargeItems.map((item) => (
              <div
                key={item.itemId}
                className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between sm:items-center gap-3 text-xs"
              >
                <div>
                  <div className="font-bold text-slate-800 text-sm">{item.title}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    مهلت پرداخت: {item.dueDate}
                    {item.fineAmount > 0 && (
                      <span className="text-red-500 mr-2 font-bold">
                        (شامل {formatToman(item.fineAmount)} جریمه دیرکرد)
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 justify-between sm:justify-end">
                  <div className="text-left">
                    <span className="font-black text-slate-900 text-sm block">
                      {formatToman(item.total)}
                    </span>
                    <span className={`text-[10px] font-bold ${
                      item.settlementStatus === "paid" ? "text-emerald-600" : "text-amber-600"
                    }`}>
                      {item.settlementStatus === "paid" ? "پرداخت شده ✓" : "پرداخت نشده"}
                    </span>
                  </div>

                  {item.settlementStatus !== "paid" && (
                    <button
                      onClick={() => handlePayOnline(item.itemId, item.title, item.total)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md transition-all flex items-center gap-1.5"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      پرداخت آنلاین شاپرک
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* صورتحساب گردش حساب و دفتر معین واحد من */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h3 className="font-black text-slate-800 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
          <BookOpen className="w-4 h-4 text-emerald-600" />
          ریز گردش حساب و دفتر معین واحد (تاریخچه بدهی و بستانکاری)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="p-2.5">تاریخ</th>
                <th className="p-2.5">شرح سند</th>
                <th className="p-2.5">بدهکار (افزایش بدهی)</th>
                <th className="p-2.5">بستانکار (پرداخت شما)</th>
                <th className="p-2.5">مانده نهایی</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {myLedger.map((row) => (
                <tr key={row.id}>
                  <td className="p-2.5 font-mono text-slate-400">{row.entryDate}</td>
                  <td className="p-2.5 font-bold text-slate-800">{row.title}</td>
                  <td className="p-2.5 text-red-600 font-mono font-bold">
                    {row.debitAmount > 0 ? formatToman(row.debitAmount) : "-"}
                  </td>
                  <td className="p-2.5 text-emerald-600 font-mono font-bold">
                    {row.creditAmount > 0 ? formatToman(row.creditAmount) : "-"}
                  </td>
                  <td className={`p-2.5 font-mono font-black ${
                    row.balanceAfter < 0 ? "text-red-600" : "text-emerald-600"
                  }`}>
                    {formatToman(row.balanceAfter)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* مودال تایید پرداخت موفق */}
      {paymentSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 text-center max-w-sm w-full space-y-4 shadow-2xl">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="font-black text-slate-900 text-base">پرداخت با موفقیت انجام شد</h3>
            <p className="text-xs text-slate-500">
              قبض «{paymentSuccessModal}» تسویه گردید و سند مالی به حساب مجتمع منظور شد.
            </p>
            <button
              onClick={() => setPaymentSuccessModal(null)}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs"
            >
              متشکرم، بستن
            </button>
          </div>
        </div>
      )}

      {/* مودال بارگذاری فیش کارت به کارت */}
      {isReceiptUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden text-right">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-5 text-white flex justify-between items-center">
              <div>
                <h3 className="font-black text-base flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  بارگذاری تصویر یا فیش واریز
                </h3>
                <p className="text-xs text-emerald-100">ارسال شماره پیگیری کارت‌به‌کارت به مدیر مجتمع</p>
              </div>
              <button onClick={() => setIsReceiptUploadOpen(false)} className="text-white/80 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleUploadReceiptSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">شماره پیگیری تراکنش بانکی</label>
                <input
                  type="text"
                  value={receiptTrackingCode}
                  onChange={(e) => setReceiptTrackingCode(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">تصویر فیش واریزی (اختیاری)</label>
                <input
                  type="file"
                  className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition-all"
              >
                ارسال فیش جهت تایید مدیر
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
