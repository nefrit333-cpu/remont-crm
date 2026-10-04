<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RenovationTask extends Model
{
    use HasFactory;

    protected $fillable = ['project_id', 'assignee_id', 'title', 'description', 'due_date', 'priority', 'status', 'visible_to_client'];

    protected $casts = [
        'due_date' => 'date',
        'visible_to_client' => 'boolean',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assignee_id');
    }

    public function scopeVisibleTo(Builder $query, User $user): Builder
    {
        return $query->whereHas('project', fn (Builder $project) => $project->visibleTo($user))
            ->when($user->hasRole('Клиент'), fn (Builder $task) => $task->where('visible_to_client', true));
    }
}
