<?php

namespace App\Repositories;

use App\Models\Schedule;
use App\Models\ScheduleTime;

class ScheduleTimeRepo
{
    /**
     * Create a new class instance.
     */
    public function __construct(protected ScheduleTime $model)
    {
        //
    }

    public function create(array $data, int $schedule_id): ScheduleTime
    {
        return $this->model->create([
            'time' => $data['time'],
            'slots' => $data['slots'],
            'schedule_id' => $schedule_id,
        ]);
    }

    public function updateTimes(array $times, int $schedule_id)
    {
        $schedule = Schedule::findOrFail($schedule_id);

        $existingIds = [];

        foreach ($times as $timeData) {

            $time = $schedule->times()->updateOrCreate(
                [
                    'id' => $timeData['id'] ?? null,
                ],
                [
                    'time' => $timeData['time'],
                    'slots' => $timeData['slots'],
                ]
            );

            $existingIds[] = $time->id;
        }

        $schedule->times()
            ->whereNotIn('id', $existingIds)
            ->delete();
    }

    public function incrementBookedSlotsById(int $id): bool
    {
        $updated = $this->model
            ->whereKey($id)
            ->whereColumn('booked_slots', '<', 'slots')
            ->increment('booked_slots');

        return $updated > 0;
    }
}
