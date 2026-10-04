<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Lead extends Model
{
    use HasFactory, SoftDeletes;

    public const STATUSES = [
        'Новая',
        'Связаться',
        'Замер назначен',
        'Смета готовится',
        'Договор',
        'В работе',
        'Завершена',
        'Отказ',
    ];

    protected $fillable = [
        'client_name',
        'phone',
        'email',
        'renovation_type',
        'address',
        'area',
        'budget',
        'desired_start_date',
        'status',
        'source',
        'manager_id',
        'comment',
        'converted_at',
    ];

    protected $casts = [
        'area' => 'decimal:2',
        'desired_start_date' => 'date',
        'converted_at' => 'datetime',
    ];

    public function manager(): BelongsTo
    {
        return $this->belongsTo(User::class, 'manager_id');
    }

    public function projects(): HasMany
    {
        return $this->hasMany(Project::class);
    }

    public function comments(): MorphMany
    {
        return $this->morphMany(Comment::class, 'commentable')->latest();
    }

    public function activities(): MorphMany
    {
        return $this->morphMany(ActivityLog::class, 'subject')->latest();
    }

    public function scopeVisibleTo(Builder $query, User $user): Builder
    {
        if ($user->hasRole('Администратор')) {
            return $query;
        }

        return $query->where('manager_id', $user->id);
    }
}
