# Aparteman Backend - Laravel Modular Monolith RESTful API

سامانه بک‌اند مدیریت ساختمان و آپارتمان با معماری **Modular Monolith** در فریم‌ورک لاراول (Laravel 11).

---

## ۱. فناوری‌ها و بسته‌های اصلی
* **فریم‌ورک:** Laravel 11.x (PHP 8.2+)
* **مدیریت ماژول‌ها:** [nwidart/laravel-modules](https://laravelmodules.com)
* **کنترل دسترسی و نقش‌ها:** [santigarcor/laratrust](https://laratrust.santigarcor.me) (با فعال‌سازی قابلیت Teams جهت تفکیک نقش‌ها به ازای هر ساختمان)
* **احراز هویت:** Laravel Sanctum (توکن‌های API) + سیستم ارسال و تایید کد یکبار مصرف (OTP)
* **پایگاه‌داده:** MySQL 8.x

---

## ۲. ساختار ماژولار (Modules Architecture)

```
backend/
├── app/
│   └── Models/User.php               # مدل کاربر اصلی متصل به Laratrust و Sanctum
├── config/
│   ├── modules.php                   # تنظیمات nwidart/laravel-modules
│   └── laratrust.php                 # تنظیمات Teams و نقش‌ها در Laratrust
├── database/migrations/              # مایگریشن‌های پایه کاربران و جداول دسترسی
└── Modules/
    ├── Auth/                         # ماژول احراز هویت
    │   ├── Http/Controllers/AuthController.php
    │   ├── Services/OtpService.php   # تولید و اعتبارسنجی پیامک OTP
    │   └── Routes/api.php
    ├── Building/                     # ماژول ساختمان و بلوک‌ها
    │   ├── Models/Building.php
    │   ├── Models/Block.php
    │   ├── Http/Controllers/BuildingController.php
    │   └── Database/Migrations/
    ├── Unit/                         # ماژول واحدها، سکونت و مالکیت
    │   ├── Models/Unit.php
    │   ├── Models/UnitAssignment.php # تاریخچه مالکیت و سکونت (ساکن، مستاجر، مالک غیرساکن)
    │   ├── Services/UnitImportService.php # ورود دسته‌جمعی از اکسل + ساخت خودکار یوزرها
    │   └── Http/Controllers/UnitController.php
    ├── Billing/                      # ماژول صدور شارژ و درآمدهای جانبی
    │   ├── Models/ChargeInvoice.php
    │   ├── Models/ChargeInvoiceItem.php
    │   ├── Models/OtherRevenue.php
    │   ├── Services/ChargeCalculationService.php # موتور محاسبه ۱۰ فرمول شارژ و جریمه دیرکرد
    │   └── Http/Controllers/BillingController.php
    ├── Expense/                      # ماژول هزینه‌ها و کنتورخوانی
    │   ├── Models/Expense.php
    │   ├── Models/MeterReading.php   # ارقام قبلی و جدید کنتورهای آب/برق/گاز و محاسبه مصرف
    │   ├── Services/ExpenseSettlementService.php # تسویه از صندوق با اعلام یا بدون اعلام
    │   └── Http/Controllers/ExpenseController.php
    └── Accounting/                   # ماژول حسابداری و تنخواه‌گردان
        ├── Models/BuildingFund.php   # صندوق اصلی ساختمان
        ├── Models/FundTransaction.php# دفتر کل واریز و برداشت‌ها
        └── Http/Controllers/AccountingController.php
```

---

## ۳. ویژگی‌های کلیدی پیاده‌سازی شده

### ۱. گردش کار لاگین و انتخاب نقش (Login & Role Switcher):
* ورود با رمز یکبار مصرف پیامکی (OTP) یا شماره موبایل و پسورد.
* پشتیبانی از دسترسی چندساختمانی کاربر (مثلاً مدیر ساختمان A و همزمان مستاجر در ساختمان B) با استفاده از `Laratrust Teams`.
* در صورتی که کاربر هیچ نقشی نداشته باشد، هدایت به فرم تعریف ساختمان جدید به عنوان مدیر.

### ۲. تعریف واحدها و تولید خودکار کاربر:
* در زمان ثبت واحد (به صورت تکی یا از طریق فایل اکسل)، در صورت عدم وجود کاربر برای ساکن یا مالک، یک رکورد در جدول `users` ایجاد شده و رمز عبور پیش‌فرض آن **کدملی** شخص قرار می‌گیرد.

### ۳. موتور محاسباتی شارژ (Billing Engine):
* پشتیبانی کامل از هر ۱۰ فرمول تسهیم شارژ:
  1. مبلغ ثابت برای همه واحدها (`FIXED_ALL`)
  2. شارژ پیش‌فرض واحد (`DEFAULT_CHARGE`)
  3. بر اساس متراژ (`BY_AREA`)
  4. بر اساس تعداد نفرات (`BY_OCCUPANTS`)
  5. مبلغ ثابت + متراژ (`FIXED_AREA`)
  6. مبلغ ثابت + نفرات (`FIXED_OCCUPANTS`)
  7. مبلغ ثابت + متراژ + نفرات (`FIXED_AREA_OCCUPANTS`)
  8. شارژ پیش‌فرض + متراژ (`DEFAULT_AREA`)
  9. شارژ پیش‌فرض + نفرات (`DEFAULT_OCCUPANTS`)
  10. شارژ پیش‌فرض + متراژ + نفرات (`DEFAULT_AREA_OCCUPANTS`)
* محاسبه خودکار جریمه دیرکرد روزانه در زمان تسویه.

### ۴. کنتورخوانی و روش‌های تسویه هزینه:
* ثبت ارقام قبلی و جدید کنتور و تسهیم قبض آب، برق و گاز بر اساس میزان مصرف واقعی هر واحد.
* دو شیوه تسویه هزینه:
  - **اعلام به اهالی:** کسر از صندوق و ایجاد بدهکاری در حساب واحدها.
  - **پرداخت از صندوق بدون اعلام:** کسر مستقیم از تنخواه بدون تقسیم بدهی.

---

## ۴. نحوه راه‌اندازی و اجرا

```bash
# ۱. نصب وابستگی‌های کامپوزر
composer install

# ۲. ایجاد فایل تنظیمات محیطی و تولید کلید برنامه
cp .env.example .env
php artisan key:generate

# ۳. اجرای مایگریشن‌های پایگاه‌داده به همراه تمام ماژول‌ها
php artisan migrate

# ۴. اجرای سرور توسعه
php artisan serve
```
