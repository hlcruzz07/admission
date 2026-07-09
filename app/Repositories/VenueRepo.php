<?php

namespace App\Repositories;

use App\Models\Venue;

class VenueRepo
{
    /**
     * Create a new class instance.
     */
    public function __construct(protected Venue $model)
    {
        //
    }

    public function create(array $data, int $campus_id): Venue
    {
        return $this->model->create([
            'name' => $data['name'],
            'campus_id' => $campus_id,
        ]);
    }

    public function updateName(int $id, string $name): void
    {
        $this->model->findOrFail($id)->update([
            'name' => $name,
        ]);
    }
}
