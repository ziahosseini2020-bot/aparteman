"use client";

import React, { useState } from "react";
import { useApp } from "@/lib/store";
import { formatToman } from "@/lib/utils";
import {
  FileText,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Wallet,
  Send,
  Download,
  Printer,
  ChevronDown,
  Building2,
  PieChart,
  CheckCircle2
} from "lucide-react";

export const ReportsModal: React.FC = () => {
  const { accounts, units, ledgerEntries, expenses, activeBuilding, sendBaleNotification } = useApp();

  const [selectedUnitId, setSelectedUnitId] = useState(units[0]?.id || "");

  const currentAccounts = accounts.filter((a) => a.buildingId === activeBuilding.id);
  const totalCash = currentAccounts.reduce((sum, a) => sum + a.currentBalance, 0);

  const currentUnits = units.filter((u) => u.buildingId === activeBuilding.id);
  const debtorUnits = currentUnits.filter((u) => u.currentBalance < 0).sort((a, b) => a.currentBalance - b.currentBalance);
  const totalDebts = debtorUnits.reduce((sum, u) => sum + Math.abs(u.currentBalance), 0);

  const selectedUnit = currentUnits.find((u) => u.id === selectedUnitId) || currentUnits[0];
  const unitLedger = ledgerEntries.filter((l) => l.unitId === selectedUnit?.id);

  // دسته‌بندی هزینه‌ها
  const currentExpenses = expenses.filter((e) => e.buildingId === activeBuilding.id);
  const totalExpenses = currentExpenses.reduce((sum, e) => sum + e.totalAmount, 0);

  return (
    <div className="space-y-6">
      
      {/* هدر بخش گزارش‌ها */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            گزارش‌های جامع مالی و ترازنامه سرابان
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            تراز نقدینگی، رتبه‌بندی بدهکاران با امکان اخطار بله، و صورتحساب گردش حساب هر واحد
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            چاپ گزارش
          </button>
        </div>
      </div>

      {/* کارت‌های خلاصه تراز مالی */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 block">نقدینگی کل مجتمع (دارایی نقدی)</span>
          <span className="text-xl font-black text-emerald-600 block mt-2">{formatToman(totalCash)}</span>
          <span className="text-[11px] text-slate-400 block mt-1">موجودی تجمیعی بانک و صندوق</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 block">کل مطالبات معوقه (دارایی جاری)</span>
          <span className="text-xl font-black text-red-600 block mt-2">{formatToman(totalDebts)}</span>
          <span className="text-[11px] text-red-500 block mt-1">{debtorUnits.length} واحد دارای بدهی معوق</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 block">کل دارایی‌های قابل اتکا</span>
          <span className="text-xl font-black text-slate-900 block mt-2">{formatToman(totalCash + totalDebts)}</span>
          <span className="text-[11px] text-emerald-600 font-bold block mt-1">نقدینگی + مطالبات قابل وصول</span>
        </div>
      </div>

      {/* دو ستون: رتبه‌بندی بدهکاران + صورتحساب تفصیلی واحد */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* رتبه‌بندی بدهکاران */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              رتبه‌بندی واحدهای بدهکار
            </h3>
            <span className="text-xs text-red-600 font-bold">بیشترین تا کمترین بدهی</span>
          </div>

          <div className="space-y-2.5">
            {debtorUnits.map((u, idx) => {
              const res = u.residents[0] || u.owners[0];
              return (
                <div key={u.id} className="p-3 bg-red-50/40 rounded-xl border border-red-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-red-200 text-red-800 font-black flex items-center justify-center text-xs">
                      {idx + 1}
                    </span>
                    <div>
                      <span className="font-black text-slate-800 block">{u.name} {u.blockName ? `(${u.blockName})` : ""}</span>
                      <span className="text-[11px] text-slate-500">{res ? `${res.userName} - ${res.userMobile}` : "ثبت نشده"}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-black text-red-600 text-sm">{formatToman(Math.abs(u.currentBalance))}</span>
                    <button
                      onClick={() => {
                        sendBaleNotification(
                          res?.userName || u.name,
                          `اخطار نهایی سرابان: بدهی معوق ${u.name} مبلغ ${new Intl.NumberFormat("fa-IR").format(Math.abs(u.currentBalance))} تومان می‌باشد. مهلت پرداخت تا پایان هفته است.`
                        );
                      }}
                      title="ارسال اخطار در ربات بله"
                      className="p-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* صورتحساب گردش حساب واحد انتخابی */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-800 text-sm">صورتحساب تفصیلی واحد (Statement)</h3>
            <select
              value={selectedUnitId}
              onChange={(e) => setSelectedUnitId(e.target.value)}
              className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
            >
              {currentUnits.map(u => (
                <option key={u.id} value={u.id}>{u.name} {u.blockName ? `(${u.blockName})` : ""}</option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto max-h-72">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 sticky top-0">
                <tr>
                  <th className="p-2">تاریخ</th>
                  <th className="p-2">شرح</th>
                  <th className="p-2">بدهکار</th>
                  <th className="p-2">بستانکار</th>
                  <th className="p-2">مانده</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {unitLedger.map((row) => (
                  <tr key={row.id}>
                    <td className="p-2 font-mono text-[11px] text-slate-400">{row.entryDate}</td>
                    <td className="p-2 font-medium text-slate-800">{row.title}</td>
                    <td className="p-2 font-mono text-red-600 font-bold">{row.debitAmount > 0 ? formatToman(row.debitAmount) : "-"}</td>
                    <td className="p-2 font-mono text-emerald-600 font-bold">{row.creditAmount > 0 ? formatToman(row.creditAmount) : "-"}</td>
                    <td className={`p-2 font-mono font-black ${row.balanceAfter < 0 ? "text-red-600" : "text-emerald-600"}`}>
                      {formatToman(row.balanceAfter)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
};
