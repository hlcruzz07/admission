<?php

namespace Database\Seeders;

use App\Models\Schedule;
use App\Models\ScheduleTime;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ScheduleTimeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $schedules = Schedule::all();

        $timeSlots = [
            '08:00:00',
            '10:00:00',
            '13:00:00',
            '15:00:00',
        ];

        foreach ($schedules as $schedule) {

            foreach ($timeSlots as $time) {

                ScheduleTime::create([
                    'schedule_id' => $schedule->id,
                    'time' => $time,
                    'slots' => 150,

                ]);
            }
        }
    }
}
