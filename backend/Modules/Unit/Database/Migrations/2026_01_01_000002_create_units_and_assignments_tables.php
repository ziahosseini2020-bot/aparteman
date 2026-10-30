<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('units', function (Blueprint $table) {
            $table->id();
            $table->foreignId('building_id')->constrained('buildings')->onDelete('cascade');
            $table->foreignId('block_id')->nullable()->constrained('blocks')->nullOnDelete();
            $table->string('title'); // e.g. "واحد ۱۰۱"
            $table->smallInteger('floor')->default(1);
            $table->decimal('area', 8, 2); // Sq meters
            $table->unsignedSmallInteger('occupants_count')->default(1);
            $table->unsignedTinyInteger('parking_count')->default(0);
            $table->unsignedTinyInteger('storage_count')->default(0);
            $table->boolean('is_occupied')->default(true);
            $table->decimal('default_charge_amount', 12, 2)->default(0);
            $table->timestamps();
        });

        Schema::create('unit_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('unit_id')->constrained('units')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->enum('type', ['owner', 'tenant'])->default('owner');
            $table->boolean('is_resident')->default(true);
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('unit_assignments');
        Schema::dropIfExists('units');
    }
};
