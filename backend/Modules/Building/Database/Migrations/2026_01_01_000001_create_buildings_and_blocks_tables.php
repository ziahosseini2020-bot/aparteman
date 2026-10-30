<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('buildings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('creator_user_id')->constrained('users')->onDelete('cascade');
            $table->string('name');
            $table->enum('type', ['مسکونی', 'تجاری', 'اداری', 'سایر'])->default('مسکونی');
            $table->string('province');
            $table->string('city');
            $table->text('address');
            $table->string('location')->nullable(); // GPS coordinates "lat,lng"
            $table->string('phone')->nullable();
            $table->string('postal_code')->nullable();
            $table->string('account_number')->nullable();
            $table->string('account_holder')->nullable();
            $table->timestamps();
        });

        Schema::create('blocks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('building_id')->constrained('buildings')->onDelete('cascade');
            $table->string('name');
            $table->unsignedSmallInteger('floor_count')->default(1);
            $table->unsignedSmallInteger('unit_count')->default(1);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('blocks');
        Schema::dropIfExists('buildings');
    }
};
