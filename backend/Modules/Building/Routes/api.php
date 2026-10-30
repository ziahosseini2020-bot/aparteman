<?php

use Illuminate\Support\Facades\Route;
use Modules\Building\Http\Controllers\BlockController;
use Modules\Building\Http\Controllers\BuildingController;

Route::middleware('auth:sanctum')->prefix('buildings')->group(function () {
    Route::get('/', [BuildingController::class, 'index']);
    Route::post('/', [BuildingController::class, 'store']);
    Route::get('{id}', [BuildingController::class, 'show']);

    Route::get('{buildingId}/blocks', [BlockController::class, 'index']);
    Route::post('{buildingId}/blocks', [BlockController::class, 'store']);
});
