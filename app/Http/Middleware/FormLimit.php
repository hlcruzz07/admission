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

        if (!$token) {
            return redirect()->route('home');
        }

        $now = now()->timestamp;
        Redis::zremrangebyscore('queue:active', 0, $now);

        $isActive = Redis::zscore('queue:active', $token);

        if ($isActive !== null) {
            return $next($request);

        }

        return redirect()->route('home');
    }
}
