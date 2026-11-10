<?php

namespace Modules\Accounting\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Accounting\Models\FinancialAccount;
use Modules\Accounting\Models\Transaction;
use Modules\Accounting\Models\UnitLedgerEntry;
use Modules\Unit\Models\Unit;
use Illuminate\Support\Facades\DB;

class AccountingController extends Controller
{
    /**
     * Get financial accounts and total liquid cash for building
     */
    public function getAccounts($buildingId): JsonResponse
    {
        $accounts = FinancialAccount::where('building_id', $buildingId)
            ->where('is_active', true)
            ->get();

        $totalBalance = $accounts->sum('balance');

        return response()->json([
            'success' => true,
            'total_liquid_balance' => $totalBalance,
            'accounts' => $accounts,
        ]);
    }

    /**
     * Get transactions history
     */
    public function getTransactions(Request $request, $buildingId): JsonResponse
    {
        $query = Transaction::with(['account', 'unit', 'allocations'])
            ->where('building_id', $buildingId);

        if ($request->has('status')) {
            $query->where('status', $request->query('status'));
        }

        if ($request->has('category')) {
            $query->where('category', $request->query('category'));
        }

        $transactions = $query->latest('transaction_date')->paginate(30);

        return response()->json([
            'success' => true,
            'transactions' => $transactions,
        ]);
    }

    /**
     * Record a new real transaction (inflow or outflow)
     */
    public function recordTransaction(Request $request, $buildingId): JsonResponse
    {
        $validated = $request->validate([
            'account_id' => 'required|exists:financial_accounts,id',
            'unit_id' => 'nullable|exists:units,id',
            'type' => 'required|in:charge_payment,expense,other_revenue,transfer',
            'amount' => 'required|numeric|min:1',
            'category' => 'required|in:charge,expense,other_revenue,fine,transfer',
            'payment_method' => 'required|in:online_gateway,card_transfer,cash,cheque',
            'status' => 'required|in:completed,pending_approval,rejected',
            'reference_number' => 'nullable|string|max:100',
            'description' => 'nullable|string|max:500',
            'attachment_url' => 'nullable|string',
        ]);

        $transaction = DB::transaction(function () use ($validated, $buildingId) {
            $account = FinancialAccount::findOrFail($validated['account_id']);
            $amount = (float) $validated['amount'];

            // 1. If completed, update liquid account balance
            if ($validated['status'] === 'completed') {
                if (in_array($validated['type'], ['charge_payment', 'other_revenue'])) {
                    $account->increment('balance', $amount);
                } elseif ($validated['type'] === 'expense') {
                    $account->decrement('balance', $amount);
                }
            }

            // 2. Create Transaction record
            $tx = Transaction::create([
                'building_id' => $buildingId,
                'account_id' => $account->id,
                'unit_id' => $validated['unit_id'] ?? null,
                'type' => $validated['type'],
                'amount' => $amount,
                'category' => $validated['category'],
                'payment_method' => $validated['payment_method'],
                'status' => $validated['status'],
                'reference_number' => $validated['reference_number'] ?? null,
                'description' => $validated['description'] ?? null,
                'attachment_url' => $validated['attachment_url'] ?? null,
                'transaction_date' => now(),
            ]);

            // 3. If unit payment completed, credit unit ledger
            if ($validated['status'] === 'completed' && !empty($validated['unit_id']) && $validated['type'] === 'charge_payment') {
                $latest = UnitLedgerEntry::where('unit_id', $validated['unit_id'])->latest('id')->first();
                $curBalance = $latest ? (float) $latest->balance : 0;
                $newBalance = $curBalance + $amount;

                UnitLedgerEntry::create([
                    'unit_id' => $validated['unit_id'],
                    'transaction_id' => $tx->id,
                    'type' => 'credit',
                    'amount' => $amount,
                    'balance' => $newBalance,
                    'category' => 'payment',
                    'description' => "واریز شارژ توسط واحد - سند شماره {$tx->id}",
                    'entry_date' => now(),
                ]);
            }

            return $tx;
        });

        return response()->json([
            'success' => true,
            'transaction' => $transaction,
        ]);
    }

    /**
     * Approve or reject a pending receipt
     */
    public function reviewTransaction(Request $request, $buildingId, $transactionId): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:completed,rejected',
        ]);

        $transaction = Transaction::where('building_id', $buildingId)->findOrFail($transactionId);

        if ($transaction->status !== 'pending_approval') {
            return response()->json(['success' => false, 'message' => 'تراکنش در وضعیت انتظار نیست.'], 400);
        }

        DB::transaction(function () use ($transaction, $validated) {
            $transaction->status = $validated['status'];
            $transaction->save();

            if ($validated['status'] === 'completed') {
                $account = FinancialAccount::find($transaction->account_id);
                if ($account) {
                    $account->increment('balance', $transaction->amount);
                }

                if ($transaction->unit_id) {
                    $latest = UnitLedgerEntry::where('unit_id', $transaction->unit_id)->latest('id')->first();
                    $curBalance = $latest ? (float) $latest->balance : 0;
                    $newBalance = $curBalance + (float) $transaction->amount;

                    UnitLedgerEntry::create([
                        'unit_id' => $transaction->unit_id,
                        'transaction_id' => $transaction->id,
                        'type' => 'credit',
                        'amount' => $transaction->amount,
                        'balance' => $newBalance,
                        'category' => 'payment',
                        'description' => "تایید فیش واریزی - سند شماره {$transaction->id}",
                        'entry_date' => now(),
                    ]);
                }
            }
        });

        return response()->json([
            'success' => true,
            'transaction' => $transaction,
        ]);
    }

    /**
     * Unit Ledger statement
     */
    public function getUnitLedger($buildingId, $unitId): JsonResponse
    {
        $unit = Unit::where('building_id', $buildingId)->findOrFail($unitId);
        $entries = UnitLedgerEntry::where('unit_id', $unit->id)->orderBy('id', 'asc')->get();

        $latestEntry = $entries->last();
        $balance = $latestEntry ? $latestEntry->balance : 0;

        return response()->json([
            'success' => true,
            'unit' => $unit,
            'current_balance' => $balance,
            'entries' => $entries,
        ]);
    }

    /**
     * Debtor ranking for manager notices and Bale Bot broadcasts
     */
    public function getDebtors($buildingId): JsonResponse
    {
        $units = Unit::with(['assignments.user'])->where('building_id', $buildingId)->get();

        $debtors = [];
        foreach ($units as $unit) {
            $latest = UnitLedgerEntry::where('unit_id', $unit->id)->latest('id')->first();
            $balance = $latest ? (float) $latest->balance : 0;
            if ($balance < 0) {
                $debtors[] = [
                    'unit_id' => $unit->id,
                    'unit_title' => $unit->title,
                    'debt_amount' => abs($balance),
                    'resident_name' => $unit->currentResident?->user?->name ?? 'ساکن ثبت نشده',
                    'resident_mobile' => $unit->currentResident?->user?->mobile ?? '-',
                ];
            }
        }

        usort($debtors, fn($a, $b) => $b['debt_amount'] <=> $a['debt_amount']);

        return response()->json([
            'success' => true,
            'debtors' => $debtors,
            'total_debt' => array_sum(array_column($debtors, 'debt_amount')),
        ]);
    }
}
