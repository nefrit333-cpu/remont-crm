<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\URL;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PublicDemoTest extends TestCase
{
    use RefreshDatabase;

    public function test_revoked_legacy_database_session_cannot_write_after_demo_is_disabled(): void
    {
        config(['demo.enabled' => true, 'session.driver' => 'database']);
        $this->seed();
        $admin = User::where('email', 'admin@remont-crm.test')->firstOrFail();
        $session = app('session')->driver();
        $legacyId = $session->getId();
        $session->put(Auth::guard('web')->getName(), $admin->id);
        $session->save();
        $cookie = config('session.cookie');

        $this->withCookie($cookie, $legacyId)
            ->patch(route('profile.update'), ['name' => 'Changed', 'email' => $admin->email])
            ->assertForbidden();
        $this->assertDatabaseHas('sessions', ['id' => $legacyId]);

        DB::table('sessions')->delete();
        config(['demo.enabled' => false]);
        app('session')->forgetDrivers();
        $this->app->forgetInstance('session.store');
        Auth::forgetGuards();

        $this->withCookie($cookie, $legacyId)
            ->patch(route('profile.update'), ['name' => 'Changed', 'email' => $admin->email])
            ->assertRedirect(route('login'));
        $this->assertGuest();
        $this->assertDatabaseMissing('users', ['email' => $admin->email, 'name' => 'Changed']);

        $this->post(route('login'), ['email' => $admin->email, 'password' => 'password'])
            ->assertRedirect();
        $this->assertAuthenticatedAs($admin);
    }

    public function test_demo_login_is_disabled_by_default_and_regular_crm_remains_writable(): void
    {
        $this->seed();
        $admin = User::where('email', 'admin@remont-crm.test')->firstOrFail();

        $this->post(route('demo.login'), ['email' => $admin->email])->assertNotFound();
        $this->assertGuest();

        $this->get(route('login'))->assertOk();
        $this->post(route('login'), ['email' => $admin->email, 'password' => 'password'])
            ->assertRedirect(route('dashboard', absolute: false));
        $this->patch(route('profile.update'), ['name' => 'Новое имя', 'email' => $admin->email])
            ->assertRedirect(route('profile.edit'));
        $this->assertSame('Новое имя', $admin->refresh()->name);
    }

    public function test_all_four_demo_accounts_can_sign_in_view_the_dashboard_and_log_out(): void
    {
        config(['demo.enabled' => true]);
        $this->seed();

        $accounts = [
            'admin@remont-crm.test' => 'Администратор',
            'manager@remont-crm.test' => 'Менеджер',
            'foreman@remont-crm.test' => 'Прораб',
            'client@remont-crm.test' => 'Клиент',
        ];

        foreach ($accounts as $email => $role) {
            $this->post(route('demo.login'), ['email' => $email])->assertRedirect(route('dashboard'));
            $this->get(route('dashboard'))->assertOk()->assertInertia(
                fn (Assert $page) => $page->where('auth.role', $role)->where('publicDemo', true),
            );
            $this->post(route('logout'))->assertRedirect('/');
            $this->assertGuest();
        }
    }

    public function test_disabling_demo_ends_existing_demo_sessions(): void
    {
        config(['demo.enabled' => true]);
        $this->seed();
        $email = 'admin@remont-crm.test';
        $this->post(route('demo.login'), ['email' => $email])->assertRedirect(route('dashboard'));

        config(['demo.enabled' => false]);
        $this->patch(route('profile.update'), ['name' => 'Changed', 'email' => $email])
            ->assertRedirect(route('login'));
        $this->assertGuest();
        $this->assertDatabaseMissing('users', ['email' => $email, 'name' => 'Changed']);
    }

    public function test_demo_rejects_other_accounts_wrong_roles_and_password_login(): void
    {
        config(['demo.enabled' => true]);
        $this->seed();
        $other = User::factory()->create();
        $admin = User::where('email', 'admin@remont-crm.test')->firstOrFail();

        $this->from('/')->post(route('demo.login'), ['email' => $other->email])
            ->assertRedirect('/')
            ->assertSessionHasErrors('email');
        $this->post(route('login'), ['email' => $admin->email, 'password' => 'password'])->assertForbidden();
        $admin->syncRoles('Менеджер');
        $this->post(route('demo.login'), ['email' => $admin->email])->assertForbidden();
        $admin->syncRoles(['Администратор', 'Менеджер']);
        $this->post(route('demo.login'), ['email' => $admin->email])->assertForbidden();
        $this->assertGuest();
        $this->actingAs($other)->get(route('dashboard'))->assertForbidden();
    }

    public function test_direct_writes_leave_demo_records_unchanged(): void
    {
        config(['demo.enabled' => true]);
        $this->seed();
        $admin = User::where('email', 'admin@remont-crm.test')->firstOrFail();
        $lead = DB::table('leads')->whereNull('converted_at')->first();
        $project = Project::firstOrFail();
        $tables = ['users', 'leads', 'projects', 'comments', 'activity_logs', 'password_reset_tokens'];
        $snapshot = fn () => array_map(fn ($table) => DB::table($table)->get()->toJson(), $tables);
        $before = $snapshot();

        $this->post('/forgot-password', ['email' => $admin->email])->assertForbidden();
        $this->post('/reset-password', ['email' => $admin->email])->assertForbidden();
        $this->actingAs($admin);

        foreach ([
            ['POST', '/leads'],
            ['PUT', "/leads/{$lead->id}"],
            ['PATCH', "/leads/{$lead->id}"],
            ['DELETE', "/leads/{$lead->id}"],
            ['POST', "/leads/{$lead->id}/convert"],
            ['POST', "/leads/{$lead->id}/comments"],
            ['POST', '/projects'],
            ['PUT', "/projects/{$project->id}"],
            ['PATCH', "/projects/{$project->id}"],
            ['POST', "/projects/{$project->id}/comments"],
            ['PATCH', '/profile'],
            ['DELETE', '/profile'],
            ['PUT', '/password'],
            ['POST', '/confirm-password'],
            ['POST', '/email/verification-notification'],
        ] as [$method, $uri]) {
            $this->json($method, $uri, [
                'name' => 'Changed',
                'email' => 'changed@example.test',
                'body' => 'Changed',
                'password' => 'password',
            ])->assertForbidden();
        }

        $verification = URL::signedRoute('verification.verify', [
            'id' => $admin->id,
            'hash' => sha1($admin->email),
        ]);
        $this->get($verification)->assertForbidden();
        $this->assertSame($before, $snapshot());
    }

    public function test_demo_client_can_view_own_project_but_not_an_existing_foreign_project(): void
    {
        config(['demo.enabled' => true]);
        $this->seed();
        $email = 'client@remont-crm.test';
        $client = User::where('email', $email)->firstOrFail();
        $own = Project::where('customer_id', $client->customer_id)->firstOrFail();
        $foreign = Project::where('customer_id', '<>', $client->customer_id)->firstOrFail();

        $this->post(route('demo.login'), ['email' => $email])->assertRedirect(route('dashboard'));
        $this->get(route('projects.show', $own))->assertOk();
        $this->get(route('projects.show', $foreign))->assertForbidden();
    }
}
