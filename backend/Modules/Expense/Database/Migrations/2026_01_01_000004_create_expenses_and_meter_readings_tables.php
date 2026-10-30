<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('expenses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('building_id')->constrained('buildings')->onDelete('cascade');
            $table->string('title');
            $table->string('category');
            $table->string('calculation_method'); // کنتورخوانی، مساوی، بر اساس نفرات، بر اساس متراژ، مبلغ دلخواه
            $table->decimal('total_bill_amount', 12, 2);
            $table->decimal('unit_price', 10, 2)->nullable();
            $table->date('expense_date');
            $table->text('description')->nullable();
            $table->enum('payer_type', ['ساکن', 'مالک'])->default('ساکن');
            $table->string('target_units')->default('all');
            $table->enum('settlement_type', ['ANNOUNCE_TO_RESIDENTS', 'DIRECT_FUND_PAYMENT'])->default('ANNOUNCE_TO_RESIDENTS');
            $table->string('attachment_path')->nullable();
            $table->timestamps();
        });

        Schema::create('meter_readings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('expense_id')->constrained('expenses')->onDelete('cascade');
            $table->foreignId('unit_id')->constrained('units')->onDelete('cascade');
            $table->string('meter_type');
            $table->decimal('previous_reading', 10, 2)->default(0);
            $table->decimal('current_reading', 10, 2)->default(0);
            $table->decimal('consumption', 10, 2)->default(0);
            $table->decimal('calculated_amount', 12, 2)->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('meter_readings');
        Schema::dropIfExists('expenses');
    }
};
