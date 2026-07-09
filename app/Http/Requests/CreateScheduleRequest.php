<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class CreateScheduleRequest extends FormRequest
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
        return [
            'schedule_date' => 'required|date|unique:schedules,schedule_date',
            'times' => 'required|array|min:1',
            'times.*.slots' => 'required|integer|min:1',
            'times.*.time' => 'required|string'
        ];
    }

    public function messages(): array
    {
        return [
            'schedule_date.required' => 'Schedule date is required.',
            'schedule_date.date' => 'Schedule date must be a valid date.',
            'schedule_date.unique' => 'A schedule already exists for this date.',

            'times.required' => 'Please add at least one schedule time.',
            'times.array' => 'Times field must be an array.',
            'times.min' => 'Please add at least one schedule time.',

            'times.*.slots.required' => 'Slot field is required.',
            'times.*.slots.integer' => 'Slot must be a whole number.',
            'times.*.slots.min' => 'Slot must be at least 1.',

            'times.*.time.required' => 'Time field is required.',
            'times.*.time.string' => 'Time must be a valid string.',
        ];
    }
}
