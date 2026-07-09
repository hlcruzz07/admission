<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreateScheduleRequest;
use App\Http\Requests\UpdateScheduleRequest;
use App\Repositories\ScheduleRepo;
use App\Repositories\ScheduleTimeRepo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ScheduleController extends Controller
{
    public function __construct(protected ScheduleRepo $scheduleRepo, protected ScheduleTimeRepo $scheduleTimeRepo)
    {

    }
    public function update(UpdateScheduleRequest $request, int $schedule_id)
    {

        try {
            $data = $request->all();

            DB::transaction(function () use ($schedule_id, $data) {

                $schedule = $this->scheduleRepo->update($schedule_id, $data);

                $this->scheduleTimeRepo->updateTimes($data['times'], $schedule->id);

            });

            return back()->with('success', 'Schedule updated successfully.');

        } catch (\Throwable $th) {

            Log::error($th->getMessage());

            return back()->with('error', 'Something went wrong.');
        }
    }

    public function destroy(int $schedule_id)
    {

        try {
            $this->scheduleRepo->destroy($schedule_id);

            return back()->with('success', 'Schedule deleted successfully.');

        } catch (\Throwable $th) {

            Log::error($th->getMessage());

            return back()->with('error', 'Something went wrong.');
        }
    }

    public function create(CreateScheduleRequest $request)
    {
        dd($request->all());
    }


}
