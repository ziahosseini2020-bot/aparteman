<?php

namespace Modules\Building\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Modules\Accounting\Models\BuildingFund;
use Modules\Building\Models\Block;
use Modules\Building\Models\Building;

class BuildingController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $buildings = Building::with(['blocks', 'fund'])
            ->where('creator_user_id', $user->id)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $buildings,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'in:مسکونی,تجاری,اداری,سایر'],
            'province' => ['required', 'string'],
            'city' => ['required', 'string'],
            'address' => ['required', 'string'],
            'phone' => ['nullable', 'string'],
            'postal_code' => ['nullable', 'string'],
            'location' => ['nullable', 'string'],
            'account_number' => ['nullable', 'string'],
            'account_holder' => ['nullable', 'string'],
            'manager_name' => ['nullable', 'string'],
            'manager_mobile' => ['nullable', 'regex:/^09[0-9]{9}$/'],
            'password' => ['nullable', 'string', 'min:4'],
            'blocks' => ['nullable', 'array'],
            'blocks.*.name' => ['required', 'string'],
            'blocks.*.floor_count' => ['required', 'integer', 'min:1'],
            'blocks.*.unit_count' => ['required', 'integer', 'min:1'],
        ]);

        return DB::transaction(function () use ($request) {
            $user = $request->user();

            // Update user details & password if provided
            if ($request->filled('password')) {
                $user->password = Hash::make($request->password);
            }
            if ($request->filled('manager_name')) {
                $parts = explode(' ', $request->manager_name, 2);
                $user->first_name = $parts[0] ?? '';
                $user->last_name = $parts[1] ?? '';
            }
            $user->save();

            // Create Building
            $building = Building::create([
                'creator_user_id' => $user->id,
                'name' => $request->name,
                'type' => $request->type,
                'province' => $request->province,
                'city' => $request->city,
                'address' => $request->address,
                'location' => $request->location,
                'phone' => $request->phone,
                'postal_code' => $request->postal_code,
                'account_number' => $request->account_number,
                'account_holder' => $request->account_holder ?: $user->full_name,
            ]);

            // Create Blocks
            if ($request->filled('blocks')) {
                foreach ($request->blocks as $blockData) {
                    Block::create([
                        'building_id' => $building->id,
                        'name' => $blockData['name'],
                        'floor_count' => $blockData['floor_count'],
                        'unit_count' => $blockData['unit_count'],
                    ]);
                }
            } else {
                Block::create([
                    'building_id' => $building->id,
                    'name' => 'بلوک اصلی',
                    'floor_count' => 4,
                    'unit_count' => 8,
                ]);
            }

            // Initialize Building Fund
            BuildingFund::firstOrCreate(
                ['building_id' => $building->id],
                ['current_balance' => 0]
            );

            // Assign Laratrust 'building_manager' role for this building (team)
            $managerRole = Role::firstOrCreate(
                ['name' => 'building_manager'],
                ['display_name' => 'مدیر ساختمان', 'description' => 'دسترسی کامل به مدیریت ساختمان و امور مالی']
            );
            $user->addRole($managerRole, $building->id);

            return response()->json([
                'success' => true,
                'message' => 'ساختمان جدید با موفقیت تعریف شد و شما به عنوان مدیر منتصب شدید',
                'data' => $building->load('blocks', 'fund'),
            ], 201);
        });
    }

    public function show($id): JsonResponse
    {
        $building = Building::with(['blocks', 'fund', 'units'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $building,
        ]);
    }
}
