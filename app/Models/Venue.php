<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Venue extends Model
{
    use SoftDeletes;
    protected $fillable = [
        'name',
        'campus_id',
    ];

    public function campus()
    {
        return $this->belongsTo(Campus::class, 'campus_id');
    }

    public function schedules()
    {
        return $this->hasMany(Schedule::class, 'venue_id');
    }
}
