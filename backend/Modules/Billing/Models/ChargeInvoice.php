<?php

namespace Modules\Billing\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Modules\Building\Models\Building;

class ChargeInvoice extends Model
{
    use HasFactory;

    protected $fillable = [
        'building_id',
        'title',
        'issue_date',
        'due_date',
        'daily_penalty_amount',
        'calculation_model',
        'base_amount',
        'area_rate',
        'occupant_rate',
        'payer_type', // 'ساکن', 'مالک', 'هر دو'
        'target_units', // 'all', 'occupied', 'empty', 'custom'
        'total_amount',
    ];

    protected $casts = [
        'issue_date' => 'date',
        'due_date' => 'date',
        'daily_penalty_amount' => 'decimal:2',
        'base_amount' => 'decimal:2',
        'area_rate' => 'decimal:2',
        'occupant_rate' => 'decimal:2',
        'total_amount' => 'decimal:2',
    ];

    public function building()
    {
        return $this->belongsTo(Building::class);
    }

    public function items()
    {
        return $this->hasMany(ChargeInvoiceItem::class);
    }
}
