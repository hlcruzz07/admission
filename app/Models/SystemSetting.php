<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class SystemSetting extends Model
{
    protected $fillable = ['key', 'value'];

    /**
     * Boot the model to automatically clear the cache whenever a setting is updated.
     */
    protected static function booted()
    {
        static::updated(function ($setting) {
            if ($setting->key === 'admission_status') {
                Cache::forget('admission_status');
            }
        });
    }
}