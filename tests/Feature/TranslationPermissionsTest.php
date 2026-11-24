<?php

use App\Modules\Auth\Database\Seeders\RolesAndPermissionsSeeder;
use App\Modules\Auth\Models\Permission;
use App\Modules\Auth\Models\Role;

test('the seeder creates the translation permissions from the module permission file', function (): void {
    $this->seed(RolesAndPermissionsSeeder::class);

    expect(Permission::query()->where('name', 'translations.index')->value('description'))->toBe('View the translation list')
        ->and(Permission::query()->where('name', 'translations.update')->value('description'))->toBe('Edit translations');
});

test('the Admin role receives the translation permissions', function (): void {
    $this->seed(RolesAndPermissionsSeeder::class);

    $admin = Role::query()->where('name', config('modules.auth.admin_role_name'))->firstOrFail();

    expect($admin->hasPermissionTo('translations.index'))->toBeTrue()
        ->and($admin->hasPermissionTo('translations.update'))->toBeTrue();
});
