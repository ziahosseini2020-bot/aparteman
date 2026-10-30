"use client";

import React, { useState } from "react";
import { useApp } from "@/lib/store";
import { ExpenseItem, MeterReadingItem, OtherRevenue } from "@/lib/mockData";
import { formatToman } from "@/lib/utils";
import {
  TrendingDown,
  TrendingUp,
  Plus,
  Gauge,
  FileText,
  DollarSign,
  Paperclip,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Building2,
  Upload
} from "lucide-react";

export const ExpenseManagement: React.FC = () => {
  const { expenses, addExpense, otherRevenues, addOtherRevenue, units, activeBuilding } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<"general" | "meter" | "revenues">("general");

  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isMeterModalOpen, setIsMeterModalOpen] = useState(false);
  const [isRevenueModalOpen, setIsRevenueModalOpen] = useState(false);

  // فرم هزینه عمومی
  const [title, setTitle] = useState("تعمیرات موتورخانه و پمپ آب");
  const [category, setCategory] = useState<ExpenseItem["category"]>("تعمیرات و نگهداری");
  const [calculationMethod, setCalculationMethod] = useState<ExpenseItem["calculationMethod"]>("مساوی");
  const [totalAmount, setTotalAmount] = useState(3600000);
  const [date, setDate] = useState("۱۴۰۵/۰۸/۰۱");
  const [description, setDescription] = useState("تعویض بلبرینگ و سرویس دوره ای پمپ آبرسانی");
  const [payerType, setPayerType] = useState<"ساکن" | "مالک">("مالک");
  const [targetUnits, setTargetUnits] = useState<"all" | "occupied" | "empty" | "custom">("all");
  const [settlementMethod, setSettlementMethod] = useState<ExpenseItem["settlementMethod"]>("اعلام به اهالی ساختمان");
  const [attachmentName, setAttachmentName] = useState("factor_pump_water.jpg");

  // فرم کنتورخوانی
  const [meterType, setMeterType] = useState<"گاز" | "آب" | "برق">("گاز");
  const [meterTotalBill, setMeterTotalBill] = useState(5400000);
  const [meterCalculationMode, setMeterCalculationMode] = useState<"proportional" | "unit_rate">("proportional");
  const [unitRate, setUnitRate] = useState(15000); // قیمت هر واحد مصرفی (متر مکعب یا کیلووات)
  
  const currentUnits = units.filter((u) => u.buildingId === activeBuilding.id);
  const [meterReadings, setMeterReadings] = useState<Record<string, { prev: number; curr: number }>>(() => {
    const initial: Record<string, { prev: number; curr: number }> = {};
    currentUnits.forEach((u, i) => {
      initial[u.id] = { prev: 120 + i * 15, curr: 145 + i * 20 };
    });
    return initial;
  });

  // فرم سایر درآمدها
  const [revTitle, setRevTitle] = useState("اجاره پارکینگ شماره ۵ مهمان");
  const [revCategory, setRevCategory] = useState("اجاره پارکینگ");
  const [revAmount, setRevAmount] = useState(1500000);
  const [revDate, setRevDate] = useState("۱۴۰۵/۰۸/۰۲");
  const [revDesc, setRevDesc] = useState("واریز مستقیم به حساب صندوق ساختمان");

  // سابمیت هزینه عمومی
  const handleGeneralExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addExpense({
      title,
      category,
      calculationMethod,
      totalAmount,
      date,
      description,
      payerType,
      targetUnits,
      settlementMethod,
      attachmentName
    });
    setIsExpenseModalOpen(false);
  };

  // سابمیت کنتورخوانی
  const handleMeterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const readingsList: MeterReadingItem[] = currentUnits.map((u) => {
      const data = meterReadings[u.id] || { prev: 0, curr: 0 };
      const consumption = Math.max(0, data.curr - data.prev);
      return {
        unitId: u.id,
        unitTitle: u.title,
        prevReading: data.prev,
        currentReading: data.curr,
        consumption,
        amount: 0 // محاسبه در ادامه
      };
    });

    const totalConsumption = readingsList.reduce((acc, r) => acc + r.consumption, 0);

    readingsList.forEach((r) => {
      if (meterCalculationMode === "proportional" && totalConsumption > 0) {
        r.amount = Math.round((r.consumption / totalConsumption) * meterTotalBill);
      } else {
        r.amount = r.consumption * unitRate;
      }
    });

    addExpense({
      title: `قبض ${meterType} - کنتورخوانی دوره جدید`,
      category: meterType,
      calculationMethod: "کنتورخوانی",
      totalAmount: meterTotalBill,
      unitPrice: unitRate,
      date: "امروز",
      description: `کنتورخوانی ${meterType} برای ${readingsList.length} واحد`,
      payerType: "ساکن",
      targetUnits: "all",
      settlementMethod: "اعلام به اهالی ساختمان",
      attachmentName: `meter_${meterType}.pdf`,
      meterReadings: readingsList
    });

    setIsMeterModalOpen(false);
  };

  // سابمیت سایر درآمدها
  const handleRevenueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addOtherRevenue({
      title: revTitle,
      category: revCategory,
      amount: revAmount,
      date: revDate,
      description: revDesc
    });
    setIsRevenueModalOpen(false);
  };

  const buildingExpenses = expenses.filter((e) => e.buildingId === activeBuilding.id);
  const buildingRevenues = otherRevenues.filter((r) => r.buildingId === activeBuilding.id);

  return (
    <div className="space-y-6">
      
      {/* سربرگ و تب‌ها */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-red-500" />
            مدیریت هزینه‌ها، کنتورخوانی و سایر درآمدها
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            ثبت فاکتورها، تسهیم هوشمند بر اساس متراژ/نفرات، کنتورخوانی و ثبت درآمدهای جانبی
          </p>
        </div>

        {/* اکشن‌ها */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsMeterModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold transition-colors"
          >
            <Gauge className="w-4 h-4 text-blue-600" />
            کنتورخوانی (آب/برق/گاز)
          </button>
          <button
            onClick={() => setIsRevenueModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition-colors"
          >
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            ثبت درآمد متفرقه
          </button>
          <button
            onClick={() => setIsExpenseModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md shadow-red-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            ثبت هزینه جدید
          </button>
        </div>
      </div>

      {/* ناوبری تب‌های فرعی */}
      <div className="flex border-b border-slate-200 gap-4 text-xs font-bold">
        <button
          onClick={() => setActiveSubTab("general")}
          className={`pb-3 border-b-2 flex items-center gap-1.5 transition-colors ${
            activeSubTab === "general"
              ? "border-red-600 text-red-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <FileText className="w-4 h-4" />
          هزینه‌های ثبت‌شده ({buildingExpenses.length})
        </button>
        <button
          onClick={() => setActiveSubTab("revenues")}
          className={`pb-3 border-b-2 flex items-center gap-1.5 transition-colors ${
            activeSubTab === "revenues"
              ? "border-emerald-600 text-emerald-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          سایر درآمدها ({buildingRevenues.length})
        </button>
      </div>

      {/* محتوای تب هزینه‌ها */}
      {activeSubTab === "general" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {buildingExpenses.map((exp) => (
            <div
              key={exp.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                    {exp.category}
                  </span>
                  <h3 className="font-black text-slate-800 text-sm mt-1">{exp.title}</h3>
                </div>
                <span className="text-xs text-slate-400">{exp.date}</span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <div className="flex justify-between">
                  <span className="text-slate-400">مبلغ کل هزینه:</span>
                  <span className="font-black text-red-600">{formatToman(exp.totalAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">روش تسهیم:</span>
                  <span className="font-bold">{exp.calculationMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">پرداخت‌کننده:</span>
                  <span className="font-bold">{exp.payerType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">نحوه تسویه:</span>
                  <span
                    className={`font-bold ${
                      exp.settlementMethod === "اعلام به اهالی ساختمان"
                        ? "text-blue-600"
                        : "text-amber-600"
                    }`}
                  >
                    {exp.settlementMethod}
                  </span>
                </div>
              </div>

              {exp.description && (
                <p className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg">
                  {exp.description}
                </p>
              )}

              {exp.attachmentName && (
                <div className="flex items-center gap-1.5 text-[11px] text-blue-600 font-semibold cursor-pointer">
                  <Paperclip className="w-3.5 h-3.5" />
                  مشاهده فایل فاکتور ({exp.attachmentName})
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* محتوای تب سایر درآمدها */}
      {activeSubTab === "revenues" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {buildingRevenues.map((rev) => (
            <div
              key={rev.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3"
            >
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  {rev.category}
                </span>
                <span className="text-xs text-slate-400">{rev.date}</span>
              </div>
              <h3 className="font-black text-slate-800 text-sm">{rev.title}</h3>
              <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-100">
                <span className="text-slate-500">مبلغ واریز به صندوق:</span>
                <span className="font-black text-emerald-600 text-sm">{formatToman(rev.amount)}</span>
              </div>
              {rev.description && (
                <p className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg">{rev.description}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* مودال ثبت هزینه عمومی جدید */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-xl my-8 overflow-hidden text-right">
            <div className="bg-red-600 p-5 text-white flex justify-between items-center">
              <div>
                <h3 className="font-black text-base">ثبت هزینه جدید ساختمان</h3>
                <p className="text-xs text-red-100">
                  تسهیم بین واحدها یا پرداخت مستقیم از صندوق ساختمان
                </p>
              </div>
              <button onClick={() => setIsExpenseModalOpen(false)} className="text-white/80 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleGeneralExpenseSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">عنوان هزینه</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">دسته‌بندی</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="تعمیرات و نگهداری">تعمیرات و نگهداری</option>
                    <option value="سرویس آسانسور">سرویس آسانسور</option>
                    <option value="نظافت">نظافت</option>
                    <option value="آب">قبض آب مشترک</option>
                    <option value="برق">قبض برق مشاعات</option>
                    <option value="گاز">قبض گاز مشاعات</option>
                    <option value="سایر">سایر موارد</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">مبلغ کل هزینه (تومان)</label>
                  <input
                    type="number"
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">روش تسهیم بین واحدها</label>
                  <select
                    value={calculationMethod}
                    onChange={(e) => setCalculationMethod(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                  >
                    <option value="مساوی">تقسیم مساوی بین واحدها</option>
                    <option value="بر اساس متراژ">بر اساس متراژ واحدها</option>
                    <option value="بر اساس نفرات">بر اساس تعداد نفرات</option>
                    <option value="مبلغ دلخواه">مبلغ دلخواه</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">طرف پرداخت‌کننده</label>
                  <select
                    value={payerType}
                    onChange={(e) => setPayerType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="مالک">مالک (هزینه‌های اساسی و عمرانی)</option>
                    <option value="ساکن">ساکن (هزینه‌های جاری و مصرفی)</option>
                  </select>
                </div>
              </div>

              {/* روش تسویه - ویژگی مهم خواسته شده در پرامپت */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 space-y-2">
                <label className="block text-xs font-bold text-amber-900">روش پرداخت و تسویه هزینه:</label>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="settlement"
                      checked={settlementMethod === "اعلام به اهالی ساختمان"}
                      onChange={() => setSettlementMethod("اعلام به اهالی ساختمان")}
                      className="text-red-600"
                    />
                    <span>
                      <strong>اعلام به اهالی ساختمان:</strong> مبلغ از صندوق کسر شده و واحدها بدهکار می‌شوند
                    </span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="settlement"
                      checked={settlementMethod === "پرداخت از صندوق بدون اعلام به اهالی"}
                      onChange={() => setSettlementMethod("پرداخت از صندوق بدون اعلام به اهالی")}
                      className="text-red-600"
                    />
                    <span>
                      <strong>پرداخت مستقیم از صندوق:</strong> بدون اعلام و بدون بدهکار شدن اهالی
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">توضیحات فاکتور</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  rows={2}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs shadow-md shadow-red-500/20"
                >
                  ثبت هزینه
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* مودال کنتورخوانی */}
      {isMeterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-2xl my-8 overflow-hidden text-right">
            <div className="bg-blue-700 p-5 text-white flex justify-between items-center">
              <div>
                <h3 className="font-black text-base flex items-center gap-2">
                  <Gauge className="w-5 h-5 text-blue-200" />
                  کنتورخوانی و تسهیم هوشمند قبوض انرژی
                </h3>
                <p className="text-xs text-blue-100">
                  ثبت ارقام قبلی و جدید کنتور برای آب، برق یا گاز هر واحد
                </p>
              </div>
              <button onClick={() => setIsMeterModalOpen(false)} className="text-white/80 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleMeterSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">نوع کنتور</label>
                  <select
                    value={meterType}
                    onChange={(e) => setMeterType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                  >
                    <option value="گاز">گاز مشترک / موتورخانه</option>
                    <option value="آب">آب</option>
                    <option value="برق">برق</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">مبلغ کل قبض (تومان)</label>
                  <input
                    type="number"
                    value={meterTotalBill}
                    onChange={(e) => setMeterTotalBill(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">روش محاسبه</label>
                  <select
                    value={meterCalculationMode}
                    onChange={(e) => setMeterCalculationMode(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="proportional">تقسیم کل قبض به نسبت مصرف</option>
                    <option value="unit_rate">مصرف واحد × قیمت واحد</option>
                  </select>
                </div>
              </div>

              {/* جدول ثبت ارقام کنتور هر واحد */}
              <div>
                <span className="text-xs font-bold text-slate-700 block mb-2">
                  ارقام کنتور واحدها (محاسبه خودکار مصرف):
                </span>
                <div className="border border-slate-200 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-bold">
                      <tr>
                        <th className="p-2.5">واحد</th>
                        <th className="p-2.5">ساکن</th>
                        <th className="p-2.5">رقم قبلی کنتور</th>
                        <th className="p-2.5">رقم جدید کنتور</th>
                        <th className="p-2.5 text-center">مصرف دوره</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {currentUnits.map((u) => {
                        const reading = meterReadings[u.id] || { prev: 0, curr: 0 };
                        const consumption = Math.max(0, reading.curr - reading.prev);
                        return (
                          <tr key={u.id}>
                            <td className="p-2.5 font-bold">{u.title}</td>
                            <td className="p-2.5 text-slate-500">{u.residentName}</td>
                            <td className="p-2.5">
                              <input
                                type="number"
                                value={reading.prev}
                                onChange={(e) =>
                                  setMeterReadings({
                                    ...meterReadings,
                                    [u.id]: { ...reading, prev: Number(e.target.value) }
                                  })
                                }
                                className="w-20 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-center text-xs font-mono"
                              />
                            </td>
                            <td className="p-2.5">
                              <input
                                type="number"
                                value={reading.curr}
                                onChange={(e) =>
                                  setMeterReadings({
                                    ...meterReadings,
                                    [u.id]: { ...reading, curr: Number(e.target.value) }
                                  })
                                }
                                className="w-20 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-center text-xs font-mono"
                              />
                            </td>
                            <td className="p-2.5 text-center font-bold text-blue-600">
                              {consumption} واحد
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
                  onClick={() => setIsMeterModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-500/20"
                >
                  محاسبه و تسهیم خودکار بین واحدها
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* مودال ثبت سایر درآمدها */}
      {isRevenueModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-md my-8 overflow-hidden text-right">
            <div className="bg-emerald-600 p-5 text-white flex justify-between items-center">
              <div>
                <h3 className="font-black text-base">ثبت درآمد متفرقه ساختمان</h3>
                <p className="text-xs text-emerald-100">اجاره پارکینگ، تبلیغات، ضایعات و موضوعات دلخواه</p>
              </div>
              <button onClick={() => setIsRevenueModalOpen(false)} className="text-white/80 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleRevenueSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">عنوان درآمد</label>
                <input
                  type="text"
                  value={revTitle}
                  onChange={(e) => setRevTitle(e.target.value)}
                  placeholder="مثال: اجاره فضای آنتن روی بام"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">موضوع / دسته‌بندی</label>
                  <input
                    type="text"
                    value={revCategory}
                    onChange={(e) => setRevCategory(e.target.value)}
                    placeholder="اجاره، تبلیغات، ضایعات..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">مبلغ دریافتی (تومان)</label>
                  <input
                    type="number"
                    value={revAmount}
                    onChange={(e) => setRevAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">توضیحات</label>
                <textarea
                  value={revDesc}
                  onChange={(e) => setRevDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  rows={2}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRevenueModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-500/20"
                >
                  واریز به صندوق ساختمان
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
