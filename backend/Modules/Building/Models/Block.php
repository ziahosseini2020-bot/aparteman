<?php

namespace Modules\Building\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Modules\Unit\Models\Unit;

class Block extends Model
{
    use HasFactory;

    protected $fillable = [
        'building_id',
        'name',
        'floor_count',
        'unit_count',
    ];

    public function building()
    {
        return $this->belongsTo(Building::class);
    }

    public function units()
    {
        return $this->hasMany(Unit::class);
    }
}
