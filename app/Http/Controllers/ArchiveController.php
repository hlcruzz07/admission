<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Schedule;
use App\Models\ScheduleTime;
use App\Models\Venue;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ArchiveController extends Controller
{
    public function index(): Response
    {
        $archive = collect();

        $archive = $archive
            ->concat(
                Venue::onlyTrashed()
                    ->with('campus')
                    ->get()
                    ->map(fn($venue) => [
                        'id' => $venue->id,
                        'type' => 'Venue',
                        'name' => $venue->name,
                        'deleted_at' => $venue->deleted_at,
                    ])
            )
            ->concat(
                Schedule::onlyTrashed()
                    ->with('venue.campus')
                    ->get()
                    ->map(fn($schedule) => [
                        'id' => $schedule->id,
                        'type' => 'Schedule',
                        'name' => $schedule->schedule_date,
                        'deleted_at' => $schedule->deleted_at,
                    ])
            )
            ->concat(
                ScheduleTime::onlyTrashed()
                    ->with('schedule.venue.campus')
                    ->get()
                    ->map(fn($time) => [
                        'id' => $time->id,
                        'type' => 'Schedule Time',
                        'name' => $time->time,
                        'deleted_at' => $time->deleted_at,
                    ])
            )
            ->sortByDesc('deleted_at')
            ->values();

        return Inertia::render('Admin/Archive/Index', [
            'archive' => $archive,
        ]);
    }

    /**
     * Restore a soft-deleted venue.
     * Route: PATCH /admin/venues/{venue}/restore
     */
    public function restoreVenue(int $venue): RedirectResponse
    {
        $model = Venue::onlyTrashed()->findOrFail($venue);
        $model->restore();

        return back()->with('success', "\"{$model->name}\" has been restored.");
    }

    /**
     * Restore a soft-deleted schedule.
     * Route: PATCH /admin/schedules/{schedule}/restore
     */
    public function restoreSchedule(int $schedule): RedirectResponse
    {
        $model = Schedule::onlyTrashed()->findOrFail($schedule);
        $model->restore();

        return back()->with('success', 'The schedule has been restored.');
    }

    /**
     * Restore a soft-deleted schedule time.
     * Route: PATCH /admin/schedule-times/{scheduleTime}/restore
     */
    public function restoreScheduleTime(int $scheduleTime): RedirectResponse
    {
        $model = ScheduleTime::onlyTrashed()->findOrFail($scheduleTime);
        $model->restore();

        return back()->with('success', 'The schedule time has been restored.');
    }
}