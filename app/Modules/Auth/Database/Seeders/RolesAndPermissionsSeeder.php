<?php

namespace App\Modules\Auth\Database\Seeders;

use App\Models\User;
use App\Modules\Auth\Models\Permission;
use App\Modules\Auth\Models\Role;
use App\Modules\Auth\Support\PermissionRegistry;
use Illuminate\Database\Seeder;
use Spatie\Permission\PermissionRegistrar;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Creates the permissions that the modules registered, then the roles, then assigns the Admin
     * role to the user whose email matches ADMIN_EMAIL, when that variable is set.
     * Admin receives every permission on each run. User is created with no permissions, and an
     * existing User role keeps the permissions it was given.
     */
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $permissions = app(PermissionRegistry::class)->all();

        foreach ($permissions as $permission) {
            Permission::query()->updateOrCreate(
                ['name' => $permission['name'], 'guard_name' => 'web'],
                ['description' => $permission['description']],
            );
        }

        Role::query()->firstOrCreate(['name' => config('modules.auth.admin_role_name'), 'guard_name' => 'web'])
            ->syncPermissions(array_column($permissions, 'name'));

        Role::query()->firstOrCreate(['name' => 'User', 'guard_name' => 'web']);

        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $adminEmail = env('ADMIN_EMAIL');

        if (is_string($adminEmail) && $adminEmail !== '') {
            User::query()->where('email', $adminEmail)->first()?->assignRole(config('modules.auth.admin_role_name'));
        }
    }
}
