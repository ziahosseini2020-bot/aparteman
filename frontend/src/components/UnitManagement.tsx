"use client";

import React, { useState } from "react";
import { useApp } from "@/lib/store";
import { Unit, Block } from "@/lib/mockData";
import { formatToman } from "@/lib/utils";
import {
  Home,
  Plus,
  FileSpreadsheet,
  Search,
  Users,
  Maximize2,
  Car,
  Package,
  CheckCircle,
  AlertCircle,
  UserCheck,
  Building,
  Upload,
  Download,
  Layers,
  Calendar,
  Percent,
  CreditCard,
  ShieldAlert
} from "lucide-react";

export const UnitManagement: React.FC = () => {
  const { units, addUnit, importUnitsExcel, activeBuilding, createBlock } = useApp();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBlockId, setSelectedBlockId] = useState("all");
  const [isAddUnitModalOpen, setIsAddUnitModalOpen] = useState(false);
  const [isAddBlockModalOpen, setIsAddBlockModalOpen] = useState(false);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);

  // فرم ثبت واحد تکی
  const [name, setName] = useState("واحد ۱۰۵");
  const [blockName, setBlockName] = useState(activeBuilding.blocks[0]?.name || "بلوک A");
  const [floorNumber, setFloorNumber] = useState(2);
  const [area, setArea] = useState(105);
  const [peopleCount, setPeopleCount] = useState(3);
  const [parkingCount, setParkingCount] = useState(1);
  const [storeCount, setStoreCount] = useState(1);
  const [residentialStatus, setResidentialStatus] = useState<"مالک نشین" | "مستاجر نشین" | "خالی">("مالک نشین");
  const [defaultChargeAmount, setDefaultChargeAmount] = useState(500000);
  const [initialBalance, setInitialBalance] = useState(0);

  // مشخصات ساکن
  const [residentName, setResidentName] = useState("سید مهدی حسینی");
  const [residentMobile, setResidentMobile] = useState("09123334455");
  const [residentNationalCode, setResidentNationalCode] = useState("0018765432");
  const [residentStartDate, setResidentStartDate] = useState("۱۴۰۴/۰۷/۰۱");
  const [residentEndDate, setResidentEndDate] = useState("۱۴۰۵/۰۶/۳۱");

  // مشخصات مالک
  const [ownerName, setOwnerName] = useState("سید مهدی حسینی");
  const [ownerMobile, setOwnerMobile] = useState("09123334455");
  const [ownerNationalCode, setOwnerNationalCode] = useState("0018765432");
  const [ownershipPercentage, setOwnershipPercentage] = useState(100);

  // فرم ثبت بلوک جدید
  const [newBlockName, setNewBlockName] = useState("بلوک C (شمالی)");
  const [newBlockFloors, setNewBlockFloors] = useState(5);
  const [newBlockUnits, setNewBlockUnits] = useState(10);
  const [newBlockManager, setNewBlockManager] = useState("مهندس کمالی");

  // واحدهای فیلتر شده
  const currentUnits = units.filter((u) => {
    if (u.buildingId !== activeBuilding.id) return false;
    if (selectedBlockId !== "all" && u.blockName !== selectedBlockId) return false;
    if (searchTerm) {
      const matchName = u.name.includes(searchTerm);
      const matchResident = u.residents.some(r => r.userName.includes(searchTerm) || r.userMobile.includes(searchTerm));
      const matchOwner = u.owners.some(o => o.userName.includes(searchTerm) || o.userMobile.includes(searchTerm));
      return matchName || matchResident || matchOwner;
    }
    return true;
  });

  // ارسال فرم واحد تکی
  const handleAddUnitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isOwnerRes = residentialStatus === "مالک نشین";
    addUnit({
      name,
      blockName,
      floorNumber,
      area,
      peopleCount: residentialStatus === "خالی" ? 0 : peopleCount,
      parkingCount,
      storeCount,
      residentialStatus,
      defaultChargeAmount,
      initialBalance,
      ownerName,
      ownerMobile,
      residentName: isOwnerRes ? ownerName : residentName,
      residentMobile: isOwnerRes ? ownerMobile : residentMobile,
      isOwnerResident: isOwnerRes
    });
    setIsAddUnitModalOpen(false);
  };

  // ارسال فرم بلوک جدید
  const handleAddBlockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createBlock(newBlockName, newBlockFloors, newBlockUnits, newBlockManager);
    setIsAddBlockModalOpen(false);
  };

  // نمونه داده‌های اکسل
  const mockExcelData = [
    { title: "واحد ۲۰۱", blockName: "بلوک A", floor: 2, area: 110, occupants: 3, defaultCharge: 550000, residentType: "مالک و ساکن", ownerName: "رضا احمدی", ownerMobile: "09121114455", residentName: "رضا احمدی", residentMobile: "09121114455" },
    { title: "واحد ۲۰۲", blockName: "بلوک A", floor: 2, area: 95, occupants: 2, defaultCharge: 450000, residentType: "مستاجر", ownerName: "کامران بهرامی", ownerMobile: "09125556677", residentName: "پیمان صادقی", residentMobile: "09362223344" },
    { title: "واحد ۲۰۳", blockName: "بلوک B", floor: 2, area: 130, occupants: 4, defaultCharge: 600000, residentType: "مالک و ساکن", ownerName: "فرزاد حسینی", ownerMobile: "09127778899", residentName: "فرزاد حسینی", residentMobile: "09127778899" },
    { title: "واحد ۲۰۴", blockName: "بلوک B", floor: 2, area: 85, occupants: 0, defaultCharge: 300000, residentType: "خالی", ownerName: "مریم شمس", ownerMobile: "09128889900", residentName: "", residentMobile: "" }
  ];

  const handleImportExcel = () => {
    importUnitsExcel(mockExcelData);
    setIsExcelModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* هدر بخش و دکمه‌های عملیاتی */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
            <Home className="w-5 h-5 text-emerald-600" />
            مدیریت واحدها، بلوک‌ها و مالکان
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            امکان تفکیک چندمالکی (درصد مالکیت)، تاریخچه سکونت مستأجر، شارژ پیش‌فرض و ورود دسته‌جمعی از اکسل
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsAddBlockModalOpen(true)}
            className="px-3 py-2 bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <Layers className="w-4 h-4" />
            تعریف بلوک جدید
          </button>
          <button
            onClick={() => setIsExcelModalOpen(true)}
            className="px-3 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4" />
            ورود گروهی با اکسل
          </button>
          <button
            onClick={() => setIsAddUnitModalOpen(true)}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
          >
            <Plus className="w-4 h-4" />
            ثبت واحد جدید
          </button>
        </div>
      </div>

      {/* فیلترها و جستجو */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* جستجو */}
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="جستجوی نام واحد، ساکن یا مالک..."
            className="w-full pl-3 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-emerald-500 transition-colors"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
        </div>

        {/* فیلتر بلوک‌ها */}
        {activeBuilding.blocks.length > 0 && (
          <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
            <span className="text-xs text-slate-400 ml-2 shrink-0">فیلتر بر اساس بلوک:</span>
            <button
              onClick={() => setSelectedBlockId("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedBlockId === "all"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              همه ({units.filter(u => u.buildingId === activeBuilding.id).length})
            </button>
            {activeBuilding.blocks.map((blk) => (
              <button
                key={blk.id}
                onClick={() => setSelectedBlockId(blk.name)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                  selectedBlockId === blk.name
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {blk.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* جدول کارت‌های واحدها */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentUnits.map((unit) => {
          const owner = unit.owners[0];
          const resident = unit.residents[0];
          const isDebtor = unit.currentBalance < 0;

          return (
            <div
              key={unit.id}
              className={`bg-white rounded-2xl border p-5 shadow-sm transition-all hover:shadow-md ${
                isDebtor ? "border-red-200 hover:border-red-300" : "border-slate-200 hover:border-emerald-300"
              }`}
            >
              {/* هدر کارت واحد */}
              <div className="flex justify-between items-start pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-slate-900 text-base">{unit.name}</h3>
                    {unit.blockName && (
                      <span className="text-[10px] bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full font-bold">
                        {unit.blockName}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 mt-0.5 block">
                    طبقه {unit.floorNumber} • متراژ {unit.area} متر • {unit.peopleCount} نفر
                  </span>
                </div>

                <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold ${
                  unit.residentialStatus === "مالک نشین"
                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : unit.residentialStatus === "مستاجر نشین"
                    ? "bg-amber-50 text-amber-700 border border-amber-200"
                    : "bg-slate-100 text-slate-600"
                }`}>
                  {unit.residentialStatus}
                </span>
              </div>

              {/* مشخصات سکونت و مالکیت */}
              <div className="py-3 space-y-2 text-xs border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5" />
                    مالک:
                  </span>
                  <div className="text-left font-bold text-slate-700">
                    {owner ? `${owner.userName} (${owner.ownershipPercentage || 100}٪)` : "ثبت نشده"}
                  </div>
                </div>

                {unit.residentialStatus === "مستاجر نشین" && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      مستأجر:
                    </span>
                    <div className="text-left font-bold text-amber-700">
                      {resident ? `${resident.userName} (${resident.userMobile})` : "ثبت نشده"}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Car className="w-3.5 h-3.5" />
                    پارکینگ و انباری:
                  </span>
                  <span className="text-slate-600 font-medium">
                    {unit.parkingCount} پارکینگ / {unit.storeCount} انباری
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">شارژ پیش‌فرض:</span>
                  <span className="text-slate-700 font-bold">{formatToman(unit.defaultChargeAmount)}</span>
                </div>
              </div>

              {/* مانده حساب و تراز معین */}
              <div className="pt-3 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 block">مانده حساب واحد:</span>
                  <span className={`font-black text-sm block ${
                    isDebtor ? "text-red-600" : unit.currentBalance > 0 ? "text-emerald-600" : "text-slate-500"
                  }`}>
                    {isDebtor
                      ? `بدهکار (${formatToman(Math.abs(unit.currentBalance))})`
                      : unit.currentBalance > 0
                      ? `بستانکار (${formatToman(unit.currentBalance)})`
                      : "تسویه کامل (۰ تومان)"}
                  </span>
                </div>

                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded-lg font-mono">
                  شناسه: {unit.id}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* مودال ثبت واحد تکی */}
      {isAddUnitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-xl my-6 overflow-hidden text-right">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-5 text-white flex justify-between items-center">
              <div>
                <h3 className="font-black text-base">تعریف واحد جدید در مجتمع</h3>
                <p className="text-xs text-emerald-100">ثبت اطلاعات فیزیکی، مالک، ساکن و شارژ پیش‌فرض</p>
              </div>
              <button onClick={() => setIsAddUnitModalOpen(false)} className="text-white/80 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddUnitSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">عنوان / شماره واحد</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">بلوک</label>
                  <select
                    value={blockName}
                    onChange={(e) => setBlockName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    {activeBuilding.blocks.map(b => (
                      <option key={b.id} value={b.name}>{b.name}</option>
                    ))}
                    {activeBuilding.blocks.length === 0 && <option value="اصلی">بلوک اصلی</option>}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">طبقه</label>
                  <input
                    type="number"
                    value={floorNumber}
                    onChange={(e) => setFloorNumber(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-center"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">متراژ (متر)</label>
                  <input
                    type="number"
                    value={area}
                    onChange={(e) => setArea(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-center"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">تعداد نفرات</label>
                  <input
                    type="number"
                    value={peopleCount}
                    onChange={(e) => setPeopleCount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-center"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">شارژ پیش‌فرض (تومان)</label>
                  <input
                    type="number"
                    value={defaultChargeAmount}
                    onChange={(e) => setDefaultChargeAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-center"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">وضعیت سکونت</label>
                  <select
                    value={residentialStatus}
                    onChange={(e) => setResidentialStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="مالک نشین">مالک و ساکن</option>
                    <option value="مستاجر نشین">مستاجر نشین</option>
                    <option value="خالی">واحد خالی</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">تعداد پارکینگ</label>
                  <input
                    type="number"
                    value={parkingCount}
                    onChange={(e) => setParkingCount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-center"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">تعداد انباری</label>
                  <input
                    type="number"
                    value={storeCount}
                    onChange={(e) => setStoreCount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-center"
                  />
                </div>
              </div>

              {/* مشخصات مالک */}
              <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 space-y-3">
                <span className="text-xs font-bold text-blue-900 block">مشخصات مالک واحد</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="نام و نام خانوادگی مالک"
                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                  <input
                    type="text"
                    value={ownerMobile}
                    onChange={(e) => setOwnerMobile(e.target.value)}
                    placeholder="شماره موبایل مالک"
                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                  <input
                    type="text"
                    value={ownerNationalCode}
                    onChange={(e) => setOwnerNationalCode(e.target.value)}
                    placeholder="کد ملی مالک"
                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* مشخصات مستأجر (در صورت وجود) */}
              {residentialStatus === "مستاجر نشین" && (
                <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100 space-y-3">
                  <span className="text-xs font-bold text-amber-900 block">مشخصات مستأجر واحد</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={residentName}
                      onChange={(e) => setResidentName(e.target.value)}
                      placeholder="نام مستأجر"
                      className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                    <input
                      type="text"
                      value={residentMobile}
                      onChange={(e) => setResidentMobile(e.target.value)}
                      placeholder="موبایل مستأجر"
                      className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                    <input
                      type="text"
                      value={residentNationalCode}
                      onChange={(e) => setResidentNationalCode(e.target.value)}
                      placeholder="کد ملی مستأجر"
                      className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition-all"
              >
                ذخیره واحد و صدور رکورد در سیستم
              </button>
            </form>
          </div>
        </div>
      )}

      {/* مودال ورود گروهی اکسل */}
      {isExcelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-2xl overflow-hidden text-right">
            <div className="bg-gradient-to-r from-emerald-700 to-teal-800 p-5 text-white flex justify-between items-center">
              <div>
                <h3 className="font-black text-base flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5" />
                  ورود هوشمند واحدها از طریق فایل اکسل
                </h3>
                <p className="text-xs text-emerald-100">ایمپورت دسته‌جمعی مشخصات بلوک‌ها، واحدها و اهالی</p>
              </div>
              <button onClick={() => setIsExcelModalOpen(false)} className="text-white/80 hover:text-white">✕</button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2">
                <span className="font-bold text-slate-800 block">پیش‌نمایش ۴ ردیف داده آماده اکسل برای تست:</span>
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-[11px]">
                    <thead className="bg-slate-200/70 text-slate-700 font-bold">
                      <tr>
                        <th className="p-1.5">بلوک</th>
                        <th className="p-1.5">واحد</th>
                        <th className="p-1.5">متراژ</th>
                        <th className="p-1.5">نفرات</th>
                        <th className="p-1.5">شارژ پیش‌فرض</th>
                        <th className="p-1.5">ساکن</th>
                        <th className="p-1.5">موبایل</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {mockExcelData.map((row, idx) => (
                        <tr key={idx}>
                          <td className="p-1.5">{row.blockName}</td>
                          <td className="p-1.5 font-bold">{row.title}</td>
                          <td className="p-1.5">{row.area} م</td>
                          <td className="p-1.5">{row.occupants}</td>
                          <td className="p-1.5">{formatToman(row.defaultCharge)}</td>
                          <td className="p-1.5">{row.residentName || "خالی"}</td>
                          <td className="p-1.5 font-mono">{row.residentMobile || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleImportExcel}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  تایید و بارگذاری ۴ واحد نمونه
                </button>
                <button
                  type="button"
                  onClick={() => setIsExcelModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all"
                >
                  انصراف
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* مودال تعریف بلوک جدید */}
      {isAddBlockModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden text-right">
            <div className="bg-gradient-to-r from-purple-700 to-indigo-800 p-5 text-white flex justify-between items-center">
              <div>
                <h3 className="font-black text-base flex items-center gap-2">
                  <Layers className="w-5 h-5" />
                  تعریف بلوک جدید در مجتمع
                </h3>
                <p className="text-xs text-purple-100">پشتیبانی از نقش مدیر بلوک و تقسیم‌بندی اختصاصی</p>
              </div>
              <button onClick={() => setIsAddBlockModalOpen(false)} className="text-white/80 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddBlockSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">نام بلوک</label>
                <input
                  type="text"
                  value={newBlockName}
                  onChange={(e) => setNewBlockName(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">تعداد طبقات</label>
                  <input
                    type="number"
                    value={newBlockFloors}
                    onChange={(e) => setNewBlockFloors(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-center"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">تعداد واحدها</label>
                  <input
                    type="number"
                    value={newBlockUnits}
                    onChange={(e) => setNewBlockUnits(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-center"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">نام مدیر بلوک (اختیاری)</label>
                <input
                  type="text"
                  value={newBlockManager}
                  onChange={(e) => setNewBlockManager(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs shadow-md transition-all"
              >
                ثبت بلوک جدید
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
