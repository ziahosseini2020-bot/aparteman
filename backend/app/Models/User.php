<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Laratrust\Contracts\LaratrustUser;
use Laratrust\Traits\HasRolesAndPermissions;
use Modules\Building\Models\Building;
use Modules\Unit\Models\UnitAssignment;

class User extends Authenticatable implements LaratrustUser
{
    use HasApiTokens, HasFactory, Notifiable, HasRolesAndPermissions;

    protected $fillable = [
        'first_name',
        'last_name',
        'mobile',
        'national_code',
        'password',
        'is_active',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    public function getFullNameAttribute(): string
    {
        return trim("{$this->first_name} {$this->last_name}");
    }

    /**
     * Buildings created or managed by this user
     */
    public function managedBuildings()
    {
        return $this->hasMany(Building::class, 'creator_user_id');
    }

    /**
     * Unit ownerships / residencies
     */
    public function unitAssignments()
    {
        return $this->hasMany(UnitAssignment::class, 'user_id');
    }
}
