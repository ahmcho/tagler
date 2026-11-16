<?php

namespace App\Modules\Auth\Services\Contracts;

use Crud\Services\Contracts\BaseCrudServiceContract;
use Illuminate\Database\Eloquent\Model;

interface UserServiceContract extends BaseCrudServiceContract
{
    /**
     * @param  array{name: string, email: string, password: string, roles: array<int, int>}  $payload
     */
    public function create(array $payload): Model;

    /**
     * Password is optional on update: an empty value keeps the current password.
     *
     * @param  array{name: string, email: string, password?: string|null, roles: array<int, int>}  $payload
     */
    public function update(int|Model $modelOrModelId, array $payload): Model;
}
