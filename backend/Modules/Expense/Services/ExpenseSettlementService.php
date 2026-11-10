<?php

namespace Modules\Expense\Services;

use Modules\Accounting\Models\FinancialAccount;
use Modules\Accounting\Models\Transaction;
use Modules\Accounting\Models\UnitLedgerEntry;
use Modules\Expense\Models\Expense;
use Modules\Unit\Models\Unit;
use Illuminate\Support\Facades\DB;

class ExpenseSettlementService
{
    /**
     * Settle an expense according to Saraban 3 scenarios:
     * 1. PAID_THEN_SPLIT: Paid from financial account immediately & distributed as debt to units
     * 2. ANNOUNCE_THEN_PAY: Distributed as debt to units first; paid to vendor after collections
     * 3. DIRECT_FUND_NO_DEBT: Paid directly from building account/fund with NO debt assigned to units
     */
    public function settleExpense(
        Expense $expense,
        string $scenario = 'PAID_THEN_SPLIT',
        ?int $accountId = null,
        array $meterOrCustomData = []
    ): void {
        DB::transaction(function () use ($expense, $scenario, $accountId, $meterOrCustomData) {
            $buildingId = $expense->building_id;
            $amount = (float) $expense->total_bill_amount;

            // Scenario 1 & 3: Outflow transaction from financial account
            if (in_array($scenario, ['PAID_THEN_SPLIT', 'DIRECT_FUND_NO_DEBT'])) {
                $account = $accountId
                    ? FinancialAccount::findOrFail($accountId)
                    : FinancialAccount::where('building_id', $buildingId)->where('is_active', true)->first();

                if ($account) {
                    $account->decrement('balance', $amount);

                    Transaction::create([
                        'building_id' => $buildingId,
                        'account_id' => $account->id,
                        'unit_id' => null,
                        'type' => 'expense',
                        'amount' => $amount,
                        'category' => 'expense',
                        'payment_method' => 'card_transfer',
                        'status' => 'completed',
                        'description' => "پرداخت هزینه: {$expense->title} (سناریو: {$scenario})",
                        'transaction_date' => now(),
                    ]);
                }
            }

            // Scenario 1 & 2: Distribute debt to units via UnitLedgerEntry
            if (in_array($scenario, ['PAID_THEN_SPLIT', 'ANNOUNCE_THEN_PAY'])) {
                $this->distributeDebtToUnits($expense, $meterOrCustomData);
            }
        });
    }

    /**
     * Distribute expense amount as ledger debit entries to units
     */
    protected function distributeDebtToUnits(Expense $expense, array $meterOrCustomData): void
    {
        $units = Unit::where('building_id', $expense->building_id)
            ->when($expense->target_units === 'occupied', fn($q) => $q->where('is_occupied', true))
            ->when($expense->target_units === 'empty', fn($q) => $q->where('is_occupied', false))
            ->get();

        if ($units->isEmpty()) {
            return;
        }

        $totalBill = (float) $expense->total_bill_amount;

        foreach ($units as $unit) {
            $unitShare = 0;

            if ($expense->calculation_method === 'کنتور' && isset($meterOrCustomData[$unit->id])) {
                $data = $meterOrCustomData[$unit->id];
                $consumption = max(0, ($data['current_meter'] ?? 0) - ($data['prev_meter'] ?? 0));
                $unitShare = $consumption * (float) ($expense->unit_rate ?: 1000);
            } elseif ($expense->calculation_method === 'بر اساس متراژ') {
                $totalArea = $units->sum('area') ?: 1;
                $unitShare = ($unit->area / $totalArea) * $totalBill;
            } elseif ($expense->calculation_method === 'بر اساس نفرات') {
                $totalOccupants = $units->sum('occupants_count') ?: 1;
                $unitShare = ($unit->occupants_count / $totalOccupants) * $totalBill;
            } else {
                // 'مساوی'
                $unitShare = $totalBill / $units->count();
            }

            if ($unitShare > 0) {
                // Fetch current unit ledger balance
                $latestEntry = UnitLedgerEntry::where('unit_id', $unit->id)->latest('id')->first();
                $currentBalance = $latestEntry ? (float) $latestEntry->balance : 0;
                $newBalance = $currentBalance - $unitShare; // Debt increases negative balance

                UnitLedgerEntry::create([
                    'unit_id' => $unit->id,
                    'transaction_id' => null,
                    'type' => 'debit',
                    'amount' => round($unitShare, 2),
                    'balance' => round($newBalance, 2),
                    'category' => 'expense',
                    'description' => "سهم هزینه {$expense->title} ({$expense->calculation_method})",
                    'entry_date' => now(),
                ]);
            }
        }
    }
}
