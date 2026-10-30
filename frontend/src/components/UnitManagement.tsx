"use client";

import React, { useState } from "react";
import { useApp } from "@/lib/store";
import { Unit } from "@/lib/mockData";
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
  Download
} from "lucide-react";

export const UnitManagement: React.FC = () => {
  const { units, addUnit, importUnitsFromExcel, activeBuilding } = useApp();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterBlock, setFilterBlock] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);

  // فرم ثبت واحد تکی
  const [title, setTitle] = useState("واحد ۱۰۵");
  const [blockName, setBlockName] = useState(activeBuilding.blocks[0]?.name || "بلوک A");
  const [floor, setFloor] = useState(2);
  const [area, setArea] = useState(105);
  const [occupants, setOccupants] = useState(3);
  const [parkingCount, setParkingCount] = useState(1);
  const [storageCount, setStorageCount] = useState(1);
  const [isOccupied, setIsOccupied] = useState(true);
  const [residentType, setResidentType] = useState<"مالک و ساکن" | "مستاجر">("مالک و ساکن");
  const [defaultCharge, setDefaultCharge] = useState(500000);

  // مشخصات ساکن
  const [residentName, setResidentName] = useState("");
  const [residentMobile, setResidentMobile] = useState("");
  const [residentNationalCode, setResidentNationalCode] = useState("");

  // مشخصات مالک
  const [ownerName, setOwnerName] = useState("");
  const [ownerMobile, setOwnerMobile] = useState("");
  const [ownerNationalCode, setOwnerNationalCode] = useState("");

  // نمونه داده‌های اکسل برای تست
  const mockExcelUnits: Omit<Unit, "id" | "buildingId" | "balance">[] = [
    {
      title: "واحد ۳۰۱",
      blockName: "بلوک A",
      floor: 3,
      area: 110,
      occupants: 4,
      parkingCount: 1,
      storageCount: 1,
      isOccupied: true,
      residentType: "مالک و ساکن",
      residentName: "رضا احمدی",
      residentMobile: "09121114455",
      residentNationalCode: "0019876543",
      ownerName: "رضا احمدی",
      ownerMobile: "09121114455",
      ownerNationalCode: "0019876543",
      defaultCharge: 550000
    },
    {
      title: "واحد ۳۰۲",
      blockName: "بلوک A",
      floor: 3,
      area: 88,
      occupants: 2,
      parkingCount: 1,
      storageCount: 1,
      isOccupied: true,
      residentType: "مستاجر",
      residentName: "پیمان صادقی",
      residentMobile: "09362223344",
      residentNationalCode: "0088997766",
      ownerName: "کامران بهرامی",
      ownerMobile: "09125556677",
      ownerNationalCode: "0033221144",
      defaultCharge: 420000
    },
    {
      title: "واحد ۳۰۳",
      blockName: "بلوک B",
      floor: 3,
      area: 135,
      occupants: 0,
      parkingCount: 2,
      storageCount: 1,
      isOccupied: false,
      residentType: "مالک و ساکن",
      residentName: "خالی",
      residentMobile: "09127778899",
      residentNationalCode: "0055667788",
      ownerName: "فرزاد نادری",
      ownerMobile: "09127778899",
      ownerNationalCode: "0055667788",
      defaultCharge: 600000
    }
  ];

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalOwnerName = residentType === "مالک و ساکن" ? residentName : ownerName;
    const finalOwnerMobile = residentType === "مالک و ساکن" ? residentMobile : ownerMobile;
    const finalOwnerNationalCode = residentType === "مالک و ساکن" ? residentNationalCode : ownerNationalCode;

    addUnit({
      title,
      blockName,
      floor,
      area,
      occupants: isOccupied ? occupants : 0,
      parkingCount,
      storageCount,
      isOccupied,
      residentType,
      residentName: isOccupied ? residentName : "خالی",
      residentMobile: isOccupied ? residentMobile : finalOwnerMobile,
      residentNationalCode: isOccupied ? residentNationalCode : finalOwnerNationalCode,
      ownerName: finalOwnerName,
      ownerMobile: finalOwnerMobile,
      ownerNationalCode: finalOwnerNationalCode,
      defaultCharge
    });

    setIsAddModalOpen(false);
    // ریست فرم
    setResidentName("");
    setResidentMobile("");
    setResidentNationalCode("");
    setOwnerName("");
    setOwnerMobile("");
    setOwnerNationalCode("");
  };

  const currentBuildingUnits = units.filter((u) => u.buildingId === activeBuilding.id);
  const filteredUnits = currentBuildingUnits.filter((u) => {
    const matchSearch =
      u.title.includes(searchTerm) ||
      u.residentName.includes(searchTerm) ||
      u.ownerName.includes(searchTerm);
    const matchBlock = filterBlock === "all" || u.blockName === filterBlock;
    return matchSearch && matchBlock;
  });

  return (
    <div className="space-y-6">
      
      {/* سربرگ و اکشن‌ها */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
            <Home className="w-5 h-5 text-blue-600" />
            مدیریت واحدهای ساختمان ({currentBuildingUnits.length} واحد)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            مشخصات ساکنین، مالکین، متراژ، ضریب شارژ پیش‌فرض و وضعیت سکونت
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExcelModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            ورود دسته‌جمعی از اکسل
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            ثبت واحد جدید
          </button>
        </div>
      </div>

      {/* نوار جستجو و فیلتر */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="جستجو بر اساس شماره واحد، نام ساکن یا مالک..."
            className="w-full pr-10 pl-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={filterBlock}
          onChange={(e) => setFilterBlock(e.target.value)}
          className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
        >
          <option value="all">همه بلوک‌ها</option>
          {activeBuilding.blocks.map((b) => (
            <option key={b.id} value={b.name}>
              {b.name}
            </option>
          ))}
        </select>
      </div>

      {/* جدول مدرن واحدها */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
              <tr>
                <th className="py-3.5 px-4">واحد و بلوک</th>
                <th className="py-3.5 px-4">مشخصات فیزیکی</th>
                <th className="py-3.5 px-4">وضعیت سکونت</th>
                <th className="py-3.5 px-4">ساکن واحد</th>
                <th className="py-3.5 px-4">مالک واحد</th>
                <th className="py-3.5 px-4">شارژ پیش‌فرض</th>
                <th className="py-3.5 px-4">مانده حساب</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredUnits.length > 0 ? (
                filteredUnits.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                    
                    {/* واحد و بلوک */}
                    <td className="py-3.5 px-4">
                      <div className="font-black text-slate-800 text-sm">{u.title}</div>
                      <div className="text-[11px] text-slate-400">
                        {u.blockName || "بلوک اصلی"} - طبقه {u.floor}
                      </div>
                    </td>

                    {/* مشخصات فیزیکی */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3 text-slate-600">
                        <span title="متراژ" className="flex items-center gap-1">
                          <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
                          {u.area} متر
                        </span>
                        <span title="تعداد نفرات" className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          {u.occupants} نفر
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Car className="w-3 h-3" /> {u.parkingCount} پارکینگ
                        </span>
                        <span className="flex items-center gap-1">
                          <Package className="w-3 h-3" /> {u.storageCount} انباری
                        </span>
                      </div>
                    </td>

                    {/* وضعیت سکونت */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-1 items-start">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            u.isOccupied
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {u.isOccupied ? "● واحد پر" : "○ واحد خالی"}
                        </span>
                        {u.isOccupied && (
                          <span className="text-[11px] text-slate-500">{u.residentType}</span>
                        )}
                      </div>
                    </td>

                    {/* ساکن */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-700">{u.residentName}</div>
                      <div className="text-[11px] font-mono text-slate-400">{u.residentMobile}</div>
                      <div className="text-[10px] text-slate-400">کدملی: {u.residentNationalCode}</div>
                    </td>

                    {/* مالک */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-700">{u.ownerName}</div>
                      <div className="text-[11px] font-mono text-slate-400">{u.ownerMobile}</div>
                      <div className="text-[10px] text-slate-400">کدملی: {u.ownerNationalCode}</div>
                    </td>

                    {/* شارژ پیش‌فرض */}
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      {formatToman(u.defaultCharge)}
                    </td>

                    {/* مانده حساب */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`font-black text-xs px-2 py-1 rounded-lg ${
                          u.balance < 0
                            ? "bg-red-50 text-red-600"
                            : u.balance > 0
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-slate-50 text-slate-600"
                        }`}
                      >
                        {u.balance < 0
                          ? `بدهکار: ${formatToman(Math.abs(u.balance))}`
                          : u.balance > 0
                          ? `بستانکار: ${formatToman(u.balance)}`
                          : "تسویه (۰)"}
                      </span>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">
                    واحدی با این مشخصات یافت نشد
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* مودال ثبت واحد جدید */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-xl my-8 overflow-hidden text-right">
            <div className="bg-blue-600 p-5 text-white flex justify-between items-center">
              <div>
                <h3 className="font-black text-base">تعریف واحد جدید</h3>
                <p className="text-xs text-blue-100">
                  پس از ثبت، حساب کاربری با رمز پیش‌فرض کدملی ایجاد می‌شود
                </p>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-white/80 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              
              {/* اطلاعات واحد */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">عنوان واحد</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="مثال: واحد ۱۰۵"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">بلوک</label>
                  <select
                    value={blockName}
                    onChange={(e) => setBlockName(e.target.value)}
                    className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    {activeBuilding.blocks.map((b) => (
                      <option key={b.id} value={b.name}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">طبقه</label>
                  <input
                    type="number"
                    value={floor}
                    onChange={(e) => setFloor(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    required
                  />
                </div>
              </div>

              {/* متراژ و امکانات */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">متراژ (متر)</label>
                  <input
                    type="number"
                    value={area}
                    onChange={(e) => setArea(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">تعداد نفرات</label>
                  <input
                    type="number"
                    value={occupants}
                    onChange={(e) => setOccupants(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">تعداد پارکینگ</label>
                  <input
                    type="number"
                    value={parkingCount}
                    onChange={(e) => setParkingCount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">تعداد انباری</label>
                  <input
                    type="number"
                    value={storageCount}
                    onChange={(e) => setStorageCount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* وضعیت پر/خالی و نوع سکونت */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">وضعیت واحد</label>
                  <select
                    value={isOccupied ? "occupied" : "empty"}
                    onChange={(e) => setIsOccupied(e.target.value === "occupied")}
                    className="w-full px-2 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="occupied">پر (سکونت دارد)</option>
                    <option value="empty">خالی</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">نوع سکونت</label>
                  <select
                    value={residentType}
                    onChange={(e) => setResidentType(e.target.value as any)}
                    className="w-full px-2 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold"
                  >
                    <option value="مالک و ساکن">مالک و ساکن است</option>
                    <option value="مستاجر">مستاجر است</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">شارژ پیش‌فرض (تومان)</label>
                  <input
                    type="number"
                    value={defaultCharge}
                    onChange={(e) => setDefaultCharge(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                    required
                  />
                </div>
              </div>

              {/* اطلاعات ساکن */}
              {isOccupied && (
                <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                  <span className="text-xs font-bold text-blue-900 block mb-2">
                    {residentType === "مالک و ساکن" ? "مشخصات مالک و ساکن واحد" : "مشخصات مستاجر (ساکن فعلی)"}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="نام و نام خانوادگی"
                      value={residentName}
                      onChange={(e) => setResidentName(e.target.value)}
                      className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      required
                    />
                    <input
                      type="tel"
                      placeholder="شماره موبایل"
                      value={residentMobile}
                      onChange={(e) => setResidentMobile(e.target.value)}
                      className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-left"
                      dir="ltr"
                      required
                    />
                    <input
                      type="text"
                      placeholder="کدملی (رمز عبور پیش‌فرض)"
                      value={residentNationalCode}
                      onChange={(e) => setResidentNationalCode(e.target.value)}
                      className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-left"
                      dir="ltr"
                      required
                    />
                  </div>
                </div>
              )}

              {/* اگر مستاجر باشد، اطلاعات مالک هم دریافت می‌شود */}
              {residentType === "مستاجر" && (
                <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100">
                  <span className="text-xs font-bold text-amber-900 block mb-2">مشخصات مالک واحد</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="نام و نام خانوادگی مالک"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      required
                    />
                    <input
                      type="tel"
                      placeholder="موبایل مالک"
                      value={ownerMobile}
                      onChange={(e) => setOwnerMobile(e.target.value)}
                      className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-left"
                      dir="ltr"
                      required
                    />
                    <input
                      type="text"
                      placeholder="کدملی مالک"
                      value={ownerNationalCode}
                      onChange={(e) => setOwnerNationalCode(e.target.value)}
                      className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-left"
                      dir="ltr"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-500/20"
                >
                  ثبت واحد
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* مودال ورود اکسل */}
      {isExcelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-2xl my-8 overflow-hidden text-right">
            <div className="bg-emerald-700 p-5 text-white flex justify-between items-center">
              <div>
                <h3 className="font-black text-base flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-200" />
                  ورود دسته‌جمعی واحدها از طریق اکسل (Excel)
                </h3>
                <p className="text-xs text-emerald-100">
                  فایل اکسل شامل اطلاعات واحدها، متراژ، ساکنین و مالکین
                </p>
              </div>
              <button onClick={() => setIsExcelModalOpen(false)} className="text-white/80 hover:text-white">
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="border-2 border-dashed border-emerald-300 bg-emerald-50/50 p-6 rounded-xl text-center">
                <Upload className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                <span className="text-xs font-bold text-slate-700 block">فایل `apartments_template.xlsx` شناسایی شد</span>
                <span className="text-[11px] text-slate-500">۳ واحد جدید آماده بارگذاری در سامانه است</span>
              </div>

              {/* پیش‌نمایش سطرهای اکسل */}
              <div>
                <span className="text-xs font-bold text-slate-700 block mb-2">پیش‌نمایش داده‌های استخراج شده:</span>
                <div className="border border-slate-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                  <table className="w-full text-right text-[11px]">
                    <thead className="bg-slate-50 text-slate-500">
                      <tr>
                        <th className="p-2">عنوان</th>
                        <th className="p-2">بلوک</th>
                        <th className="p-2">متراژ</th>
                        <th className="p-2">ساکن</th>
                        <th className="p-2">مالک</th>
                        <th className="p-2">شارژ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {mockExcelUnits.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2 font-bold">{item.title}</td>
                          <td className="p-2">{item.blockName}</td>
                          <td className="p-2">{item.area} متر</td>
                          <td className="p-2">{item.residentName}</td>
                          <td className="p-2">{item.ownerName}</td>
                          <td className="p-2 font-bold">{formatToman(item.defaultCharge)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                <button
                  type="button"
                  className="flex items-center gap-1.5 text-xs text-blue-600 font-bold hover:underline"
                >
                  <Download className="w-4 h-4" />
                  دانلود نمونه فایل اکسل خام
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsExcelModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800"
                  >
                    انصراف
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      importUnitsFromExcel(mockExcelUnits);
                      setIsExcelModalOpen(false);
                    }}
                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-600/20"
                  >
                    تایید و ثبت {mockExcelUnits.length} واحد در سیستم
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
