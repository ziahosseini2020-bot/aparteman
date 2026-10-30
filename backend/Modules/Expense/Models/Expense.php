<?php

namespace Modules\Expense\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Modules\Building\Models\Building;

class Expense extends Model
{
    use HasFactory;

    protected $fillable = [
        'building_id',
        'title',
        'category', // 'آب', 'برق', 'گاز', 'تعمیرات و نگهداری', 'نظافت', 'سرویس آسانسور', 'سایر'
        'calculation_method', // 'کنتورخوانی', 'مساوی', 'بر اساس نفرات', 'بر اساس متراژ', 'مبلغ دلخواه'
        'total_bill_amount',
        'unit_price',
        'expense_date',
        'description',
        'payer_type', // 'ساکن', 'مالک'
        'target_units', // 'all', 'occupied', 'empty', 'specific'
        'settlement_type', // 'ANNOUNCE_TO_RESIDENTS', 'DIRECT_FUND_PAYMENT'
        'attachment_path',
    ];

    protected $casts = [
        'total_bill_amount' => 'decimal:2',
        'unit_price' => 'decimal:2',
        'expense_date' => 'date',
    ];

    public function building()
    {
        return $this->belongsTo(Building::class);
    }

    public function meterReadings()
    {
        return $this->hasMany(MeterReading::class);
    }
}
