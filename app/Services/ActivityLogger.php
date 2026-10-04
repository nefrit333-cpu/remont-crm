<?php

namespace App\Services;

use App\Models\ActivityLog;
use Illuminate\Database\Eloquent\Model;

class ActivityLogger
{
    public function log(Model $subject, string $event, string $description, ?int $userId = null, array $properties = []): ActivityLog
    {
        return ActivityLog::create([
            'user_id' => $userId,
            'subject_type' => $subject::class,
            'subject_id' => $subject->getKey(),
            'event' => $event,
            'description' => $description,
            'properties' => $properties ?: null,
        ]);
    }
}
