<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class FinanceAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_foreman_cannot_open_payments_or_acts_sections(): void
    {
        $foreman = User::factory()->create();
        Role::create(['name' => 'Прораб']);
        $foreman->assignRole('Прораб');

        $this->actingAs($foreman)->get(route('payments.index'))->assertForbidden();
        $this->actingAs($foreman)->get(route('acts.index'))->assertForbidden();
    }

    public function test_manager_can_open_finance_sections(): void
    {
        $manager = User::factory()->create();
        Role::create(['name' => 'Менеджер']);
        $manager->assignRole('Менеджер');

        $this->actingAs($manager)->get(route('payments.index'))->assertOk();
        $this->actingAs($manager)->get(route('acts.index'))->assertOk();
    }
}
