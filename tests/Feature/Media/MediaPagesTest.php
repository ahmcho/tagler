<?php

use App\Models\User;
use App\Modules\Auth\Database\Seeders\RolesAndPermissionsSeeder;
use App\Modules\Auth\Models\Role;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function (): void {
    (new RolesAndPermissionsSeeder)->run();

    $this->admin = User::factory()->create();
    $this->admin->assignRole('Admin');
});

test('the dashboard renders the file manager page', function (): void {
    $this->actingAs($this->admin)->get(route('media.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('media/index'));
});

test('the library renders the full listing page', function (): void {
    $this->actingAs($this->admin)->get(route('media.library'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('media/library'));
});

test('a user without the index permission cannot open either page', function (): void {
    $outsider = User::factory()->create();

    $this->actingAs($outsider)->get(route('media.index'))->assertForbidden();
    $this->actingAs($outsider)->get(route('media.library'))->assertForbidden();
});

test('a user with only the index permission can open the library', function (): void {
    Role::create(['name' => 'Media reader', 'guard_name' => 'web'])->givePermissionTo('media.index');
    $reader = User::factory()->create();
    $reader->assignRole('Media reader');

    $this->actingAs($reader)->get(route('media.library'))->assertOk();
});
