<?php

namespace Modules\Auth\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Modules\Auth\Services\OtpService;
use Modules\Building\Models\Building;
use Modules\Unit\Models\UnitAssignment;

class AuthController extends Controller
{
    protected OtpService $otpService;

    public function __construct(OtpService $otpService)
    {
        $this->otpService = $otpService;
    }

    /**
     * Request OTP SMS
     */
    public function sendOtp(Request $request): JsonResponse
    {
        $request->validate([
            'mobile' => ['required', 'regex:/^09[0-9]{9}$/'],
        ]);

        $code = $this->otpService->generateOtp($request->mobile);

        return response()->json([
            'success' => true,
            'message' => 'کد تایید یکبار مصرف ارسال شد',
            'expires_in' => OtpService::OTP_TTL_SECONDS,
            'debug_code' => app()->environment('local') ? $code : null,
        ]);
    }

    /**
     * Verify OTP & Login
     */
    public function verifyOtp(Request $request): JsonResponse
    {
        $request->validate([
            'mobile' => ['required', 'regex:/^09[0-9]{9}$/'],
            'code' => ['required', 'string'],
        ]);

        if (!$this->otpService->verifyOtp($request->mobile, $request->code)) {
            return response()->json([
                'success' => false,
                'message' => 'کد تایید نامعتبر یا منقضی شده است',
            ], 422);
        }

        $user = User::firstOrCreate(
            ['mobile' => $request->mobile],
            [
                'password' => Hash::make(str()->random(16)),
                'is_active' => true,
            ]
        );

        $token = $user->createToken('auth-token')->plainTextToken;
        $roles = $this->resolveUserRoles($user);

        return response()->json([
            'success' => true,
            'message' => 'ورود با موفقیت انجام شد',
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->full_name,
                'mobile' => $user->mobile,
            ],
            'roles' => $roles,
            'has_role' => count($roles) > 0,
        ]);
    }

    /**
     * Login with Mobile and Password
     */
    public function loginWithPassword(Request $request): JsonResponse
    {
        $request->validate([
            'mobile' => ['required', 'regex:/^09[0-9]{9}$/'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('mobile', $request->mobile)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'شماره موبایل یا رمز عبور اشتباه است',
            ], 401);
        }

        $token = $user->createToken('auth-token')->plainTextToken;
        $roles = $this->resolveUserRoles($user);

        return response()->json([
            'success' => true,
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->full_name,
                'mobile' => $user->mobile,
            ],
            'roles' => $roles,
            'has_role' => count($roles) > 0,
        ]);
    }

    /**
     * Resolve all roles across all buildings for the user
     */
    public function resolveUserRoles(User $user): array
    {
        $rolesList = [];

        // 1. Managed Buildings (مدیر ساختمان)
        $managedBuildings = Building::where('creator_user_id', $user->id)->get();
        foreach ($managedBuildings as $bld) {
            $rolesList[] = [
                'building_id' => $bld->id,
                'building_name' => $bld->name,
                'role' => 'building_manager',
                'role_title' => 'مدیر ساختمان',
                'unit_id' => null,
                'unit_title' => null,
            ];
        }

        // 2. Unit Assignments (مالک یا مستاجر در واحدها)
        $assignments = UnitAssignment::with(['unit.building'])
            ->where('user_id', $user->id)
            ->where('is_active', true)
            ->get();

        foreach ($assignments as $asn) {
            $roleKey = $asn->type === 'owner' ? ($asn->is_resident ? 'owner_resident' : 'owner_non_resident') : 'tenant';
            $roleTitle = $asn->type === 'owner' ? ($asn->is_resident ? 'مالک و ساکن' : 'مالک غیرساکن') : 'مستاجر';

            $rolesList[] = [
                'building_id' => $asn->unit->building->id,
                'building_name' => $asn->unit->building->name,
                'role' => $roleKey,
                'role_title' => $roleTitle,
                'unit_id' => $asn->unit->id,
                'unit_title' => $asn->unit->title,
            ];
        }

        return $rolesList;
    }

    /**
     * Get Current User Profile & Roles
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        $roles = $this->resolveUserRoles($user);

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->full_name,
                'mobile' => $user->mobile,
            ],
            'roles' => $roles,
        ]);
    }
}
