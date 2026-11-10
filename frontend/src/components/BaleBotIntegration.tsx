"use client";

import React, { useState } from "react";
import { useApp } from "@/lib/store";
import { Send, Bell, CheckCircle2, MessageSquare, Shield, Smartphone } from "lucide-react";

export const BaleBotIntegration: React.FC = () => {
  const { baleNotifications, sendBaleNotification, activeBuilding } = useApp();

  const [recipient, setRecipient] = useState("اهالی ساختمان");
  const [messageText, setMessageText] = useState("اطلاعیه سرابان: آب ساختمان به علت تعمیرات موتورخانه فردا از ساعت ۱۰ تا ۱۲ قطع می‌باشد.");

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText) return;
    sendBaleNotification(recipient, messageText);
    setMessageText("");
  };

  return (
    <div className="space-y-6">
      
      {/* هدر بخش بله */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              یکپارچگی با ربات پیام‌رسان بله (Bale Bot)
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              متصل به @saraband_bot
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            ارسال خودکار قبوض شارژ، یادآوری بدهی‌ها، لینک پرداخت مستقیم و اطلاعیه‌های مدیر ساختمان به اهالی
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* فرم ارسال پیام جدید */}
        <div className="lg:col-span-1 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <Send className="w-4 h-4 text-blue-600" />
            ارسال پیام و اعلان دستی
          </h3>

          <form onSubmit={handleSend} className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">گیرنده پیام</label>
              <select
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              >
                <option value="اهالی ساختمان">همه ساکنین و مالکین ساختمان</option>
                <option value="واحدهای بدهکار">فقط واحدهای بدهکار</option>
                <option value="مدیران بلوک">مدیران بلوک‌ها</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">متن پیام یا اطلاعیه</label>
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                rows={4}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <Send className="w-4 h-4" />
              ارسال پیام به کانال ربات بله
            </button>
          </form>
        </div>

        {/* تاریخچه پیام‌های ارسالی */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Bell className="w-4 h-4 text-emerald-600" />
              لاگ پیام‌ها و اعلان‌های ارسال‌شده به بات
            </h3>
            <span className="text-xs text-slate-400">تعداد کل: {baleNotifications.length} پیام</span>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {baleNotifications.map((n) => (
              <div key={n.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                    گیرنده: {n.recipient}
                  </span>
                  <span className="text-slate-400 font-mono">{n.time}</span>
                </div>
                <p className="text-slate-700 leading-relaxed font-medium">{n.text}</p>
                <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold pt-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  تحویل داده شد به پیام‌رسان بله
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
