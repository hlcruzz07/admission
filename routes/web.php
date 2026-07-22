<?php

use App\Http\Controllers\ArchiveController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CampusController;
use App\Http\Controllers\QueueController;
use App\Http\Controllers\ScheduleController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\SystemSettingController;
use App\Http\Controllers\VenueController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Route;
Route::middleware('throttle:60,1')->group(function () {

    Route::get('/', [QueueController::class, 'home'])->name('home');
    Route::get('/admin', [AuthController::class, 'index'])->name('admin')->middleware('guest');
    Route::get('/auth/google/redirect', [AuthController::class, 'redirect'])->name('login');
    Route::get('/auth/google/callback', [AuthController::class, 'callback']);

    Route::middleware('admission.open')->group(function () {
        Route::get('/queue/enter', [QueueController::class, 'enter'])->name('queue.enter');
        Route::get('/queue', [QueueController::class, 'queue'])->name('queue');
        Route::middleware('form.limit')->group(function () {
            Route::get('/student/form', [StudentController::class, 'form'])->name('student.form');
            Route::post('/student/create', [StudentController::class, 'create'])->name('student.create');
        });
        Route::get('/student/receipt/{token}', [StudentController::class, 'ticket'])->name('student.ticket');
        Route::get('/student/success', [StudentController::class, 'success'])->name('student.success');
    });
});

Route::prefix('admin')->middleware(['custom.auth'])->group(function () {
    Route::get('/dashboard', [AdminController::class, 'index'])->name('dashboard');

    Route::get('/students', [StudentController::class, 'index'])->middleware('permission:view_students')->name('students');
    //         'export_students',

    Route::get('/campuses', [CampusController::class, 'index'])->middleware('permission:view_campuses')->name('campuses');
    Route::get('/campus/{id}', [CampusController::class, 'edit'])->middleware('permission:view_campuses')->name('edit.campus');

    Route::middleware('schedule.locked')->group(function () {
        Route::post('/venue/create/{campus_id}', [VenueController::class, 'create'])->middleware('permission:create_venues')->name('create.venue');
        Route::put('/venue/update/{venue_id}', [VenueController::class, 'update'])->middleware('permission:update_venues')->name('update.venue');
        Route::delete('/venue/delete/{venue_id}', [VenueController::class, 'destroy'])->middleware('permission:delete_venues')->name('delete.venue');

        Route::post('/schedule/create/{venue_id}', [ScheduleController::class, 'create'])->middleware('permission:create_schedules')->name('create.schedule');
        Route::put('/schedule/update/{schedule_id}', [ScheduleController::class, 'update'])->middleware('permission:update_schedules')->name('update.schedule');
        Route::delete('/schedule/delete/{schedule_id}', [ScheduleController::class, 'destroy'])->middleware('permission:delete_schedules')->name('delete.schedule');

        Route::patch('venues/{venue}/restore', [ArchiveController::class, 'restoreVenue'])->name('admin.venues.restore');
        Route::patch('schedules/{schedule}/restore', [ArchiveController::class, 'restoreSchedule'])->name('admin.schedules.restore');
        Route::patch('schedule-times/{scheduleTime}/restore', [ArchiveController::class, 'restoreScheduleTime'])->name(
            'admin.schedule-times.restore',
        );
    });

    Route::get('/archive', [ArchiveController::class, 'index'])->middleware('permission:view_archive')->name('archive');

    Route::post('/admin/settings/admission', [SystemSettingController::class, 'updateAdmission'])->middleware('permission:update_admission_settings')->name('admission.update');
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
});

Route::get('/test/fill-queue', function () {
    $reset = request()->boolean('reset'); // ?reset=true to clear first, otherwise appends
    $count = (int) request()->input('count', 1000);

    if ($reset) {
        Redis::del('queue:waiting');

        // KEYS is O(n) and blocks Redis — fine for a one-off manual test
        // route, but avoid ever calling this on a live/prod-scale instance.
        $keys = Redis::keys('waiting:*');
        if (!empty($keys)) {
            Redis::del($keys);
        }
    }

    $now = now()->timestamp;
    $batchSize = 500;

    // Score = real "now" at insertion time, exactly like the real
    // /queue/enter route does. A tiny fractional increment per token keeps
    // stable ordering WITHIN this batch, without shifting the batch as a
    // whole into the past or future relative to real entries. This means:
    // - fill first, then a real user enters later -> real user's score
    //   (a later real timestamp) is naturally greater -> lands behind.
    // - a real user enters first, then you fill more later -> the new
    //   batch's later real timestamp is naturally greater -> lands behind
    //   the existing real user, as expected.
    for ($i = 0; $i < $count; $i += $batchSize) {
        Redis::pipeline(function ($pipe) use ($batchSize, $i, $count, $now) {
            for ($j = 0; $j < $batchSize && ($i + $j) < $count; $j++) {
                $token = (string) \Illuminate\Support\Str::uuid();

                $score = $now + (($i + $j) * 0.001);

                $pipe->zadd('queue:waiting', $score, $token);

                $ttl = 300 + random_int(0, 120);
                $pipe->setex("waiting:$token", $ttl, true);
            }
        });
    }

    return response()->json([
        'message' => $reset ? 'Queue reset and filled' : 'Batch appended to existing queue',
        'added' => $count,
        'total' => Redis::zcard('queue:waiting'),
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

Route::get('/oauth/callback', function (Request $request) {
    dd($request->input('code'));
});

require __DIR__ . '/api.php';