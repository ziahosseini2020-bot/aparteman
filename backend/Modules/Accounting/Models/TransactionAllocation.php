<?php

namespace Modules\Accounting\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class TransactionAllocation extends Model
{
    protected $table = 'transaction_allocations';

    protected $fillable = [
        'transaction_id',
        'allocatable_type',
        'allocatable_id',
        'unit_title',
        'amount',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
    ];

    public function transaction(): BelongsTo
    {
        return $this->belongsTo(Transaction::class);
    }

    public function allocatable(): MorphTo
    {
        return $this->morphTo();
    }
}
