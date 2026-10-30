<?php

use Illuminate\Support\Facades\Route;
use Modules\Unit\Http\Controllers\UnitController;

Route::middleware('auth:sanctum')->prefix('buildings/{buildingId}/units')->group(function () {
    Route::get('/', [UnitController::class, 'index']);
    Route::post('/', [UnitController::class, 'store']);
    Route::post('import-excel', [UnitController::class, 'importExcel']);
});
