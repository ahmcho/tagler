<?php

use App\Models\User;
use App\Modules\Auth\Database\Seeders\RolesAndPermissionsSeeder;
use Inertia\Testing\AssertableInertia;

test('the application name is shared with every page', function () {
    config(['app.name' => 'Tagler CMS']);

    $this->get(route('login'))->assertInertia(fn (AssertableInertia $page) => $page
        ->where('name', 'Tagler CMS')
        ->missing('sidebarOpen'));
});

test('a guest has no permissions shared with the page', function () {
    $this->get(route('login'))->assertInertia(fn (AssertableInertia $page) => $page
        ->where('auth.permissions', []));
});

test('the signed in user permission names are shared with every page', function () {
    $this->seed(RolesAndPermissionsSeeder::class);

    $user = User::factory()->create();
    $user->givePermissionTo('translations.update');

    $this->actingAs($user)->get(route('dashboard'))->assertInertia(fn (AssertableInertia $page) => $page
        ->where('auth.permissions', ['translations.update']));
});

test('the class-level abilities are shared as the can prop', function () {
    $this->seed(RolesAndPermissionsSeeder::class);

    $admin = User::factory()->create();
    $admin->assignRole('Admin');

    $can = $this->actingAs($admin)->get(route('dashboard'))->viewData('page')['props']['can'];

    expect($can)->toMatchArray([
        'roles.index' => true,
        'roles.store' => true,
        'users.index' => true,
        'activity-logs.index' => true,
        'translations.index' => true,
    ]);
});

test('a User role holder gets false for every class-level ability', function () {
    $this->seed(RolesAndPermissionsSeeder::class);

    $user = User::factory()->create();
    $user->assignRole('User');

    $can = $this->actingAs($user)->get(route('dashboard'))->viewData('page')['props']['can'];

    expect($can)->toMatchArray([
        'roles.index' => false,
        'users.index' => false,
        'translations.index' => false,
    ]);
});
