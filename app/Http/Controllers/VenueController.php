<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreateVenueRequest;
use App\Http\Requests\UpdateVenueRequest;
use App\Repositories\CampusRepo;
use App\Repositories\ScheduleRepo;
use App\Repositories\ScheduleTimeRepo;
use App\Repositories\VenueRepo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class VenueController extends Controller
{
    public function __construct(protected VenueRepo $venueRepo, protected CampusRepo $campusRepo, protected ScheduleTimeRepo $scheduleTimeRepo, protected ScheduleRepo $scheduleRepo)
    {
    }

    public function create(CreateVenueRequest $request, int $campus_id)
    {


        try {
            DB::transaction(function () use ($request, $campus_id) {

                $venue = $this->venueRepo->create($request->all(), $campus_id);

                foreach ($request->schedules as $schedule_item) {
                    $schedule = $this->scheduleRepo->create($schedule_item, $venue->id);

                    foreach ($schedule_item['times'] as $time_item) {
                        $this->scheduleTimeRepo->create($time_item, $schedule->id);
                    }
                }
            });

            return back()->with('success', 'Venue created successfully');

        } catch (\Throwable $th) {

            return back()->with('error', $th->getMessage());
        }
    }

    public function update(Request $request, int $venue_id)
    {
        try {


            $validated = $request->validate([
                'name' => 'required|string|max:255',
            ]);


            $this->venueRepo->updateName($venue_id, $validated['name']);

            return back()->with('success', 'Venue updated successfully');

        } catch (\Throwable $th) {
            return back()->with('error', $th->getMessage());
        }
    }

    public function destroy(int $venue_id)
    {
        try {
            $this->venueRepo->destroy($venue_id);

            return back()->with('success', 'Venue deleted successfully');

        } catch (\Throwable $th) {

            return back()->with('error', $th->getMessage());
        }
    }
}
