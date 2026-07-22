<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreateStudentRequest;
use App\Jobs\SendAppointmentConfirmationEmail;
use App\Models\Campus;
use App\Models\Student;
use App\Repositories\ScheduleTimeRepo;
use App\Repositories\StudentRepo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;
use Inertia\Inertia;

class StudentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function __construct(protected StudentRepo $studentRepo, protected ScheduleTimeRepo $scheduleTimeRepo)
    {

    }
    public function index()
    {
        $campus = Campus::all();

        $studentCounts = $this->studentRepo->countByCampus();

        return Inertia::render('Admin/Students/Index', [
            'campus' => $campus,
            'student_counts' => $studentCounts,
        ]);
    }

    public function form()
    {
        $schedules = Campus::with('venues.schedules.times')->get();

        return Inertia::render('Student/Form/Index', ['schedules' => $schedules]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(CreateStudentRequest $request)
    {
        $token = request()->cookie('queue_token');

        if (!$token) {
            return redirect()->route('home')->with('error', 'Session Expired');
        }

        try {
            $student = DB::transaction(function () use ($request) {
                $data = $request->validated();

                $reserved = $this->scheduleTimeRepo->incrementBookedSlotsById($data['schedule_time_id']);

                if (!$reserved) {
                    throw new \Exception('This time slot is fully booked. Please choose another.');
                }

                $student = $this->studentRepo->create($data);

                $student->schedule()->create([
                    'student_id' => $student->id,
                    'schedule_time_id' => $data['schedule_time_id'],
                ]);

                return $student;
            });

            $student->load('schedule.scheduleTime.schedule.venue.campus');

            $scheduleTime = $student->schedule->scheduleTime;
            $scheduleDay = $scheduleTime->schedule;
            $venue = $scheduleDay->venue;
            $campus = $venue->campus;

            $payload = [
                'student' => [
                    'id' => $student->id,
                    'fname' => $student->fname,
                    'mname' => $student->mname,
                    'lname' => $student->lname,
                    'suffix' => $student->suffix,
                    'birthdate' => $student->birthdate,
                    'email' => $student->email,
                ],
                'schedule' => [
                    'campus' => $campus,
                    'venue' => $venue,
                    'schedule' => $scheduleDay,
                    'time' => $scheduleTime,
                ],
                'expires_at' => now()->addDays(30)->timestamp
            ];

            $successToken = Crypt::encryptString(json_encode($payload));

            $student->schedule()->update([
                'token' => $successToken,
            ]);

            $successUrl = route('student.ticket', [
                'token' => $successToken,
            ]);

            SendAppointmentConfirmationEmail::dispatch(
                $student->email,
                $student->full_name,
                $successUrl,
            );

            Redis::zrem('queue:active', $token);
            Redis::del("active:$token");
            Redis::del("waiting:$token");
            Redis::del("initial_pos:$token");
            Redis::del("grace:$token");
            Cookie::queue(Cookie::forget('queue_token'));


            // Immediate post-submit redirect uses flash data (one-time),
            // separate from the permanent token-based /ticket link above.
            return redirect()->route('student.success')->with('success_data', $payload);
        } catch (\Throwable $th) {
            return back()
                ->withErrors([
                    'schedule_time_id' => $th->getMessage(),
                ])
                ->withInput();
        }
    }

    public function ticket(string $token)
    {
        try {
            $payload = json_decode(Crypt::decryptString($token), true);
        } catch (\Illuminate\Contracts\Encryption\DecryptException) {
            return redirect()
                ->route('home')
                ->withErrors('This confirmation link is invalid.');
        }

        if (!isset($payload['expires_at']) || now()->timestamp > $payload['expires_at']) {
            return redirect()
                ->route('home')
                ->withErrors('This confirmation link has expired.');
        }

        if (!Student::find($payload['student']['id'])) {
            return redirect()
                ->route('home')
                ->withErrors('This confirmation link is no longer valid.');
        }

        return Inertia::render('Student/Ticket/Index', $payload);
    }

    public function success()
    {
        return Inertia::render('Student/Success/Index', [
            'success_data' => session('success_data'),
        ]);
    }




    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Student $student)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Student $student)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Student $student)
    {
        //
    }
}
