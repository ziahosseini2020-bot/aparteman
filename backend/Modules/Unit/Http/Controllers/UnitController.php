<?php

namespace Modules\Unit\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Modules\Unit\Models\Unit;
use Modules\Unit\Models\UnitAssignment;
use Modules\Unit\Services\UnitImportService;

class UnitController extends Controller
{
    protected UnitImportService $importService;

    public function __construct(UnitImportService $importService)
    {
        $this->importService = $importService;
    }

    public function index($buildingId): JsonResponse
    {
        $units = Unit::with(['block', 'currentResident.user', 'currentOwner.user'])
            ->where('building_id', $buildingId)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $units,
        ]);
    }

    public function store(Request $request, $buildingId): JsonResponse
    {
        $request->validate([
            'title' => ['required', 'string'],
            'block_id' => ['nullable', 'exists:blocks,id'],
            'floor' => ['required', 'integer'],
            'area' => ['required', 'numeric', 'min:1'],
            'occupants_count' => ['required', 'integer', 'min:0'],
            'parking_count' => ['nullable', 'integer', 'min:0'],
            'storage_count' => ['nullable', 'integer', 'min:0'],
            'is_occupied' => ['required', 'boolean'],
            'default_charge_amount' => ['nullable', 'numeric', 'min:0'],
            'resident_type' => ['required', 'in:مالک و ساکن,مستاجر'],
            'resident_name' => ['required_if:is_occupied,true', 'nullable', 'string'],
            'resident_mobile' => ['required_if:is_occupied,true', 'nullable', 'regex:/^09[0-9]{9}$/'],
            'resident_national_code' => ['nullable', 'string', 'size:10'],
            'owner_name' => ['required_if:resident_type,مستاجر', 'nullable', 'string'],
            'owner_mobile' => ['required_if:resident_type,مستاجر', 'nullable', 'regex:/^09[0-9]{9}$/'],
            'owner_national_code' => ['nullable', 'string', 'size:10'],
        ]);

        return DB::transaction(function () use ($request, $buildingId) {
            $unit = Unit::create([
                'building_id' => $buildingId,
                'block_id' => $request->block_id,
                'title' => $request->title,
                'floor' => $request->floor,
                'area' => $request->area,
                'occupants_count' => $request->is_occupied ? $request->occupants_count : 0,
                'parking_count' => $request->parking_count ?: 0,
                'storage_count' => $request->storage_count ?: 0,
                'is_occupied' => $request->is_occupied,
                'default_charge_amount' => $request->default_charge_amount ?: 0,
            ]);

            if ($request->is_occupied && $request->filled('resident_mobile')) {
                $isOwnerResident = ($request->resident_type === 'مالک و ساکن');

                // 1. Resident User Account Creation with Default Password = National Code
                $residentUser = $this->createOrGetUser(
                    $request->resident_name,
                    $request->resident_mobile,
                    $request->resident_national_code
                );

                // Assign Unit Assignment
                UnitAssignment::create([
                    'unit_id' => $unit->id,
                    'user_id' => $residentUser->id,
                    'type' => $isOwnerResident ? 'owner' : 'tenant',
                    'is_resident' => true,
                    'start_date' => now(),
                    'is_active' => true,
                ]);

                // Assign Laratrust role
                $roleName = $isOwnerResident ? 'owner_resident' : 'tenant';
                $role = Role::firstOrCreate(['name' => $roleName], ['display_name' => $isOwnerResident ? 'مالک و ساکن' : 'مستاجر']);
                $residentUser->addRole($role, $buildingId);

                // 2. If Tenant, also handle the Owner User Account
                if (!$isOwnerResident && $request->filled('owner_mobile')) {
                    $ownerUser = $this->createOrGetUser(
                        $request->owner_name,
                        $request->owner_mobile,
                        $request->owner_national_code
                    );

                    UnitAssignment::create([
                        'unit_id' => $unit->id,
                        'user_id' => $ownerUser->id,
                        'type' => 'owner',
                        'is_resident' => false,
                        'start_date' => now(),
                        'is_active' => true,
                    ]);

                    $ownerRole = Role::firstOrCreate(['name' => 'owner_non_resident'], ['display_name' => 'مالک غیرساکن']);
                    $ownerUser->addRole($ownerRole, $buildingId);
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'واحد جدید با موفقیت ثبت شد و حساب کاربری اهالی ایجاد گردید',
                'data' => $unit->load(['currentResident.user', 'currentOwner.user']),
            ], 201);
        });
    }

    public function importExcel(Request $request, $buildingId): JsonResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:xlsx,xls,csv'],
        ]);

        $importedCount = $this->importService->import($request->file('file'), $buildingId);

        return response()->json([
            'success' => true,
            'message' => "تعداد {$importedCount} واحد با موفقیت از فایل اکسل وارد سیستم شد",
        ]);
    }

    protected function createOrGetUser(?string $fullName, string $mobile, ?string $nationalCode): User
    {
        $user = User::where('mobile', $mobile)->first();

        if (!$user) {
            $parts = explode(' ', $fullName ?? '', 2);
            $user = User::create([
                'first_name' => $parts[0] ?? '',
                'last_name' => $parts[1] ?? '',
                'mobile' => $mobile,
                'national_code' => $nationalCode,
                // Default password = national code (or mobile suffix if empty)
                'password' => Hash::make($nationalCode ?: substr($mobile, -4)),
                'is_active' => true,
            ]);
        } elseif ($nationalCode && empty($user->national_code)) {
            $user->national_code = $nationalCode;
            $user->save();
        }

        return $user;
    }
}
