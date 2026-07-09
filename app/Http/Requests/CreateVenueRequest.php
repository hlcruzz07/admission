<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class CreateVenueRequest extends FormRequest
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
            'name' => 'required|string|max:255',
            'schedules' => 'array|min:1',
            'schedules.*.schedule_date' => 'required|date|unique:schedules,schedule_date',
            'schedules.*.times' => 'required|array|min:1',
            'schedules.*.times.*.time' => 'required|string',
            'schedules.*.times.*.slots' => 'required|integer',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Name is required',
            'name.max' => 'Name must be less than 255 characters',
            'schedules.min' => 'At least one schedule is required',
            'schedules.*.schedule_date.required' => 'Date is required',
            'schedules.*.schedule_date.unique' => 'Date already exists.',
            'schedules.*.times.required' => 'Times is required',
            'schedules.*.times.min' => 'At least one time is required',
            'schedules.*.times.*.time.required' => 'Time slot is required',
            'schedules.*.times.*.slots.required' => 'Number of slots is required',
            'schedules.*.times.*.slots.integer' => 'Number of slots must be a number',
        ];
    }
}
