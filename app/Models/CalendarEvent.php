<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CalendarEvent extends Model
{
    use HasFactory;

    protected $fillable = ['project_id', 'lead_id', 'user_id', 'title', 'type', 'starts_at', 'ends_at', 'description', 'visible_to_client'];

    protected $casts = [
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
        'visible_to_client' => 'boolean',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function lead(): BelongsTo
    {
        return $this->belongsTo(Lead::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopeVisibleTo(Builder $query, User $user): Builder
    {
        if ($user->hasRole(['Администратор', 'Менеджер'])) {
            return $query;
        }

        return $query->where(function (Builder $events) use ($user) {
            $events->where('user_id', $user->id)
                ->orWhereHas('project', fn (Builder $project) => $project->visibleTo($user));
        })->when($user->hasRole('Клиент'), fn (Builder $events) => $events->where('visible_to_client', true));
    }
}
