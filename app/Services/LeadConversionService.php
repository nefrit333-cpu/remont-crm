<?php

namespace App\Services;

use App\Models\Customer;
use App\Models\Lead;
use App\Models\Project;
use Illuminate\Support\Facades\DB;

class LeadConversionService
{
    public function __construct(private readonly ActivityLogger $activityLogger) {}

    public function convert(Lead $lead, ?int $userId = null): Project
    {
        return DB::transaction(function () use ($lead, $userId): Project {
            $customer = Customer::firstOrCreate(
                ['email' => $lead->email ?: null, 'phone' => $lead->phone],
                [
                    'name' => $lead->client_name,
                    'address' => $lead->address,
                    'notes' => $lead->comment,
                ],
            );

            $project = Project::create([
                'name' => 'Ремонт: '.$lead->address,
                'address' => $lead->address,
                'customer_id' => $customer->id,
                'manager_id' => $lead->manager_id,
                'lead_id' => $lead->id,
                'area' => $lead->area,
                'renovation_type' => $lead->renovation_type,
                'status' => 'Подготовка',
                'start_date' => $lead->desired_start_date,
                'planned_finish_date' => $lead->desired_start_date?->copy()->addMonths(4),
                'budget' => $lead->budget,
            ]);

            foreach (['Подготовка', 'Демонтаж', 'Черновые работы', 'Электрика', 'Сантехника', 'Отделка', 'Приёмка'] as $index => $name) {
                $project->stages()->create([
                    'name' => $name,
                    'status' => $index === 0 ? 'В работе' : 'Ожидает',
                    'progress' => $index === 0 ? 20 : 0,
                    'sort_order' => $index + 1,
                ]);
            }

            $lead->update([
                'status' => 'В работе',
                'converted_at' => now(),
            ]);

            $this->activityLogger->log($lead, 'lead.converted', 'Заявка превращена в объект ремонта', $userId, [
                'project_id' => $project->id,
            ]);

            $this->activityLogger->log($project, 'project.created', 'Создан объект ремонта из заявки', $userId, [
                'lead_id' => $lead->id,
            ]);

            return $project;
        });
    }
}
