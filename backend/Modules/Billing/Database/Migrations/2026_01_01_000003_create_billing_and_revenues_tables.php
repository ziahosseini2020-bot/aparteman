<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('charge_invoices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('building_id')->constrained('buildings')->onDelete('cascade');
            $table->string('title');
            $table->date('issue_date');
            $table->date('due_date');
            $table->decimal('daily_penalty_amount', 10, 2)->default(0);
            $table->string('calculation_model'); // FIXED_ALL, DEFAULT_CHARGE, BY_AREA, etc.
            $table->decimal('base_amount', 12, 2)->default(0);
            $table->decimal('area_rate', 10, 2)->default(0);
            $table->decimal('occupant_rate', 10, 2)->default(0);
            $table->enum('payer_type', ['ساکن', 'مالک', 'هر دو'])->default('ساکن');
            $table->enum('target_units', ['all', 'occupied', 'empty', 'custom'])->default('all');
            $table->decimal('total_amount', 14, 2)->default(0);
            $table->timestamps();
        });

        Schema::create('charge_invoice_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('charge_invoice_id')->constrained('charge_invoices')->onDelete('cascade');
            $table->foreignId('unit_id')->constrained('units')->onDelete('cascade');
            $table->foreignId('payer_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->decimal('base_amount', 12, 2);
            $table->decimal('penalty_amount', 10, 2)->default(0);
            $table->decimal('total_amount', 12, 2);
            $table->enum('status', ['unpaid', 'paid'])->default('unpaid');
            $table->timestamp('paid_at')->nullable();
            $table->string('payment_method')->nullable();
            $table->timestamps();
        });

        Schema::create('other_revenues', function (Blueprint $table) {
            $table->id();
            $table->foreignId('building_id')->constrained('buildings')->onDelete('cascade');
            $table->string('category');
            $table->string('title');
            $table->decimal('amount', 12, 2);
            $table->string('payer_name')->nullable();
            $table->date('revenue_date');
            $table->text('description')->nullable();
            $table->string('receipt_path')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('other_revenues');
        Schema::dropIfExists('charge_invoice_items');
        Schema::dropIfExists('charge_invoices');
    }
};
