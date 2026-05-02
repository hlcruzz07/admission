<?php

use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| HOME
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    $existing = request()->cookie('queue_token');

    $token = null;

    if ($existing) {
        // Check if still valid
        $queue = Redis::lrange('queue:waiting', 0, -1);
        $inWaiting = in_array($existing, $queue);

        $inActive = Redis::zscore('queue:active', $existing);

        if ($inWaiting || $inActive !== null) {
            $token = $existing;
        }
    }

    // Create new token if needed
    if (!$token) {
        $token = (string) Str::uuid();

        Redis::rpush('queue:waiting', $token);
        Redis::setex("waiting:$token", 1800, true);
    }

    // Decide where to go
    if (Redis::zscore('queue:active', $token)) {
        return redirect('/form')
            ->cookie('queue_token', $token, 60);
    }

    return redirect('queue')
        ->cookie('queue_token', $token, 60);
})->name('home');

/*
|--------------------------------------------------------------------------
| QUEUE ROOM UI
|--------------------------------------------------------------------------
*/
Route::get('/queue', function () {
    return Inertia::render('Student/Queue/Index');
});


/*
|--------------------------------------------------------------------------
| QUEUE: ENTER LOGIC
|--------------------------------------------------------------------------
*/
Route::get('/queue/enter', function () {
    $token = request()->cookie('queue_token');

    if (!$token) {
        return response()->json(['error' => 'No token'], 400);
    }

    $now = now()->timestamp;

    // 🔥 CLEANUP expired active users (NO LOOP)
    Redis::zremrangebyscore('queue:active', 0, $now);

    // Already allowed
    if (Redis::zscore('queue:active', $token)) {
        return response()->json(['status' => 'allowed']);
    }

    /*
    |--------------------------------------------------------------------------
    | 🔒 ATOMIC LOCK (CRITICAL)
    |--------------------------------------------------------------------------
    */
    $lock = Redis::set('queue:lock', 1, 'NX', 'EX', 5);

    if ($lock) {
        try {
            $activeCount = Redis::zcard('queue:active');

            while ($activeCount < config('queue_room.max_active')) {
                $next = Redis::lpop('queue:waiting');
                if (!$next) break;

                // Skip expired waiting users
                if (!Redis::exists("waiting:$next")) {
                    continue;
                }

                // Add to active with expiry timestamp
                Redis::zadd('queue:active', $now + 600, $next); // 10 mins

                // Track TTL key
                Redis::setex("active:$next", 600, true);

                $activeCount++;
            }
        } finally {
            Redis::del('queue:lock');
        }
    }

    // Check again if user got in
    if (Redis::zscore('queue:active', $token)) {
        return response()->json(['status' => 'allowed']);
    }

    // Get position (lightweight approach)
    $queue = Redis::lrange('queue:waiting', 0, -1);
    $position = array_search($token, $queue);

    return response()->json([
        'status' => 'waiting',
        'position' => $position !== false ? $position + 1 : null,
    ]);
});

/*
|--------------------------------------------------------------------------
| FORM PAGE
|--------------------------------------------------------------------------
*/
Route::get('/form', function () {
    return Inertia::render('Student/Form/Index');
})->middleware('form_limit');

/*
|--------------------------------------------------------------------------
| FORM SUBMIT
|--------------------------------------------------------------------------
*/
Route::post('/form/submit', function () {
    $token = request()->cookie('queue_token');

    if (!$token) {
        return response()->json(['error' => 'No token'], 400);
    }

    // Remove from active
    Redis::zrem('queue:active', $token);
    Redis::del("active:$token");

    // Remove waiting TTL (cleanup)
    Redis::del("waiting:$token");

    return redirect('/')
        ->cookie('queue_token', null, -1);
})->middleware('form_limit');

/*
|--------------------------------------------------------------------------
| DASHBOARD (UNCHANGED)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
