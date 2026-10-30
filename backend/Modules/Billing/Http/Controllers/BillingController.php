<?php

namespace Modules\Billing\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Modules\Accounting\Models\BuildingFund;
use Modules\Accounting\Models\FundTransaction;
use Modules\Billing\Models\ChargeInvoice;
use Modules\Billing\Models\ChargeInvoiceItem;
use Modules\Billing\Services\ChargeCalculationService;
use Modules\Unit\Models\Unit;

class BillingController extends Controller
{
    protected ChargeCalculationService $calcService;

    public function __construct(ChargeCalculationService $calcService)
    {
        $this->calcService = $calcService;
    }

    public function index($buildingId): JsonResponse
    {
        $invoices = ChargeInvoice::with(['items.unit', 'items.payer'])
            ->where('building_id', $buildingId)
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $invoices,
        ]);
    }

    public function preview(Request $request, $buildingId): JsonResponse
    {
        $request->validate([
            'calculation_model' => ['required', 'string'],
            'base_amount' => ['nullable', 'numeric', 'min:0'],
            'area_rate' => ['nullable', 'numeric', 'min:0'],
            'occupant_rate' => ['nullable', 'numeric', 'min:0'],
            'target_units' => ['required', 'in:all,occupied,empty,custom'],
        ]);

        $query = Unit::where('building_id', $buildingId);
        if ($request->target_units === 'occupied') {
            $query->where('is_occupied', true);
        } elseif ($request->target_units === 'empty') {
            $query->where('is_occupied', false);
        }

        $units = $query->get();
        $items = [];
        $totalAmount = 0;

        foreach ($units as $unit) {
            $amount = $this->calcService->calculateUnitCharge(
                $unit,
                $request->calculation_model,
                (float) ($request->base_amount ?: 0),
                (float) ($request->area_rate ?: 0),
                (float) ($request->occupant_rate ?: 0)
            );

            $totalAmount += $amount;
            $items[] = [
                'unit_id' => $unit->id,
                'unit_title' => $unit->title,
                'area' => $unit->area,
                'occupants' => $unit->occupants_count,
                'calculated_amount' => $amount,
            ];
        }

        return response()->json([
            'success' => true,
            'total_amount' => $totalAmount,
            'units_count' => count($items),
            'items' => $items,
        ]);
    }

    public function store(Request $request, $buildingId): JsonResponse
    {
        $request->validate([
            'title' => ['required', 'string'],
            'due_date_days' => ['required', 'integer', 'min:1'],
            'daily_penalty_amount' => ['nullable', 'numeric', 'min:0'],
            'calculation_model' => ['required', 'string'],
            'base_amount' => ['nullable', 'numeric', 'min:0'],
            'area_rate' => ['nullable', 'numeric', 'min:0'],
            'occupant_rate' => ['nullable', 'numeric', 'min:0'],
            'payer_type' => ['required', 'in:ساکن,مالک,هر دو'],
            'target_units' => ['required', 'in:all,occupied,empty,custom'],
        ]);

        return DB::transaction(function () use ($request, $buildingId) {
            $issueDate = now()->toDateString();
            $dueDate = now()->addDays((int) $request->due_date_days)->toDateString();

            $query = Unit::with(['currentResident', 'currentOwner'])
                ->where('building_id', $buildingId);

            if ($request->target_units === 'occupied') {
                $query->where('is_occupied', true);
            } elseif ($request->target_units === 'empty') {
                $query->where('is_occupied', false);
            }

            $units = $query->get();

            $invoice = ChargeInvoice::create([
                'building_id' => $buildingId,
                'title' => $request->title,
                'issue_date' => $issueDate,
                'due_date' => $dueDate,
                'daily_penalty_amount' => $request->daily_penalty_amount ?: 0,
                'calculation_model' => $request->calculation_model,
                'base_amount' => $request->base_amount ?: 0,
                'area_rate' => $request->area_rate ?: 0,
                'occupant_rate' => $request->occupant_rate ?: 0,
                'payer_type' => $request->payer_type,
                'target_units' => $request->target_units,
                'total_amount' => 0,
            ]);

            $totalAmount = 0;

            foreach ($units as $unit) {
                $amount = $this->calcService->calculateUnitCharge(
                    $unit,
                    $request->calculation_model,
                    (float) ($request->base_amount ?: 0),
                    (float) ($request->area_rate ?: 0),
                    (float) ($request->occupant_rate ?: 0)
                );

                $totalAmount += $amount;

                // Determine payer user
                $payerUserId = null;
                if ($request->payer_type === 'ساکن' && $unit->currentResident) {
                    $payerUserId = $unit->currentResident->user_id;
                } elseif ($request->payer_type === 'مالک' && $unit->currentOwner) {
                    $payerUserId = $unit->currentOwner->user_id;
                } elseif ($unit->currentResident) {
                    $payerUserId = $unit->currentResident->user_id;
                }

                ChargeInvoiceItem::create([
                    'charge_invoice_id' => $invoice->id,
                    'unit_id' => $unit->id,
                    'payer_user_id' => $payerUserId,
                    'base_amount' => $amount,
                    'penalty_amount' => 0,
                    'total_amount' => $amount,
                    'status' => 'unpaid',
                ]);
            }

            $invoice->update(['total_amount' => $totalAmount]);

            return response()->json([
                'success' => true,
                'message' => 'قبض شارژ دوره‌ای برای واحدها با موفقیت صادر گردید',
                'data' => $invoice->load('items.unit'),
            ], 201);
        });
    }

    public function payItem(Request $request, $itemId): JsonResponse
    {
        $request->validate([
            'payment_method' => ['nullable', 'string'],
        ]);

        return DB::transaction(function () use ($request, $itemId) {
            $item = ChargeInvoiceItem::with('invoice')->findOrFail($itemId);

            if ($item->status === 'paid') {
                return response()->json(['success' => false, 'message' => 'این قبض قبلاً تسویه شده است'], 422);
            }

            // Calculate overdue penalty if applicable
            $penalty = $this->calcService->calculateLatePenalty(
                $item->invoice->due_date,
                (float) $item->invoice->daily_penalty_amount
            );

            $finalPayable = $item->base_amount + $penalty;

            $item->update([
                'penalty_amount' => $penalty,
                'total_amount' => $finalPayable,
                'status' => 'paid',
                'paid_at' => now(),
                'payment_method' => $request->payment_method ?: 'آنلاین / شتاب',
            ]);

            // Deposit into Building Fund
            $fund = BuildingFund::firstOrCreate(['building_id' => $item->invoice->building_id]);
            $fund->increment('current_balance', $finalPayable);

            FundTransaction::create([
                'building_id' => $item->invoice->building_id,
                'type' => 'deposit',
                'amount' => $finalPayable,
                'source' => 'charge_payment',
                'reference_id' => $item->id,
                'description' => "تسویه شارژ {$item->invoice->title} برای واحد {$item->unit_id}",
                'balance_after' => $fund->current_balance,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'پرداخت با موفقیت انجام شد و به صندوق ساختمان واریز گردید',
                'data' => $item,
            ]);
        });
    }

    public function myInvoices(Request $request): JsonResponse
    {
        $user = $request->user();
        $items = ChargeInvoiceItem::with(['invoice.building', 'unit'])
            ->where('payer_user_id', $user->id)
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $items,
        ]);
    }
}
