<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
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

    protected $appends = ['full_name'];

    public function schedule()
    {
        return $this->hasOne(StudentSchedule::class, 'student_id')->with('scheduleTime.schedule.venue.campus');
    }

    public function fullName(): Attribute
    {
        return Attribute::make(
            get: fn() => trim(implode(' ', array_filter([
                $this->fname,
                $this->mname ? mb_strtoupper(mb_substr($this->mname, 0, 1)) . '.' : null,
                $this->lname,
                $this->suffix ?: null,
            ])))
        );
    }
}
