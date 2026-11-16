<?php

namespace App\Modules\Auth\Services;

use App\Models\User;
use App\Modules\Auth\Repositories\Contracts\UserRepositoryContract;
use App\Modules\Auth\Services\Contracts\UserServiceContract;
use Crud\Services\BaseCrudService;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class UserService extends BaseCrudService implements UserServiceContract
{
    public function __construct(UserRepositoryContract $repository)
    {
        parent::__construct($repository);
    }

    public function create(array $payload): Model
    {
        return DB::transaction(function () use ($payload): Model {
            $user = $this->repository->create([
                'name' => $payload['name'],
                'email' => $payload['email'],
                'password' => $payload['password'],
            ]);

            $user->markEmailAsVerified();
            $user->syncRoles($payload['roles']);

            return $user;
        });
    }

    public function update(int|Model $modelOrModelId, array $payload): Model
    {
        return DB::transaction(function () use ($modelOrModelId, $payload): Model {
            $attributes = ['name' => $payload['name'], 'email' => $payload['email']];

            if (! empty($payload['password'])) {
                $attributes['password'] = $payload['password'];
            }

            /** @var User $user */
            $user = $this->repository->update($modelOrModelId, $attributes);

            $user->syncRoles($payload['roles']);

            return $user;
        });
    }
}
