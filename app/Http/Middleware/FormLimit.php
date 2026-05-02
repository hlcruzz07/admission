<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redis;

class FormLimit
{
    public function handle(Request $request, Closure $next)
    {
        $token = $request->cookie('queue_token');

        // ❌ HARD BLOCK: no token
        if (!$token) {
            return redirect('/queue');
        }

        // ✅ Cleanup expired users using ZSET score (expiry timestamp)
        $now = now()->timestamp;
        Redis::zremrangebyscore('queue:active', 0, $now);

        // ✅ Check if user is still active
        $isActive = Redis::zscore('queue:active', $token);

        if ($isActive !== null) {
            Log::info('FORM MIDDLEWARE HIT', [
                'token' => $token,
                'count' => Redis::zcard('queue:active')
            ]);

            return $next($request);
        }

        // ❌ Not allowed
        return redirect('/queue');
    }
}
