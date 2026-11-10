"use client";

import React, { useState } from "react";
import { useApp } from "@/lib/store";
import { FinancialAccount, Transaction, UnitLedgerEntry } from "@/lib/mockData";
import { formatToman } from "@/lib/utils";
import {
  CreditCard,
  Wallet,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingDown,
  TrendingUp,
  CheckCircle2,
  Clock,
  BookOpen,
  Filter,
  Search,
  Building2,
  Send,
  AlertCircle
} from "lucide-react";

export const AccountingTransactions: React.FC = () => {
  const {
    accounts,
    transactions,
    addTransaction,
    approvePendingTransaction,
    ledgerEntries,
    units,
    activeBuilding,
    sendBaleNotification
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<"accounts" | "transactions" | "ledger">("accounts");
  const [selectedUnitFilter, setSelectedUnitFilter] = useState("all");
  const [isAddTxModalOpen, setIsAddTxModalOpen] = useState(false);

  // فرم تراکنش جدید
  const [txType, setTxType] = useState<"receipt" | "payment" | "transfer">("receipt");
  const [txAccountId, setTxAccountId] = useState(accounts[0]?.id || "");
  const [txAmount, setTxAmount] = useState(1200000);
  const [txCategory, setTxCategory] = useState<Transaction["category"]>("دریافت شارژ");
  const [txDate, setTxDate] = useState("۱۴۰۵/۰۸/۰۴");
  const [txDescription, setTxDescription] = useState("واریز کارت به کارت شارژ آبان واحد ۱۰۲");
  const [txPayerPayee, setTxPayerPayee] = useState("محمد حسینی");
  const [txStatus, setTxStatus] = useState<Transaction["status"]>("confirmed");

  const currentAccounts = accounts.filter((a) => a.buildingId === activeBuilding.id);
  const currentTransactions = transactions.filter((t) => t.buildingId === activeBuilding.id);
  const currentLedger = ledgerEntries.filter((l) => {
    if (l.buildingId !== activeBuilding.id) return false;
    if (selectedUnitFilter !== "all" && l.unitId !== selectedUnitFilter) return false;
    return true;
  });

  const handleAddTxSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const acc = accounts.find((a) => a.id === txAccountId);
    addTransaction({
      financialAccountId: txAccountId,
      accountName: acc?.name || "حساب ساختمان",
      type: txType,
      category: txCategory,
      amount: txAmount,
      transactionDate: txDate,
      description: txDescription,
      payerOrPayeeName: txPayerPayee,
      status: txStatus,
      allocations: []
    });

    sendBaleNotification(
      "مدیریت مالی",
      `تراکنش جدید به مبلغ ${new Intl.NumberFormat("fa-IR").format(txAmount)} تومان با عنوان «${txDescription}» ثبت گردید.`
    );

    setIsAddTxModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* هدر بخش حسابداری و دفتر معین */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-600" />
            امور مالی، حساب‌ها، تراکنش‌ها و دفتر معین دوبل
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            انطباق کامل با پایگاه داده saraban_db: فقط تراکنش‌های تاییدشده بر موجودی حساب اثر گذاشته و دفتر معین واحدها را تراز می‌کنند.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddTxModalOpen(true)}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
          >
            <Plus className="w-4 h-4" />
            ثبت تراکنش مالی جدید
          </button>
        </div>
      </div>

      {/* تب‌های داخلی */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveSubTab("accounts")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeSubTab === "accounts" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Wallet className="w-3.5 h-3.5" />
          حساب‌های بانکی و صندوق ({currentAccounts.length})
        </button>
        <button
          onClick={() => setActiveSubTab("transactions")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeSubTab === "transactions" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          تراکنش‌های واقعی ({currentTransactions.length})
        </button>
        <button
          onClick={() => setActiveSubTab("ledger")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeSubTab === "ledger" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          دفتر معین واحدها (unit_ledger_entries)
        </button>
      </div>

      {/* تب ۱: حساب‌های مالی (بانک، صندوق، تنخواه) */}
      {activeSubTab === "accounts" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {currentAccounts.map((acc) => (
            <div
              key={acc.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3 hover:border-emerald-300 transition-all"
            >
              <div className="flex justify-between items-start">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Wallet className="w-5 h-5" />
                </div>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-bold">
                  {acc.accountType === "bank" ? "حساب بانکی" : acc.accountType === "cash" ? "صندوق نقدی" : "تنخواه‌گردان"}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-slate-800 text-sm">{acc.name}</h3>
                <span className="text-[11px] text-slate-400 block mt-0.5 font-mono">
                  {acc.accountNumber || "صندوق فیزیکی مدیر"}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-between items-baseline">
                <span className="text-xs text-slate-500">موجودی فعلی:</span>
                <span className="font-black text-emerald-600 text-base">{formatToman(acc.currentBalance)}</span>
              </div>

              <div className="text-[11px] text-slate-500 flex justify-between">
                <span>مسئول حساب:</span>
                <span className="font-bold text-slate-700">{acc.responsibleName}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* تب ۲: تراکنش‌های واقعی ثبت‌شده */}
      {activeSubTab === "transactions" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="font-black text-slate-800 text-sm">لیست اسناد مالی و تراکنش‌های بانکی</h3>
            <span className="text-xs text-slate-400">تعداد کل: {currentTransactions.length} تراکنش</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">نوع</th>
                  <th className="p-3">شرح تراکنش</th>
                  <th className="p-3">حساب مالی</th>
                  <th className="p-3">طرف حساب</th>
                  <th className="p-3">مبلغ</th>
                  <th className="p-3">تاریخ</th>
                  <th className="p-3">وضعیت</th>
                  <th className="p-3">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        tx.type === "receipt" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                      }`}>
                        {tx.type === "receipt" ? "واریز" : "پرداخت"}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-slate-800">{tx.description}</td>
                    <td className="p-3 text-slate-600">{tx.accountName}</td>
                    <td className="p-3 text-slate-700 font-medium">{tx.payerOrPayeeName}</td>
                    <td className={`p-3 font-black text-sm ${
                      tx.type === "receipt" ? "text-emerald-600" : "text-slate-800"
                    }`}>
                      {tx.type === "receipt" ? "+" : "-"}{formatToman(tx.amount)}
                    </td>
                    <td className="p-3 font-mono text-slate-500">{tx.transactionDate}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        tx.status === "confirmed" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                      }`}>
                        {tx.status === "confirmed" ? "تایید شده ✓" : "در انتظار تایید"}
                      </span>
                    </td>
                    <td className="p-3">
                      {tx.status === "pending_approval" && (
                        <button
                          onClick={() => approvePendingTransaction(tx.id)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold shadow-sm transition-all"
                        >
                          تایید و اعمال به حساب
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* تب ۳: دفتر معین واحدها (unit_ledger_entries) */}
      {activeSubTab === "ledger" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-black text-slate-800 text-sm">دفتر معین دوبل واحدها (unit_ledger_entries)</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                ثبت تاریخچه کامل بدهکار، بستانکار و مانده نهایی پس از هر رویداد مالی
              </p>
            </div>

            {/* فیلتر بر اساس واحد */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 shrink-0">فیلتر واحد:</span>
              <select
                value={selectedUnitFilter}
                onChange={(e) => setSelectedUnitFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              >
                <option value="all">همه واحدهای مجتمع</option>
                {units.filter(u => u.buildingId === activeBuilding.id).map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">واحد</th>
                  <th className="p-3">تاریخ</th>
                  <th className="p-3">شرح سند</th>
                  <th className="p-3">نوع رویداد</th>
                  <th className="p-3">بدهکار (افزایش بدهی)</th>
                  <th className="p-3">بستانکار (پرداخت/تسویه)</th>
                  <th className="p-3">مانده پس از رویداد</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentLedger.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-3 font-bold text-slate-800">{entry.unitTitle}</td>
                    <td className="p-3 font-mono text-slate-500">{entry.entryDate}</td>
                    <td className="p-3 text-slate-700 font-medium">{entry.title}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-600 font-bold">
                        {entry.entryType}
                      </span>
                    </td>
                    <td className="p-3 font-mono font-bold text-red-600">
                      {entry.debitAmount > 0 ? formatToman(entry.debitAmount) : "-"}
                    </td>
                    <td className="p-3 font-mono font-bold text-emerald-600">
                      {entry.creditAmount > 0 ? formatToman(entry.creditAmount) : "-"}
                    </td>
                    <td className={`p-3 font-mono font-black ${
                      entry.balanceAfter < 0 ? "text-red-600" : entry.balanceAfter > 0 ? "text-emerald-600" : "text-slate-500"
                    }`}>
                      {formatToman(entry.balanceAfter)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* مودال ثبت تراکنش مالی جدید */}
      {isAddTxModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-lg my-6 overflow-hidden text-right">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-5 text-white flex justify-between items-center">
              <div>
                <h3 className="font-black text-base flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  ثبت تراکنش مالی واقعی در سرابان
                </h3>
                <p className="text-xs text-emerald-100">فقط این فرم نقدینگی و موجودی حساب‌های بانکی را تغییر می‌دهد</p>
              </div>
              <button onClick={() => setIsAddTxModalOpen(false)} className="text-white/80 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddTxSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">نوع تراکنش</label>
                  <select
                    value={txType}
                    onChange={(e) => setTxType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="receipt">واریز به حساب مجتمع (+)</option>
                    <option value="payment">برداشت و پرداخت هزینه (-)</option>
                    <option value="transfer">انتقال بین حساب‌ها</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">حساب بانکی / صندوق</label>
                  <select
                    value={txAccountId}
                    onChange={(e) => setTxAccountId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    {currentAccounts.map(acc => (
                      <option key={acc.id} value={acc.id}>{acc.name} ({formatToman(acc.currentBalance)})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">مبلغ (تومان)</label>
                  <input
                    type="number"
                    value={txAmount}
                    onChange={(e) => setTxAmount(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-center font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">طرف حساب</label>
                  <input
                    type="text"
                    value={txPayerPayee}
                    onChange={(e) => setTxPayerPayee(e.target.value)}
                    required
                    placeholder="نام واریزکننده یا دریافت‌کننده"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">شرح تراکنش و سند</label>
                <input
                  type="text"
                  value={txDescription}
                  onChange={(e) => setTxDescription(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">وضعیت تایید سند</label>
                <select
                  value={txStatus}
                  onChange={(e) => setTxStatus(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                >
                  <option value="confirmed">تایید شده (اثر فوری بر موجودی حساب)</option>
                  <option value="pending_approval">در انتظار بررسی فیش واریزی</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition-all"
              >
                ثبت سند مالی و اعمال به حساب
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
