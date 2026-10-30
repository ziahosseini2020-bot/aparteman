<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
| Aparteman API uses Laravel Modules (nwidart/laravel-modules).
| Each module registers its own routes under Modules/{Module}/Routes/api.php
*/

Route::get('/health', function () {
    return response()->json([
        'status' => 'healthy',
        'app' => 'Aparteman API',
        'version' => '1.0.0',
        'timestamp' => now()->toIso8601String(),
    ]);
});
