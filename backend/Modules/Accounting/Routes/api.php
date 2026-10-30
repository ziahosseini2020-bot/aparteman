<?php

use Illuminate\Support\Facades\Route;
use Modules\Accounting\Http\Controllers\AccountingController;

Route::middleware('auth:sanctum')->prefix('buildings/{buildingId}/accounting')->group(function () {
    Route::get('fund', [AccountingController::class, 'getFundStatus']);
});
