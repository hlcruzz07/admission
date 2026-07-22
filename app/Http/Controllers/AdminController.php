<?php

namespace App\Http\Controllers;

use App\Models\StudentSchedule;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;
use Inertia\Inertia;

class AdminController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Dashboard/Index', [
            'admissionIsOpen' => $this->admissionIsOpen(),
            'queue' => $this->queueStats(),
            'emailHealth' => $this->emailHealthStats(),
            'registrations' => $this->registrationsOverTime(),
        ]);
    }

    protected function admissionIsOpen(): bool
    {

        return (bool) Cache::get('admission_status', false);
    }

    /**
     * Live queue counts. zcard is O(1) — safe to call on every dashboard load.
     */
    protected function queueStats(): array
    {
        return [
            'active' => Redis::zcard('queue:active'),
            'waiting' => Redis::zcard('queue:waiting'),
        ];
    }

    /**
     * Email delivery health: sent (email_sent_at populated), pending
     * (row exists but no email_sent_at yet), and failed (from Laravel's
     * failed_jobs table, filtered to this specific job class).
     */
    protected function emailHealthStats(): array
    {
        $sent = StudentSchedule::whereNotNull('email_sent_at')->count();
        $pending = StudentSchedule::whereNull('email_sent_at')->count();

        $failed = DB::table('failed_jobs')
            ->where('payload', 'like', '%SendAppointmentConfirmationEmail%')
            ->count();

        return compact('sent', 'pending', 'failed');
    }

    /**
     * Daily registration counts for the last 14 days, including days
     * with zero registrations so the chart doesn't show gaps.
     */
    protected function registrationsOverTime(): array
    {
        $startDate = now()->subDays(13)->startOfDay();
        $endDate = now()->endOfDay();

        $countsByDate = StudentSchedule::query()
            ->selectRaw('DATE(created_at) as date, COUNT(*) as total')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->groupBy('date')
            ->pluck('total', 'date');

        $result = [];

        for ($date = $startDate->copy(); $date->lte($endDate); $date->addDay()) {
            $key = $date->format('Y-m-d');

            $result[] = [
                'date' => $date->format('M j'),
                'registrations' => (int) ($countsByDate[$key] ?? 0),
            ];
        }

        return $result;
    }
}