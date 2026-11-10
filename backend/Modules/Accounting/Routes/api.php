<?php

use Illuminate\Support\Facades\Route;
use Modules\Accounting\Http\Controllers\AccountingController;

Route::middleware('auth:sanctum')->prefix('buildings/{buildingId}/accounting')->group(function () {
    Route::get('accounts', [AccountingController::class, 'getAccounts']);
    Route::get('transactions', [AccountingController::class, 'getTransactions']);
    Route::post('transactions', [AccountingController::class, 'recordTransaction']);
    Route::post('transactions/{transactionId}/review', [AccountingController::class, 'reviewTransaction']);
    Route::get('units/{unitId}/ledger', [AccountingController::class, 'getUnitLedger']);
    Route::get('debtors', [AccountingController::class, 'getDebtors']);
});
