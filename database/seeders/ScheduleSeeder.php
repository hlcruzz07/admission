<?php

namespace Database\Seeders;

use App\Models\Schedule;
use App\Models\Venue;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ScheduleSeeder extends Seeder
{
    public function run(): void
    {
        $venues = Venue::all();

        $dates = [
            '2027-02-23',
            '2027-02-24',
            '2027-02-25',
            '2027-02-26',
            '2027-02-27',
            '2027-02-28',
            '2027-03-03',
            '2027-03-04',
            '2027-03-05',
            '2027-03-06',
        ];

        foreach ($venues as $venue) {
            foreach ($dates as $date) {
                Schedule::create([
                    'venue_id' => $venue->id,
                    'schedule_date' => $date,
                ]);
            }
        }
    }
}