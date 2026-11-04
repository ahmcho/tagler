<?php

use App\Models\User;
use App\Modules\Auth\Database\Seeders\RolesAndPermissionsSeeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

test('the seeder creates the Admin and User roles with the translation permissions', function () {
    $this->seed(RolesAndPermissionsSeeder::class);

    expect(Role::query()->pluck('name')->sort()->values()->all())->toBe(['Admin', 'User'])
        ->and(Permission::query()->pluck('name')->sort()->values()->all())->toBe(['translations.index', 'translations.update'])
        ->and(Role::findByName('Admin', 'web')->permissions->pluck('name')->sort()->values()->all())
        ->toBe(['translations.index', 'translations.update'])
        ->and(Role::findByName('User', 'web')->permissions)->toBeEmpty();
});

test('running the seeder twice does not duplicate roles or permissions', function () {
    $this->seed(RolesAndPermissionsSeeder::class);
    $this->seed(RolesAndPermissionsSeeder::class);

    expect(Role::query()->count())->toBe(2)
        ->and(Permission::query()->count())->toBe(2);
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
