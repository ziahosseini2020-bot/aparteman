<?php

use Illuminate\Support\Facades\Route;
use Modules\Billing\Http\Controllers\BillingController;
use Modules\Billing\Http\Controllers\OtherRevenueController;

Route::middleware('auth:sanctum')->group(function () {
    Route::prefix('buildings/{buildingId}/billing')->group(function () {
        Route::get('invoices', [BillingController::class, 'index']);
        Route::post('preview', [BillingController::class, 'preview']);
        Route::post('invoices', [BillingController::class, 'store']);
        Route::post('items/{itemId}/pay', [BillingController::class, 'payItem']);

        Route::get('revenues', [OtherRevenueController::class, 'index']);
        Route::post('revenues', [OtherRevenueController::class, 'store']);
    });

    Route::get('my-invoices', [BillingController::class, 'myInvoices']);
});
