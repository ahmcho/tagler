<?php

namespace App\Modules\Auth\Repositories;

use App\Models\User;
use App\Modules\Auth\Repositories\Contracts\UserRepositoryContract;
use Crud\Repositories\EloquentRepository;
use Illuminate\Database\Eloquent\Builder;

class UserRepository extends EloquentRepository implements UserRepositoryContract
{
    public function __construct(User $model)
    {
        parent::__construct($model);
    }

    /**
     * Users that hold the given role.
     *
     * @param  Builder<User>  $query
     */
    protected function addRoleCondition(Builder $query, mixed $roleId): void
    {
        $query->whereHas('roles', fn (Builder $roles) => $roles->where('roles.id', (int) $roleId));
    }

    public function countWithRole(string $roleName): int
    {
        return $this->model->newQuery()->role($roleName)->count();
    }

    public function findByEmail(string $email): ?User
    {
        /** @var User|null $user */
        $user = $this->model->newQuery()->where('email', $email)->first();

        return $user;
    }
}
