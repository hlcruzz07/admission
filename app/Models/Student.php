<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    protected $fillable = [
        'email',
        'fname',
        'mname',
        'lname',
        'suffix',
        'birthdate',
    ];

    public function schedule()
    {
        return $this->hasOne(StudentSchedule::class, 'student_id')->with('schedule_time.schedule.venue.campus');
    }

    public function getFullName(): string
    {
        return trim(implode(' ', [
            $this->fname,
            $this->mname ? $this->mname . '.' : '',
            $this->lname,
            $this->suffix ? $this->suffix . '.' : '',
        ]));
    }
}
