<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Schedule extends Model
{
    protected $fillable = [
        'venue_id',
        'schedule_date',
    ];

    public function venue()
    {
        return $this->belongsTo(Venue::class, 'venue_id');
    }

    public function times()
    {
        return $this->hasMany(ScheduleTime::class, 'schedule_id');
    }
}
