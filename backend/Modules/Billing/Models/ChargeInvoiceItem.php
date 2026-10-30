<?php

namespace Modules\Billing\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Modules\Unit\Models\Unit;

class ChargeInvoiceItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'charge_invoice_id',
        'unit_id',
        'payer_user_id',
        'base_amount',
        'penalty_amount',
        'total_amount',
        'status', // 'unpaid', 'paid'
        'paid_at',
        'payment_method',
    ];

    protected $casts = [
        'base_amount' => 'decimal:2',
        'penalty_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'paid_at' => 'datetime',
    ];

    public function invoice()
    {
        return $this->belongsTo(ChargeInvoice::class, 'charge_invoice_id');
    }

    public function unit()
    {
        return $this->belongsTo(Unit::class);
    }

    public function payer()
    {
        return $this->belongsTo(User::class, 'payer_user_id');
    }
}
