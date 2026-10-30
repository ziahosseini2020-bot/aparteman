<?php

namespace Modules\Building\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Modules\Accounting\Models\BuildingFund;
use Modules\Billing\Models\ChargeInvoice;
use Modules\Expense\Models\Expense;
use Modules\Unit\Models\Unit;

class Building extends Model
{
    use HasFactory;

    protected $fillable = [
        'creator_user_id',
        'name',
        'type',
        'province',
        'city',
        'address',
        'location',
        'phone',
        'postal_code',
        'account_number',
        'account_holder',
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'creator_user_id');
    }

    public function blocks()
    {
        return $this->hasMany(Block::class);
    }

    public function units()
    {
        return $this->hasMany(Unit::class);
    }

    public function fund()
    {
        return $this->hasOne(BuildingFund::class);
    }

    public function invoices()
    {
        return $this->hasMany(ChargeInvoice::class);
    }

    public function expenses()
    {
        return $this->hasMany(Expense::class);
    }
}
