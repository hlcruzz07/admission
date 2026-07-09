<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Redis;

class QueueApiController extends Controller
{
    public function check()
    {
        $token = request()->cookie('queue_token');

        if (!$token) {
            return redirect()->route('home');
        }


        if (Redis::exists("waiting:$token")) {
            Redis::expire("waiting:$token", 1800);
        }

        $now = now()->timestamp;

        Redis::zremrangebyscore('queue:active', 0, $now);

        // Already allowed
        if (Redis::zscore('queue:active', $token)) {
            return response()->json([
                'status' => 'allowed'
            ]);
        }


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

        $position = Redis::zrank('queue:waiting', $token);
        $position = $position !== null ? $position + 1 : null;

        $totalWaiting = Redis::zcard('queue:waiting');

        if ($position && !Redis::exists("initial_pos:$token")) {
            Redis::set("initial_pos:$token", $position);
        }

        $maxActive = config('queue_room.max_active'); // e.g. 500
        $sessionSeconds = 300; // 150 = 2.5 mins , 600 = 10mins

        $throughputPerSecond = $maxActive / $sessionSeconds;

        $estimatedSeconds = ($position && $throughputPerSecond > 0)
            ? $position / $throughputPerSecond
            : 0;

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

        $arrivalTime = now()
            ->timezone(config('app.timezone'))
            ->addSeconds($estimatedSeconds)
            ->format('h:i A');

        $lastUpdated = now()
            ->timezone(config('app.timezone'))
            ->format('h:i A');

        if ($position !== null && $totalWaiting > 0) {
            $progress = round((($totalWaiting - $position + 1) / $totalWaiting) * 100, 1);
        } else {
            $progress = 100;
        }

        return response()->json([
            'status' => 'waiting',
            'position' => $position,
            'total_waiting' => $totalWaiting,
            'applicants_ahead' => $position ? $position - 1 : 0,
            'estimated_wait_text' => $waitingTimeText,
            'estimated_arrival_time' => $arrivalTime,
            'last_updated' => $lastUpdated,
            'progress_percent' => $progress,
            'token' => $token
        ]);

    }
}
