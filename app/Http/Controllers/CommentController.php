<?php

namespace App\Http\Controllers;

use App\Models\Lead;
use App\Models\Project;
use App\Services\ActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    public function lead(Request $request, Lead $lead, ActivityLogger $activityLogger): RedirectResponse
    {
        abort_unless($lead->newQuery()->whereKey($lead->id)->visibleTo($request->user())->exists(), 403);

        $validated = $request->validate([
            'body' => ['required', 'string', 'max:2000'],
            'visible_to_client' => ['boolean'],
        ]);

        $lead->comments()->create([
            'user_id' => $request->user()->id,
            'body' => $validated['body'],
            'visible_to_client' => $validated['visible_to_client'] ?? true,
        ]);

        $activityLogger->log($lead, 'comment.created', 'Добавлен комментарий к заявке', $request->user()->id);

        return redirect()->back()->with('success', 'Комментарий добавлен.');
    }

    public function project(Request $request, Project $project, ActivityLogger $activityLogger): RedirectResponse
    {
        abort_unless($project->newQuery()->whereKey($project->id)->visibleTo($request->user())->exists(), 403);

        $validated = $request->validate([
            'body' => ['required', 'string', 'max:2000'],
            'visible_to_client' => ['boolean'],
        ]);

        $project->comments()->create([
            'user_id' => $request->user()->id,
            'body' => $validated['body'],
            'visible_to_client' => $validated['visible_to_client'] ?? true,
        ]);

        $activityLogger->log($project, 'comment.created', 'Добавлен комментарий к объекту', $request->user()->id);

        return redirect()->back()->with('success', 'Комментарий добавлен.');
    }
}
