"use client";

import React, { useState } from "react";
import { useApp } from "@/lib/store";
import { Phone, Lock, KeyRound, Building2, UserCheck, AlertCircle, ArrowLeft, PlusCircle } from "lucide-react";

export const LoginModal: React.FC = () => {
  const {
    isLoginModalOpen,
    setIsLoginModalOpen,
    loginWithOtp,
    loginWithPassword,
    userRoles,
    currentRole,
    switchRole,
    isLoggedIn,
    setIsNewBuildingModalOpen
  } = useApp();

  const [tab, setTab] = useState<"otp" | "password">("otp");
  const [mobile, setMobile] = useState("09121112233");
  const [code, setCode] = useState("1234");
  const [password, setPassword] = useState("123456");
  const [step, setStep] = useState<"form" | "role_select">("form");
  const [error, setError] = useState("");

  if (!isLoginModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!mobile || mobile.length < 10) {
      setError("لطفاً شماره موبایل معتبر وارد کنید");
      return;
    }

    let success = false;
    if (tab === "otp") {
      success = loginWithOtp(mobile, code);
    } else {
      success = loginWithPassword(mobile, password);
    }

    if (success) {
      setStep("role_select");
    } else {
      setError("اطلاعات ورود نادرست است (برای دمو کد 1234 را وارد کنید)");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden text-right">
        
        {/* هدر مودال */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white text-center relative">
          <button
            onClick={() => {
              setIsLoginModalOpen(false);
              setStep("form");
            }}
            className="absolute left-4 top-4 text-white/80 hover:text-white text-sm"
          >
            ✕
          </button>
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-3 backdrop-blur-md">
            <Building2 className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-xl font-black">ورود به سامانه آپارتمانا</h2>
          <p className="text-xs text-blue-100 mt-1">مدیریت هوشمند ساختمان‌ها و مجتمع‌های مسکونی</p>
        </div>

        {/* محتوای لاگین */}
        <div className="p-6">
          {step === "form" ? (
            <>
              {/* تب‌های ورود */}
              <div className="flex border-b border-slate-200 mb-6">
                <button
                  type="button"
                  onClick={() => { setTab("otp"); setError(""); }}
                  className={`flex-1 py-3 text-sm font-bold border-b-2 transition-all flex items-center justify-center gap-2 ${
                    tab === "otp"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <KeyRound className="w-4 h-4" />
                  رمز یکبار مصرف (پیامک)
                </button>
                <button
                  type="button"
                  onClick={() => { setTab("password"); setError(""); }}
                  className={`flex-1 py-3 text-sm font-bold border-b-2 transition-all flex items-center justify-center gap-2 ${
                    tab === "password"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <Lock className="w-4 h-4" />
                  ورود با رمز عبور
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">شماره موبایل</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute right-3 top-3.5" />
                    <input
                      type="tel"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                      className="w-full pr-10 pl-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-left font-mono"
                      dir="ltr"
                      required
                    />
                  </div>
                </div>

                {tab === "otp" ? (
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-xs font-bold text-slate-700">کد تایید پیامک شده</label>
                      <span className="text-[11px] text-blue-600 font-semibold cursor-pointer">ارسال مجدد کد</span>
                    </div>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-400 absolute right-3 top-3.5" />
                      <input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="کد تایید (پیش‌فرض: 1234)"
                        className="w-full pr-10 pl-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-center tracking-widest font-mono"
                        dir="ltr"
                        required
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">رمز عبور</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-3.5" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pr-10 pl-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-left"
                        dir="ltr"
                        required
                      />
                    </div>
                  </div>
                )}

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-500/20 text-sm transition-all"
                >
                  ورود و ادامه
                </button>
              </form>

              {/* اکانت‌های تستی آماده برای دمو */}
              <div className="mt-6 pt-4 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 block mb-2">تست سریع در دمو:</span>
                <div className="flex gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => { setMobile("09121112233"); setTab("otp"); }}
                    className="flex-1 p-2 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 rounded-lg text-slate-600 transition-colors"
                  >
                    👤 مدیر ساختمان
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMobile("09351234567"); setTab("otp"); }}
                    className="flex-1 p-2 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 rounded-lg text-slate-600 transition-colors"
                  >
                    🏠 مستاجر واحد ۱۰۲
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMobile("09990001122"); setTab("otp"); }}
                    className="flex-1 p-2 bg-slate-50 hover:bg-amber-50 hover:text-amber-700 border border-slate-200 rounded-lg text-slate-600 transition-colors"
                  >
                    ✨ کاربر بدون نقش
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* انتخاب نقش پس از احراز هویت */
            <div className="space-y-4">
              <div className="text-center pb-2">
                <h3 className="font-black text-slate-800 text-base">انتخاب نقش و محیط کاربری</h3>
                <p className="text-xs text-slate-500 mt-1">لطفاً مشخص کنید می‌خواهید با چه عنوانی وارد شوید:</p>
              </div>

              {userRoles.length > 0 ? (
                <div className="space-y-2.5 max-h-60 overflow-y-auto p-1">
                  {userRoles.map((roleItem, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        switchRole(roleItem);
                        setIsLoginModalOpen(false);
                        setStep("form");
                      }}
                      className="w-full text-right p-3.5 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all flex items-center justify-between group"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                            roleItem.role === "مدیر ساختمان" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                          }`}>
                            {roleItem.role}
                          </span>
                          {roleItem.unitTitle && (
                            <span className="text-xs font-bold text-slate-700">{roleItem.unitTitle}</span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">{roleItem.buildingName}</div>
                      </div>
                      <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:-translate-x-1 transition-all" />
                    </button>
                  ))}
                </div>
              ) : (
                /* حالتی که کاربر هیچ نقشی ندارد */
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-center space-y-3">
                  <AlertCircle className="w-8 h-8 text-amber-600 mx-auto" />
                  <div>
                    <h4 className="font-bold text-amber-900 text-sm">هیچ نقشی برای شما ثبت نشده است</h4>
                    <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                      شماره موبایل شما توسط هیچ مدیر ساختمانی به عنوان ساکن یا مالک ثبت نشده است. برای اختصاص نقش با مدیر ساختمان خود تماس بگیرید یا می‌توانید به عنوان مدیر، یک ساختمان جدید ثبت کنید.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setIsLoginModalOpen(false);
                      setIsNewBuildingModalOpen(true);
                    }}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                  >
                    <PlusCircle className="w-4 h-4" />
                    تعریف ساختمان جدید و شروع مدیریت
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={() => setStep("form")}
                className="w-full py-2 text-xs text-slate-500 hover:text-slate-800 font-medium"
              >
                بازگشت به فرم لاگین
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
