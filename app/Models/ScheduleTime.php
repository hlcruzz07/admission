<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ScheduleTime extends Model
{
    protected $fillable = [
        'schedule_id',
        'time',
        'slots',
    ];

    public function schedule()
    {
        return $this->belongsTo(Schedule::class, 'schedule_id');
    }
}
