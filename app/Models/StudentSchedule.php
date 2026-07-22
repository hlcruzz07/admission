<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StudentSchedule extends Model
{
    protected $fillable = [
        'student_id',
        'schedule_time_id',
        'email_sent_at',
        'token'
    ];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function scheduleTime()
    {
        return $this->belongsTo(ScheduleTime::class);
    }
}
