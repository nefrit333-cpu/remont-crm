<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\CalendarEvent;
use App\Models\Lead;
use App\Models\Payment;
use App\Models\Project;
use App\Models\RenovationTask;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $user = $request->user();

        $projects = Project::query()->visibleTo($user);
        $tasks = RenovationTask::query()->visibleTo($user);
        $canViewFinance = ! $user->hasRole('Прораб');

        $stats = [
            'newLeads' => $user->hasRole('Клиент') ? 0 : Lead::query()->visibleTo($user)->where('status', 'Новая')->count(),
            'activeLeads' => $user->hasRole('Клиент') ? 0 : Lead::query()->visibleTo($user)->whereNotIn('status', ['Завершена', 'Отказ'])->count(),
            'activeProjects' => (clone $projects)->whereNotIn('status', ['Завершён', 'Архив'])->count(),
            'todayTasks' => (clone $tasks)->whereDate('due_date', today())->count(),
            'pendingPayments' => $canViewFinance ? Payment::query()->visibleTo($user)->where('status', 'Ожидается')->sum('amount') : null,
        ];
        $dashboardProjects = (clone $projects)
            ->with(['customer', 'foreman', 'manager'])
            ->latest()
            ->limit(5)
            ->get();

        if (! $canViewFinance) {
            $dashboardProjects->each->makeHidden('budget');
        }

        return Inertia::render('Dashboard', [
            'role' => $user->roles()->value('name'),
            'stats' => $stats,
            'projects' => $dashboardProjects,
            'tasks' => (clone $tasks)
                ->with(['project', 'assignee'])
                ->orderByRaw('due_date is null, due_date asc')
                ->limit(6)
                ->get(),
            'events' => CalendarEvent::query()
                ->visibleTo($user)
                ->with(['project', 'lead'])
                ->where('starts_at', '>=', now()->subDay())
                ->orderBy('starts_at')
                ->limit(6)
                ->get(),
            'activity' => ActivityLog::query()
                ->with('user')
                ->where(function ($query) use ($user) {
                    if ($user->hasRole(['Администратор', 'Менеджер'])) {
                        return;
                    }

                    $projectIds = Project::query()->visibleTo($user)->pluck('id');
                    $query->where(function ($visible) use ($projectIds) {
                        $visible->where('subject_type', Project::class)->whereIn('subject_id', $projectIds);
                    });
                })
                ->latest()
                ->limit(8)
                ->get(),
        ]);
    }
}
