<?php

namespace App\Http\Requests;

use App\Models\Schedule;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateScheduleRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $schedule = Schedule::findOrFail($this->route('schedule_id'));
        return [
            'schedule_date' => [
                'required',
                'date',
                Rule::unique('schedules', 'schedule_date')
                    ->where(
                        fn($query) =>
                        $query->where('venue_id', $schedule->venue_id)
                    )
                    ->ignore($schedule->id),
            ],
            'times' => 'required|array|min:1',
            'times.*.slots' => 'required|integer|min:0',
            'times.*.time' => 'required|string|distinct',
        ];
    }

    public function messages(): array
    {
        return [
            'schedule_date.required' => 'Date is required',
            'schedule_date.date' => 'Date must be a valid date',
            'times.required' => 'Times is required',
            'times.array' => 'Times must be an array',
            'times.min' => 'Times is required',
            'times.*.slots.required' => 'Slots is required',
            'times.*.slots.integer' => 'Slots must be an integer',
            'times.*.slots.min' => 'Slots must be at least 0',
            'times.*.time.required' => 'Time is required',
            'times.*.time.string' => 'Time must be a string',
            'times.*.time.distinct' => 'Time must be unique',
        ];
    }
}
