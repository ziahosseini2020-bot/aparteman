<?php

namespace Modules\Accounting\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Modules\Building\Models\Building;

class FundTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'building_id',
        'type', // 'deposit', 'withdrawal'
        'amount',
        'source', // 'charge_payment', 'other_revenue', 'expense_payment'
        'reference_id',
        'description',
        'balance_after',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'balance_after' => 'decimal:2',
    ];

    public function building()
    {
        return $this->belongsTo(Building::class);
    }
}
