<?php

namespace Modules\Billing\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Modules\Building\Models\Building;

class OtherRevenue extends Model
{
    use HasFactory;

    protected $fillable = [
        'building_id',
        'category', // 'اجاره پارکینگ', 'تبلیغات', 'فروش ضایعات', etc.
        'title',
        'amount',
        'payer_name',
        'revenue_date',
        'description',
        'receipt_path',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'revenue_date' => 'date',
    ];

    public function building()
    {
        return $this->belongsTo(Building::class);
    }
}
