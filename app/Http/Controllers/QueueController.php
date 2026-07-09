<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Str;
use Inertia\Inertia;

class QueueController extends Controller
{
    public function index()
    {
        $existing = request()->cookie('queue_token');
        $token = null;

        if ($existing) {
            $inWaiting = Redis::zscore('queue:waiting', $existing);
            $inActive = Redis::zscore('queue:active', $existing);

            if ($inWaiting !== null || $inActive !== null) {
                $token = $existing;
            }
        }

        if (!$token) {
            $token = (string) Str::uuid();

            Redis::zadd('queue:waiting', now()->timestamp, $token);

            // ✅ NO EXPIRATION
            Redis::set("waiting:$token", true);
        }

        if (Redis::zscore('queue:active', $token)) {
            return redirect()
                ->route('student.form')
                ->cookie(cookie()->forever('queue_token', $token));
        }

        return redirect()
            ->route('queue')
            ->cookie(cookie()->forever('queue_token', $token));
    }

    public function queue()
    {


        return Inertia::render('Student/Queue/Index');
    }
}
