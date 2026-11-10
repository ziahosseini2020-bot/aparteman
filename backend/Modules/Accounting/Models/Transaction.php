<?php

namespace Modules\Accounting\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Modules\Building\Models\Building;
use App\Models\User;

class Transaction extends Model
{
    protected $table = 'transactions';

    protected $fillable = [
        'building_id',
        'financial_account_id',
        'type',
        'category',
        'amount',
        'transaction_date',
        'tracking_number',
        'description',
        'payer_or_payee_name',
        'status',
        'receipt_attachment',
        'created_by',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'transaction_date' => 'date',
    ];

    public function building(): BelongsTo
    {
        return $this->belongsTo(Building::class);
    }

    public function account(): BelongsTo
    {
        return $this->belongsTo(FinancialAccount::class, 'financial_account_id');
    }

    public function allocations(): HasMany
    {
        return $this->hasMany(TransactionAllocation::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
