"use client";

import React, { useState } from "react";
import { useApp } from "@/lib/store";
import { formatToman } from "@/lib/utils";
import {
  Building2,
  User,
  LogOut,
  LogIn,
  ChevronDown,
  PlusCircle,
  Wallet,
  ShieldCheck,
  Home,
  CheckCircle2,
  Bell
} from "lucide-react";

export const Navbar: React.FC = () => {
  const {
    isLoggedIn,
    currentUser,
    userRoles,
    currentRole,
    switchRole,
    logout,
    setIsLoginModalOpen,
    setIsNewBuildingModalOpen,
    buildings,
    activeBuilding,
    setActiveBuilding
  } = useApp();

  const [isBuildingMenuOpen, setIsBuildingMenuOpen] = useState(false);
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* لوگو و نام سامانه */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xl tracking-tight text-slate-900">آپارتمانـا</span>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">نسخه دمو</span>
              </div>
              <span className="text-xs text-slate-500 hidden sm:inline">سامانه جامع مدیریت هوشمند ساختمان</span>
            </div>
          </div>

          {/* انتخاب ساختمان و نقش کاربر */}
          {isLoggedIn && (
            <div className="flex items-center gap-3">
              {/* انتخاب ساختمان */}
              <div className="relative">
                <button
                  onClick={() => setIsBuildingMenuOpen(!isBuildingMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs sm:text-sm font-medium text-slate-700 transition-colors"
                >
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <span className="max-w-[120px] sm:max-w-[180px] truncate">{activeBuilding?.name || "انتخاب ساختمان"}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {isBuildingMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      ساختمان‌های شما
                    </div>
                    {buildings.map((b) => (
                      <button
                        key={b.id}
                        onClick={() => {
                          setActiveBuilding(b);
                          setIsBuildingMenuOpen(false);
                        }}
                        className={`w-full text-right px-3 py-2 text-sm flex items-center justify-between hover:bg-slate-50 transition-colors ${
                          activeBuilding?.id === b.id ? "text-blue-600 font-bold bg-blue-50/50" : "text-slate-700"
                        }`}
                      >
                        <div className="truncate">
                          <div>{b.name}</div>
                          <div className="text-[11px] text-slate-400">{b.city} - {b.type}</div>
                        </div>
                        {activeBuilding?.id === b.id && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                      </button>
                    ))}
                    <div className="border-t border-slate-100 my-1"></div>
                    <button
                      onClick={() => {
                        setIsBuildingMenuOpen(false);
                        setIsNewBuildingModalOpen(true);
                      }}
                      className="w-full text-right px-3 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-50 flex items-center gap-2 transition-colors"
                    >
                      <PlusCircle className="w-4 h-4" />
                      تعریف ساختمان جدید
                    </button>
                  </div>
                )}
              </div>

              {/* انتخاب نقش */}
              <div className="relative">
                <button
                  onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs sm:text-sm font-semibold transition-colors ${
                    currentRole?.role === "مدیر ساختمان"
                      ? "border-amber-300 bg-amber-50 text-amber-900"
                      : "border-emerald-300 bg-emerald-50 text-emerald-900"
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{currentRole?.role || "انتخاب نقش"}</span>
                  {currentRole?.unitTitle && (
                    <span className="text-xs opacity-75">({currentRole.unitTitle})</span>
                  )}
                  <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                </button>

                {isRoleMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50">
                    <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      تغییر دسترسی / نقش فعال
                    </div>
                    {userRoles.length > 0 ? (
                      userRoles.map((r, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            switchRole(r);
                            setIsRoleMenuOpen(false);
                          }}
                          className={`w-full text-right px-3 py-2 text-sm flex items-center justify-between hover:bg-slate-50 ${
                            currentRole?.role === r.role && currentRole?.unitId === r.unitId
                              ? "text-blue-600 font-bold bg-blue-50/50"
                              : "text-slate-700"
                          }`}
                        >
                          <div>
                            <div>{r.role}</div>
                            <div className="text-[11px] text-slate-400">{r.buildingName} {r.unitTitle ? `- ${r.unitTitle}` : ""}</div>
                          </div>
                          {currentRole?.role === r.role && currentRole?.unitId === r.unitId && (
                            <CheckCircle2 className="w-4 h-4 text-blue-600" />
                          )}
                        </button>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-xs text-amber-700 bg-amber-50 rounded m-2">
                        نقشی برای این کاربر ثبت نشده است.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* موجودی صندوق و دکمه پروفایل/خروج */}
          <div className="flex items-center gap-3">
            {isLoggedIn && currentRole?.role === "مدیر ساختمان" && (
              <div className="hidden md:flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded-lg text-xs font-semibold">
                <Wallet className="w-4 h-4 text-emerald-600" />
                <span>صندوق ساختمان:</span>
                <span className="font-bold">{formatToman(activeBuilding?.fundBalance || 0)}</span>
              </div>
            )}

            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-800">{currentUser?.name}</span>
                  <span className="text-[11px] text-slate-500 font-mono">{currentUser?.mobile}</span>
                </div>
                <button
                  onClick={logout}
                  title="خروج از حساب"
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm shadow-blue-600/20 transition-all"
              >
                <LogIn className="w-4 h-4" />
                ورود به سامانه
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
