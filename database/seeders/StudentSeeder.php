<?php

namespace Database\Seeders;

use App\Models\ScheduleTime;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class StudentSeeder extends Seeder
{
    /**
     * How many students to generate. Automatically capped to however
     * many open seats actually exist across all schedule_times, so
     * this seeder can never overbook a slot.
     */
    protected int $totalStudentsToSeed = 5000;

    /**
     * Bulk-insert batch size. Kept moderate to avoid tripping
     * max_allowed_packet on default MySQL configs.
     */
    protected int $chunkSize = 250;

    public function run(): void
    {
        // Avoid unbounded memory growth from Laravel's query log across
        // thousands of queries — a common hidden cause of long-running
        // seeders eventually losing their DB connection.
        DB::connection()->disableQueryLog();

        $scheduleTimes = ScheduleTime::with('schedule.venue.campus')->get();

        $scheduleTimeLookup = $scheduleTimes->keyBy('id')->map(function (ScheduleTime $time) {
            $scheduleDay = $time->schedule;
            $venue = $scheduleDay->venue;
            $campus = $venue->campus;

            return [
                'campus' => $campus,
                'venue' => $venue,
                'schedule' => $scheduleDay,
                'time' => $time,
            ];
        });

        $seatPool = $scheduleTimes
            ->flatMap(function (ScheduleTime $time) {
                $remaining = max($time->slots - $time->booked_slots, 0);
                return array_fill(0, $remaining, $time->id);
            })
            ->shuffle()
            ->values();

        $studentsToCreate = min($this->totalStudentsToSeed, $seatPool->count());

        if ($studentsToCreate === 0) {
            $this->command?->warn('No open slots available across any schedule — nothing seeded.');
            return;
        }

        $bookedCounts = [];
        $now = now();
        $created = 0;

        foreach (array_chunk(range(0, $studentsToCreate - 1), $this->chunkSize) as $indexChunk) {
            $studentRows = [];
            $rawStudentData = []; // parallel array, same order as $studentRows

            foreach ($indexChunk as $i) {
                $fname = fake()->firstName();
                $mname = fake()->boolean(70) ? fake()->firstName() : null;
                $lname = fake()->lastName();
                $suffix = fake()->boolean(10) ? fake()->randomElement(['Jr.', 'Sr.', 'II', 'III']) : null;
                $birthdate = fake()->dateTimeBetween('-22 years', '-16 years')->format('Y-m-d');
                $email = Str::slug("{$fname}.{$lname}") . "{$i}@example.com";

                $studentRows[] = [
                    'fname' => $fname,
                    'mname' => $mname,
                    'lname' => $lname,
                    'suffix' => $suffix,
                    'birthdate' => $birthdate,
                    'email' => $email,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];

                $rawStudentData[] = compact('fname', 'mname', 'lname', 'suffix', 'birthdate', 'email');
            }

            // Bulk insert this whole chunk of students in ONE query.
            DB::table('students')->insert($studentRows);

            // MySQL assigns sequential auto-increment IDs for a multi-row
            // insert, starting at lastInsertId(). This assumes no
            // concurrent writes to `students` during seeding.
            $firstId = (int) DB::getPdo()->lastInsertId();

            $scheduleRows = [];

            foreach ($rawStudentData as $offset => $data) {
                $studentId = $firstId + $offset;
                $scheduleTimeId = $seatPool[$created + $offset];
                $bookedCounts[$scheduleTimeId] = ($bookedCounts[$scheduleTimeId] ?? 0) + 1;

                $payload = [
                    'student' => array_merge(['id' => $studentId], $data),
                    'schedule' => $scheduleTimeLookup[$scheduleTimeId],
                ];

                $token = Crypt::encryptString(json_encode($payload));
                $emailSentAt = fake()->boolean(70)
                    ? fake()->dateTimeBetween('-30 days', 'now')->format('Y-m-d H:i:s')
                    : null;

                $scheduleRows[] = [
                    'student_id' => $studentId,
                    'schedule_time_id' => $scheduleTimeId,
                    'email_sent_at' => $emailSentAt,
                    'token' => $token,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }

            DB::table('student_schedules')->insert($scheduleRows);

            $created += count($indexChunk);
            $this->command?->info("Seeded {$created} / {$studentsToCreate} students...");
        }

        foreach ($bookedCounts as $scheduleTimeId => $count) {
            DB::table('schedule_times')
                ->where('id', $scheduleTimeId)
                ->increment('booked_slots', $count);
        }

        $this->command?->info("Done: seeded {$studentsToCreate} students across " . count($bookedCounts) . ' schedule times.');
    }
}