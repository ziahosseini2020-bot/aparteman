<?php

namespace Modules\Accounting\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Modules\Building\Models\Building;

class BuildingFund extends Model
{
    use HasFactory;

    protected $fillable = [
        'building_id',
        'current_balance',
    ];

    protected $casts = [
        'current_balance' => 'decimal:2',
    ];

    public function building()
    {
        return $this->belongsTo(Building::class);
    }

    public function transactions()
    {
        return $this->hasMany(FundTransaction::class, 'building_id', 'building_id');
    }
}
