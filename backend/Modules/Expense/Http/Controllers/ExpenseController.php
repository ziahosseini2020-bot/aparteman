<?php

namespace Modules\Expense\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Modules\Expense\Models\Expense;
use Modules\Expense\Models\MeterReading;
use Modules\Expense\Services\ExpenseSettlementService;

class ExpenseController extends Controller
{
    protected ExpenseSettlementService $settlementService;

    public function __construct(ExpenseSettlementService $settlementService)
    {
        $this->settlementService = $settlementService;
    }

    public function index($buildingId): JsonResponse
    {
        $expenses = Expense::with('meterReadings.unit')
            ->where('building_id', $buildingId)
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $expenses,
        ]);
    }

    public function store(Request $request, $buildingId): JsonResponse
    {
        $request->validate([
            'title' => ['required', 'string'],
            'category' => ['required', 'string'],
            'calculation_method' => ['required', 'string'],
            'total_bill_amount' => ['required', 'numeric', 'min:1'],
            'unit_price' => ['nullable', 'numeric'],
            'expense_date' => ['required', 'date'],
            'description' => ['nullable', 'string'],
            'payer_type' => ['required', 'in:ساکن,مالک'],
            'target_units' => ['nullable', 'string'],
            'settlement_type' => ['required', 'in:ANNOUNCE_TO_RESIDENTS,DIRECT_FUND_PAYMENT'],
            'attachment' => ['nullable', 'file', 'max:10240'],
            'meter_readings' => ['nullable', 'array'],
            'meter_readings.*.unit_id' => ['required_with:meter_readings', 'exists:units,id'],
            'meter_readings.*.previous_reading' => ['required_with:meter_readings', 'numeric'],
            'meter_readings.*.current_reading' => ['required_with:meter_readings', 'numeric'],
        ]);

        return DB::transaction(function () use ($request, $buildingId) {
            $attachmentPath = null;
            if ($request->hasFile('attachment')) {
                $attachmentPath = $request->file('attachment')->store('expenses', 'public');
            }

            $expense = Expense::create([
                'building_id' => $buildingId,
                'title' => $request->title,
                'category' => $request->category,
                'calculation_method' => $request->calculation_method,
                'total_bill_amount' => $request->total_bill_amount,
                'unit_price' => $request->unit_price,
                'expense_date' => $request->expense_date,
                'description' => $request->description,
                'payer_type' => $request->payer_type,
                'target_units' => $request->target_units ?: 'all',
                'settlement_type' => $request->settlement_type,
                'attachment_path' => $attachmentPath,
            ]);

            // If Meter Readings provided (آب، برق، گاز)
            if ($request->calculation_method === 'کنتورخوانی' && $request->filled('meter_readings')) {
                $totalConsumption = 0;
                $meterRows = [];

                foreach ($request->meter_readings as $row) {
                    $consumption = max(0, $row['current_reading'] - $row['previous_reading']);
                    $totalConsumption += $consumption;
                    $meterRows[] = [
                        'unit_id' => $row['unit_id'],
                        'prev' => $row['previous_reading'],
                        'curr' => $row['current_reading'],
                        'consumption' => $consumption,
                    ];
                }

                foreach ($meterRows as $m) {
                    // Calculate proportional share
                    $amount = ($totalConsumption > 0)
                        ? ($m['consumption'] / $totalConsumption) * $request->total_bill_amount
                        : 0;

                    MeterReading::create([
                        'expense_id' => $expense->id,
                        'unit_id' => $m['unit_id'],
                        'meter_type' => $request->category,
                        'previous_reading' => $m['prev'],
                        'current_reading' => $m['curr'],
                        'consumption' => $m['consumption'],
                        'calculated_amount' => $amount,
                    ]);
                }
            }

            // Settle expense (fund deduction & unit debt accounting)
            $this->settlementService->settleExpense($expense);

            return response()->json([
                'success' => true,
                'message' => 'هزینه با موفقیت در سیستم ثبت گردید',
                'data' => $expense->load('meterReadings.unit'),
            ], 201);
        });
    }
}
