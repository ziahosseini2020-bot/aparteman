<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // حساب‌های مالی مجتمع (حساب بانکی، صندوق نقدی، تنخواه‌گردان)
        Schema::create('financial_accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('building_id')->constrained('buildings')->onDelete('cascade');
            $table->string('name');
            $table->enum('account_type', ['bank', 'cash', 'petty_cash'])->default('bank');
            $table->string('account_number')->nullable();
            $table->string('card_number')->nullable();
            $table->string('shaba_number')->nullable();
            $table->string('bank_name')->nullable();
            $table->string('responsible_name')->nullable();
            $table->decimal('initial_balance', 14, 2)->default(0);
            $table->decimal('current_balance', 14, 2)->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // تراکنش‌های واقعی واریز / برداشت / انتقال
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('building_id')->constrained('buildings')->onDelete('cascade');
            $table->foreignId('financial_account_id')->constrained('financial_accounts')->onDelete('cascade');
            $table->enum('type', ['receipt', 'payment', 'transfer']);
            $table->string('category');
            $table->decimal('amount', 14, 2);
            $table->date('transaction_date');
            $table->string('tracking_number')->nullable();
            $table->text('description')->nullable();
            $table->string('payer_or_payee_name')->nullable();
            $table->enum('status', ['confirmed', 'pending_approval', 'rejected'])->default('confirmed');
            $table->string('receipt_attachment')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users');
            $table->timestamps();
        });

        // تخصیص تراکنش به اقلام شارژ یا هزینه‌ها
        Schema::create('transaction_allocations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('transaction_id')->constrained('transactions')->onDelete('cascade');
            $table->morphs('allocatable'); // charge_items, expenses, etc.
            $table->string('unit_title')->nullable();
            $table->decimal('amount', 14, 2);
            $table->timestamps();
        });

        // دفتر معین دوبل واحدها (unit_ledger_entries)
        Schema::create('unit_ledger_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('building_id')->constrained('buildings')->onDelete('cascade');
            $table->foreignId('unit_id')->constrained('units')->onDelete('cascade');
            $table->string('unit_title');
            $table->date('entry_date');
            $table->string('entry_type'); // Charge, payment, expense, fine, init
            $table->string('title');
            $table->decimal('debit_amount', 14, 2)->default(0); // بدهکار
            $table->decimal('credit_amount', 14, 2)->default(0); // بستانکار
            $table->decimal('balance_after', 14, 2); // مانده پس از رویداد
            $table->unsignedBigInteger('reference_id')->nullable();
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('unit_ledger_entries');
        Schema::dropIfExists('transaction_allocations');
        Schema::dropIfExists('transactions');
        Schema::dropIfExists('financial_accounts');
    }
};
