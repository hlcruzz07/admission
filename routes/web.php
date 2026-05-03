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
        $inWaiting = Redis::zscore('queue:waiting', $existing);
        $inActive = Redis::zscore('queue:active', $existing);

        if ($inWaiting !== null || $inActive !== null) {
            $token = $existing;
        }
    }

    // Create new token
    if (!$token) {
        $token = (string) Str::uuid();

        // Use timestamp as score
        Redis::zadd('queue:waiting', now()->timestamp, $token);
        Redis::setex("waiting:$token", 1800, true);
    }

    // If already active → go to form
    if (Redis::zscore('queue:active', $token)) {
        return redirect('/form')->cookie('queue_token', $token, 60);
    }

    return redirect('/queue')->cookie('queue_token', $token, 60);
})->name('home');


/*
|--------------------------------------------------------------------------
| QUEUE UI
use Illuminate\Support\Facades\Redis; $keys = Redis::keys('active:*'); foreach($keys as $k) Redis::del($k); Redis::del('queue:waiting', 'queue:active'); echo "Done"
|--------------------------------------------------------------------------
*/
Route::get('/queue', function () {
    return Inertia::render('Student/Queue/Index');
});


/*
|--------------------------------------------------------------------------
| QUEUE ENTER (OPTIMIZED)
|--------------------------------------------------------------------------
*/
Route::get('/queue/enter', function () {
    $token = request()->cookie('queue_token');

    if (!$token) {
        return response()->json(['error' => 'No token'], 400);
    }

    // ✅ KEEP USER ALIVE IN QUEUE
    if (Redis::exists("waiting:$token")) {
        Redis::expire("waiting:$token", 1800);
    }

    $now = now()->timestamp;

    // 🔥 Remove expired active users
    Redis::zremrangebyscore('queue:active', 0, $now);

    // Already allowed
    if (Redis::zscore('queue:active', $token)) {
        return response()->json([
            'status' => 'allowed'
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | 🔒 ATOMIC LOCK
    |--------------------------------------------------------------------------
    */
    $lock = Redis::set('queue:lock', 1, 'NX', 'EX', 2);

    if ($lock) {
        try {
            $activeCount = Redis::zcard('queue:active');
            $max = config('queue_room.max_active');

            if ($activeCount < $max) {
                $slots = $max - $activeCount;

                $nextUsers = Redis::zrange('queue:waiting', 0, $slots - 1);

                foreach ($nextUsers as $next) {
                    if (!Redis::exists("waiting:$next")) {
                        Redis::zrem('queue:waiting', $next);
                        continue;
                    }

                    Redis::zrem('queue:waiting', $next);
                    Redis::zadd('queue:active', $now + 300, $next);

                    Redis::setex("active:$next", 300, true);
                }
            }
        } finally {
            Redis::del('queue:lock');
        }
    }

    // Check again
    if (Redis::zscore('queue:active', $token)) {
        return response()->json([
            'status' => 'allowed'
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | 🚀 POSITION
    |--------------------------------------------------------------------------
    */
    $position = Redis::zrank('queue:waiting', $token);
    $position = $position !== null ? $position + 1 : null;

    $totalWaiting = Redis::zcard('queue:waiting');

    /*
    |--------------------------------------------------------------------------
    | 📌 STORE INITIAL POSITION (ONLY ONCE)
    |--------------------------------------------------------------------------
    */
    if ($position && !Redis::exists("initial_pos:$token")) {
        Redis::set("initial_pos:$token", $position);
    }

    $initialPosition = Redis::get("initial_pos:$token");

    /*
    |--------------------------------------------------------------------------
    | 📊 ESTIMATION LOGIC
    |--------------------------------------------------------------------------
    */
    $maxActive = config('queue_room.max_active'); // e.g. 500
    $sessionSeconds = 100; // 150 = 2.5 mins , 600 = 10mins

    $throughputPerSecond = $maxActive / $sessionSeconds;

    $estimatedSeconds = ($position && $throughputPerSecond > 0)
        ? $position / $throughputPerSecond
        : 0;

    /*
    |--------------------------------------------------------------------------
    | ⏱️ HUMAN-READABLE WAIT TIME
    |--------------------------------------------------------------------------
    */
    $seconds = (int) $estimatedSeconds;

    $days = floor($seconds / 86400);
    $hours = floor(($seconds % 86400) / 3600);
    $minutes = floor(($seconds % 3600) / 60);

    $parts = [];

    if ($days > 0) {
        $parts[] = $days . ' day' . ($days > 1 ? 's' : '');
    }
    if ($hours > 0) {
        $parts[] = $hours . ' hour' . ($hours > 1 ? 's' : '');
    }
    if ($minutes > 0) {
        $parts[] = $minutes . ' minute' . ($minutes > 1 ? 's' : '');
    }

    $waitingTimeText = count($parts)
        ? implode(', ', array_slice($parts, 0, 2))
        : 'Less than a minute';

    /*
    |--------------------------------------------------------------------------
    | 🕒 ARRIVAL TIME (TIMEZONE SAFE)
    |--------------------------------------------------------------------------
    */
    $arrivalTime = now()
        ->timezone(config('app.timezone'))
        ->addSeconds($estimatedSeconds)
        ->format('h:i A');

    /*
    |--------------------------------------------------------------------------
    | 🔄 LAST UPDATED
    |--------------------------------------------------------------------------
    */
    $lastUpdated = now()
        ->timezone(config('app.timezone'))
        ->format('h:i:s A');

    /*
    |--------------------------------------------------------------------------
    | 📊 REAL PROGRESS (FIXED)
    |--------------------------------------------------------------------------
    */
    $progress = ($initialPosition && $position && $initialPosition > 0)
        ? round((($initialPosition - $position) / $initialPosition) * 100)
        : 0;

    return response()->json([
        'status' => 'waiting',

        // queue data
        'position' => $position,
        'total_waiting' => $totalWaiting,
        'applicants_ahead' => $position ? $position - 1 : 0,

        // UI cards
        'estimated_wait_text' => $waitingTimeText,
        'estimated_arrival_time' => $arrivalTime,
        'last_updated' => $lastUpdated,

        // progress
        'progress_percent' => $progress,
        'token' => $token
    ]);
});


Route::get('/test/fill-queue', function () {
    $count = 5000;
    $now = now()->timestamp;

    $batchSize = 500; // prevent overload

    for ($i = 0; $i < $count; $i += $batchSize) {
        Redis::pipeline(function ($pipe) use ($batchSize, $i, $count, $now) {

            for ($j = 0; $j < $batchSize && ($i + $j) < $count; $j++) {
                $token = (string) Str::uuid();

                $score = $now - ($count - ($i + $j));

                $pipe->zadd('queue:waiting', $score, $token);

                $pipe->setex("waiting:$token", 1800, true);
            }
        });
    }

    return response()->json([
        'message' => 'Queue filled',
        'total' => Redis::zcard('queue:waiting')
    ]);
});

/*
|--------------------------------------------------------------------------
| FORM PAGE
|--------------------------------------------------------------------------
*/
Route::get('/form', function () {
    return Inertia::render('Student/Form/Index');
});
// ->middleware('form_limit');


/*
|--------------------------------------------------------------------------
| FORM SUBMIT
|--------------------------------------------------------------------------
*/
Route::post('/form/submit', function () {
    $token = request()->cookie('queue_token');

    if (!$token) {
        return redirect('/');
    }

    Redis::zrem('queue:active', $token);
    Redis::del("active:$token");
    Redis::del("waiting:$token");

    return redirect('/')
        ->cookie('queue_token', null, -1);
        
})->middleware('form_limit');


/*
|--------------------------------------------------------------------------
| DASHBOARD
|--------------------------------------------------------------------------
*/
Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});



require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';