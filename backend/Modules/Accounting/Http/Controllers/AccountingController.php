<?php

namespace Modules\Accounting\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Modules\Accounting\Models\BuildingFund;
use Modules\Accounting\Models\FundTransaction;

class AccountingController extends Controller
{
    public function getFundStatus($buildingId): JsonResponse
    {
        $fund = BuildingFund::firstOrCreate(
            ['building_id' => $buildingId],
            ['current_balance' => 0]
        );

        $recentTransactions = FundTransaction::where('building_id', $buildingId)
            ->latest()
            ->take(20)
            ->get();

        return response()->json([
            'success' => true,
            'current_balance' => $fund->current_balance,
            'recent_transactions' => $recentTransactions,
        ]);
    }
}
