<?php

namespace Modules\Unit\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Modules\Billing\Models\ChargeInvoiceItem;
use Modules\Building\Models\Block;
use Modules\Building\Models\Building;
use Modules\Expense\Models\MeterReading;

class Unit extends Model
{
    use HasFactory;

    protected $fillable = [
        'building_id',
        'block_id',
        'title',
        'floor',
        'area',
        'occupants_count',
        'parking_count',
        'storage_count',
        'is_occupied',
        'default_charge_amount',
    ];

    protected $casts = [
        'area' => 'decimal:2',
        'is_occupied' => 'boolean',
        'default_charge_amount' => 'decimal:2',
    ];

    public function building()
    {
        return $this->belongsTo(Building::class);
    }

    public function block()
    {
        return $this->belongsTo(Block::class);
    }

    public function assignments()
    {
        return $this->hasMany(UnitAssignment::class);
    }

    public function currentResident()
    {
        return $this->hasOne(UnitAssignment::class)
            ->where('is_active', true)
            ->where(function ($q) {
                $q->where('type', 'tenant')->orWhere('is_resident', true);
            });
    }

    public function currentOwner()
    {
        return $this->hasOne(UnitAssignment::class)
            ->where('is_active', true)
            ->where('type', 'owner');
    }

    public function invoiceItems()
    {
        return $this->hasMany(ChargeInvoiceItem::class);
    }

    public function meterReadings()
    {
        return $this->hasMany(MeterReading::class);
    }
}
