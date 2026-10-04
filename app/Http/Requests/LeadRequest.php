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

    public function messages(): array
    {
        return [
            'client_name.required' => 'Укажите имя клиента.',
            'phone.required' => 'Укажите телефон клиента.',
            'email.email' => 'Введите корректный email.',
            'renovation_type.required' => 'Укажите тип ремонта.',
            'address.required' => 'Укажите адрес или район.',
            'area.numeric' => 'Площадь должна быть числом.',
            'area.min' => 'Площадь должна быть больше нуля.',
            'budget.integer' => 'Бюджет должен быть целым числом.',
            'budget.min' => 'Бюджет не может быть отрицательным.',
            'desired_start_date.date' => 'Укажите корректную дату старта.',
            'status.required' => 'Выберите статус заявки.',
            'status.in' => 'Выберите статус из списка.',
            'manager_id.exists' => 'Выберите менеджера из списка.',
            'comment.max' => 'Комментарий не должен быть длиннее 2000 символов.',
        ];
    }
}
