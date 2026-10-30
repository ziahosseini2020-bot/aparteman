<?php

namespace Modules\Unit\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UnitAssignment extends Model
{
    use HasFactory;

    protected $fillable = [
        'unit_id',
        'user_id',
        'type', // 'owner' or 'tenant'
        'is_resident', // if owner lives in the unit
        'start_date',
        'end_date',
        'is_active',
    ];

    protected $casts = [
        'is_resident' => 'boolean',
        'is_active' => 'boolean',
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    public function unit()
    {
        return $this->belongsTo(Unit::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
