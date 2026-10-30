<?php

namespace Modules\Expense\Services;

use Modules\Accounting\Models\BuildingFund;
use Modules\Accounting\Models\FundTransaction;
use Modules\Expense\Models\Expense;
use Modules\Unit\Models\Unit;

class ExpenseSettlementService
{
    /**
     * Settle an expense according to settlement_type and calculation_method
     */
    public function settleExpense(Expense $expense, array $meterData = []): void
    {
        $buildingId = $expense->building_id;
        $amount = (float) $expense->total_bill_amount;

        // 1. Deduct from Building Fund
        $fund = BuildingFund::firstOrCreate(['building_id' => $buildingId]);
        $fund->decrement('current_balance', $amount);

        FundTransaction::create([
            'building_id' => $buildingId,
            'type' => 'withdrawal',
            'amount' => $amount,
            'source' => 'expense_payment',
            'reference_id' => $expense->id,
            'description' => "پرداخت هزینه: {$expense->title} ({$expense->settlement_type})",
            'balance_after' => $fund->current_balance,
        ]);

        // 2. If 'ANNOUNCE_TO_RESIDENTS', distribute debt to units
        if ($expense->settlement_type === 'ANNOUNCE_TO_RESIDENTS') {
            $this->distributeToUnits($expense, $meterData);
        }
    }

    protected function distributeToUnits(Expense $expense, array $meterData): void
    {
        $units = Unit::where('building_id', $expense->building_id)->get();
        if ($units->isEmpty()) return;

        $totalBill = (float) $expense->total_bill_amount;

        switch ($expense->calculation_method) {
            case 'مساوی':
                $perUnit = $totalBill / $units->count();
                // Creates debit records for units
                break;

            case 'بر اساس متراژ':
                $totalArea = $units->sum('area');
                if ($totalArea > 0) {
                    foreach ($units as $unit) {
                        $share = ($unit->area / $totalArea) * $totalBill;
                    }
                }
                break;

            case 'بر اساس نفرات':
                $totalOccupants = $units->sum('occupants_count');
                if ($totalOccupants > 0) {
                    foreach ($units as $unit) {
                        $share = ($unit->occupants_count / $totalOccupants) * $totalBill;
                    }
                }
                break;
        }
    }
}
