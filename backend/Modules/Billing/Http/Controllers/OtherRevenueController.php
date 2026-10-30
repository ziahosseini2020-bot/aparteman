<?php

namespace Modules\Billing\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Modules\Accounting\Models\BuildingFund;
use Modules\Accounting\Models\FundTransaction;
use Modules\Billing\Models\OtherRevenue;

class OtherRevenueController extends Controller
{
    public function index($buildingId): JsonResponse
    {
        $revenues = OtherRevenue::where('building_id', $buildingId)->latest()->get();

        return response()->json([
            'success' => true,
            'data' => $revenues,
        ]);
    }

    public function store(Request $request, $buildingId): JsonResponse
    {
        $request->validate([
            'category' => ['required', 'string'],
            'title' => ['required', 'string'],
            'amount' => ['required', 'numeric', 'min:1'],
            'payer_name' => ['nullable', 'string'],
            'revenue_date' => ['required', 'date'],
            'description' => ['nullable', 'string'],
        ]);

        return DB::transaction(function () use ($request, $buildingId) {
            $revenue = OtherRevenue::create([
                'building_id' => $buildingId,
                'category' => $request->category,
                'title' => $request->title,
                'amount' => $request->amount,
                'payer_name' => $request->payer_name,
                'revenue_date' => $request->revenue_date,
                'description' => $request->description,
            ]);

            // Add amount to Building Fund
            $fund = BuildingFund::firstOrCreate(['building_id' => $buildingId]);
            $fund->increment('current_balance', $request->amount);

            FundTransaction::create([
                'building_id' => $buildingId,
                'type' => 'deposit',
                'amount' => $request->amount,
                'source' => 'other_revenue',
                'reference_id' => $revenue->id,
                'description' => "درآمد متفرقه: {$revenue->title}",
                'balance_after' => $fund->current_balance,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'درآمد متفرقه با موفقیت ثبت و به موجودی صندوق ساختمان اضافه شد',
                'data' => $revenue,
            ], 201);
        });
    }
}
