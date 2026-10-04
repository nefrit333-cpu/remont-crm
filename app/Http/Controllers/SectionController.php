<?php

namespace App\Http\Controllers;

use App\Models\Act;
use App\Models\CalendarEvent;
use App\Models\Customer;
use App\Models\Payment;
use App\Models\ProjectFile;
use App\Models\RenovationTask;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SectionController extends Controller
{
    public function tasks(Request $request): Response
    {
        return Inertia::render('Sections/Tasks', [
            'tasks' => RenovationTask::query()->visibleTo($request->user())->with(['project', 'assignee'])->latest()->paginate(16),
        ]);
    }

    public function calendar(Request $request): Response
    {
        return Inertia::render('Sections/Calendar', [
            'events' => CalendarEvent::query()->visibleTo($request->user())->with(['project', 'lead', 'user'])->orderBy('starts_at')->paginate(24),
        ]);
    }

    public function files(Request $request): Response
    {
        return Inertia::render('Sections/Files', [
            'files' => ProjectFile::query()->visibleTo($request->user())->with(['project', 'uploader'])->latest()->paginate(18),
        ]);
    }

    public function payments(Request $request): Response
    {
        abort_if($request->user()->hasRole('Прораб'), 403);

        return Inertia::render('Sections/Payments', [
            'payments' => Payment::query()->visibleTo($request->user())->with('project.customer')->orderByRaw('due_date is null, due_date asc')->paginate(18),
        ]);
    }

    public function acts(Request $request): Response
    {
        abort_if($request->user()->hasRole('Прораб'), 403);

        return Inertia::render('Sections/Acts', [
            'acts' => Act::query()->visibleTo($request->user())->with('project.customer')->latest()->paginate(18),
        ]);
    }

    public function customers(Request $request): Response
    {
        abort_if($request->user()->hasRole(['Прораб', 'Клиент']), 403);

        return Inertia::render('Sections/Customers', [
            'customers' => Customer::query()->withCount('projects')->latest()->paginate(18),
        ]);
    }

    public function team(Request $request): Response
    {
        abort_unless($request->user()->hasRole('Администратор'), 403);

        return Inertia::render('Sections/Team', [
            'users' => User::query()->with('roles', 'customer')->orderBy('name')->paginate(24),
        ]);
    }

    public function settings(Request $request): Response
    {
        abort_unless($request->user()->hasRole('Администратор'), 403);

        return Inertia::render('Sections/Settings', [
            'roles' => ['Администратор', 'Менеджер', 'Прораб', 'Клиент'],
            'note' => 'В demo-версии настройки показаны как справочный раздел без изменения внешних сервисов.',
        ]);
    }
}
