<?php

use App\Modules\Auth\Database\Seeders\RolesAndPermissionsSeeder;
use App\Modules\Auth\Models\Permission;
use App\Modules\Auth\Models\Role;
use App\Modules\Auth\Support\PermissionFileLoader;

test('the seeder creates permissions from the root and module permission files', function (): void {
    (new RolesAndPermissionsSeeder([base_path('tests/Fixtures/permissions/root'), base_path('tests/Fixtures/permissions/module')]))->run();

    expect(Permission::query()->where('name', 'reports.index')->value('description'))->toBe('View the report list')
        ->and(Permission::query()->where('name', 'gallery.index')->value('description'))->toBe('View the gallery list');
});

test('the Admin role receives the permissions from the files', function (): void {
    (new RolesAndPermissionsSeeder([base_path('tests/Fixtures/permissions/root'), base_path('tests/Fixtures/permissions/module')]))->run();

    $admin = Role::query()->where('name', config('modules.auth.admin_role_name'))->firstOrFail();

    expect($admin->hasPermissionTo('reports.show'))->toBeTrue()
        ->and($admin->hasPermissionTo('gallery.index'))->toBeTrue();
});

test('the seeder still creates the permissions that the modules register', function (): void {
    (new RolesAndPermissionsSeeder([base_path('tests/Fixtures/permissions/root'), base_path('tests/Fixtures/permissions/module')]))->run();

    $admin = Role::query()->where('name', config('modules.auth.admin_role_name'))->firstOrFail();

    expect(Permission::query()->where('name', 'roles.index')->exists())->toBeTrue()
        ->and($admin->hasPermissionTo('roles.index'))->toBeTrue();
});

test('a module registration replaces a file entry with the same name', function (): void {
    (new RolesAndPermissionsSeeder([base_path('tests/Fixtures/permissions/root')]))->run();

    expect(Permission::query()->where('name', 'users.index')->value('description'))->toBe('View the user list');
});

test('running the seeder twice does not duplicate file permissions', function (): void {
    $seeder = new RolesAndPermissionsSeeder([base_path('tests/Fixtures/permissions/root'), base_path('tests/Fixtures/permissions/module')]);

    $seeder->run();
    $seeder->run();

    expect(Permission::query()->where('name', 'reports.index')->count())->toBe(1);
});

test('the loader rejects a permission file entry without a description', function (): void {
    (new PermissionFileLoader)->load([base_path('tests/Fixtures/permissions/invalid')]);
})->throws(InvalidArgumentException::class, 'has no description');

test('the loader ignores a directory that does not exist', function (): void {
    expect((new PermissionFileLoader)->load([base_path('tests/Fixtures/permissions/missing')]))->toBe([]);
});
