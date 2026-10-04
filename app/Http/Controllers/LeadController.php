<?php

namespace App\Http\Controllers;

use App\Http\Requests\LeadRequest;
use App\Models\Lead;
use App\Models\User;
use App\Services\ActivityLogger;
use App\Services\LeadConversionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LeadController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        abort_if($user->hasRole(['Прораб', 'Клиент']), 403);

        $leads = Lead::query()
            ->visibleTo($user)
            ->with('manager')
            ->when($request->string('status')->isNotEmpty(), fn ($query) => $query->where('status', $request->string('status')))
            ->when($request->string('search')->isNotEmpty(), function ($query) use ($request) {
                $search = $request->string('search')->toString();
                $query->where(fn ($leads) => $leads
                    ->where('client_name', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('address', 'like', "%{$search}%"));
            })
            ->latest()
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('Leads/Index', [
            'leads' => $leads,
            'filters' => $request->only(['status', 'search']),
            'statuses' => Lead::STATUSES,
            'managers' => User::role(['Администратор', 'Менеджер'])->select('id', 'name')->orderBy('name')->get(),
        ]);
    }

    public function store(LeadRequest $request, ActivityLogger $activityLogger): RedirectResponse
    {
        $lead = Lead::create($request->validated());
        $activityLogger->log($lead, 'lead.created', 'Создана заявка', $request->user()->id);

        return redirect()->route('leads.index')->with('success', 'Заявка создана.');
    }

    public function show(Request $request, Lead $lead): Response
    {
        abort_unless($lead->newQuery()->whereKey($lead->id)->visibleTo($request->user())->exists(), 403);

        return Inertia::render('Leads/Show', [
            'lead' => $lead->load(['manager', 'comments.author', 'activities.user', 'projects']),
            'statuses' => Lead::STATUSES,
            'managers' => User::role(['Администратор', 'Менеджер'])->select('id', 'name')->orderBy('name')->get(),
        ]);
    }

    public function update(LeadRequest $request, Lead $lead, ActivityLogger $activityLogger): RedirectResponse
    {
        $oldStatus = $lead->status;
        $lead->update($request->validated());

        if ($oldStatus !== $lead->status) {
            $activityLogger->log($lead, 'lead.status_changed', "Статус заявки изменён: {$oldStatus} -> {$lead->status}", $request->user()->id);
        } else {
            $activityLogger->log($lead, 'lead.updated', 'Заявка обновлена', $request->user()->id);
        }

        return redirect()->back()->with('success', 'Заявка обновлена.');
    }

    public function destroy(Request $request, Lead $lead, ActivityLogger $activityLogger): RedirectResponse
    {
        abort_unless($request->user()->hasRole(['Администратор', 'Менеджер']), 403);
        $activityLogger->log($lead, 'lead.deleted', 'Заявка удалена в корзину', $request->user()->id);
        $lead->delete();

        return redirect()->route('leads.index')->with('success', 'Заявка удалена.');
    }

    public function convert(Request $request, Lead $lead, LeadConversionService $service): RedirectResponse
    {
        abort_unless($request->user()->hasRole(['Администратор', 'Менеджер']), 403);
        abort_if($lead->converted_at, 422, 'Заявка уже превращена в объект.');

        $project = $service->convert($lead, $request->user()->id);

        return redirect()->route('projects.show', $project)->with('success', 'Объект ремонта создан.');
    }
}
