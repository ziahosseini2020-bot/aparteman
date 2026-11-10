<?php

namespace Modules\Accounting\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Modules\Building\Models\Building;

class FinancialAccount extends Model
{
    protected $table = 'financial_accounts';

    protected $fillable = [
        'building_id',
        'name',
        'account_type',
        'account_number',
        'card_number',
        'shaba_number',
        'bank_name',
        'responsible_name',
        'initial_balance',
        'current_balance',
        'is_active',
    ];

    protected $casts = [
        'initial_balance' => 'decimal:2',
        'current_balance' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    public function building(): BelongsTo
    {
        return $this->belongsTo(Building::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }
}
