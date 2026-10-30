"use client";

import React, { useState } from "react";
import { useApp } from "@/lib/store";
import { ChargeInvoice } from "@/lib/mockData";
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
  ChevronDown
} from "lucide-react";

export const ChargeIssuanceModal: React.FC = () => {
  const { invoices, createChargeInvoice, units, activeBuilding, payInvoiceItem } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<ChargeInvoice | null>(null);

  // فرم صدور شارژ
  const [title, setTitle] = useState("شارژ ماهیانه آبان‌ماه ۱۴۰۵");
  const [dueDateDays, setDueDateDays] = useState(10);
  const [dailyPenalty, setDailyPenalty] = useState(20000);
  const [calculationModel, setCalculationModel] = useState<ChargeInvoice["calculationModel"]>("DEFAULT_CHARGE");
  const [baseAmount, setBaseAmount] = useState(200000); // مبلغ ثابت
  const [areaRate, setAreaRate] = useState(3000); // نرخ هر متر مربع (تومان)
  const [occupantRate, setOccupantRate] = useState(50000); // نرخ هر نفر (تومان)
  const [payerType, setPayerType] = useState<"ساکن" | "مالک" | "هر دو">("ساکن");
  const [targetUnits, setTargetUnits] = useState<"all" | "occupied" | "empty" | "custom">("all");

  const currentBuildingUnits = units.filter((u) => u.buildingId === activeBuilding.id);

  // محاسبه زنده برای پیش‌نمایش مبالغ هر واحد
  const calculatePreviewAmount = (unit: typeof units[0]): number => {
    const area = unit.area;
    const occupants = unit.occupants || 1;
    const defaultCharge = unit.defaultCharge || 300000;

    switch (calculationModel) {
      case "FIXED_ALL":
        return baseAmount;
      case "DEFAULT_CHARGE":
        return defaultCharge;
      case "BY_AREA":
        return area * areaRate;
      case "BY_OCCUPANTS":
        return occupants * occupantRate;
      case "FIXED_AREA":
        return baseAmount + area * areaRate;
      case "FIXED_OCCUPANTS":
        return baseAmount + occupants * occupantRate;
      case "FIXED_AREA_OCCUPANTS":
        return baseAmount + area * areaRate + occupants * occupantRate;
      case "DEFAULT_AREA":
        return defaultCharge + area * areaRate;
      case "DEFAULT_OCCUPANTS":
        return defaultCharge + occupants * occupantRate;
      case "DEFAULT_AREA_OCCUPANTS":
        return defaultCharge + area * areaRate + occupants * occupantRate;
      default:
        return defaultCharge;
    }
  };

  const previewUnits = currentBuildingUnits.filter((u) => {
    if (targetUnits === "occupied") return u.isOccupied;
    if (targetUnits === "empty") return !u.isOccupied;
    return true;
  });

  const totalPreviewAmount = previewUnits.reduce((acc, u) => acc + calculatePreviewAmount(u), 0);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createChargeInvoice({
      title,
      issueDate: "امروز",
      dueDateDays,
      dueDate: `پس از ${dueDateDays} روز`,
      dailyPenalty,
      calculationModel,
      baseAmount,
      areaRate,
      occupantRate,
      payerType,
      targetUnits
    });

    setIsModalOpen(false);
  };

  const currentBuildingInvoices = invoices.filter((i) => i.buildingId === activeBuilding.id);

  return (
    <div className="space-y-6">
      
      {/* سربرگ */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-blue-600" />
            صدور و مدیریت قبوض شارژ واحدها
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            فرمول‌های متنوع محاسبه (ثابت، پیش‌فرض، متراژ، نفرات و ترکیبی) همراه با جریمه دیرکرد روزانه
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          صدور قبض شارژ جدید
        </button>
      </div>

      {/* لیست قبوض صادرشده */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentBuildingInvoices.map((inv) => {
          const paidCount = inv.items.filter((i) => i.isPaid).length;
          const totalCount = inv.items.length;
          const percentPaid = Math.round((paidCount / totalCount) * 100);

          return (
            <div
              key={inv.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                    تاریخ صدور: {inv.issueDate}
                  </span>
                  <h3 className="font-black text-slate-800 text-sm mt-1">{inv.title}</h3>
                </div>
                <button
                  onClick={() => setSelectedInvoice(inv)}
                  className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                  title="مشاهده ریز قبوض واحدها"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <div>
                  <span className="text-[11px] text-slate-400 block">مهلت پرداخت:</span>
                  <span className="font-bold">{inv.dueDate}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">جریمه دیرکرد:</span>
                  <span className="font-bold text-red-600">{formatToman(inv.dailyPenalty)} / روز</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">پرداخت‌کننده:</span>
                  <span className="font-bold">{inv.payerType}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">مبلغ کل شارژ:</span>
                  <span className="font-black text-blue-600">{formatToman(inv.totalAmount)}</span>
                </div>
              </div>

              {/* Progress Bar پرداخت‌ها */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-500">وضعیت پرداخت اهالی:</span>
                  <span className="font-bold text-slate-700">
                    {paidCount} از {totalCount} واحد ({percentPaid}٪)
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${percentPaid}%` }}
                  />
                </div>
              </div>

              <button
                onClick={() => setSelectedInvoice(inv)}
                className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition-colors"
              >
                مشاهده و تسویه دستی واحدها
              </button>
            </div>
          );
        })}
      </div>

      {/* مودال ویزارد صدور شارژ با محاسبه آنی */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-3xl my-8 overflow-hidden text-right">
            
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white flex justify-between items-center">
              <div>
                <h3 className="font-black text-base flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-blue-200" />
                  صدور قبض شارژ دوره‌ای واحدها
                </h3>
                <p className="text-xs text-blue-100">
                  فرمول محاسبه را انتخاب کنید، مبالغ هر واحد به صورت خودکار محاسبه می‌شود
                </p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-white/80 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              
              {/* عنوان و مهلت */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">عنوان قبض</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">مهلت پرداخت (روز)</label>
                  <input
                    type="number"
                    value={dueDateDays}
                    onChange={(e) => setDueDateDays(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">جریمه دیرکرد روزانه (تومان)</label>
                  <input
                    type="number"
                    value={dailyPenalty}
                    onChange={(e) => setDailyPenalty(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                    required
                  />
                </div>
              </div>

              {/* پرداخت‌کننده و واحدهای هدف */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">پرداخت‌کننده شارژ</label>
                  <select
                    value={payerType}
                    onChange={(e) => setPayerType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold"
                  >
                    <option value="ساکن">ساکن واحد</option>
                    <option value="مالک">مالک واحد</option>
                    <option value="هر دو">هر دو (تفکیک پیش‌فرض)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">واحدهای مشمول شارژ</label>
                  <select
                    value={targetUnits}
                    onChange={(e) => setTargetUnits(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold"
                  >
                    <option value="all">همه واحدها ({currentBuildingUnits.length} واحد)</option>
                    <option value="occupied">فقط واحدهای پر و دارای سکونت</option>
                    <option value="empty">فقط واحدهای خالی</option>
                  </select>
                </div>
              </div>

              {/* انتخاب الگوی محاسبه */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-800">
                  فرمول و روش محاسبه مبلغ شارژ:
                </label>
                <select
                  value={calculationModel}
                  onChange={(e) => setCalculationModel(e.target.value as any)}
                  className="w-full px-3 py-2.5 bg-blue-50 border-2 border-blue-200 text-blue-900 rounded-xl text-xs font-black"
                >
                  <option value="DEFAULT_CHARGE">• مبلغ شارژ پیش‌فرض تعریف‌شده در جدول هر واحد</option>
                  <option value="FIXED_ALL">• مبلغ ثابت یکسان برای همه واحدها</option>
                  <option value="BY_AREA">• شارژ تسهیمی بر اساس متراژ هر واحد</option>
                  <option value="BY_OCCUPANTS">• شارژ تسهیمی بر اساس تعداد نفرات هر واحد</option>
                  <option value="FIXED_AREA">• مبلغ ثابت + متراژ واحد</option>
                  <option value="FIXED_OCCUPANTS">• مبلغ ثابت + نفرات واحد</option>
                  <option value="FIXED_AREA_OCCUPANTS">• مبلغ ثابت + متراژ + نفرات</option>
                  <option value="DEFAULT_AREA">• شارژ پیش‌فرض هر واحد + متراژ</option>
                  <option value="DEFAULT_OCCUPANTS">• شارژ پیش‌فرض هر واحد + نفرات</option>
                  <option value="DEFAULT_AREA_OCCUPANTS">• شارژ پیش‌فرض هر واحد + متراژ + نفرات</option>
                </select>

                {/* متغیرهای فرمول */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  {(calculationModel.includes("FIXED") || calculationModel === "FIXED_ALL") && (
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">مبلغ پایه ثابت (تومان)</label>
                      <input
                        type="number"
                        value={baseAmount}
                        onChange={(e) => setBaseAmount(Number(e.target.value))}
                        className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-xs font-mono"
                      />
                    </div>
                  )}
                  {calculationModel.includes("AREA") && (
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">نرخ هر متر مربع (تومان)</label>
                      <input
                        type="number"
                        value={areaRate}
                        onChange={(e) => setAreaRate(Number(e.target.value))}
                        className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-xs font-mono"
                      />
                    </div>
                  )}
                  {calculationModel.includes("OCCUPANTS") && (
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">نرخ به ازای هر نفر (تومان)</label>
                      <input
                        type="number"
                        value={occupantRate}
                        onChange={(e) => setOccupantRate(Number(e.target.value))}
                        className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-xs font-mono"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* جدول پیش‌نمایش آنی مبالغ */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-700">
                    پیش‌نمایش زنده مبالغ محاسبه‌شده برای هر واحد ({previewUnits.length} واحد):
                  </span>
                  <span className="text-xs font-black text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg">
                    مجموع درآمد شارژ: {formatToman(totalPreviewAmount)}
                  </span>
                </div>
                <div className="border border-slate-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-bold">
                      <tr>
                        <th className="p-2.5">واحد</th>
                        <th className="p-2.5">ساکن</th>
                        <th className="p-2.5">متراژ</th>
                        <th className="p-2.5">نفرات</th>
                        <th className="p-2.5 text-left pl-4">مبلغ قبض قابل پرداخت</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {previewUnits.map((u) => {
                        const amount = calculatePreviewAmount(u);
                        return (
                          <tr key={u.id} className="hover:bg-slate-50">
                            <td className="p-2.5 font-bold">{u.title}</td>
                            <td className="p-2.5">{u.residentName}</td>
                            <td className="p-2.5">{u.area} متر</td>
                            <td className="p-2.5">{u.occupants} نفر</td>
                            <td className="p-2.5 font-black text-blue-600 text-left pl-4">
                              {formatToman(amount)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-500/20"
                >
                  تایید و صدور نهایی قبوض ({formatToman(totalPreviewAmount)})
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* مودال مشاهده جزئیات و تسویه دستی */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-2xl my-8 overflow-hidden text-right">
            <div className="bg-slate-900 p-5 text-white flex justify-between items-center">
              <div>
                <h3 className="font-black text-base">{selectedInvoice.title}</h3>
                <span className="text-xs text-slate-400">
                  مهلت: {selectedInvoice.dueDate} | جریمه دیرکرد: {formatToman(selectedInvoice.dailyPenalty)}
                </span>
              </div>
              <button onClick={() => setSelectedInvoice(null)} className="text-white/80 hover:text-white">
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="border border-slate-200 rounded-xl overflow-hidden max-h-72 overflow-y-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold">
                    <tr>
                      <th className="p-2.5">واحد</th>
                      <th className="p-2.5">ساکن</th>
                      <th className="p-2.5">مبلغ شارژ</th>
                      <th className="p-2.5">وضعیت پرداخت</th>
                      <th className="p-2.5 text-center">عملیات تسویه</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedInvoice.items.map((item) => (
                      <tr key={item.unitId} className="hover:bg-slate-50">
                        <td className="p-2.5 font-bold">{item.unitTitle}</td>
                        <td className="p-2.5">{item.residentName}</td>
                        <td className="p-2.5 font-bold text-slate-800">{formatToman(item.amount)}</td>
                        <td className="p-2.5">
                          {item.isPaid ? (
                            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-bold">
                              ✓ پرداخت شده
                            </span>
                          ) : (
                            <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[10px] font-bold">
                              در انتظار پرداخت
                            </span>
                          )}
                        </td>
                        <td className="p-2.5 text-center">
                          {!item.isPaid && (
                            <button
                              onClick={() => payInvoiceItem(selectedInvoice.id, item.unitId)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold"
                            >
                              ثبت دریافت نقدی
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  بستن
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
