<?php

namespace Database\Seeders;

use App\Models\Campus;
use App\Models\Venue;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class VenueSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $venues = [
            'Talisay' => ['ETGB 3rd Floor, Function Hall'],
            'Fortune Towne' => ['AVR, Fortune Towne Campus'],
            'Binalbagan' => ['AB Building (Rooms 1-13)', 'Convention Hall'],
            'Alijis' => ['AVR, CHMSU-ALIJIS Campus'],
        ];

        foreach ($venues as $campus => $campusVenues) {

            $campus = Campus::where('name', $campus)->first();

            if ($campus) {
                foreach ($campusVenues as $venue) {
                    Venue::create([
                        'name' => $venue,
                        'campus_id' => $campus->id,
                    ]);
                }
            }
        }
    }
}
