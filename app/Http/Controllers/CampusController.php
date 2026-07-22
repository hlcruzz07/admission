<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreateVenueRequest;
use App\Models\Campus;
use App\Repositories\CampusRepo;
use App\Repositories\ScheduleRepo;
use App\Repositories\ScheduleTimeRepo;
use App\Repositories\VenueRepo;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CampusController extends Controller
{
    public function __construct(protected VenueRepo $venueRepo, protected CampusRepo $campusRepo, protected ScheduleTimeRepo $scheduleTimeRepo, protected ScheduleRepo $scheduleRepo)
    {
    }
    public function index()
    {
        return Inertia::render('Admin/Campus/Index');
    }


    public function edit(int $id)
    {
        $campus = Campus::with(['venues.schedules.times'])->findOrFail($id);

        $times = $campus->venues
            ->flatMap(fn($venue) => $venue->schedules)
            ->flatMap(fn($schedule) => $schedule->times);

        $total_slots = $times->sum('slots');
        $total_booked_slots = $times->sum('booked_slots');
        $total_available_slots = max($total_slots - $total_booked_slots, 0);

        return Inertia::render('Admin/Campus/Index', [
            'campus' => $campus,
            'total_slots' => $total_slots,
            'total_booked_slots' => $total_booked_slots,
            'total_available_slots' => $total_available_slots,
        ]);
    }
}
