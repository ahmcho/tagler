<?php

namespace App\Modules\Auth\Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Permissions every module declares, keyed by permission name.
     *
     * @var array<int, string>
     */
    private const array PERMISSIONS = [
        'translations.index',
        'translations.update',
    ];

    /**
     * Role name => permission names it holds. An empty list means no
     * permissions.
     *
     * @var array<string, array<int, string>>
     */
    private const array ROLES = [
        'Admin' => self::PERMISSIONS,
        'User' => [],
    ];

    /**
     * Creates the permissions and roles, then assigns the Admin role to the
     * user whose email matches ADMIN_EMAIL, when that variable is set.
     */
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        foreach (self::PERMISSIONS as $permissionName) {
            Permission::query()->firstOrCreate(['name' => $permissionName, 'guard_name' => 'web']);
        }

        foreach (self::ROLES as $roleName => $permissionNames) {
            $role = Role::query()->firstOrCreate(['name' => $roleName, 'guard_name' => 'web']);
            $role->syncPermissions($permissionNames);
        }

        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $adminEmail = env('ADMIN_EMAIL');

        if (is_string($adminEmail) && $adminEmail !== '') {
            User::query()->where('email', $adminEmail)->first()?->assignRole('Admin');
        }
    }
}
