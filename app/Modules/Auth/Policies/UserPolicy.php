<?php

namespace App\Modules\Auth\Policies;

use App\Models\User;
use App\Modules\Auth\Concerns\HasTranslatedDenialResponse;
use App\Modules\Auth\Support\LastAdminGuard;
use Illuminate\Auth\Access\Response;

class UserPolicy
{
    use HasTranslatedDenialResponse;

    public function __construct(private readonly LastAdminGuard $lastAdminGuard) {}

    public function viewAny(User $user): Response
    {
        return $this->check(allowed: $user->can('users.index'));
    }

    public function view(User $user, User $model): Response
    {
        return $this->check(allowed: $user->can('users.show'));
    }

    public function create(User $user): Response
    {
        return $this->check(allowed: $user->can('users.store'));
    }

    public function update(User $user, User $model): Response
    {
        return $this->check(allowed: $user->can('users.update'));
    }

    /**
     * The last user with the Admin role cannot be deleted.
     */
    public function delete(User $user, User $model): Response
    {
        if ($this->lastAdminGuard->isLastAdmin($model)) {
            return $this->check(allowed: false);
        }

        return $this->check(allowed: $user->can('users.destroy'));
    }

    public function restore(User $user, User $model): Response
    {
        return $this->check(allowed: false);
    }

    public function forceDelete(User $user, User $model): Response
    {
        return $this->check(allowed: false);
    }
}
