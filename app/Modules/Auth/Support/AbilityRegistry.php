<?php

namespace App\Modules\Auth\Support;

use App\Models\User;

/**
 * Maps a UI ability key (for example `roles.store`) to a policy method, or to a Gate ability name.
 * The Inertia `can` prop is built from this map, so the UI asks the same policies the server enforces.
 */
class AbilityRegistry
{
    /**
     * @var array<string, array{0: class-string, 1: string}|string>
     */
    private array $abilities = [];

    /**
     * @param  array<string, array{0: class-string, 1: string}|string>  $abilities
     */
    public function register(array $abilities): void
    {
        $this->abilities = array_merge($this->abilities, $abilities);
    }

    /**
     * @return array<string, bool>
     */
    public function resolveFor(?User $user): array
    {
        if ($user === null) {
            return [];
        }

        $resolved = [];

        foreach ($this->abilities as $key => $target) {
            $resolved[$key] = is_string($target)
                ? $user->can($target)
                : $user->can($target[1], $target[0]);
        }

        return $resolved;
    }
}
