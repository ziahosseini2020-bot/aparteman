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
  Calendar
} from "lucide-react";

export const ResidentPortal: React.FC = () => {
  const { currentRole, units, invoices, payInvoiceItem, activeBuilding } = useApp();

  const [paymentSuccessModal, setPaymentSuccessModal] = useState<string | null>(null);
  const [selectedInvoiceToPay, setSelectedInvoiceToPay] = useState<{ invoiceId: string; amount: number; title: string } | null>(null);

  // یافتن واحد کاربر فعلی
  const myUnit = units.find((u) => u.id === currentRole?.unitId) || units[0];

  // قبوض مربوط به واحد من
  const myInvoices = invoices.flatMap((inv) => {
    const item = inv.items.find((i) => i.unitId === myUnit?.id);
    if (!item) return [];
    return [
      {
        invoiceId: inv.id,
        title: inv.title,
        dueDate: inv.dueDate,
        dailyPenalty: inv.dailyPenalty,
        amount: item.amount,
        penalty: item.penalty,
        total: item.amount + item.penalty,
        isPaid: item.isPaid,
        paidAt: item.paidAt
      }
    ];
  });

  const unpaidTotal = myInvoices
    .filter((inv) => !inv.isPaid)
    .reduce((acc, curr) => acc + curr.total, 0);

  const handlePay = (invoiceId: string, title: string, amount: number) => {
    payInvoiceItem(invoiceId, myUnit.id);
    setSelectedInvoiceToPay(null);
    setPaymentSuccessModal(title);
  };

  return (
    <div className="space-y-6">
      
      {/* کارت خوش‌آمدگویی و وضعیت واحد */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute left-0 bottom-0 opacity-10 translate-y-1/3 -translate-x-1/4">
          <Home className="w-96 h-96" />
        </div>

        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold text-blue-100 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" />
                  نقش شما: {currentRole?.role || "ساکن"}
                </span>
                <span className="text-xs text-white/70">{activeBuilding.name}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black">{myUnit?.title || "واحد شما"}</h2>
              <p className="text-xs sm:text-sm text-blue-100 mt-1">
                طبقه {myUnit?.floor} • متراژ {myUnit?.area} متر • {myUnit?.occupants} نفر ساکن
              </p>
            </div>

            {/* وضعیت بدهی */}
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-center sm:text-left min-w-[200px]">
              <span className="text-xs text-blue-100 block">مانده حساب / بدهی شارژ</span>
              <span className="text-2xl font-black tracking-tight block mt-1">
                {unpaidTotal > 0 ? (
                  <span className="text-amber-300">{formatToman(unpaidTotal)}</span>
                ) : (
                  <span className="text-emerald-300">تسویه شده ✓</span>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* قبوض شارژ صادرشده برای من */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-blue-600" />
              قبوض شارژ و هزینه‌های واحد من
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              مشاهده سوابق و پرداخت آنلاین مستقیم به حساب ساختمان
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {myInvoices.length > 0 ? (
            myInvoices.map((inv, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-blue-400 transition-colors bg-slate-50/50"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 text-sm">{inv.title}</span>
                    {inv.isPaid ? (
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        پرداخت شده ({inv.paidAt})
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        در انتظار پرداخت
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-500 mt-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      مهلت پرداخت: {inv.dueDate}
                    </span>
                    {inv.penalty > 0 && (
                      <span className="text-red-600 font-bold">
                        جریمه دیرکرد: {formatToman(inv.penalty)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-200">
                  <div className="text-left">
                    <span className="text-[11px] text-slate-400 block">مبلغ قابل پرداخت</span>
                    <span className="font-black text-blue-600 text-base">{formatToman(inv.total)}</span>
                  </div>

                  {!inv.isPaid ? (
                    <button
                      onClick={() =>
                        setSelectedInvoiceToPay({
                          invoiceId: inv.invoiceId,
                          amount: inv.total,
                          title: inv.title
                        })
                      }
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all"
                    >
                      <CreditCard className="w-4 h-4" />
                      پرداخت آنلاین
                    </button>
                  ) : (
                    <span className="px-3 py-1.5 bg-slate-100 text-slate-500 rounded-xl text-xs font-semibold">
                      رسید الکترونیکی صادر شد
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-slate-400 text-xs">
              هیچ قبضی برای واحد شما صادر نشده است
            </div>
          )}
        </div>
      </div>

      {/* شفافیت مالی ساختمان */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-sm font-black text-slate-800 mb-2">اطلاعات واریز به حساب ساختمان</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600">
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-slate-400 block mb-1">شماره حساب / کارت مدیر ساختمان:</span>
            <span className="font-bold font-mono text-slate-800">{activeBuilding.accountNumber}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-slate-400 block mb-1">نام صاحب حساب:</span>
            <span className="font-bold text-slate-800">{activeBuilding.accountHolder}</span>
          </div>
        </div>
      </div>

      {/* شبیه‌ساز درگاه پرداخت اینترنتی */}
      {selectedInvoiceToPay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden text-right">
            <div className="bg-emerald-600 p-5 text-white flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold text-emerald-100 uppercase tracking-wider block">
                  درگاه امن پرداخت شتاب
                </span>
                <h3 className="font-black text-base">{selectedInvoiceToPay.title}</h3>
              </div>
              <button
                onClick={() => setSelectedInvoiceToPay(null)}
                className="text-white/80 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="text-center py-2">
                <span className="text-xs text-slate-500 block">مبلغ قابل کسر از کارت</span>
                <span className="text-2xl font-black text-slate-900 mt-1 block">
                  {formatToman(selectedInvoiceToPay.amount)}
                </span>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  واریز به حساب {activeBuilding.name}
                </span>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>
                  این یک پرداخت آزمایشی است. با کلیک بر روی تایید، تسویه حساب شما بلافاصله در سیستم ثبت و به صندوق افزوده می‌شود.
                </span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedInvoiceToPay(null)}
                  className="flex-1 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800"
                >
                  انصراف
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handlePay(
                      selectedInvoiceToPay.invoiceId,
                      selectedInvoiceToPay.title,
                      selectedInvoiceToPay.amount
                    )
                  }
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-600/20"
                >
                  تکمیل پرداخت و تسویه
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* مودال موفقیت پرداخت */}
      {paymentSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-sm p-6 text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h4 className="font-black text-slate-900 text-base">پرداخت با موفقیت انجام شد</h4>
              <p className="text-xs text-slate-500 mt-1">
                قبض «{paymentSuccessModal}» تسویه شد و به موجودی صندوق ساختمان اضافه گردید.
              </p>
            </div>
            <button
              onClick={() => setPaymentSuccessModal(null)}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs"
            >
              متوجه شدم
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
