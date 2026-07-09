<?php

namespace App\Repositories;

use App\Models\Campus;
use App\Models\Schedule;
use App\Models\ScheduleTime;
use App\Models\Venue;

class CampusRepo
{
    /**
     * Create a new class instance.
     */
    public function __construct(protected Campus $model)
    {
    }

    public function all()
    {
        return $this->model->all();
    }

    public function create(array $data): Campus
    {
        return $this->model->create($data);
    }
}
