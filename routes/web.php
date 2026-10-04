<?php

use App\Http\Controllers\CommentController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DemoLoginController;
use App\Http\Controllers\LeadController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\SectionController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => false,
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::post('/demo-login', DemoLoginController::class)
    ->middleware('guest')
    ->name('demo.login');

Route::get('/dashboard', DashboardController::class)->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::resource('leads', LeadController::class)->except(['create', 'edit']);
    Route::post('/leads/{lead}/convert', [LeadController::class, 'convert'])->name('leads.convert');
    Route::post('/leads/{lead}/comments', [CommentController::class, 'lead'])->name('leads.comments.store');

    Route::resource('projects', ProjectController::class)->except(['create', 'edit', 'destroy']);
    Route::post('/projects/{project}/comments', [CommentController::class, 'project'])->name('projects.comments.store');

    Route::get('/tasks', [SectionController::class, 'tasks'])->name('tasks.index');
    Route::get('/calendar', [SectionController::class, 'calendar'])->name('calendar.index');
    Route::get('/files', [SectionController::class, 'files'])->name('files.index');
    Route::get('/payments', [SectionController::class, 'payments'])->name('payments.index');
    Route::get('/acts', [SectionController::class, 'acts'])->name('acts.index');
    Route::get('/customers', [SectionController::class, 'customers'])->name('customers.index');
    Route::get('/team', [SectionController::class, 'team'])->name('team.index');
    Route::get('/settings', [SectionController::class, 'settings'])->name('settings.index');
});

require __DIR__.'/auth.php';
