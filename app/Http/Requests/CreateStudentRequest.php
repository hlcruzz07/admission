<?php

namespace App\Http\Requests;

use App\Models\ScheduleTime;
use App\Models\StudentSchedule;
use Illuminate\Foundation\Http\FormRequest;

class CreateStudentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'fname' => 'required|string|max:100',
            'mname' => 'nullable|string|max:50',
            'lname' => 'required|string|max:100',
            'suffix' => 'nullable|string|in:Jr.,Sr.,III,IV,V',
            'birthdate' => 'required|date',
            'email' => 'required|email|max:150|unique:students,email',
            'schedule_time_id' => [
                'required',
                'integer',
                'exists:schedule_times,id',
                function (string $attribute, int $value, $fail) {
                    $scheduleTime = ScheduleTime::find($value);

                    if (!$scheduleTime) {
                        $fail('The selected schedule does not exist');
                        return;
                    }

                    if ($scheduleTime->booked_slots >= $scheduleTime->slots) {
                        $fail('The selected schedule is already full. Please choose another schedule.');
                    }
                },
            ],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'fname.required' => 'Please enter your first name.',
            'fname.string' => 'First name must be valid text.',
            'fname.max' => 'First name must not exceed 100 characters.',

            'mname.string' => 'Middle name must be valid text.',
            'mname.max' => 'Middle name must not exceed 50 characters.',

            'lname.required' => 'Please enter your last name.',
            'lname.string' => 'Last name must be valid text.',
            'lname.max' => 'Last name must not exceed 100 characters.',

            'birthdate.required' => 'Please enter your birthdate.',
            'birthdate.date' => 'Please enter a valid birthdate.',

            'email.required' => 'Please enter your email address.',
            'email.email' => 'Please enter a valid email address.',
            'email.max' => 'Email address must not exceed 150 characters.',
            'email.unique' => 'Email address already submitted',

            'schedule_time_id.required' => 'Please select a schedule.',
            'schedule_time_id.integer' => 'The selected schedule is invalid.',
            'schedule_time_id.exists' => 'The selected schedule does not exist.',
        ];
    }
}