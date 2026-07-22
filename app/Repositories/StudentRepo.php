<?php

namespace App\Repositories;

use App\Models\Student;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class StudentRepo
{
    /**
     * Create a new class instance.
     */
    public function __construct(protected Student $model)
    {
        //
    }

    public function create(array $data)
    {
        $student = $this->model->create([
            'fname' => $data['fname'],
            'mname' => $data['mname'],
            'lname' => $data['lname'],
            'suffix' => $data['suffix'],
            'birthdate' => $data['birthdate'],
            'email' => $data['email'],
        ]);


        return $student;
    }

    public function paginate(array $filters)
    {
        $query = $this->model->query()->with('schedule');

        if (!empty($filters['search'])) {
            $search = '%' . $filters['search'] . '%';

            $query->where(function ($q) use ($search) {
                $q->where('email', 'like', $search)
                    ->orWhere('id', 'like', $search)
                    ->orWhere('fname', 'like', $search)
                    ->orWhere('mname', 'like', $search)
                    ->orWhere('lname', 'like', $search)
                    ->orWhere('suffix', 'like', $search)
                    ->orWhereRaw("CONCAT_WS(' ', fname, mname, lname, suffix) LIKE ?", [$search]);
            });
        }

        if (!empty($filters['campus'])) {
            $campusId = $filters['campus'];

            $query->whereHas('schedule.scheduleTime.schedule.venue', function ($q) use ($campusId) {
                $q->where('campus_id', $campusId);
            });
        }

        if (!empty($filters['created_at_from']) && !empty($filters['created_at_to'])) {
            if ($filters['created_at_from'] === $filters['created_at_to']) {
                $query->whereDate('created_at', '=', $filters['created_at_from']);
            } else {
                $query->whereDate('created_at', '>=', $filters['created_at_from'])
                    ->whereDate('created_at', '<=', $filters['created_at_to']);
            }
        }

        $sortable = ['id', 'fname', 'lname', 'email', 'created_at'];
        $sort = in_array($filters['sort'] ?? null, $sortable, true) ? $filters['sort'] : 'id';
        $order = in_array(strtolower($filters['order'] ?? ''), ['asc', 'desc'], true) ? $filters['order'] : 'desc';

        $query->orderBy($sort, $order);

        $show = $filters['show'] ?? 10;

        return $query->paginate($show);
    }

    public function countByCampus()
    {
        return Cache::remember('student_counts_by_campus', now()->addSeconds(30), function () {
            return DB::table('campuses')
                ->leftJoin('venues', 'venues.campus_id', '=', 'campuses.id')
                ->leftJoin('schedules', 'schedules.venue_id', '=', 'venues.id')
                ->leftJoin('schedule_times', 'schedule_times.schedule_id', '=', 'schedules.id')
                ->leftJoin('student_schedules', 'student_schedules.schedule_time_id', '=', 'schedule_times.id')
                ->select('campuses.id', 'campuses.name', DB::raw('COUNT(DISTINCT student_schedules.student_id) as students_count'))
                ->groupBy('campuses.id', 'campuses.name')
                ->get();
        });
    }
}