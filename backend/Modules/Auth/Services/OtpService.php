<?php

namespace Modules\Auth\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class OtpService
{
    const OTP_TTL_SECONDS = 120; // 2 minutes

    public function generateOtp(string $mobile): string
    {
        // For development / testing, fixed code or random 5-digit number
        $code = app()->environment('local', 'testing') ? '1234' : (string) random_int(10000, 99999);
        
        $cacheKey = "otp_{$mobile}";
        Cache::put($cacheKey, $code, now()->addSeconds(self::OTP_TTL_SECONDS));

        $this->sendSms($mobile, $code);

        return $code;
    }

    public function verifyOtp(string $mobile, string $code): bool
    {
        $cacheKey = "otp_{$mobile}";
        $cachedCode = Cache::get($cacheKey);

        if (!$cachedCode) {
            return false;
        }

        if ($cachedCode === $code) {
            Cache::forget($cacheKey);
            return true;
        }

        return false;
    }

    protected function sendSms(string $mobile, string $code): void
    {
        // Driver integration for Kavenegar / Melipayamak
        Log::info("OTP Code for {$mobile} is: {$code}");
    }
}
