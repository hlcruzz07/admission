<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Str;
use Inertia\Inertia;

class QueueController extends Controller
{
    /**
     * The landing page. Just renders the Home component —
     * no token logic happens here.
     */
    public function home()
    {
        return Inertia::render('Home/Index');
    }

    /**
     * Entry point into the queue. Assigns/validates a token and
     * redirects to either the queue page or straight to the form
     * if the student is already active.
     */
    public function enter()
    {
        $existing = request()->cookie('queue_token');
        $token = null;

        if ($existing) {
            $inWaiting = Redis::zscore('queue:waiting', $existing);
            $inActive = Redis::zscore('queue:active', $existing);

            if ($inWaiting !== null || $inActive !== null) {
                $token = $existing;
            } else {
                // Not currently waiting or active — check if they're still
                // within the grace window to reclaim their original position.
                $graceScore = Redis::get("grace:$existing");

                if ($graceScore !== null) {
                    Redis::zadd('queue:waiting', 'NX', (float) $graceScore, $existing);
                    Redis::setex("waiting:$existing", 1800, true);
                    Redis::del("grace:$existing");
                    $token = $existing;
                }
            }
        }

        if (!$token) {
            $token = (string) Str::uuid();

            Redis::zadd('queue:waiting', 'NX', now()->timestamp, $token);
            Redis::setex("waiting:$token", 1800, true);
        }

        if (Redis::zscore('queue:active', $token) !== null) {
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
        if (!request()->cookie('queue_token')) {
            return redirect()->route('home')->with('error', 'Session Expired');
        }

        return Inertia::render('Student/Queue/Index');
    }
}