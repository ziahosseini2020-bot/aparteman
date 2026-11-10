"use client";

import React, { useState } from "react";
import { useApp } from "@/lib/store";
import { Expense, ExpenseScenario, Income, MeterReadingRecord } from "@/lib/mockData";
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
  Upload,
  CreditCard,
  Send,
  Zap,
  Droplets,
  Flame,
  Layers
} from "lucide-react";

export const ExpenseManagement: React.FC = () => {
  const {
    expenses,
    createExpense,
    payExpenseFromFund,
    incomes,
    addIncome,
    accounts,
    units,
    activeBuilding,
    sendBaleNotification
  } = useApp();

  const [activeTab, setActiveTab] = useState<"general" | "meter" | "incomes">("general");

  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isMeterModalOpen, setIsMeterModalOpen] = useState(false);
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);

  // فرم هزینه عمومی
  const [title, setTitle] = useState("تعمیر و نگهداری موتورخانه و پمپ آب");
  const [category, setCategory] = useState("تعمیرات و نگهداری");
  const [totalAmount, setTotalAmount] = useState(3800000);
  const [expenseDate, setExpenseDate] = useState("۱۴۰۵/۰۸/۰۴");
  const [scenario, setScenario] = useState<ExpenseScenario>("SCENARIO_1_FUND_PAY_THEN_SPLIT");
  const [calculationMethod, setCalculationMethod] = useState<Expense["calculationMethod"]>("equal");
  const [payerTarget, setPayerTarget] = useState<"residents" | "owners">("owners");
  const [selectedAccountId, setSelectedAccountId] = useState(accounts[0]?.id || "");
  const [description, setDescription] = useState("تعویض بلبرینگ و کاسه‌نمد پمپ خطی شوفاژخانه");

  // فرم کنتورخوانی
  const [meterType, setMeterType] = useState<"gas" | "water" | "electricity">("gas");
  const [meterTotalBill, setMeterTotalBill] = useState(4800000);
  const [meterCalcMode, setMeterCalcMode] = useState<"proportional_share" | "fixed_rate_per_unit">("proportional_share");
  const [unitRate, setUnitRate] = useState(12000); // نرخ هر واحد مصرفی

  const currentUnits = units.filter((u) => u.buildingId === activeBuilding.id);
  const [meterReadings, setMeterReadings] = useState<Record<string, { prev: number; curr: number }>>(() => {
    const initial: Record<string, { prev: number; curr: number }> = {};
    currentUnits.forEach((u, i) => {
      initial[u.id] = { prev: 150 + i * 20, curr: 185 + i * 25 };
    });
    return initial;
  });

  // فرم درآمد متفرقه
  const [incTitle, setIncTitle] = useState("اجاره پارکینگ شماره ۴ به مهمان");
  const [incCategory, setIncCategory] = useState<Income["category"]>("اجاره پارکینگ");
  const [incAmount, setIncAmount] = useState(1500000);
  const [incDate, setIncDate] = useState("۱۴۰۵/۰۸/۰۲");
  const [incPayer, setIncPayer] = useState("آقای رحیمی (واحد ۳۰۱)");
  const [incAccountId, setIncAccountId] = useState(accounts[0]?.id || "");

  // سابمیت هزینه عمومی
  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createExpense({
      title,
      category,
      totalAmount,
      expenseDate,
      scenario,
      calculationMethod,
      payerTarget,
      targetScope: "all",
      description,
      payStatus: scenario === "SCENARIO_1_FUND_PAY_THEN_SPLIT" || scenario === "SCENARIO_3_FUND_PAY_NO_SPLIT" ? "paid" : "unpaid",
      paidFromAccountId: scenario !== "SCENARIO_2_SPLIT_COLLECT_THEN_PAY" ? selectedAccountId : undefined
    });
    setIsExpenseModalOpen(false);
  };

  // سابمیت کنتورخوانی
  const handleMeterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const readingsList: MeterReadingRecord[] = currentUnits.map((u) => {
      const data = meterReadings[u.id] || { prev: 0, curr: 0 };
      const consumption = Math.max(0, data.curr - data.prev);
      return {
        id: "mr-" + u.id,
        unitId: u.id,
        unitTitle: u.name,
        previousNumber: data.prev,
        currentNumber: data.curr,
        consumption,
        calculatedAmount: 0 // محاسبه در ادامه
      };
    });

    const totalConsumption = readingsList.reduce((acc, r) => acc + r.consumption, 0);

    const finalReadings = readingsList.map((r) => {
      let amount = 0;
      if (meterCalcMode === "proportional_share") {
        amount = totalConsumption > 0 ? Math.round((r.consumption / totalConsumption) * meterTotalBill) : 0;
      } else {
        amount = r.consumption * unitRate;
      }
      return { ...r, calculatedAmount: amount };
    });

    createExpense({
      title: `قبض تجمیعی ${meterType === "gas" ? "گاز" : meterType === "water" ? "آب" : "برق"} دوره آبان`,
      category: `قبوض (${meterType === "gas" ? "گاز" : meterType === "water" ? "آب" : "برق"})`,
      totalAmount: meterTotalBill,
      expenseDate: "۱۴۰۵/۰۸/۰۳",
      scenario: "SCENARIO_1_FUND_PAY_THEN_SPLIT",
      calculationMethod: "meter_consumption",
      payerTarget: "residents",
      targetScope: "all",
      description: `کنتورخوانی ${meterType} با روش ${meterCalcMode === "proportional_share" ? "تسهیم به نسبت مصرف" : "نرخ مصوب هر واحد"}`,
      payStatus: "paid",
      paidFromAccountId: selectedAccountId,
      meterReadings: finalReadings
    });

    setIsMeterModalOpen(false);
  };

  // سابمیت سایر درآمدها
  const handleIncomeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addIncome({
      title: incTitle,
      category: incCategory,
      amount: incAmount,
      incomeDate: incDate,
      payerName: incPayer,
      receivedToAccountId: incAccountId,
      status: "received",
      description: "ثبت مستقیم در درآمد متفرقه مجتمع"
    });
    setIsIncomeModalOpen(false);
  };

  const buildingExpenses = expenses.filter((e) => e.buildingId === activeBuilding.id);
  const buildingIncomes = incomes.filter((i) => i.buildingId === activeBuilding.id);

  return (
    <div className="space-y-6">
      
      {/* هدر بخش و دکمه‌های عملیاتی */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-emerald-600" />
            مدیریت هزینه‌ها، کنتورخوانی و سایر درآمدها
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            پیاده‌سازی دقیق ۳ سناریوی هزینه، تسهیم کنتورهای مشترک آب، گاز و برق و درآمدهای متفرقه
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsIncomeModalOpen(true)}
            className="px-3 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <TrendingUp className="w-4 h-4" />
            ثبت درآمد متفرقه
          </button>
          <button
            onClick={() => setIsMeterModalOpen(true)}
            className="px-3 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <Gauge className="w-4 h-4" />
            ثبت کنتورخوانی (آب/برق/گاز)
          </button>
          <button
            onClick={() => setIsExpenseModalOpen(true)}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
          >
            <Plus className="w-4 h-4" />
            ثبت هزینه جدید (۳ سناریو)
          </button>
        </div>
      </div>

      {/* تب‌های ناوبری داخلی */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab("general")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "general"
              ? "bg-slate-900 text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          هزینه‌های عمومی ساختمان ({buildingExpenses.length})
        </button>
        <button
          onClick={() => setActiveTab("meter")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === "meter"
              ? "bg-slate-900 text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Gauge className="w-3.5 h-3.5" />
          کنتورخوانی و تسهیم انشعابات
        </button>
        <button
          onClick={() => setActiveTab("incomes")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === "incomes"
              ? "bg-slate-900 text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          سایر درآمدهای مجتمع ({buildingIncomes.length})
        </button>
      </div>

      {/* محتوای تب هزینه‌های عمومی */}
      {activeTab === "general" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {buildingExpenses.map((exp) => (
              <div
                key={exp.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3 hover:border-emerald-300 transition-all"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">{exp.title}</h3>
                    <span className="text-[11px] text-slate-400 block mt-0.5">{exp.category} • {exp.expenseDate}</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    exp.scenario === "SCENARIO_1_FUND_PAY_THEN_SPLIT"
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : exp.scenario === "SCENARIO_2_SPLIT_COLLECT_THEN_PAY"
                      ? "bg-amber-50 text-amber-700 border border-amber-200"
                      : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  }`}>
                    {exp.scenario === "SCENARIO_1_FUND_PAY_THEN_SPLIT"
                      ? "سناریو ۱: پرداخت سپس تسهیم"
                      : exp.scenario === "SCENARIO_2_SPLIT_COLLECT_THEN_PAY"
                      ? "سناریو ۲: تسهیم اول، سپس پرداخت"
                      : "سناریو ۳: از صندوق بدون تسهیم"}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">مبلغ کل هزینه:</span>
                    <span className="font-black text-slate-900">{formatToman(exp.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">پرداخت‌کننده هدف:</span>
                    <span className="font-bold text-slate-700">
                      {exp.payerTarget === "owners" ? "مالکین واحدها" : "ساکنین"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">وضعیت پرداخت به پیمانکار:</span>
                    <span className={`font-bold ${exp.payStatus === "paid" ? "text-emerald-600" : "text-amber-600"}`}>
                      {exp.payStatus === "paid" ? "پرداخت شده ✓" : "در انتظار وصول و پرداخت"}
                    </span>
                  </div>
                </div>

                {exp.payStatus === "unpaid" && (
                  <button
                    onClick={() => payExpenseFromFund(exp.id, accounts[0]?.id)}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    پرداخت هزینه از حساب صندوق ساختمان
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* محتوای تب کنتورخوانی */}
      {activeTab === "meter" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-black text-slate-800 text-sm">تسهیم مصرف قبوض مشاعات با کنتور فرعی یا تفکیکی</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                محاسبه رقم کنتورهای گاز، آب و برق بر مبنای نسبت مصرف یا نرخ واحد
              </p>
            </div>
            <button
              onClick={() => setIsMeterModalOpen(true)}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm shrink-0"
            >
              <Plus className="w-4 h-4" />
              ثبت کنتورخوانی دوره جدید
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/40 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-xs text-slate-800 block">کنتور گاز موتورخانه و واحدها</span>
                <span className="text-[11px] text-slate-500">ثبت‌شده در دوره جاری: فعال</span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-cyan-100 bg-cyan-50/40 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center shrink-0">
                <Droplets className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-xs text-slate-800 block">کنتور آب مشاعات و پمپ</span>
                <span className="text-[11px] text-slate-500">تسهیم بر اساس مصرف و نفرات</span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-amber-100 bg-amber-50/40 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-xs text-slate-800 block">برق عمومی و آسانسورها</span>
                <span className="text-[11px] text-slate-500">تسهیم بر اساس متراژ و کنتور</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* محتوای تب سایر درآمدها */}
      {activeTab === "incomes" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-black text-slate-800 text-sm">سایر درآمدهای مجتمع (غیر از شارژ)</h3>
              <p className="text-xs text-slate-500 mt-0.5">اجاره پارکینگ، تبلیغات در لابی و آسانسور، فروش ضایعات و اقلام مازاد</p>
            </div>
            <button
              onClick={() => setIsIncomeModalOpen(true)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              افزودن درآمد جدید
            </button>
          </div>

          <div className="space-y-2.5">
            {buildingIncomes.map((inc) => (
              <div
                key={inc.id}
                className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-slate-800 text-sm">{inc.title}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    دسته‌بندی: {inc.category} • تاریخ: {inc.incomeDate} • طرف حساب: {inc.payerName}
                  </div>
                </div>

                <div className="text-left">
                  <span className="font-black text-emerald-600 text-base block">
                    +{formatToman(inc.amount)}
                  </span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold">
                    واریز به صندوق مجتمع
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* مودال ثبت هزینه عمومی */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-xl my-6 overflow-hidden text-right">
            <div className="bg-gradient-to-r from-emerald-700 to-teal-800 p-5 text-white flex justify-between items-center">
              <div>
                <h3 className="font-black text-base">ثبت هزینه جدید در سامانه سرابان</h3>
                <p className="text-xs text-emerald-100">پشتیبانی از سناریوهای ۱ و ۲ و ۳ پرداخت و تسهیم</p>
              </div>
              <button onClick={() => setIsExpenseModalOpen(false)} className="text-white/80 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleExpenseSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">عنوان هزینه</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">دسته‌بندی</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="تعمیرات و نگهداری">تعمیرات و نگهداری</option>
                    <option value="نظافت و بهداشت">نظافت و بهداشت</option>
                    <option value="سرویس آسانسور">سرویس آسانسور</option>
                    <option value="لوازم مصرفی مشاعات">لوازم مصرفی مشاعات</option>
                    <option value="سرایداری و نگهبانی">سرایداری و نگهبانی</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">مبلغ کل هزینه (تومان)</label>
                  <input
                    type="number"
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-center font-bold"
                  />
                </div>
              </div>

              {/* سناریوهای سه‌گانه */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">روش و سناریوی پرداخت:</label>
                <div className="space-y-2">
                  {[
                    { id: "SCENARIO_1_FUND_PAY_THEN_SPLIT", title: "سناریو ۱: پرداخت از صندوق/بانک، سپس تسهیم به واحدها", desc: "کسر فوری از حساب بانکی ساختمان و ایجاد بدهی برای واحدها" },
                    { id: "SCENARIO_2_SPLIT_COLLECT_THEN_PAY", title: "سناریو ۲: تسهیم و وصول اول، سپس پرداخت به پیمانکار", desc: "اعلام به اهالی جهت واریز؛ پرداخت به پیمانکار پس از وصول کامل" },
                    { id: "SCENARIO_3_FUND_PAY_NO_SPLIT", title: "سناریو ۳: پرداخت مستقیم از صندوق بدون تسهیم به اهالی", desc: "هزینه جاری از محل شارژ عمومی پرداخت شده و واحدها بدهکار نمی‌شوند" }
                  ].map((sc) => (
                    <label
                      key={sc.id}
                      onClick={() => setScenario(sc.id as any)}
                      className={`p-3 rounded-xl border cursor-pointer block transition-all ${
                        scenario === sc.id
                          ? "border-emerald-500 bg-emerald-50/70 ring-1 ring-emerald-500"
                          : "border-slate-200 bg-white hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-800">{sc.title}</span>
                        <input
                          type="radio"
                          checked={scenario === sc.id}
                          onChange={() => setScenario(sc.id as any)}
                          className="accent-emerald-600"
                        />
                      </div>
                      <span className="text-[11px] text-slate-500 mt-1 block">{sc.desc}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* حساب پرداخت‌کننده */}
              {scenario !== "SCENARIO_2_SPLIT_COLLECT_THEN_PAY" && (
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">پرداخت از حساب مالی / صندوق:</label>
                  <select
                    value={selectedAccountId}
                    onChange={(e) => setSelectedAccountId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} (موجودی: {formatToman(acc.currentBalance)})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition-all"
              >
                ثبت هزینه و صدور اسناد حسابداری
              </button>
            </form>
          </div>
        </div>
      )}

      {/* مودال کنتورخوانی */}
      {isMeterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-xl my-6 overflow-hidden text-right">
            <div className="bg-gradient-to-r from-blue-700 to-cyan-800 p-5 text-white flex justify-between items-center">
              <div>
                <h3 className="font-black text-base flex items-center gap-2">
                  <Gauge className="w-5 h-5" />
                  ثبت ارقام کنتور و تسهیم قبض دوره
                </h3>
                <p className="text-xs text-blue-100">ورود شماره قبلی و فعلی کنتور هر واحد و محاسبه خودکار سهم مصرف</p>
              </div>
              <button onClick={() => setIsMeterModalOpen(false)} className="text-white/80 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleMeterSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">نوع انشعاب</label>
                  <select
                    value={meterType}
                    onChange={(e) => setMeterType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="gas">گاز موتورخانه</option>
                    <option value="water">آب مصرفی مشاعات</option>
                    <option value="electricity">برق عمومی</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">مبلغ کل قبض (تومان)</label>
                  <input
                    type="number"
                    value={meterTotalBill}
                    onChange={(e) => setMeterTotalBill(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-center font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">روش محاسبه</label>
                  <select
                    value={meterCalcMode}
                    onChange={(e) => setMeterCalcMode(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="proportional_share">تسهیم به نسبت مصرف</option>
                    <option value="fixed_rate_per_unit">نرخ ثابت به ازای هر واحد</option>
                  </select>
                </div>
              </div>

              {/* جدول ورود رقم‌های کنتور هر واحد */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-700 block">ارقام کنتور واحدهای مجتمع:</span>
                <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                  {currentUnits.map((u) => {
                    const data = meterReadings[u.id] || { prev: 100, curr: 120 };
                    const diff = Math.max(0, data.curr - data.prev);
                    return (
                      <div key={u.id} className="p-2 bg-white rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800 w-24 truncate">{u.name}</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={data.prev}
                            onChange={(e) => setMeterReadings({
                              ...meterReadings,
                              [u.id]: { ...data, prev: Number(e.target.value) }
                            })}
                            placeholder="رقم قبلی"
                            className="w-20 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-center text-xs"
                          />
                          <span className="text-slate-400">←</span>
                          <input
                            type="number"
                            value={data.curr}
                            onChange={(e) => setMeterReadings({
                              ...meterReadings,
                              [u.id]: { ...data, curr: Number(e.target.value) }
                            })}
                            placeholder="رقم فعلی"
                            className="w-20 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-center text-xs"
                          />
                        </div>
                        <span className="text-blue-600 font-bold w-16 text-left">{diff} واحد</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md transition-all"
              >
                تایید ارقام کنتور و صدور سهم واحدهای مصرف‌کننده
              </button>
            </form>
          </div>
        </div>
      )}

      {/* مودال سایر درآمدها */}
      {isIncomeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden text-right">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-5 text-white flex justify-between items-center">
              <div>
                <h3 className="font-black text-base flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  ثبت سایر درآمدهای مجتمع
                </h3>
                <p className="text-xs text-emerald-100">درآمدهای اجاره، تبلیغات، فروش ضایعات و اقلام مازاد</p>
              </div>
              <button onClick={() => setIsIncomeModalOpen(false)} className="text-white/80 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleIncomeSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">موضوع درآمد</label>
                <input
                  type="text"
                  value={incTitle}
                  onChange={(e) => setIncTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">دسته‌بندی</label>
                  <select
                    value={incCategory}
                    onChange={(e) => setIncCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="اجاره پارکینگ">اجاره پارکینگ</option>
                    <option value="تبلیغات آسانسور">تبلیغات آسانسور و لابی</option>
                    <option value="فروش ضایعات">فروش ضایعات و بازیافت</option>
                    <option value="اجاره آنتن/بام">اجاره آنتن/بام</option>
                    <option value="سایر درآمدها">سایر موارد</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">مبلغ واریزی (تومان)</label>
                  <input
                    type="number"
                    value={incAmount}
                    onChange={(e) => setIncAmount(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-center font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">واریز به کدام حساب مالی؟</label>
                <select
                  value={incAccountId}
                  onChange={(e) => setIncAccountId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                >
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.name}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition-all"
              >
                ثبت درآمد و افزایش موجودی صندوق
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
