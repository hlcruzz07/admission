<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use App\Models\SystemSetting;

class AppSettings
{
    public static function isAdmissionOpen(): bool
    {
        return Cache::remember('admission_status', 3600, function () {
            $setting = SystemSetting::where('key', 'admission_status')->first();
            return $setting ? $setting->value === 'open' : false;
        });
    }
}