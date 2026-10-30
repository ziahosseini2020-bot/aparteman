<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Use MorphMap in relationships
    |--------------------------------------------------------------------------
    */
    'use_morph_map' => false,

    /*
    |--------------------------------------------------------------------------
    | Teams (Multi-Building Context)
    |--------------------------------------------------------------------------
    | In Aparteman, each Building acts as a Laratrust Team.
    | A user can be 'building_manager' in Building A, and 'tenant' in Building B.
    */
    'teams' => [
        'enabled' => true,
        'model' => \Modules\Building\Models\Building::class,
        'table' => 'buildings',
        'foreign_key' => 'building_id',
    ],

    /*
    |--------------------------------------------------------------------------
    | Strict Check
    |--------------------------------------------------------------------------
    */
    'magic_can_method' => false,

    'models' => [
        'user' => \App\Models\User::class,
        'role' => \App\Models\Role::class,
        'permission' => \App\Models\Permission::class,
    ],

    'tables' => [
        'roles' => 'roles',
        'permissions' => 'permissions',
        'teams' => 'buildings',
        'role_user' => 'role_user',
        'permission_user' => 'permission_user',
        'permission_role' => 'permission_role',
    ],

    'foreign_keys' => [
        'user' => 'user_id',
        'role' => 'role_id',
        'permission' => 'permission_id',
        'team' => 'team_id',
    ],

    /*
    | Predefined Roles in Aparteman
    */
    'user_models' => [
        'users' => \App\Models\User::class,
    ],
];
