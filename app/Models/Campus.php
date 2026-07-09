<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Campus extends Model
{
    protected $fillable = [
        'name',
    ];

    public function venues()
    {
        return $this->hasMany(Venue::class, 'campus_id');
    }


}
