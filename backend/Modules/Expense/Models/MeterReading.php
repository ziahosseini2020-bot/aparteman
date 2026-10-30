<?php

namespace Modules\Expense\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Modules\Unit\Models\Unit;

class MeterReading extends Model
{
    use HasFactory;

    protected $fillable = [
        'expense_id',
        'unit_id',
        'meter_type', // 'water', 'electricity', 'gas'
        'previous_reading',
        'current_reading',
        'consumption',
        'calculated_amount',
    ];

    protected $casts = [
        'previous_reading' => 'decimal:2',
        'current_reading' => 'decimal:2',
        'consumption' => 'decimal:2',
        'calculated_amount' => 'decimal:2',
    ];

    public function expense()
    {
        return $this->belongsTo(Expense::class);
    }

    public function unit()
    {
        return $this->belongsTo(Unit::class);
    }
}
