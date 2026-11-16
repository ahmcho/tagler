<?php

namespace App\Modules\Auth\Support;

/**
 * Collects the permissions that each module declares. The seeder reads this list.
 */
class PermissionRegistry
{
    /**
     * @var array<string, array{name: string, description: string}>
     */
    private array $permissions = [];

    /**
     * @param  array<int, array{name: string, description: string}>  $permissions
     */
    public function register(array $permissions): void
    {
        foreach ($permissions as $permission) {
            $this->permissions[$permission['name']] = $permission;
        }
    }

    /**
     * @return array<int, array{name: string, description: string}>
     */
    public function all(): array
    {
        return array_values($this->permissions);
    }
}
