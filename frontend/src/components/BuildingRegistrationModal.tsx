"use client";

import React, { useState } from "react";
import { useApp } from "@/lib/store";
import { Building, Block } from "@/lib/mockData";
import { Building2, Layers, MapPin, CreditCard, Shield, Plus, Trash2, CheckCircle2 } from "lucide-react";

export const BuildingRegistrationModal: React.FC = () => {
  const { isNewBuildingModalOpen, setIsNewBuildingModalOpen, createBuilding, currentUser } = useApp();

  const [step, setStep] = useState<1 | 2>(1);

  // مرحله ۱: اطلاعات پایه و مدیر ساختمان
  const [managerName, setManagerName] = useState(currentUser?.name || "امیرحسین رضایی");
  const [managerMobile, setManagerMobile] = useState(currentUser?.mobile || "09121112233");
  const [password, setPassword] = useState("123456");

  const [name, setName] = useState("برج آسمان");
  const [type, setType] = useState<"مسکونی" | "تجاری" | "اداری" | "سایر">("مسکونی");
  const [province, setProvince] = useState("تهران");
  const [city, setCity] = useState("تهران");
  const [address, setAddress] = useState("سعادت آباد، میدان کاج، خیابان سرو غربی");
  const [location, setLocation] = useState("35.7925, 51.3782");
  const [phone, setPhone] = useState("02122001122");
  const [postalCode, setPostalCode] = useState("1998765432");
  const [accountNumber, setAccountNumber] = useState("6037-9975-4321-9876");
  const [accountHolder, setAccountHolder] = useState("امیرحسین رضایی (مدیر ساختمان)");

  // مرحله ۲: بلوک‌بندی
  const [hasBlocks, setHasBlocks] = useState(true);
  const [blocks, setBlocks] = useState<Block[]>([
    { id: "blk-1", name: "بلوک شرقی (A)", floors: 6, unitsCount: 12 },
    { id: "blk-2", name: "بلوک غربی (B)", floors: 6, unitsCount: 12 }
  ]);

  if (!isNewBuildingModalOpen) return null;

  const handleAddBlock = () => {
    const newId = "blk-" + (blocks.length + 1);
    setBlocks([
      ...blocks,
      { id: newId, name: `بلوک ${String.fromCharCode(65 + blocks.length)}`, floors: 4, unitsCount: 8 }
    ]);
  };

  const handleRemoveBlock = (id: string) => {
    setBlocks(blocks.filter((b) => b.id !== id));
  };

  const handleUpdateBlock = (id: string, field: keyof Block, val: any) => {
    setBlocks(blocks.map((b) => (b.id === id ? { ...b, [field]: val } : b)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createBuilding({
      name,
      type,
      province,
      city,
      address,
      location,
      phone,
      postalCode,
      accountNumber,
      accountHolder,
      managerName,
      managerMobile,
      password,
      blocks: hasBlocks ? blocks : [{ id: "blk-main", name: "بلوک اصلی", floors: 4, unitsCount: 10 }]
    });
    setStep(1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-2xl my-8 overflow-hidden text-right">
        
        {/* هدر */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-6 text-white relative">
          <button
            onClick={() => setIsNewBuildingModalOpen(false)}
            className="absolute left-4 top-4 text-white/80 hover:text-white"
          >
            ✕
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black">تعریف ساختمان جدید و معرفی مدیر</h2>
              <p className="text-xs text-blue-100">فرم ثبت مشخصات کامل، اطلاعات بانکی و بلوک‌بندی</p>
            </div>
          </div>

          {/* Stepper */}
          <div className="flex items-center gap-2 mt-5 pt-3 border-t border-white/10 text-xs font-semibold">
            <span className={`px-2.5 py-1 rounded-lg ${step === 1 ? "bg-white text-blue-700" : "bg-white/20 text-white"}`}>
              ۱. مشخصات ساختمان و مدیر
            </span>
            <span className="text-white/40">←</span>
            <span className={`px-2.5 py-1 rounded-lg ${step === 2 ? "bg-white text-blue-700" : "bg-white/20 text-white"}`}>
              ۲. بلوک‌بندی و طبقات
            </span>
          </div>
        </div>

        {/* فرم */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {step === 1 ? (
            <div className="space-y-4">
              {/* بخش ۱: اطلاعات مدیر ساختمان */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-3">
                  <Shield className="w-4 h-4 text-blue-600" />
                  اطلاعات مدیر ساختمان (حساب کاربری اصلی)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">نام و نام خانوادگی مدیر</label>
                    <input
                      type="text"
                      value={managerName}
                      onChange={(e) => setManagerName(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">شماره موبایل مدیر</label>
                    <input
                      type="tel"
                      value={managerMobile}
                      onChange={(e) => setManagerMobile(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono text-left"
                      dir="ltr"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">رمز عبور ورود</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-left"
                      dir="ltr"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* بخش ۲: مشخصات ساختمان */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">نام ساختمان / مجتمع</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="مثال: مجتمع مسکونی آسمان"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">نوع ساختمان</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium"
                  >
                    <option value="مسکونی">مسکونی</option>
                    <option value="تجاری">تجاری</option>
                    <option value="اداری">اداری</option>
                    <option value="سایر">سایر</option>
                  </select>
                </div>
              </div>

              {/* آدرس و لوکیشن */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">استان</label>
                  <input
                    type="text"
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">شهر</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">تلفن ساختمان</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-left"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">آدرس دقیق</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">کد پستی</label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-left"
                    dir="ltr"
                  />
                </div>
              </div>

              {/* حساب بانکی ساختمان */}
              <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5 mb-3">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  اطلاعات حساب بانکی و واریز شارژ ساختمان
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">شماره حساب یا کارت</label>
                    <input
                      type="text"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="۶۰۳۷-۹۹۱۸-..."
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono text-left"
                      dir="ltr"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">نام صاحب حساب</label>
                    <input
                      type="text"
                      value={accountHolder}
                      onChange={(e) => setAccountHolder(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-500/20"
                >
                  ادامه به مرحله بلوک‌بندی ←
                </button>
              </div>
            </div>
          ) : (
            /* مرحله ۲: بلوک‌بندی */
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">آیا ساختمان شما بلوک‌بندی دارد؟</h4>
                  <p className="text-xs text-slate-500">برای مجتمع‌های چندبلوکه می‌توانید بلوک‌ها را تفکیک کنید</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setHasBlocks(true)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      hasBlocks ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    بله، دارای بلوک است
                  </button>
                  <button
                    type="button"
                    onClick={() => setHasBlocks(false)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      !hasBlocks ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    خیر (تک‌بلوک / ساده)
                  </button>
                </div>
              </div>

              {hasBlocks && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-700">لیست بلوک‌ها:</span>
                    <button
                      type="button"
                      onClick={handleAddBlock}
                      className="flex items-center gap-1 text-xs text-blue-600 font-bold hover:text-blue-800"
                    >
                      <Plus className="w-4 h-4" />
                      افزودن بلوک جدید
                    </button>
                  </div>

                  <div className="space-y-2">
                    {blocks.map((block, index) => (
                      <div
                        key={block.id}
                        className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3"
                      >
                        <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                          {index + 1}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1">
                          <input
                            type="text"
                            value={block.name}
                            onChange={(e) => handleUpdateBlock(block.id, "name", e.target.value)}
                            placeholder="نام بلوک"
                            className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                          />
                          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2">
                            <span className="text-[11px] text-slate-500 shrink-0">طبقات:</span>
                            <input
                              type="number"
                              value={block.floors}
                              onChange={(e) => handleUpdateBlock(block.id, "floors", Number(e.target.value))}
                              className="w-full py-1 text-xs text-center focus:outline-none"
                            />
                          </div>
                          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2">
                            <span className="text-[11px] text-slate-500 shrink-0">واحدها:</span>
                            <input
                              type="number"
                              value={block.unitsCount}
                              onChange={(e) => handleUpdateBlock(block.id, "unitsCount", Number(e.target.value))}
                              className="w-full py-1 text-xs text-center focus:outline-none"
                            />
                          </div>
                        </div>
                        {blocks.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveBlock(block.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  ← بازگشت به مرحله قبل
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-600/20 flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  ثبت نهایی ساختمان و شروع به کار
                </button>
              </div>
            </div>
          )}
        </form>

      </div>
    </div>
  );
};
