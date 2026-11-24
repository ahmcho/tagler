<?php

namespace App\Modules\Auth\Database\Seeders;

use App\Models\User;
use App\Modules\Auth\Models\Permission;
use App\Modules\Auth\Models\Role;
use App\Modules\Auth\Support\PermissionFileLoader;
use App\Modules\Auth\Support\PermissionRegistry;
use Illuminate\Database\Seeder;
use Spatie\Permission\PermissionRegistrar;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * @param  array<int, string>|null  $permissionDirectories  Overrides the directories that are scanned. Null scans the defaults.
     */
    public function __construct(private readonly ?array $permissionDirectories = null) {}

    /**
     * Creates the permissions from the permission files and from the modules' registrations, then the roles,
     * then assigns the Admin role to the user whose email matches ADMIN_EMAIL, when that variable is set.
     * A module registration replaces a file entry with the same name.
     * Admin receives every permission on each run. User is created with no permissions, and an
     * existing User role keeps the permissions it was given.
     */
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $permissions = $this->mergePermissions(
            app(PermissionFileLoader::class)->load($this->permissionDirectories()),
            app(PermissionRegistry::class)->all(),
        );

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

        $adminEmail = config('modules.auth.admin_email');

        if (is_string($adminEmail) && $adminEmail !== '') {
            User::query()->where('email', $adminEmail)->first()?->assignRole(config('modules.auth.admin_role_name'));
        }
    }

    /**
     * Later lists win, so the module registrations replace file entries with the same name.
     *
     * @param  array<int, array{name: string, description: string}>  $filePermissions
     * @param  array<int, array{name: string, description: string}>  $registeredPermissions
     * @return array<int, array{name: string, description: string}>
     */
    private function mergePermissions(array $filePermissions, array $registeredPermissions): array
    {
        $merged = [];

        foreach ([...$filePermissions, ...$registeredPermissions] as $permission) {
            $merged[$permission['name']] = $permission;
        }

        return array_values($merged);
    }

    /**
     * @return array<int, string>
     */
    private function permissionDirectories(): array
    {
        return $this->permissionDirectories ?? app(PermissionFileLoader::class)->defaultDirectories();
    }
}
