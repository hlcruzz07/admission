<?php

namespace App\Console\Commands;

use App\Models\ScheduleTime;
use Illuminate\Console\Command;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class ResetAdmission extends Command
{
    protected $signature = 'admission:reset';
    protected $description = 'Backup combined student + schedule data into a single year-stamped table, then truncate and reset slots';

    public function handle()
    {
        $year = now()->year;
        $backupTable = "students_backup_{$year}";

        if (Schema::hasTable($backupTable)) {
            $this->error("Backup table '{$backupTable}' already exists. Aborting to avoid overwriting.");
            return 1;
        }

        if (!$this->confirm("This will back up combined student data to '{$backupTable}', then truncate students and student_schedules, and reset all booked_slots to 0. Continue?")) {
            $this->info('Cancelled.');
            return;
        }

        $originalStudentCount = DB::table('students')->count();

        Schema::create($backupTable, function (Blueprint $table) {
            $table->id('original_student_id');
            $table->string('fname');
            $table->string('mname')->nullable();
            $table->string('lname');
            $table->string('suffix')->nullable();
            $table->date('birthdate');
            $table->string('email');

            $table->unsignedBigInteger('schedule_time_id')->nullable();
            $table->string('campus')->nullable();
            $table->string('venue')->nullable();
            $table->date('schedule_date')->nullable();
            $table->time('schedule_time')->nullable();

            $table->timestamp('email_sent_at')->nullable();
            $table->text('token')->nullable();

            $table->timestamps();
        });

        // 2. Populate it via a single INSERT ... SELECT with joins
        DB::statement("
            INSERT INTO {$backupTable}
                (original_student_id, fname, mname, lname, suffix, birthdate, email,
                 schedule_time_id, campus, venue, schedule_date, schedule_time,
                 email_sent_at, token, created_at, updated_at)
            SELECT
                students.id, students.fname, students.mname, students.lname, students.suffix,
                students.birthdate, students.email,
                student_schedules.schedule_time_id, campuses.name, venues.name,
                schedules.schedule_date, schedule_times.time,
                student_schedules.email_sent_at, student_schedules.token,
                students.created_at, students.updated_at
            FROM students
            LEFT JOIN student_schedules ON student_schedules.student_id = students.id
            LEFT JOIN schedule_times ON schedule_times.id = student_schedules.schedule_time_id
            LEFT JOIN schedules ON schedules.id = schedule_times.schedule_id
            LEFT JOIN venues ON venues.id = schedules.venue_id
            LEFT JOIN campuses ON campuses.id = venues.campus_id
        ");

        $backedUpCount = DB::table($backupTable)->count();

        if ($backedUpCount !== $originalStudentCount) {
            $this->error("Backup row count ({$backedUpCount}) does not match original student count ({$originalStudentCount}). Aborting truncate for safety. Please check '{$backupTable}' manually.");
            return 1;
        }

        // 3. Truncate original tables (child first, due to FK constraints)
        Schema::disableForeignKeyConstraints();
        DB::table('student_schedules')->truncate();
        DB::table('students')->truncate();
        Schema::enableForeignKeyConstraints();

        // 4. Reset booked_slots for the next admission period
        ScheduleTime::query()->update(['booked_slots' => 0]);

        $this->info("Backup complete: {$backupTable} ({$backedUpCount} rows).");
        $this->info('Students and student_schedules truncated. booked_slots reset to 0.');
    }
}