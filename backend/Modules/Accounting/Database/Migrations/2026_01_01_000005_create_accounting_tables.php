<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('building_funds', function (Blueprint $table) {
            $table->id();
            $table->foreignId('building_id')->unique()->constrained('buildings')->onDelete('cascade');
            $table->decimal('current_balance', 14, 2)->default(0);
            $table->timestamps();
        });

        Schema::create('fund_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('building_id')->constrained('buildings')->onDelete('cascade');
            $table->enum('type', ['deposit', 'withdrawal']);
            $table->decimal('amount', 12, 2);
            $table->string('source'); // charge_payment, other_revenue, expense_payment
            $table->unsignedBigInteger('reference_id')->nullable();
            $table->text('description')->nullable();
            $table->decimal('balance_after', 14, 2);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fund_transactions');
        Schema::dropIfExists('building_funds');
    }
};
