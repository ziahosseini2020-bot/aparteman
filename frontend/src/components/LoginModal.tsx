"use client";

import React, { useState } from "react";
import { useApp } from "@/lib/store";
import { Phone, Lock, KeyRound, Building2, UserCheck, AlertCircle, ArrowLeft, PlusCircle, ShieldCheck } from "lucide-react";

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
      setError("اطلاعات ورود نادرست است (برای تست دمو کد ۱۲۳۴ را وارد کنید)");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden text-right">
        
        {/* هدر مودال با برندینگ سرابان */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-900 p-6 text-white text-center relative">
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
          <h2 className="text-xl font-black">ورود به سامانه سَـرابـان</h2>
          <p className="text-xs text-emerald-100 mt-1">مدیریت هوشمند مجتمع‌ها و ساختمان‌های مسکونی و تجاری</p>
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
                  className={`flex-1 py-3 text-xs font-bold border-b-2 transition-all flex items-center justify-center gap-2 ${
                    tab === "otp"
                      ? "border-emerald-600 text-emerald-600"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <KeyRound className="w-4 h-4" />
                  رمز یکبار مصرف (پیامک OTP)
                </button>
                <button
                  type="button"
                  onClick={() => { setTab("password"); setError(""); }}
                  className={`flex-1 py-3 text-xs font-bold border-b-2 transition-all flex items-center justify-center gap-2 ${
                    tab === "password"
                      ? "border-emerald-600 text-emerald-600"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <Lock className="w-4 h-4" />
                  رمز عبور ثابت
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-600 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">شماره تلفن همراه</label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="09121112233"
                      className="w-full pl-3 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-left focus:bg-white focus:outline-none focus:border-emerald-500"
                    />
                    <Phone className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                  </div>
                </div>

                {tab === "otp" ? (
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">کد تأیید پیامک شده</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="کد ۴ رقمی (دمو: 1234)"
                        className="w-full pl-3 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-center tracking-widest focus:bg-white focus:outline-none focus:border-emerald-500"
                      />
                      <KeyRound className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                    </div>
                    <span className="text-[11px] text-slate-400 mt-1 block">کد پیش‌فرض برای دمو: 1234</span>
                  </div>
                ) : (
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">کلمه عبور</label>
                    <div className="relative">
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="رمز عبور شما"
                        className="w-full pl-3 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-left focus:bg-white focus:outline-none focus:border-emerald-500"
                      />
                      <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
                >
                  تأیید و ورود به سیستم
                </button>
              </form>
            </>
          ) : (
            /* مرحله انتخاب نقش پس از احراز هویت */
            <div className="space-y-4">
              <div className="text-center pb-2 border-b border-slate-100">
                <span className="text-xs text-slate-400">احراز هویت موفق: {mobile}</span>
                <h3 className="font-black text-slate-900 text-sm mt-1">نقش خود را در سرابان انتخاب کنید</h3>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {userRoles.map((r, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      switchRole(r);
                      setIsLoginModalOpen(false);
                      setStep("form");
                    }}
                    className={`w-full p-3 rounded-xl border text-right transition-all flex items-center justify-between ${
                      currentRole?.role === r.role && currentRole?.unitId === r.unitId
                        ? "border-emerald-500 bg-emerald-50/70"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        {r.role}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {r.buildingName} {r.blockName ? `| ${r.blockName}` : ""} {r.unitTitle ? `| ${r.unitTitle}` : ""}
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-600">انتخاب ←</span>
                  </button>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsLoginModalOpen(false);
                    setStep("form");
                    setIsNewBuildingModalOpen(true);
                  }}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <PlusCircle className="w-4 h-4 text-emerald-600" />
                  تعریف ساختمان جدید به عنوان مدیر
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
