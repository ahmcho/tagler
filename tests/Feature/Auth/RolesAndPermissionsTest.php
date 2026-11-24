<?php

use App\Models\User;
use App\Modules\Auth\Database\Seeders\RolesAndPermissionsSeeder;
use App\Modules\Auth\Models\Permission;
use App\Modules\Auth\Models\Role;
use App\Modules\Auth\Support\PermissionFileLoader;
use App\Modules\Auth\Support\PermissionRegistry;

/**
 * Every permission the seeder creates: the file permissions and the registered permissions.
 *
 * @return array<int, string>
 */
function seededPermissionNames(): array
{
    $loader = app(PermissionFileLoader::class);

    return collect([...$loader->load($loader->defaultDirectories()), ...app(PermissionRegistry::class)->all()])
        ->pluck('name')
        ->unique()
        ->sort()
        ->values()
        ->all();
}

test('the seeder creates the Admin and User roles and every registered and file permission', function (): void {
    $this->seed(RolesAndPermissionsSeeder::class);

    $registeredNames = seededPermissionNames();

    expect(Role::query()->pluck('name')->sort()->values()->all())->toBe(['Admin', 'User'])
        ->and(Permission::query()->pluck('name')->sort()->values()->all())->toBe($registeredNames)
        ->and(Role::findByName('Admin', 'web')->permissions->pluck('name')->sort()->values()->all())->toBe($registeredNames)
        ->and(Role::findByName('User', 'web')->permissions)->toBeEmpty();
});

test('the seeder stores the description of each permission', function (): void {
    $this->seed(RolesAndPermissionsSeeder::class);

    expect(Permission::findByName('translations.update', 'web')->description)->toBe('Edit translations');
});

test('running the seeder twice does not duplicate roles or permissions', function (): void {
    $this->seed(RolesAndPermissionsSeeder::class);
    $this->seed(RolesAndPermissionsSeeder::class);

    expect(Role::query()->count())->toBe(2)
        ->and(Permission::query()->count())->toBe(count(seededPermissionNames()));
});

test('an Admin role holder can use the translation permissions', function (): void {
    $this->seed(RolesAndPermissionsSeeder::class);

    $user = User::factory()->create();
    $user->assignRole('Admin');

    expect($user->can('translations.index'))->toBeTrue()
        ->and($user->can('translations.update'))->toBeTrue();
});

test('a User role holder cannot use the translation permissions', function (): void {
    $this->seed(RolesAndPermissionsSeeder::class);

    $user = User::factory()->create();
    $user->assignRole('User');

    expect($user->can('translations.index'))->toBeFalse();
});

test('running the seeder again keeps the permissions given to the User role', function (): void {
    $this->seed(RolesAndPermissionsSeeder::class);

    Role::findByName('User', 'web')->givePermissionTo('translations.index');

    $this->seed(RolesAndPermissionsSeeder::class);

    expect(Role::findByName('User', 'web')->permissions->pluck('name')->all())->toBe(['translations.index']);
});
