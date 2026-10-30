<?php

namespace Modules\Unit\Services;

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Modules\Building\Models\Block;
use Modules\Unit\Models\Unit;
use Modules\Unit\Models\UnitAssignment;

class UnitImportService
{
    public function import(UploadedFile $file, int $buildingId): int
    {
        // Simple CSV / Excel reader logic for units
        $count = 0;
        $path = $file->getRealPath();
        
        if (($handle = fopen($path, 'r')) !== false) {
            $header = fgetcsv($handle, 1000, ',');
            
            DB::transaction(function () use ($handle, $buildingId, &$count) {
                while (($data = fgetcsv($handle, 1000, ',')) !== false) {
                    if (count($data) < 5) continue;
                    
                    $title = $data[0] ?? "واحد " . ($count + 1);
                    $floor = (int) ($data[1] ?? 1);
                    $area = (float) ($data[2] ?? 100);
                    $occupants = (int) ($data[3] ?? 2);
                    $defaultCharge = (float) ($data[4] ?? 400000);
                    $residentName = $data[5] ?? null;
                    $residentMobile = $data[6] ?? null;
                    $residentNatCode = $data[7] ?? null;

                    $unit = Unit::create([
                        'building_id' => $buildingId,
                        'title' => $title,
                        'floor' => $floor,
                        'area' => $area,
                        'occupants_count' => $occupants,
                        'is_occupied' => !empty($residentMobile),
                        'default_charge_amount' => $defaultCharge,
                    ]);

                    if ($residentMobile) {
                        $user = User::firstOrCreate(
                            ['mobile' => $residentMobile],
                            [
                                'first_name' => $residentName,
                                'national_code' => $residentNatCode,
                                'password' => Hash::make($residentNatCode ?: substr($residentMobile, -4)),
                                'is_active' => true,
                            ]
                        );

                        UnitAssignment::create([
                            'unit_id' => $unit->id,
                            'user_id' => $user->id,
                            'type' => 'owner',
                            'is_resident' => true,
                            'start_date' => now(),
                            'is_active' => true,
                        ]);
                    }

                    $count++;
                }
            });
            fclose($handle);
        }

        return $count;
    }
}
