<?php

use App\Models\User;
use App\Modules\Auth\Database\Seeders\RolesAndPermissionsSeeder;
use App\Modules\Auth\Models\Permission;
use App\Modules\Auth\Models\Role;
use App\Modules\Auth\Support\PermissionRegistry;

test('the seeder creates the Admin and User roles and every registered permission', function () {
    $this->seed(RolesAndPermissionsSeeder::class);

    $registeredNames = collect(app(PermissionRegistry::class)->all())->pluck('name')->sort()->values()->all();

    expect(Role::query()->pluck('name')->sort()->values()->all())->toBe(['Admin', 'User'])
        ->and(Permission::query()->pluck('name')->sort()->values()->all())->toBe($registeredNames)
        ->and(Role::findByName('Admin', 'web')->permissions->pluck('name')->sort()->values()->all())->toBe($registeredNames)
        ->and(Role::findByName('User', 'web')->permissions)->toBeEmpty();
});

test('the seeder stores the description of each permission', function () {
    $this->seed(RolesAndPermissionsSeeder::class);

    expect(Permission::findByName('translations.update', 'web')->description)->toBe('Edit translations');
});

test('running the seeder twice does not duplicate roles or permissions', function () {
    $this->seed(RolesAndPermissionsSeeder::class);
    $this->seed(RolesAndPermissionsSeeder::class);

    expect(Role::query()->count())->toBe(2)
        ->and(Permission::query()->count())->toBe(count(app(PermissionRegistry::class)->all()));
});

test('an Admin role holder can use the translation permissions', function () {
    $this->seed(RolesAndPermissionsSeeder::class);

    $user = User::factory()->create();
    $user->assignRole('Admin');

    expect($user->can('translations.index'))->toBeTrue()
        ->and($user->can('translations.update'))->toBeTrue();
});

test('a User role holder cannot use the translation permissions', function () {
    $this->seed(RolesAndPermissionsSeeder::class);

    $user = User::factory()->create();
    $user->assignRole('User');

    expect($user->can('translations.index'))->toBeFalse();
});

test('running the seeder again keeps the permissions given to the User role', function () {
    $this->seed(RolesAndPermissionsSeeder::class);

    Role::findByName('User', 'web')->givePermissionTo('translations.index');

    $this->seed(RolesAndPermissionsSeeder::class);

    expect(Role::findByName('User', 'web')->permissions->pluck('name')->all())->toBe(['translations.index']);
});
