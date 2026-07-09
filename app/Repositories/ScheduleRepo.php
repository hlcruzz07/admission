<?php

namespace App\Repositories;

use App\Models\Schedule;

class ScheduleRepo
{
    /**
     * Create a new class instance.
     */
    public function __construct(protected Schedule $model)
    {
        //
    }

    public function create(array $data, int $venue_id)
    {
        return $this->model->create([
            'schedule_date' => $data['schedule_date'],
            'venue_id' => $venue_id,
        ]);
    }

    public function update(int $id, array $data)
    {
        $schedule = $this->model->findOrFail($id);

        $schedule->update([

            'schedule_date' => $data['schedule_date']
        ]);

        return $schedule;
    }

    public function destroy(int $id)
    {
        $schedule = $this->model->findOrFail($id);

        $schedule->delete();
    }
}
