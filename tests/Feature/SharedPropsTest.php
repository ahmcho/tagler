<?php

use App\Models\User;
use App\Modules\Auth\Database\Seeders\RolesAndPermissionsSeeder;
use Inertia\Testing\AssertableInertia;

test('the application name is shared with every page', function () {
    config(['app.name' => 'Tagler CMS']);

    $this->get(route('home'))->assertInertia(fn (AssertableInertia $page) => $page
        ->where('name', 'Tagler CMS')
        ->missing('sidebarOpen'));
});

test('a guest has no permissions shared with the page', function () {
    $this->get(route('home'))->assertInertia(fn (AssertableInertia $page) => $page
        ->where('auth.permissions', []));
});

test('the signed in user permission names are shared with every page', function () {
    $this->seed(RolesAndPermissionsSeeder::class);

    $user = User::factory()->create();
    $user->givePermissionTo('translations.update');

    $this->actingAs($user)->get(route('dashboard'))->assertInertia(fn (AssertableInertia $page) => $page
        ->where('auth.permissions', ['translations.update']));
});
