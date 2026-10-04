<?php

namespace App\Http\Requests;

use App\Models\Lead;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class LeadRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole(['Администратор', 'Менеджер']) ?? false;
    }

    public function rules(): array
    {
        return [
            'client_name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:255'],
            'renovation_type' => ['required', 'string', 'max:120'],
            'address' => ['required', 'string', 'max:255'],
            'area' => ['nullable', 'numeric', 'min:1', 'max:10000'],
            'budget' => ['nullable', 'integer', 'min:0'],
            'desired_start_date' => ['nullable', 'date'],
            'status' => ['required', Rule::in(Lead::STATUSES)],
            'source' => ['nullable', 'string', 'max:120'],
            'manager_id' => ['nullable', 'exists:users,id'],
            'comment' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
