<?php

namespace Modules\Accounting\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Modules\Building\Models\Building;
use Modules\Unit\Models\Unit;

class UnitLedgerEntry extends Model
{
    protected $table = 'unit_ledger_entries';

    protected $fillable = [
        'building_id',
        'unit_id',
        'unit_title',
        'entry_date',
        'entry_type',
        'title',
        'debit_amount',
        'credit_amount',
        'balance_after',
        'reference_id',
        'description',
    ];

    protected $casts = [
        'entry_date' => 'date',
        'debit_amount' => 'decimal:2',
        'credit_amount' => 'decimal:2',
        'balance_after' => 'decimal:2',
    ];

    public function building(): BelongsTo
    {
        return $this->belongsTo(Building::class);
    }

    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class);
    }
}
