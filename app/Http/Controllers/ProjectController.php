<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Project;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProjectController extends Controller
{
    public function index(Request $request): Response
    {
        $canViewFinance = ! $request->user()->hasRole('Прораб');
        $projects = Project::query()
            ->visibleTo($request->user())
            ->with(['customer', 'manager', 'foreman'])
            ->when($request->string('status')->isNotEmpty(), fn ($query) => $query->where('status', $request->string('status')))
            ->latest()
            ->paginate(12)
            ->withQueryString();

        if (! $canViewFinance) {
            $projects->getCollection()->each->makeHidden('budget');
        }

        return Inertia::render('Projects/Index', [
            'projects' => $projects,
            'filters' => $request->only(['status']),
            'foremen' => User::role('Прораб')->select('id', 'name')->orderBy('name')->get(),
            'customers' => Customer::select('id', 'name')->orderBy('name')->get(),
        ]);
    }

    public function store(Request $request, ActivityLogger $activityLogger): RedirectResponse
    {
        abort_unless($request->user()->hasRole(['Администратор', 'Менеджер']), 403);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'address' => ['required', 'string', 'max:255'],
            'customer_id' => ['required', 'exists:customers,id'],
            'foreman_id' => ['nullable', 'exists:users,id'],
            'manager_id' => ['nullable', 'exists:users,id'],
            'area' => ['nullable', 'numeric', 'min:1'],
            'renovation_type' => ['required', 'string', 'max:120'],
            'status' => ['required', 'string', 'max:80'],
            'start_date' => ['nullable', 'date'],
            'planned_finish_date' => ['nullable', 'date'],
            'budget' => ['nullable', 'integer', 'min:0'],
        ]);

        $project = Project::create($validated);
        $activityLogger->log($project, 'project.created', 'Создан объект ремонта', $request->user()->id);

        return redirect()->route('projects.show', $project)->with('success', 'Объект создан.');
    }

    public function show(Request $request, Project $project): Response
    {
        $user = $request->user();
        $canViewFinance = ! $user->hasRole('Прораб');

        abort_unless($project->newQuery()->whereKey($project->id)->visibleTo($user)->exists(), 403);

        $relations = [
            'customer',
            'manager',
            'foreman',
            'lead',
            'stages',
            'tasks.assignee',
            'events',
            'files.uploader',
            'comments.author',
            'activities.user',
        ];

        if ($canViewFinance) {
            $relations[] = 'payments';
            $relations[] = 'acts';
        } else {
            $project->makeHidden('budget');
        }

        $project->load($relations);

        return Inertia::render('Projects/Show', [
            'project' => $project,
            'foremen' => User::role('Прораб')->select('id', 'name')->orderBy('name')->get(),
            'managers' => User::role(['Администратор', 'Менеджер'])->select('id', 'name')->orderBy('name')->get(),
        ]);
    }

    public function update(Request $request, Project $project, ActivityLogger $activityLogger): RedirectResponse
    {
        abort_unless($request->user()->hasRole(['Администратор', 'Менеджер']), 403);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'address' => ['required', 'string', 'max:255'],
            'foreman_id' => ['nullable', 'exists:users,id'],
            'manager_id' => ['nullable', 'exists:users,id'],
            'area' => ['nullable', 'numeric', 'min:1'],
            'renovation_type' => ['required', 'string', 'max:120'],
            'status' => ['required', 'string', 'max:80'],
            'start_date' => ['nullable', 'date'],
            'planned_finish_date' => ['nullable', 'date'],
            'budget' => ['nullable', 'integer', 'min:0'],
        ]);

        $oldStatus = $project->status;
        $project->update($validated);
        $event = $oldStatus === $project->status ? 'project.updated' : 'project.status_changed';
        $description = $oldStatus === $project->status ? 'Объект обновлён' : "Статус объекта изменён: {$oldStatus} -> {$project->status}";
        $activityLogger->log($project, $event, $description, $request->user()->id);

        return redirect()->back()->with('success', 'Объект обновлён.');
    }
}
