<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CampusController;
use App\Http\Controllers\QueueController;
use App\Http\Controllers\ScheduleController;
use App\Http\Controllers\ScheduleTimeController;
use App\Http\Controllers\VenueController;
use App\Models\Campus;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;
use Inertia\Inertia;

Route::middleware('throttle:60,1')->group(function () {

    Route::get('/', [QueueController::class, 'index'])->name('home');
    Route::get('/admin', [AuthController::class, 'index'])->name('admin')->middleware('guest');
    Route::get('/auth/google/redirect', [AuthController::class, 'redirect'])->name('login');
    Route::get('/auth/google/callback', [AuthController::class, 'callback']);

    Route::get('/queue', [QueueController::class, 'queue'])->name('queue');


    Route::middleware('form.limit')->group(function () {

        Route::get('/student/form', function () {
            $schedules = Campus::with('venues.schedules.times')->get();


            return Inertia::render('Student/Form/Index', [
                'schedules' => $schedules,
            ]);
        })->name('student.form');


        Route::post('/student/create', function () {

            $token = request()->cookie('queue_token');

            if (!$token) {
                return redirect()->route('home');
            }

            Redis::zrem('queue:active', $token);
            Redis::del("active:$token");
            Redis::del("waiting:$token");

            return redirect()->route('home')->cookie('queue_token', null, -1);

        })->name('student.create');
    });



});

Route::middleware(['auth'])->group(function () {
    Route::get('/dashboard', [AdminController::class, 'index'])->name('dashboard');

    // CAMPUSES
    Route::get('/campuses', [CampusController::class, 'index'])->middleware('permission:view_campuses')->name('campuses');
    Route::get('/campus/{id}', [CampusController::class, 'edit'])->middleware('permission:view_campuses')->name('edit.campus');
    Route::put('/campus/{id}', [CampusController::class, 'update'])->middleware('permission:update_campuses')->name('update.campus');
    Route::post('/campus/{id}', [CampusController::class, 'create'])->middleware('permission:create_campuses')->name('create.campus');

    Route::post('/venue/create/{campus_id}', [VenueController::class, 'create'])->middleware('permission:create_venues')->name('create.venue');
    Route::put('/venue/update/{venue_id}', [VenueController::class, 'update'])->middleware('permission:update_venues')->name('update.venue');

    Route::post('/schedule/create/{venue_id}', [ScheduleController::class, 'create'])->middleware('permission:create_schedules')->name('create.schedule');
    Route::put('/schedule/update/{schedule_id}', [ScheduleController::class, 'update'])->middleware('permission:update_schedules')->name('update.schedule');
    Route::delete('/schedule/delete/{schedule_id}', [ScheduleController::class, 'destroy'])->middleware('permission:delete_schedules')->name('delete.schedule');

    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
});







Route::get('/test-relations', function () {

    $campuses = Campus::with([
        'venues.schedules.times'
    ])->get();

    return ($campuses);
});





Route::get('/test/fill-queue', function () {
    // ✅ Clear queue
    Redis::del('queue:waiting');

    // ✅ Clear all waiting tokens
    $keys = Redis::keys('waiting:*');
    if (!empty($keys)) {
        Redis::del($keys);
    }

    $count = 25;
    $now = now()->timestamp;

    $batchSize = 500;

    for ($i = 0; $i < $count; $i += $batchSize) {
        Redis::pipeline(function ($pipe) use ($batchSize, $i, $count, $now) {

            for ($j = 0; $j < $batchSize && ($i + $j) < $count; $j++) {
                $token = (string) Str::uuid();

                $score = $now - ($count - ($i + $j));

                $pipe->zadd('queue:waiting', $score, $token);

                // 5–7 mins staggered expiry
                $ttl = 300 + ($i + $j);

                $pipe->setex("waiting:$token", $ttl, true);
            }
        });
    }

    return response()->json([
        'message' => 'Queue filled',
        'total' => Redis::zcard('queue:waiting')
    ]);
});
Route::get('/test/clear-queue', function () {

    // Clear sorted sets
    Redis::del('queue:waiting');
    Redis::del('queue:active');

    // Clear waiting tokens
    $waitingKeys = Redis::keys('waiting:*');
    if (!empty($waitingKeys)) {
        Redis::del($waitingKeys);
    }

    // Clear active tokens
    $activeKeys = Redis::keys('active:*');
    if (!empty($activeKeys)) {
        Redis::del($activeKeys);
    }

    return response()->json([
        'message' => 'Queue cleared successfully.',
        'waiting' => Redis::zcard('queue:waiting'),
        'active' => Redis::zcard('queue:active'),
    ]);
});

Route::get('/test/add-batch', function () {
    $count = 53; // how many to add
    $now = now()->timestamp;

    $batchSize = 500;

    // ✅ Get current last score (latest person in queue)
    $last = Redis::zrevrange('queue:waiting', 0, 0, ['withscores' => true]);

    if (!empty($last)) {
        $lastScore = array_values($last)[0]; // last score in queue
    } else {
        $lastScore = $now;
    }

    for ($i = 0; $i < $count; $i += $batchSize) {
        Redis::pipeline(function ($pipe) use ($batchSize, $i, $count, $lastScore) {

            for ($j = 0; $j < $batchSize && ($i + $j) < $count; $j++) {
                $token = (string) Str::uuid();

                // ✅ Continue from last score (keeps order correct)
                $score = $lastScore + ($i + $j + 1);

                $pipe->zadd('queue:waiting', $score, $token);

                // ✅ Keep your staggered expiration
                $ttl = 300 + ($i + $j);

                $pipe->setex("waiting:$token", $ttl, true);
            }
        });
    }

    return response()->json([
        'message' => 'Batch added to queue',
        'total' => Redis::zcard('queue:waiting')
    ]);
});

require __DIR__ . '/api.php';