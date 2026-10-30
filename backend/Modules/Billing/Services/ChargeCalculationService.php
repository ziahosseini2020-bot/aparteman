<?php

namespace Modules\Billing\Services;

use Modules\Unit\Models\Unit;

class ChargeCalculationService
{
    /**
     * Calculate individual unit charge amount based on chosen calculation model
     */
    public function calculateUnitCharge(
        Unit $unit,
        string $model,
        float $baseAmount = 0,
        float $areaRate = 0,
        float $occupantRate = 0
    ): float {
        $area = (float) $unit->area;
        $occupants = (int) ($unit->occupants_count ?: 1);
        $defaultCharge = (float) ($unit->default_charge_amount ?: 0);

        return match ($model) {
            'FIXED_ALL' => $baseAmount,
            'DEFAULT_CHARGE' => $defaultCharge,
            'BY_AREA' => $area * $areaRate,
            'BY_OCCUPANTS' => $occupants * $occupantRate,
            'FIXED_AREA' => $baseAmount + ($area * $areaRate),
            'FIXED_OCCUPANTS' => $baseAmount + ($occupants * $occupantRate),
            'FIXED_AREA_OCCUPANTS' => $baseAmount + ($area * $areaRate) + ($occupants * $occupantRate),
            'DEFAULT_AREA' => $defaultCharge + ($area * $areaRate),
            'DEFAULT_OCCUPANTS' => $defaultCharge + ($occupants * $occupantRate),
            'DEFAULT_AREA_OCCUPANTS' => $defaultCharge + ($area * $areaRate) + ($occupants * $occupantRate),
            default => $defaultCharge,
        };
    }

    /**
     * Calculate overdue daily penalty
     */
    public function calculateLatePenalty(string $dueDate, float $dailyPenaltyAmount): float
    {
        $due = \Carbon\Carbon::parse($dueDate);
        $today = now();

        if ($today->gt($due)) {
            $daysPast = $today->diffInDays($due);
            return $daysPast * $dailyPenaltyAmount;
        }

        return 0;
    }
}
